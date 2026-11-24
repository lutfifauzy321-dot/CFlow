export default function DashboardLoading() {
  return (
    <div
      aria-label="Memuat halaman"
      aria-busy="true"
      className="mx-auto max-w-360 space-y-6 animate-pulse"
    >
      <div className="space-y-2.5">
        <div className="h-3.5 w-36 rounded-full bg-surface-alt" />
        <div className="h-8 w-64 rounded-xl bg-surface-alt" />
        <div className="h-4 w-80 rounded-lg bg-surface-alt" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-32 rounded-3xl border border-border/70 bg-surface" />
        <div className="h-32 rounded-3xl border border-border/70 bg-surface" />
        <div className="h-32 rounded-3xl border border-border/70 bg-surface" />
        <div className="h-32 rounded-3xl border border-border/70 bg-surface" />
      </div>

      <div className="h-80 rounded-3xl border border-border/70 bg-surface" />
    </div>
  );
}
