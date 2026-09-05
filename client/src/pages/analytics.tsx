import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  BarChart3, TrendingUp, Sparkles, Sliders, RefreshCw, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import type { Product, AnalyticsOverview, ForecastingData } from "@shared/schema";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

export default function Analytics() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("sales");

  // Chart Studio Customization State
  const [studioMetric, setStudioMetric] = useState<"revenue" | "stock" | "price">("revenue");
  const [studioGroupBy, setStudioGroupBy] = useState<"category" | "region">("category");
  const [studioChartType, setStudioChartType] = useState<"bar" | "line" | "pie" | "radar">("bar");

  const { data: analytics } = useQuery<AnalyticsOverview>({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: forecasting } = useQuery<ForecastingData>({
    queryKey: ['/api/analytics/forecasting'],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  if (!analytics || !forecasting) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate Chart Studio Dataset
  const getStudioData = () => {
    if (studioGroupBy === "category") {
      const categories = Array.from(new Set(products.map(p => p.category)));
      return categories.map(cat => {
        const catProds = products.filter(p => p.category === cat);
        let val = 0;
        if (studioMetric === "revenue") val = catProds.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0);
        else if (studioMetric === "stock") val = catProds.reduce((sum, p) => sum + p.stock, 0);
        else val = catProds.reduce((sum, p) => sum + parseFloat(p.price), 0) / (catProds.length || 1);

        return { name: cat, value: Math.round(val) };
      });
    } else {
      return analytics.regionalSales.map((r: { region: string; revenue: number }) => ({
        name: r.region,
        value: studioMetric === "revenue" ? r.revenue : Math.round(r.revenue / 150)
      }));
    }
  };

  const studioData = getStudioData();

  // Forecasting Chart Data Combine
  const forecastingChartData = [
    ...forecasting.historical.map((h: { date: string; actualRevenue: number }) => ({
      date: h.date,
      actual: h.actualRevenue,
      predicted: null,
      lower: null,
      upper: null,
    })),
    ...forecasting.predictions.map((p: { date: string; predictedRevenue: number; lowerBound: number; upperBound: number }) => ({
      date: p.date,
      actual: null,
      predicted: p.predictedRevenue,
      lower: p.lowerBound,
      upper: p.upperBound,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Data Visualization Studio</h1>
          <p className="text-xs text-muted-foreground">Deep financial insights, inventory intelligence, predictive AI forecasting & custom chart builder.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export PDF Summary
        </Button>
      </div>

      {/* Main Analytics Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted p-1 border border-border/50">
          <TabsTrigger value="sales" className="gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" /> Sales Performance
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" /> Inventory Intelligence
          </TabsTrigger>
          <TabsTrigger value="forecasting" className="gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Predictive Forecasting
          </TabsTrigger>
          <TabsTrigger value="studio" className="gap-1.5 text-xs">
            <Sliders className="h-3.5 w-3.5 text-primary" /> Interactive Chart Studio
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Sales Performance */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">12-Month Revenue vs Gross Profit</CardTitle>
                <CardDescription className="text-xs">Comparative financial trajectory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v: number) => `$${v/1000}k`} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Total Revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="profit" name="Gross Profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Order Volume Trajectory</CardTitle>
                <CardDescription className="text-xs">Number of fulfilled transactions per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip formatter={(v: number) => `${v} orders`} />
                      <Bar dataKey="orders" name="Order Volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Inventory Intelligence */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Top Products by Stock Valuation</CardTitle>
                <CardDescription className="text-xs">Highest total capital tied up in inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...products].sort((a, b) => (parseFloat(b.price) * b.stock) - (parseFloat(a.price) * a.stock)).slice(0, 7).map((p: Product) => ({
                        name: p.name.length > 18 ? p.name.slice(0, 18) + '...' : p.name,
                        value: Math.round(parseFloat(p.price) * p.stock)
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v: number) => `$${v}`} />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={130} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Category Capital Distribution</CardTitle>
                <CardDescription className="text-xs">Value contribution per product vertical</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        nameKey="category"
                        label={({ name, percent }: { name: string; percent: number }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {analytics.categoryDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Predictive Forecasting */}
        <TabsContent value="forecasting" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> AI-Driven Revenue Projection Model
              </CardTitle>
              <CardDescription className="text-xs">
                3-Month forward projection computed via double exponential moving averages & seasonal trend variance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastingChartData}>
                    <defs>
                      <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v: number) => `$${v/1000}k`} />
                    <Tooltip formatter={(v: number) => v ? `$${v.toLocaleString()}` : 'N/A'} />
                    <Legend />
                    <Area type="monotone" dataKey="actual" name="Historical Revenue" stroke="#3b82f6" strokeWidth={2.5} fill="#3b82f6" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="predicted" name="Predicted Trajectory" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 5" fill="url(#colorPred)" />
                    <Line type="monotone" dataKey="upper" name="Upper Confidence Bound" stroke="#10b981" strokeWidth={1} strokeDasharray="2 2" dot={false} />
                    <Line type="monotone" dataKey="lower" name="Lower Confidence Bound" stroke="#ef4444" strokeWidth={1} strokeDasharray="2 2" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Interactive Chart Studio */}
        <TabsContent value="studio" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Custom Visualization Studio</CardTitle>
              <CardDescription className="text-xs">Configure metrics, dimensions, and visualization formats on demand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Studio Controls */}
              <div className="grid gap-4 md:grid-cols-3 p-4 rounded-xl bg-muted/30 border">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Dataset Metric</Label>
                  <Select value={studioMetric} onValueChange={(v: any) => setStudioMetric(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Total Inventory Valuation ($)</SelectItem>
                      <SelectItem value="stock">Stock Unit Quantity</SelectItem>
                      <SelectItem value="price">Average Unit Price ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Dimension Group</Label>
                  <Select value={studioGroupBy} onValueChange={(v: any) => setStudioGroupBy(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Product Categories</SelectItem>
                      <SelectItem value="region">Geographic Regions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Chart Visualization Type</Label>
                  <Select value={studioChartType} onValueChange={(v: any) => setStudioChartType(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="radar">Radar Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Render Selected Chart */}
              <div className="h-96 w-full p-4 border rounded-xl bg-card">
                <ResponsiveContainer width="100%" height="100%">
                  {studioChartType === "bar" ? (
                    <BarChart data={studioData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip formatter={(v: number) => `${v.toLocaleString()}`} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : studioChartType === "line" ? (
                    <LineChart data={studioData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip formatter={(v: number) => `${v.toLocaleString()}`} />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  ) : studioChartType === "pie" ? (
                    <PieChart>
                      <Pie data={studioData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                        {studioData.map((_: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v.toLocaleString()}`} />
                    </PieChart>
                  ) : (
                    <RadarChart cx="50%" cy="50%" outerRadius={110} data={studioData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <PolarRadiusAxis />
                      <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                      <Tooltip formatter={(v: number) => `${v.toLocaleString()}`} />
                    </RadarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
