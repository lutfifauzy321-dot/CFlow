export default function DashboardLoading() {
  return (
    <div
      aria-label="Memuat data"
      aria-busy="true"
      className="mx-auto max-w-360 space-y-6 animate-pulse"
    >
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-surface-alt" />
        <div className="h-8 w-56 rounded-md bg-surface-alt" />
        <div className="h-4 w-72 rounded bg-surface-alt" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-28 rounded-xl border border-border bg-surface" />
        <div className="h-28 rounded-xl border border-border bg-surface" />
        <div className="h-28 rounded-xl border border-border bg-surface" />
      </div>

      <div className="h-80 rounded-xl border border-border bg-surface" />
    </div>
  );
}
