"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main role="alert" className="mx-auto grid min-h-[45vh] max-w-xl content-center justify-items-center px-5 text-center">
      <h1 className="text-xl font-semibold text-foreground">Data belum dapat dimuat</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Terjadi kendala saat mengambil data. Coba muat ulang halaman.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover"
      >
        Coba lagi
      </button>
    </main>
  );
}