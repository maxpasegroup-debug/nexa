"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  exiting: boolean;
};

type ToastContextValue = {
  toast: (message: string, type: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, string> = {
  success: "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#d8fff3]",
  error: "border-[#FF6B6B]/30 bg-[#FF6B6B]/10 text-[#ffdede]",
  warning: "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#ffe9be]",
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
    (message: string, type: ToastType) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, type, exiting: false }]);
      window.setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-5 top-5 z-[100] flex w-[340px] max-w-[calc(100vw-40px)] flex-col gap-3">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl shadow-black/30 backdrop-blur ${toastStyles[item.type]} ${
              item.exiting ? "toast-out" : "toast-in"
            }`}
          >
            {item.message}
          </div>
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
            transform: translateX(18px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes toastOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }

          to {
            opacity: 0;
            transform: translateX(18px);
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
