import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopHeader } from "@/components/top-header";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Orders from "@/pages/orders";
import Analytics from "@/pages/analytics";
import Automation from "@/pages/automation";
import Suppliers from "@/pages/suppliers";
import Activities from "@/pages/activities";
import NotFound from "@/pages/not-found";
import "./i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/orders" component={Orders} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/automation" component={Automation} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/activities" component={Activities} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <TopHeader />
                <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
