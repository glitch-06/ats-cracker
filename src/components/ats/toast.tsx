import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

/**
 * Minimal glass-pill toast system.
 * Purely local state — nothing is sent anywhere.
 */
type Toast = { id: number; message: string };

const ToastContext = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message }]);
    // auto-dismiss
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-fade-up border-2 border-border-strong bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-signal-foreground shadow-[4px_4px_0_0_var(--color-border-strong)]"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
