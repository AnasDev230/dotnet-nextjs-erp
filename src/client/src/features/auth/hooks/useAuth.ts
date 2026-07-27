"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, logout as logoutApi } from "../api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { clearAuthCookie } from "@/lib/utils";
import type { LoginFormData } from "../schemas/auth.schema";

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: LoginFormData) =>
      login({ email: data.email, password: data.password }),
    onSuccess: (response) => {
      setUser(response);
      router.push("/");
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
