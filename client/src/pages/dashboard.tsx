import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import {
  DollarSign, ShoppingCart, Package, Zap, TrendingUp,
  AlertTriangle, ArrowRight, RefreshCw, Layers, MapPin, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import type { Product, AnalyticsOverview } from "@shared/schema";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("30d");

  const { data: analytics, isLoading: analyticsLoading, refetch } = useQuery<AnalyticsOverview>({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  if (analyticsLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading executive metrics dashboard...</p>
        </div>
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-muted-foreground">Real-time enterprise metrics, sales analytics & system status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
            <TabsList className="h-8 text-xs bg-muted">
              <TabsTrigger value="7d" className="text-xs px-2.5 h-7">7D</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2.5 h-7">30D</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs px-2.5 h-7">90D</TabsTrigger>
              <TabsTrigger value="1y" className="text-xs px-2.5 h-7">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 w-8 p-0">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-500 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+{analytics.revenueGrowth}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-500 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+{analytics.ordersGrowth}% fulfillment rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Inventory Valuation
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {analytics.totalProducts} unique SKUs
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Automations
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeTasks} Workflows</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500 font-medium">
              <Activity className="h-3.5 w-3.5" />
              <span>100% operational status</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Revenue & Sales Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Revenue & Profit History</CardTitle>
              <CardDescription className="text-xs">Monthly performance trajectory over 12 months</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setLocation('/analytics')} className="text-xs gap-1">
              Deep Analytics <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(val: number) => `$${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => `$${val.toLocaleString()}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="profit" name="Gross Profit ($)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Breakdown Bar Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Regional Sales
            </CardTitle>
            <CardDescription className="text-xs">Revenue contribution by geographic territory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.regionalSales} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v: number) => `$${v/1000}k`} />
                  <YAxis dataKey="region" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => `$${val.toLocaleString()}`}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Dashboard Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Category Share Donut */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-500" /> Category Distribution
            </CardTitle>
            <CardDescription className="text-xs">Inventory breakdown by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="category"
                  >
                    {analytics.categoryDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {analytics.categoryDistribution.map((item: any, idx: number) => (
                <div key={item.category} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate">{item.category} ({item.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-4 w-4" /> Low Stock Warnings
              </CardTitle>
              <CardDescription className="text-xs">Items near or below reorder threshold</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">
              {lowStockProducts.length} Items
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">All inventory stock levels are healthy.</p>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                    <div>
                      <p className="font-medium text-xs truncate max-w-[160px]">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">SKU: {p.sku}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={p.stock === 0 ? "destructive" : "secondary"} className="text-[10px]">
                        {p.stock === 0 ? "Out of Stock" : `${p.stock} units left`}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Min: {p.minStock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/inventory')}
              className="w-full mt-3 text-xs"
            >
              Manage Inventory Stock
            </Button>
          </CardContent>
        </Card>

        {/* Audit Activity Stream */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Live System Activity</CardTitle>
              <CardDescription className="text-xs">Audit log stream of user & system events</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setLocation('/activities')} className="text-xs p-0 h-auto">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics.recentActivities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-medium leading-tight truncate">{act.details}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{act.user}</span>
                      <span>•</span>
                      <span>{act.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
