import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "@/types";
import { logout as logoutApi } from "@/features/auth/api/auth";
import { setAuthCookie, clearAuthCookie } from "@/lib/utils";

export interface UserInfo {
  fullName: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  setUser: (authResponse: AuthResponse) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (authResponse) => {
        localStorage.setItem("accessToken", authResponse.accessToken);
        localStorage.setItem("refreshToken", authResponse.refreshToken);
        setAuthCookie(authResponse.accessToken);
        set({
          user: {
            fullName: authResponse.fullName,
            email: authResponse.email,
            roles: authResponse.roles,
          },
          isAuthenticated: true,
        });
      },
      logout: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            await logoutApi(refreshToken);
          } catch {
            // Silently fail — we clear local state regardless
          }
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        clearAuthCookie();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "bunyan-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          setAuthCookie(accessToken);
        }
      },
    }
  )
);
