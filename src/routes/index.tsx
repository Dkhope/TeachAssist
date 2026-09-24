import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CalendarClock,
  Clock,
  MessageSquareHeart,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useActivity, useFavourites, timeAgo } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TeachAssist" },
      {
        name: "description",
        content:
          "Your teaching day at a glance: planner, research assistant and AI chat in one dashboard.",
      },
      { property: "og:title", content: "Dashboard — TeachAssist" },
      {
        property: "og:description",
        content:
          "Your teaching day at a glance: planner, research assistant and AI chat in one dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/planner",
    icon: CalendarClock,
    title: "AI Task Planner",
    description: "Turn your task list into a prioritised daily or weekly schedule.",
  },
  {
    to: "/research",
    icon: BookOpenCheck,
    title: "Research Assistant",
    description: "Summarise a topic, article or link into classroom-ready insights.",
  },
  {
    to: "/assistant",
    icon: MessageSquareHeart,
    title: "AI Assistant",
    description: "Ask anything about planning, behaviour, marking or parent comms.",
  },
] as const;

function Dashboard() {
  const activity = useActivity();
  const { favourites } = useFavourites();

  const stats = [
    { label: "Tools used this week", value: activity.length, max: 12, icon: TrendingUp },
    { label: "Saved responses", value: favourites.length, max: 10, icon: Star },
    { label: "Time saved (est.)", value: activity.length * 25, max: 300, icon: Clock, unit: "min" },
  ];

  return (
    <div className="space-y-8">
      <section className="surface-hero relative overflow-hidden rounded-3xl p-6 shadow-soft sm:p-10">
        <Badge className="mb-4 bg-card text-card-foreground hover:bg-card">
          <Sparkles className="size-3.5" /> AI workspace
        </Badge>
        <h1 className="max-w-xl text-3xl font-semibold sm:text-4xl">
          Welcome back — let's make today lighter.
        </h1>
        <p className="mt-3 max-w-lg text-sm text-foreground/80 sm:text-base">
          Plan your tasks, research a topic, or talk things through with your assistant. Everything
          stays in this browser.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <s.icon className="size-4" /> {s.label}
              </CardDescription>
              <CardTitle className="text-3xl">
                {s.value}
                {s.unit ? <span className="ml-1 text-base font-medium">{s.unit}</span> : null}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.min(100, (s.value / s.max) * 100)} />
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Quick access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Link key={t.to} to={t.to} className="group">
              <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-soft">
                <CardHeader>
                  <span className="surface-primary mb-2 grid size-10 place-items-center rounded-2xl text-primary-foreground">
                    <t.icon className="size-5" />
                  </span>
                  <CardTitle className="text-base">{t.title}</CardTitle>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
        {activity.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nothing here yet"
            hint="Generate a schedule, summary or chat reply and it will show up here."
          />
        ) : (
          <Card className="shadow-card">
            <CardContent className="divide-y p-0">
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.tool}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(a.createdAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
