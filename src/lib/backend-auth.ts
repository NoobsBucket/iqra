export const BACKEND_AUTH_COOKIE = "iqra_api_token";

export function getBackendAccessToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return undefined;

  const record = payload as Record<string, unknown>;
  for (const key of ["access_token", "accessToken", "token", "jwt"]) {
    const token = record[key];
    if (typeof token === "string" && token.trim()) return token.trim();
  }

  if (typeof record.session === "string" && record.session.split(".").length === 3) {
    return record.session;
  }

  for (const key of ["data", "session", "auth", "result"]) {
    const token = getBackendAccessToken(record[key]);
    if (token) return token;
  }

  return undefined;
}