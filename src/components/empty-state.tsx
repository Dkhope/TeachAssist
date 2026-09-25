import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center shadow-card">
      <span className="grid size-12 place-items-center rounded-lg bg-accent text-primary">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ThinkingState({ label = "Generating…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-5 shadow-card">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
