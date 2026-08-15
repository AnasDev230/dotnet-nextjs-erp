"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import { login, logout as logoutApi } from "../api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { clearAuthCookie } from "@/lib/utils";
import type { LoginFormData } from "../schemas/auth.schema";

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const { t } = useTranslation();
  const { error } = useToast();

  return useMutation({
    mutationFn: (data: LoginFormData) =>
      login({ email: data.email, password: data.password }),
    onSuccess: (response) => {
      setUser(response);
      router.push("/");
    },
    onError: (err) => {
      error(t("auth.loginFailed"), getErrorMessage(err) || undefined);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const storeLogout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await storeLogout();
    },
    onSuccess: () => {
      clearAuthCookie();
      router.push("/login");
    },
    onError: () => {
      clearAuthCookie();
      router.push("/login");
    },
  });
}
