import { useToastStore } from "@/stores/toast-store";

export function useToast() {
  const { success, error, warning, info, removeToast } = useToastStore();
  return { success, error, warning, info, removeToast };
}