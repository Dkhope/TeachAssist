import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, ListChecks, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ThinkingState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ResultActions } from "@/components/result-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateSchedule, type Priority, type SchedulePlan, type Task } from "@/lib/mock-ai";
import { logActivity, useTasks } from "@/lib/storage";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — TeachAssist" },
      {
        name: "description",
        content:
          "Add your tasks, deadlines and priorities and get an intelligent daily or weekly teaching schedule.",
      },
      { property: "og:title", content: "AI Task Planner — TeachAssist" },
      {
        property: "og:description",
        content:
          "Add your tasks, deadlines and priorities and get an intelligent daily or weekly teaching schedule.",
      },
    ],
  }),
  component: Planner,
});

const priorityStyles: Record<Priority, string> = {
  high: "bg-secondary text-secondary-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

function Planner() {
  const [tasks, setTasks] = useTasks();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [minutes, setMinutes] = useState("45");
  const [mode, setMode] = useState<"daily" | "weekly">("daily");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<SchedulePlan | null>(null);

  const addTask = () => {
    if (!title.trim()) {
      toast.error("Give the task a name first");
      return;
    }
    setTasks((t) => [
      ...t,
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        deadline,
        priority,
        minutes: Number(minutes) || 45,
      },
    ]);
    setTitle("");
    setDeadline("");
    setMinutes("45");
    setPriority("medium");
  };

  const run = async () => {
    if (tasks.length === 0) {
      toast.error("Add at least one task");
      return;
    }
    setLoading(true);
    setPlan(null);
    const result = await generateSchedule(tasks, mode);
    setPlan(result);
    setLoading(false);
    logActivity("Task Planner", `Generated a ${mode} schedule for ${tasks.length} tasks`);
  };

  const planText = plan
    ? `${plan.summary}\n\n${plan.days
        .map(
          (d) =>
            `${d.day} — ${d.focus}\n${d.blocks.map((b) => `${b.time}  ${b.title} (${b.detail})`).join("\n")}`,
        )
        .join("\n\n")}\n\nTips:\n${plan.tips.map((t) => `• ${t}`).join("\n")}`
    : "";

  return (
    <div className="space-y-8">
      <PageHeader
        icon={CalendarClock}
        title="AI Task Planner"
        description="Capture what needs doing, then let the planner sequence it around your energy and deadlines."
      />

      <Card className="no-print shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Add a task</CardTitle>
          <CardDescription>Name it, set a deadline and how urgent it feels.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="task">Task</Label>
            <Input
              id="task"
              placeholder="Mark Year 8 essays"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minutes">Estimated minutes</Label>
            <Input
              id="minutes"
              type="number"
              min={15}
              step={15}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={addTask} className="w-full">
              <Plus className="size-4" /> Add task
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="no-print space-y-3">
        <h2 className="text-lg font-semibold">Your tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No tasks yet"
            hint="Add a few things from your week — marking, planning, meetings — and the planner will order them for you."
          />
        ) : (
          <Card className="shadow-card">
            <CardContent className="divide-y p-0">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.minutes} min{t.deadline ? ` · due ${t.deadline}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className={priorityStyles[t.priority]}>{t.priority}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove task"
                      onClick={() => setTasks((list) => list.filter((x) => x.id !== t.id))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "daily" | "weekly")}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={run} disabled={loading}>
            <Sparkles className="size-4" /> {loading ? "Planning…" : "Generate schedule"}
          </Button>
        </div>
      </section>

      {loading && <ThinkingState label="Prioritising tasks and building your schedule…" />}

      {plan && (
        <section className="space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <h2 className="text-lg font-semibold">Your {mode} schedule</h2>
            <ResultActions tool="Task Planner" title={`${mode} schedule`} content={planText} />
          </div>

          <Card className="shadow-card">
            <CardContent className="pt-6 text-sm leading-relaxed">{plan.summary}</CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {plan.days.map((d) => (
              <Card key={d.day} className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{d.day}</CardTitle>
                  <CardDescription className="truncate">Focus: {d.focus}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-0">
                  {d.blocks.map((b, i) => (
                    <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-l-2 border-primary/30 py-2 pl-3">
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-primary">
                        {b.time}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{b.title}</p>
                        <p className="text-xs text-muted-foreground">{b.detail}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.tips.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
