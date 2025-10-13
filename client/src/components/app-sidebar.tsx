import { LayoutDashboard, Package, BarChart3, Globe } from "lucide-react";
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

  const items = [
    {
      title: t('nav.dashboard'),
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: t('nav.inventory'),
      url: "/inventory",
      icon: Package,
    },
    {
      title: t('nav.analytics'),
      url: "/analytics",
      icon: BarChart3,
    },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold px-4 py-3">
            {t('nav.brand')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.url === '/' ? 'dashboard' : item.url.slice(1)}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-language-selector">
              <Globe className="h-4 w-4 mr-2" />
              <span>{currentLanguage.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                data-testid={`language-${lang.code}`}
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
