const SESSION_COOKIE_NAME = "pray_session_id";
const SESSION_MAX_AGE_SECONDS = 31536000; // 1 year

/**
 * Get session_id from request cookie, or create a new one.
 * Returns sessionId and optional Set-Cookie header when a new session was created.
 * Use only in server API routes.
 */
export function getOrCreateSessionId(
  request: Request
): { sessionId: string; cookieHeader?: string } {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`, "i")
  );
  if (match?.[1]) {
    return { sessionId: match[1].trim() };
  }
  const sessionId = crypto.randomUUID();
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  const cookieValue = `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
  return { sessionId, cookieHeader: cookieValue };
}
