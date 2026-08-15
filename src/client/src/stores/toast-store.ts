import { create } from "zustand";
import { ToastData } from "@/types/toast";

interface ToastState {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

let toastId = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastId}-${Date.now()}`;
    const newToast: ToastData = { ...toast, id };

    set((state) => {
      const toasts = [...state.toasts, newToast].slice(-3);
      return { toasts };
    });

    const duration = toast.duration ?? 4000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (title, description) => {
    get().addToast({ variant: "success", title, description });
  },

  error: (title, description) => {
    get().addToast({ variant: "error", title, description, duration: 6000 });
  },

  warning: (title, description) => {
    get().addToast({ variant: "warning", title, description });
  },

  info: (title, description) => {
    get().addToast({ variant: "info", title, description });
  },
}));