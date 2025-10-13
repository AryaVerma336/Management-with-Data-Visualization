import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCategoryLabel } from "@/lib/category-utils";
import type { Product } from "@shared/schema";

export default function Analytics() {
  const { t } = useTranslation();
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const topProducts = [...products]
    .map(p => ({
      name: p.name,
      value: parseFloat(p.price) * p.stock,
      stock: p.stock,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryPerformance = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    return {
      category: getCategoryLabel(cat, t),
      products: catProducts.length,
      totalValue: catProducts.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0),
      avgStock: catProducts.reduce((sum, p) => sum + p.stock, 0) / catProducts.length || 0,
    };
  });

  const healthData = [
    { name: t('dashboard.healthyStock'), value: products.filter(p => p.stock > p.minStock).length },
    { name: t('inventory.lowStock'), value: products.filter(p => p.stock > 0 && p.stock <= p.minStock).length },
    { name: t('inventory.outOfStock'), value: products.filter(p => p.stock === 0).length },
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
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-analytics-title">{t('analytics.title')}</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.topProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" width={150} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }} 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.categoryPerformance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="products" fill="hsl(var(--chart-2))" name={t('dashboard.products')} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgStock" fill="hsl(var(--chart-3))" name={t('dashboard.avgStock')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.inventoryHealth')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={healthData}>
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
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
