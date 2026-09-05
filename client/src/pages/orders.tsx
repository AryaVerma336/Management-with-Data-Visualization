import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart, Plus, Search, Download, CheckCircle2, Clock, Truck, XCircle, AlertCircle, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function Orders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State for new order
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [itemsCount, setItemsCount] = useState("1");
  const [region, setRegion] = useState("North America");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/overview'] });
      toast({ title: "Order Updated", description: "Order status successfully updated." });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const newOrderNumber = `ORD-${1000 + orders.length + 1}`;
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: newOrderNumber,
          customerName,
          customerEmail,
          status: "pending",
          totalAmount,
          itemsCount: parseInt(itemsCount, 10),
          date: today,
          region,
          paymentMethod,
        }),
      });
      if (!res.ok) throw new Error("Failed to create order");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/overview'] });
      toast({ title: "Order Created", description: "New order has been recorded." });
      setIsCreateOpen(false);
      setCustomerName("");
      setCustomerEmail("");
      setTotalAmount("");
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1 text-[10px]"><CheckCircle2 className="h-3 w-3" /> Delivered</Badge>;
      case "shipped":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 gap-1 text-[10px]"><Truck className="h-3 w-3" /> Shipped</Badge>;
      case "processing":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1 text-[10px]"><Clock className="h-3 w-3" /> Processing</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="gap-1 text-[10px]"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="gap-1 text-[10px]"><AlertCircle className="h-3 w-3" /> Pending</Badge>;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === "all" || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales & Orders Pipeline</h1>
          <p className="text-xs text-muted-foreground">Track customer orders, fulfillment statuses, and transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/api/export/orders?format=csv')} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export Orders (CSV)
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> Create New Order
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="bg-muted h-9 text-xs">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
            <TabsTrigger value="processing" className="text-xs">Processing</TabsTrigger>
            <TabsTrigger value="shipped" className="text-xs">Shipped</TabsTrigger>
            <TabsTrigger value="delivered" className="text-xs">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order # or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="text-xs">
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                  Loading sales orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                  No orders matched your search filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="text-xs hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono font-bold">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{order.customerName}</div>
                    <span className="text-[10px] text-muted-foreground">{order.customerEmail}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">{order.region}</Badge>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-500">${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{order.paymentMethod}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(val) => updateStatusMutation.mutate({ id: order.id, status: val })}
                    >
                      <SelectTrigger className="h-7 w-28 text-[11px] border-none shadow-none p-0">
                        {getStatusBadge(order.status)}
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setInspectingOrder(order)}>
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Inspect Order Modal */}
      {inspectingOrder && (
        <Dialog open={!!inspectingOrder} onOpenChange={() => setInspectingOrder(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>Order {inspectingOrder.orderNumber}</span>
                {getStatusBadge(inspectingOrder.status)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-semibold">{inspectingOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{inspectingOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region:</span>
                  <span>{inspectingOrder.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span>{inspectingOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{inspectingOrder.date}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-base text-emerald-500">${inspectingOrder.totalAmount}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Order Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Record New Customer Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <Input placeholder="Acme Inc." value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label>Customer Email</Label>
              <Input placeholder="contact@acme.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Total Amount ($)</Label>
                <Input placeholder="1250.00" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label>Items Quantity</Label>
                <Input type="number" value={itemsCount} onChange={(e) => setItemsCount(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                    <SelectItem value="Latin America">Latin America</SelectItem>
                    <SelectItem value="EMEA">EMEA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Corporate Invoice">Corporate Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => createOrderMutation.mutate()}
              disabled={!customerName || !totalAmount || createOrderMutation.isPending}
              className="w-full text-xs mt-2"
            >
              Save Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
