import { cn } from "@/lib/utils";

export default function StatPill({
  label,
  value,
  tone = "primary",
  "data-testid": dataTestId,
}: {
  label: string;
  value: string | number;
  tone?: "primary" | "accent" | "muted";
  "data-testid"?: string;
}) {
  const toneCls =
    tone === "primary"
      ? "from-primary/14 to-primary/6 text-foreground"
      : tone === "accent"
        ? "from-accent/16 to-accent/8 text-foreground"
        : "from-muted/80 to-muted/40 text-foreground";

  const dot =
    tone === "primary"
      ? "bg-primary"
      : tone === "accent"
        ? "bg-accent"
        : "bg-muted-foreground/40";

  return (
    <div
      data-testid={dataTestId}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70",
        "bg-gradient-to-br",
        toneCls,
        "px-4 py-3 shadow-soft transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lift",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className={cn("h-2 w-2 rounded-full", dot)} aria-hidden />
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight">{value}</div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full",
          "bg-white/35 blur-2xl transition-opacity duration-300",
          "opacity-0 group-hover:opacity-100",
        )}
      />
    </div>
  );
}
