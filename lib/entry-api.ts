/**
 * Client-side helpers for entry and event APIs. Use only in client components.
 */

export interface SubmitEntryPayload {
  journal: string;
  reframe: string;
  prayer: string;
  blessing: string;
}

export async function submitEntry(
  payload: SubmitEntryPayload
): Promise<{ entry_id: string }> {
  const res = await fetch("/api/entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data?.error as string) || `Failed to save entry (${res.status})`
    );
  }
  if (!data?.entry_id) {
    throw new Error("Invalid response: missing entry_id");
  }
  return { entry_id: data.entry_id };
}

export interface TrackEventPayload {
  event_name: string;
  entry_id?: string;
  meta?: Record<string, unknown>;
}

/**
 * Track an event. Fire-and-forget; does not block UI. Failures are logged only.
 */
export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  try {
    await fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("trackEvent failed:", err);
  }
}
