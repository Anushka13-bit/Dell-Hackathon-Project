const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

export function getBackendUrl() {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
}

/** Use same-origin proxy in the browser to avoid CORS / connection issues. */
export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "/api/backend";
  }
  return getBackendUrl();
}
