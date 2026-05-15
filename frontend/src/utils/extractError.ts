import axios from "axios";

const FALLBACK = "Something went wrong";

export function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { error?: unknown; message?: unknown }
      | undefined;
    if (typeof data?.error === "string" && data.error) return data.error;
    if (typeof data?.message === "string" && data.message) return data.message;
    if (err.message) return err.message;
    return FALLBACK;
  }
  if (err instanceof Error && err.message) return err.message;
  return FALLBACK;
}
