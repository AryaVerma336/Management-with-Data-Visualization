import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Download, Search, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import type { Notification } from "@shared/schema";

export function TopHeader() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const quickLinks = [
    { title: "Dashboard Overview", url: "/" },
    { title: "Inventory Products", url: "/inventory" },
    { title: "Sales & Orders", url: "/orders" },
    { title: "Analytics Studio", url: "/analytics" },
    { title: "Automation & Scripts", url: "/automation" },
    { title: "Suppliers & Vendors", url: "/suppliers" },
    { title: "System Activity Logs", url: "/activities" },
  ];

  const filteredLinks = quickLinks.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleExport = (type: string) => {
    window.open(`/api/export/${type}?format=csv`, '_blank');
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchOpen(true)}
          className="h-8 text-xs text-muted-foreground w-64 justify-between bg-muted/30 border-muted"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search features & pages...</span>
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            Ctrl K
          </kbd>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* Export Data Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("products")} className="text-xs cursor-pointer">
              Export Products (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("orders")} className="text-xs cursor-pointer">
              Export Sales & Orders (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("tasks")} className="text-xs cursor-pointer">
              Export Automation Tasks (CSV)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Drawer */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="font-semibold text-xs">System Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border/30">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markReadMutation.mutate(n.id)}
                    className={`p-3 text-xs flex gap-2 cursor-pointer transition-colors ${
                      n.read ? "opacity-60 hover:bg-muted/40" : "bg-primary/5 hover:bg-primary/10 font-medium"
                    }`}
                  >
                    <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground">{n.timestamp}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-tight">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>

      {/* Quick Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-sm font-semibold">Quick Navigation</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-2">
            <Input
              placeholder="Type a page name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto border-t p-2">
            {filteredLinks.map((link) => (
              <div
                key={link.url}
                onClick={() => {
                  setLocation(link.url);
                  setSearchOpen(false);
                }}
                className="px-3 py-2 text-xs rounded-md hover:bg-accent cursor-pointer flex items-center justify-between"
              >
                <span>{link.title}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{link.url}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
