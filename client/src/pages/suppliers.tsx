import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Mail, Phone, User, Star, Clock, Plus, Search, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Supplier } from "@shared/schema";

export default function Suppliers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [leadTimeDays, setLeadTimeDays] = useState("5");

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  const createSupplierMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contactPerson,
          email,
          phone,
          category,
          leadTimeDays: parseInt(leadTimeDays, 10),
          rating: "4.8",
          status: "Active",
        }),
      });
      if (!res.ok) throw new Error("Failed to create supplier");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({ title: "Supplier Added", description: "New vendor registered in directory." });
      setIsAddOpen(false);
      setName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
    },
  });

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers & Vendor Directory</h1>
          <p className="text-xs text-muted-foreground">Manage global logistics partners, fulfillment lead times, and contact protocols.</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Vendor Partner
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search suppliers by name, contact, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card className="col-span-full p-8 text-center text-xs text-muted-foreground">
            Loading supplier directory...
          </Card>
        ) : filteredSuppliers.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-xs text-muted-foreground">
            No suppliers matched your search query.
          </Card>
        ) : (
          filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="border-border/50 bg-card hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" /> {supplier.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {supplier.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs bg-amber-500/10 px-2 py-0.5 rounded">
                    <Star className="h-3 w-3 fill-amber-500" />
                    {supplier.rating}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>Contact: <strong className="text-foreground">{supplier.contactPerson}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${supplier.email}`} className="hover:underline">{supplier.email}</a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-[11px]">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-blue-500" /> Lead Time:
                  </span>
                  <span className="font-semibold">{supplier.leadTimeDays} Business Days</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Supplier Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Supplier Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label>Company Name</Label>
              <Input placeholder="Global Logistics Co." value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Person</Label>
              <Input placeholder="Jane Doe" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input placeholder="jane@logistics.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input placeholder="Electronics" value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label>Lead Time (Days)</Label>
                <Input type="number" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>
            <Button
              onClick={() => createSupplierMutation.mutate()}
              disabled={!name || !contactPerson || !email || createSupplierMutation.isPending}
              className="w-full text-xs mt-2"
            >
              Save Vendor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
