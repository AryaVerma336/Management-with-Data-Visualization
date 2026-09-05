import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Play, Pause, RefreshCw, FolderCheck, Mail, FileText, CheckCircle2, AlertTriangle, Terminal, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { AutomationTask } from "@shared/schema";

export default function Automation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "[SYSTEM INITIATED] Automation Engine v2.4 initialized.",
    "[SCHEDULE LOADED] 6 active cron workers standing by.",
  ]);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New task form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("file_organizer");
  const [schedule, setSchedule] = useState("Daily at 00:00");

  const { data: tasks = [], isLoading } = useQuery<AutomationTask[]>({
    queryKey: ['/api/tasks'],
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task Status Updated", description: "Automation schedule state changed." });
    },
  });

  const runTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      setRunningTaskId(id);
      const res = await fetch(`/api/tasks/${id}/run`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to run task");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setRunningTaskId(null);
      setTerminalOutput(prev => [
        `[${new Date().toLocaleTimeString()}] EXECUTE SUCCESS: ${data.message}`,
        ...prev
      ]);
      toast({ title: "Task Executed", description: data.message });
    },
    onError: (err: Error) => {
      setRunningTaskId(null);
      toast({ title: "Task Error", description: err.message, variant: "destructive" });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, type, schedule, status: "active" }),
      });
      if (!res.ok) throw new Error("Failed to create task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task Created", description: "New automation schedule registered." });
      setIsCreateOpen(false);
      setName("");
      setDescription("");
    },
  });

  const getTaskIcon = (typeStr: string) => {
    switch (typeStr) {
      case "file_organizer": return <FolderCheck className="h-5 w-5 text-blue-500" />;
      case "email_alert": return <Mail className="h-5 w-5 text-amber-500" />;
      case "report_generator": return <FileText className="h-5 w-5 text-emerald-500" />;
      default: return <Zap className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automation & Workflow Engine</h1>
          <p className="text-xs text-muted-foreground">Automated file organizers, email notification dispatchers, and scheduled reports.</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Create Automation Schedule
        </Button>
      </div>

      {/* Main Grid: Tasks & Live Output Terminal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Cards List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              Loading automation schedule...
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="border-border/50 bg-card hover:border-border transition-colors">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-muted/60 border border-border/50 shrink-0">
                      {getTaskIcon(task.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{task.name}</h3>
                        <Badge variant={task.status === "active" ? "default" : "secondary"} className="text-[10px]">
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground max-w-lg leading-snug">{task.description}</p>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
                        <span>Schedule: <strong>{task.schedule}</strong></span>
                        <span>Runs: <strong>{task.executionCount}</strong></span>
                        <span>Last: <strong>{task.lastRun || "Never"}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    <Switch
                      checked={task.status === "active"}
                      onCheckedChange={() => toggleStatusMutation.mutate(task.id)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={runningTaskId === task.id}
                      onClick={() => runTaskMutation.mutate(task.id)}
                      className="gap-1.5 text-xs h-8"
                    >
                      {runningTaskId === task.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                      ) : (
                        <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                      )}
                      <span>Run Now</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Live Execution Terminal */}
        <Card className="border-border/50 flex flex-col h-[520px]">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2 font-mono">
              <Terminal className="h-4 w-4 text-emerald-500" /> Live Script Console
            </CardTitle>
            <CardDescription className="text-[11px]">Real-time automation engine execution logs</CardDescription>
          </CardHeader>
          <CardContent className="p-3 flex-1 bg-zinc-950 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1.5 rounded-b-xl">
            {terminalOutput.map((log, index) => (
              <div key={index} className="leading-relaxed border-b border-zinc-900 pb-1">
                {log}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">New Automation Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label>Task Title</Label>
              <Input placeholder="File Organizer Script" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input placeholder="Description of automated action..." value={description} onChange={(e) => setDescription(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Workflow Category</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file_organizer">File & Folder Cleanup</SelectItem>
                    <SelectItem value="email_alert">Email Notification</SelectItem>
                    <SelectItem value="report_generator">Report Generator</SelectItem>
                    <SelectItem value="inventory_sync">Inventory Sync</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Execution Schedule</Label>
                <Input placeholder="Daily at 00:00" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>
            <Button
              onClick={() => createTaskMutation.mutate()}
              disabled={!name || !description || createTaskMutation.isPending}
              className="w-full text-xs mt-2"
            >
              Save Workflow Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
