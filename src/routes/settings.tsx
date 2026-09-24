import { createFileRoute } from "@tanstack/react-router";
import { Download, Moon, Settings as SettingsIcon, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { clearActivity, exportToPdf, timeAgo, useFavourites } from "@/lib/storage";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TeachAssist" },
      {
        name: "description",
        content: "Manage appearance, saved favourites and stored activity in TeachAssist.",
      },
      { property: "og:title", content: "Settings — TeachAssist" },
      {
        property: "og:description",
        content: "Manage appearance, saved favourites and stored activity in TeachAssist.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { favourites, remove, clear } = useFavourites();

  return (
    <div className="space-y-8">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Appearance, saved responses and your locally stored data."
      />

      <Card className="no-print shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Switch between light and dark mode.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <Moon className="size-4 shrink-0" />
            <span className="truncate text-sm">Dark mode</span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggle} aria-label="Dark mode" />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate text-lg font-semibold">Saved responses ({favourites.length})</h2>
          <div className="no-print flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToPdf}>
              <Download className="size-4" /> Export PDF
            </Button>
            {favourites.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clear();
                  toast.success("Favourites cleared");
                }}
              >
                <Trash2 className="size-4" /> Clear
              </Button>
            )}
          </div>
        </div>

        {favourites.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No favourites yet"
            hint="Tap Save on any schedule, summary or chat reply and it will be stored here in this browser."
          />
        ) : (
          <div className="space-y-3">
            {favourites.map((f) => (
              <Card key={f.id} className="shadow-card">
                <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 pb-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{f.title}</CardTitle>
                    <CardDescription>
                      <Badge className="mr-2 bg-accent text-accent-foreground">{f.tool}</Badge>
                      {timeAgo(f.createdAt)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="no-print"
                    aria-label="Remove"
                    onClick={() => remove(f.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {f.content.slice(0, 600)}
                    {f.content.length > 600 ? "…" : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="no-print shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Stored data</CardTitle>
          <CardDescription>
            TeachAssist keeps everything in this browser only — nothing is uploaded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearActivity();
              toast.success("Activity history cleared");
            }}
          >
            <Trash2 className="size-4" /> Clear activity history
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
