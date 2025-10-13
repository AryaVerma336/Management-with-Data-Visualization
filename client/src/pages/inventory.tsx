import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductModal } from "@/components/product-modal";
import { DeleteDialog } from "@/components/delete-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCategoryLabel } from "@/lib/category-utils";
import type { Product } from "@shared/schema";

export default function Inventory() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: t('common.success'),
        description: t('toast.productDeleted'),
      });
      setDeletingProduct(null);
    },
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "in-stock" && product.stock > product.minStock) ||
                         (statusFilter === "low-stock" && product.stock > 0 && product.stock <= product.minStock) ||
                         (statusFilter === "out-of-stock" && product.stock === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockBadge = (product: Product) => {
    if (product.stock === 0) {
      return <Badge variant="destructive" data-testid={`badge-stock-${product.id}`}>{t('inventory.outOfStock')}</Badge>;
    }
    if (product.stock <= product.minStock) {
      return <Badge className="bg-chart-4 text-primary-foreground" data-testid={`badge-stock-${product.id}`}>{t('inventory.lowStock')}</Badge>;
    }
    return <Badge className="bg-chart-2 text-primary-foreground" data-testid={`badge-stock-${product.id}`}>{t('inventory.inStock')}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold" data-testid="text-inventory-title">{t('inventory.title')}</h1>
        <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          {t('inventory.addProduct')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('inventory.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
            <SelectValue placeholder={t('inventory.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('inventory.allCategories')}</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{getCategoryLabel(cat, t)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-status">
            <SelectValue placeholder={t('inventory.allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('inventory.allStatus')}</SelectItem>
            <SelectItem value="in-stock">{t('inventory.inStock')}</SelectItem>
            <SelectItem value="low-stock">{t('inventory.lowStock')}</SelectItem>
            <SelectItem value="out-of-stock">{t('inventory.outOfStock')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('common.loading')}</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('inventory.noProducts')}</h3>
          <p className="text-muted-foreground mb-4">{t('inventory.noProductsDesc')}</p>
          <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('inventory.addProduct')}
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('inventory.product')}</TableHead>
                <TableHead>{t('product.sku')}</TableHead>
                <TableHead>{t('inventory.category')}</TableHead>
                <TableHead>{t('inventory.price')}</TableHead>
                <TableHead>{t('inventory.stock')}</TableHead>
                <TableHead className="text-center">{t('product.status')}</TableHead>
                <TableHead className="text-right">{t('inventory.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                  <TableCell className="font-medium" data-testid={`text-name-${product.id}`}>{product.name}</TableCell>
                  <TableCell className="font-mono text-sm" data-testid={`text-sku-${product.id}`}>{product.sku}</TableCell>
                  <TableCell data-testid={`text-category-${product.id}`}>{getCategoryLabel(product.category, t)}</TableCell>
                  <TableCell data-testid={`text-price-${product.id}`}>${parseFloat(product.price).toFixed(2)}</TableCell>
                  <TableCell className="font-mono" data-testid={`text-stock-${product.id}`}>{product.stock}</TableCell>
                  <TableCell className="text-center">{getStockBadge(product)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingProduct(product)}
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={editingProduct}
      />

      <DeleteDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onConfirm={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)}
        title={t('product.deleteConfirm')}
        description={t('product.deleteDesc')}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
