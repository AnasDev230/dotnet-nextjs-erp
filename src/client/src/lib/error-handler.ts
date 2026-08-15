import { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    return data?.message || error.message || "";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "";
}
