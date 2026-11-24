"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Trash2,
  X,
} from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
};

type NotificationContextValue = {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
      const timer = setTimeout(() => {
        dismissToast(id);
      }, 3600);
      timersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  const toast = {
    success: useCallback(
      (message: string, title = "Berhasil") => pushToast("success", message, title),
      [pushToast],
    ),
    error: useCallback(
      (message: string, title = "Terjadi Kesalahan") => pushToast("error", message, title),
      [pushToast],
    ),
    info: useCallback(
      (message: string, title = "Informasi") => pushToast("info", message, title),
      [pushToast],
    ),
  };

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const handleConfirmChoice = useCallback((accepted: boolean) => {
    setConfirmState((prev) => {
      if (prev) prev.resolve(accepted);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!confirmState) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleConfirmChoice(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmState, handleConfirmChoice]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Custom Confirmation Dialog */}
      {confirmState && (
        <div
          className="fixed inset-0 z-80 flex items-end justify-center bg-foreground/50 p-4 backdrop-blur-xs sm:items-center animate-in fade-in duration-150"
          onClick={() => handleConfirmChoice(false)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-border bg-white/95 dark:bg-[#161032]/95 p-6 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-4">
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-2xl border ${
                  confirmState.options.tone === "primary"
                    ? "bg-primary-soft text-primary border-primary/20"
                    : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/50"
                }`}
              >
                {confirmState.options.tone === "primary" ? (
                  <AlertTriangle size={22} />
                ) : (
                  <Trash2 size={22} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <h2
                  id="confirm-dialog-title"
                  className="text-base sm:text-lg font-bold text-foreground"
                >
                  {confirmState.options.title}
                </h2>
                <p
                  id="confirm-dialog-desc"
                  className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted"
                >
                  {confirmState.options.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => handleConfirmChoice(false)}
                className="h-10.5 rounded-xl border border-border bg-surface-alt/70 px-4 text-xs sm:text-sm font-semibold text-foreground-soft transition hover:bg-surface-alt"
              >
                {confirmState.options.cancelLabel ?? "Batal"}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => handleConfirmChoice(true)}
                className={`h-10.5 rounded-xl px-5 text-xs sm:text-sm font-semibold text-white shadow-sm transition active:scale-95 ${
                  confirmState.options.tone === "primary"
                    ? "bg-primary hover:bg-primary-hover"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {confirmState.options.confirmLabel ?? "Ya, Hapus"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Floating Toast Notifications */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 right-4 left-4 z-90 flex flex-col items-end gap-2.5 sm:left-auto sm:w-full sm:max-w-sm"
        >
          {toasts.map((item) => {
            const isSuccess = item.type === "success";
            const isError = item.type === "error";
            const Icon = isSuccess
              ? CheckCircle2
              : isError
                ? AlertCircle
                : Info;

            return (
              <div
                key={item.id}
                role="status"
                className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-border bg-white/95 dark:bg-[#161032]/95 p-3.5 shadow-xl animate-in slide-in-from-bottom-3 fade-in duration-200"
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                    isSuccess
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400"
                      : isError
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400"
                        : "bg-primary-soft text-primary"
                  }`}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                  {item.title && (
                    <p className="text-xs font-bold text-foreground leading-tight">
                      {item.title}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted leading-snug">
                    {item.message}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Tutup notifikasi"
                  onClick={() => dismissToast(item.id)}
                  className="grid size-7 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-alt hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
}
