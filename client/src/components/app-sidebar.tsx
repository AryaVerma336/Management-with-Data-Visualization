import { LayoutDashboard, Package, ShoppingCart, BarChart3, Zap, Building2, ClipboardList, Settings, Globe } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: '中文' },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { t, i18n } = useTranslation();

  const mainNavItems = [
    { title: t('nav.dashboard', 'Dashboard'), url: "/", icon: LayoutDashboard },
    { title: t('nav.inventory', 'Inventory'), url: "/inventory", icon: Package },
    { title: "Sales & Orders", url: "/orders", icon: ShoppingCart },
    { title: t('nav.analytics', 'Analytics Studio'), url: "/analytics", icon: BarChart3 },
    { title: "Automation & Scripts", url: "/automation", icon: Zap },
    { title: "Suppliers", url: "/suppliers", icon: Building2 },
    { title: "Activity Logs", url: "/activities", icon: ClipboardList },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="px-6 py-4 flex flex-row items-center gap-3 border-b border-border/40">
        <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-lg border border-primary/30">
          V
        </div>
        <div>
          <h2 className="font-bold text-base tracking-tight leading-none text-foreground">ApexManager</h2>
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Analytics & Data Vis</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
            Core Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`w-full justify-start gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm' 
                          : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                      }`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 border-t border-border/40 space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
              <Globe className="h-3.5 w-3.5" />
              <span>{currentLanguage.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className="text-xs cursor-pointer"
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/40 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Status: <strong className="text-foreground">Online</strong></span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
