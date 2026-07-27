import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COOKIE_OPTIONS = "path=/; max-age=604800; SameSite=Lax";

export function setAuthCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `accessToken=${token}; ${COOKIE_OPTIONS}`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "accessToken=; path=/; max-age=0";
}
