import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Package, AlertTriangle, DollarSign, Grid3X3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { getCategoryLabel } from "@/lib/category-utils";
import type { Product } from "@shared/schema";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockItems = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0);
  
  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryData = categories.map(cat => ({
    name: getCategoryLabel(cat, t),
    value: products.filter(p => p.category === cat).length,
    stock: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.stock, 0),
  }));

  const stockLevelData = [
    { name: t('dashboard.healthyStock'), value: products.filter(p => p.stock > p.minStock).length },
    { name: t('inventory.lowStock'), value: lowStockItems },
    { name: t('inventory.outOfStock'), value: outOfStockItems },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-dashboard-title">{t('dashboard.title')}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalProducts')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-products">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {categories.length} {t('dashboard.categories')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.lowStock')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4" data-testid="text-low-stock">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {outOfStockItems} {t('inventory.outOfStock')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalValue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-value">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.acrossInventory')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.categories')}</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-categories">{categories.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.activeCategories')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.categoryDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }} 
                />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.stockLevels')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="hsl(var(--chart-1))"
                  dataKey="value"
                >
                  {stockLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
