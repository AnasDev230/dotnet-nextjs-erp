import { create } from "zustand";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "bunyan-theme";
const THEME_VALUES: Theme[] = ["light", "dark", "system"];

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "system") {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", systemDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system",

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  },

  initializeTheme: () => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme = stored && THEME_VALUES.includes(stored) ? stored : "system";
    set({ theme });
    applyTheme(theme);
  },
}));

if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (useThemeStore.getState().theme === "system") {
        applyTheme("system");
      }
    });
}
