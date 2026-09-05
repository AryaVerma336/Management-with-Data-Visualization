import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProductSchema } from "@shared/schema";
import type { Product } from "@shared/schema";

interface ProductModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  product?: Product | null;
}

export function ProductModal({ isOpen, open, onClose, onOpenChange, product }: ProductModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const isDialogOpen = open !== undefined ? open : (isOpen !== undefined ? isOpen : false);

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const formSchema = insertProductSchema.extend({
    price: z.string().min(1, t('product.validation.priceRequired')),
    stock: z.string().min(1, t('product.validation.stockRequired')),
    minStock: z.string().min(1, t('product.validation.minStockRequired')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "Electronics",
      price: "",
      stock: "",
      minStock: "10",
      description: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        description: product.description || "",
      });
    } else {
      form.reset({
        name: "",
        sku: "",
        category: "Electronics",
        price: "",
        stock: "",
        minStock: "10",
        description: "",
      });
    }
  }, [product, form]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/overview'] });
      toast({
        title: t('common.success'),
        description: t('toast.productCreated'),
      });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', `/api/products/${product?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/overview'] });
      toast({
        title: t('common.success'),
        description: t('toast.productUpdated'),
      });
      handleClose();
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const productData = {
      ...values,
      price: values.price,
      stock: parseInt(values.stock),
      minStock: parseInt(values.minStock),
    };

    if (product) {
      updateMutation.mutate(productData);
    } else {
      createMutation.mutate(productData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const categories = [
    { value: 'Electronics', label: t('product.categories.electronics') },
    { value: 'Clothing', label: t('product.categories.clothing') },
    { value: 'Food & Beverage', label: t('product.categories.food') },
    { value: 'Furniture', label: t('product.categories.furniture') },
    { value: 'Toys', label: t('product.categories.toys') },
    { value: 'Books & Office', label: t('product.categories.books') },
    { value: 'Sports', label: t('product.categories.sports') },
    { value: 'Other', label: t('product.categories.other') },
  ];

  return (
    <Dialog open={isDialogOpen} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {product ? t('product.editProduct') : t('product.addNew')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('product.productName')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('product.productNamePlaceholder')} className="h-9 text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('product.sku')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('product.skuPlaceholder')} className="font-mono h-9 text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('product.category')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder={t('product.categoryPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('product.price')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder={t('product.pricePlaceholder')} className="h-9 text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('product.stock')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder={t('product.stockPlaceholder')} className="h-9 text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('product.minStock')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder={t('product.minStockPlaceholder')} className="h-9 text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => {
                const { value, ...fieldProps } = field;
                return (
                  <FormItem>
                    <FormLabel>{t('product.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...fieldProps}
                        value={value || ""}
                        placeholder={t('product.descriptionPlaceholder')}
                        rows={3}
                        className="text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" size="sm" onClick={handleClose} className="text-xs">
                {t('product.cancel')}
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="text-xs">
                {isPending ? t('common.loading') : t('product.save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
