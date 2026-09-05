import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Search, User, Shield, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActivityLog } from "@shared/schema";

export default function Activities() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/activities'],
  });

  const filteredLogs = logs.filter(log =>
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE") || action.includes("ADD")) return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">{action}</Badge>;
    if (action.includes("UPDATE") || action.includes("TRIGGER")) return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[10px]">{action}</Badge>;
    if (action.includes("DELETE")) return <Badge variant="destructive" className="text-[10px]">{action}</Badge>;
    return <Badge variant="outline" className="text-[10px]">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Audit & Activity Logs</h1>
        <p className="text-xs text-muted-foreground">Immutable trail of administrative operations, data mutations, and automated script executions.</p>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter logs by user, action, entity, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Logs Data Table */}
      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="text-xs">
              <TableHead>User / Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Scope</TableHead>
              <TableHead>Event Details</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                  Loading activity logs...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-xs text-muted-foreground">
                  No activity records found matching search filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="text-xs hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{log.user}</span>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">{log.entity}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-md">{log.details}</TableCell>
                  <TableCell className="text-right font-mono text-[11px] text-muted-foreground">{log.timestamp}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
