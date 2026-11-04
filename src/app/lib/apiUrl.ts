// Builds an API URL that forwards the widget's `key` query param (if present),
// so widgets authenticate without cookies (e.g. inside OBS browser sources).
export function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const key = new URLSearchParams(window.location.search).get("key");
  if (!key) return path;
  return `${path}${path.includes("?") ? "&" : "?"}key=${encodeURIComponent(key)}`;
}
