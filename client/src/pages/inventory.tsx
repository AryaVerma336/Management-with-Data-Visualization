import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Plus, Search, Filter, Download, Upload, Trash2, Edit, AlertTriangle, CheckCircle2, Star, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductModal } from "@/components/product-modal";
import { DeleteDialog } from "@/components/delete-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function Inventory() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/overview'] });
      toast({ title: t('common.success'), description: t('toast.productDeleted') });
      setDeletingProduct(null);
    },
    onError: (err: Error) => {
      toast({ title: t('common.error'), description: err.message, variant: "destructive" });
    },
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus === "instock") matchesStatus = p.stock > p.minStock;
    else if (selectedStatus === "lowstock") matchesStatus = p.stock > 0 && p.stock <= p.minStock;
    else if (selectedStatus === "outofstock") matchesStatus = p.stock === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('inventory.title')}</h1>
          <p className="text-xs text-muted-foreground">Manage SKUs, stock levels, suppliers, and pricing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/api/export/products?format=csv')} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> {t('inventory.addProduct')}
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border/50 bg-card/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 text-xs w-[160px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 text-xs w-[150px]">
                  <SelectValue placeholder="All Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Status</SelectItem>
                  <SelectItem value="instock">In Stock</SelectItem>
                  <SelectItem value="lowstock">Low Stock</SelectItem>
                  <SelectItem value="outofstock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="text-xs">
              <TableHead className="w-[240px]">Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price / Cost</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                  Loading inventory database...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                  No products matched your search filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => (
                <TableRow key={p.id} className="text-xs hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{p.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {p.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">${parseFloat(p.price).toFixed(2)}</span>
                    <span className="text-[10px] text-muted-foreground block">Cost: ${parseFloat(p.cost || "0").toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 w-28">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium">{p.stock} units</span>
                        <span className="text-[10px] text-muted-foreground">Min: {p.minStock}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            p.stock === 0 ? 'bg-destructive' : p.stock <= p.minStock ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (p.stock / p.maxStock) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.supplier}</TableCell>
                  <TableCell>
                    <Badge
                      variant={p.stock === 0 ? "destructive" : p.stock <= p.minStock ? "secondary" : "default"}
                      className={`text-[10px] ${p.stock <= p.minStock && p.stock > 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : ''}`}
                    >
                      {p.stock === 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "In Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setInspectingProduct(p)}>
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingProduct(p)}>
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeletingProduct(p)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <ProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
        />
      )}

      {/* Product Detail Inspector Dialog */}
      {inspectingProduct && (
        <Dialog open={!!inspectingProduct} onOpenChange={() => setInspectingProduct(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{inspectingProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40">
                <div>
                  <span className="text-muted-foreground block text-[10px]">SKU</span>
                  <span className="font-mono font-semibold">{inspectingProduct.sku}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Category</span>
                  <span className="font-semibold">{inspectingProduct.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Price</span>
                  <span className="font-bold text-emerald-500">${inspectingProduct.price}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Stock Level</span>
                  <span className="font-bold">{inspectingProduct.stock} units</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Supplier</span>
                  <span>{inspectingProduct.supplier}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Rating</span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {inspectingProduct.rating} / 5.0
                  </span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] mb-1">Description</span>
                <p className="p-2.5 rounded border bg-card text-muted-foreground">
                  {inspectingProduct.description || "No description provided."}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingProduct && (
        <DeleteDialog
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={() => deleteMutation.mutate(deletingProduct.id)}
        />
      )}
    </div>
  );
}
