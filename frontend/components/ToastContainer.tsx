import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Toast {
  id: number;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

let toastCounter = 0;
const toastEvents = new EventTarget();

export function showToast(
  type: Toast["type"],
  title: string,
  message: string,
  duration = 5000
) {
  const toast: Toast = {
    id: toastCounter++,
    type,
    title,
    message,
    duration,
  };
  toastEvents.dispatchEvent(new CustomEvent("toast", { detail: toast }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const toast = (e as CustomEvent).detail as Toast;
      setToasts((prev) => [...prev, toast]);

      if (toast.duration) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, toast.duration);
      }
    };

    toastEvents.addEventListener("toast", handleToast);
    return () => toastEvents.removeEventListener("toast", handleToast);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
    }
  };

  const getColors = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-500 text-green-100";
      case "error":
        return "bg-red-900/90 border-red-500 text-red-100";
      case "warning":
        return "bg-yellow-900/90 border-yellow-500 text-yellow-100";
      case "info":
        return "bg-blue-900/90 border-blue-500 text-blue-100";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`
              pointer-events-auto
              max-w-md w-full
              rounded-xl border-2 p-4
              backdrop-blur-lg
              shadow-2xl
              ${getColors(toast.type)}
            `}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
                className="text-3xl"
              >
                {getIcon(toast.type)}
              </motion.div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{toast.title}</h3>
                <p className="text-sm opacity-90 whitespace-pre-line">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Progress bar */}
            {toast.duration && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: toast.duration / 1000, ease: "linear" }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
