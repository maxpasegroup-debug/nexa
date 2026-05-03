"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  exiting: boolean;
  href?: string;
  variant?: "default" | "onboarding";
};

type ToastContextValue = {
  toast: (message: string, type: ToastType, options?: ToastOptions) => void;
};

type ToastOptions = {
  href?: string;
  variant?: "default" | "onboarding";
};

type ToastListener = (message: string, type: ToastType, options?: ToastOptions) => void;

const listeners = new Set<ToastListener>();

function emitToast(message: string, type: ToastType, options?: ToastOptions) {
  listeners.forEach((listener) => listener(message, type, options));
}

export const toast = {
  success: (message: string) => emitToast(message, "success"),
  error: (message: string) => emitToast(message, "error"),
  warning: (message: string) => emitToast(message, "warning"),
  info: (message: string) => emitToast(message, "warning"),
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, string> = {
  success: "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#d8fff3]",
  error: "border-[#FF6B6B]/30 bg-[#FF6B6B]/10 text-[#ffdede]",
  warning: "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#ffe9be]",
};

const variantStyles: Record<NonNullable<Toast["variant"]>, string> = {
  default: "",
  onboarding: "border-[#22D9A0]/40 bg-[#22D9A0]/20 text-[#eafff7] cursor-pointer",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, exiting: true } : toast,
      ),
    );

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 250);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType, options?: ToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((current) => [
        ...current,
        {
          id,
          message,
          type,
          exiting: false,
          href: options?.href,
          variant: options?.variant ?? "default",
        },
      ]);
      window.setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  useEffect(() => {
    const listener: ToastListener = (message, type, options) => toast(message, type, options);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [toast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 left-1/2 z-[100] flex w-[340px] max-w-[calc(100vw-40px)] -translate-x-1/2 flex-col gap-3">
        {toasts.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.href) window.location.href = item.href;
            }}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium shadow-2xl shadow-black/30 backdrop-blur ${toastStyles[item.type]} ${
              variantStyles[item.variant ?? "default"]
            } ${
              item.exiting ? "toast-out" : "toast-in"
            }`}
          >
            {item.message}
          </button>
        ))}
      </div>
      <style jsx>{`
        .toast-in {
          animation: toastIn 0.25s ease-out both;
        }

        .toast-out {
          animation: toastOut 0.25s ease-in both;
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes toastOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }

          to {
            opacity: 0;
            transform: translateY(18px);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
