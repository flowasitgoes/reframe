import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateSessionId } from "@/lib/session";
import { supabase } from "@/lib/supabase-server";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const bodySchema = z.object({
  event_name: z.string().min(1, "event_name is required"),
  entry_id: z
    .string()
    .optional()
    .refine((v) => !v || uuidRegex.test(v), "entry_id must be a valid UUID"),
  meta: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first).flat()[0] ?? "Invalid request";
      return NextResponse.json({ error: String(msg) }, { status: 400 });
    }

    const { event_name, entry_id, meta } = parsed.data;
    const { sessionId, cookieHeader } = getOrCreateSessionId(req);

    let personNumber: number | null = null;
    if (entry_id) {
      const { data: row } = await supabase
        .from("entries")
        .select("person_number")
        .eq("id", entry_id)
        .single();
      if (row?.person_number != null) personNumber = Number(row.person_number);
    }

    const payload: Record<string, unknown> = {
      session_id: sessionId,
      entry_id: entry_id ?? null,
      event_name,
      meta: meta ?? null,
    };
    if (personNumber != null) payload.person_number = personNumber;

    let result = await supabase.from("events").insert(payload);

    if (result.error?.code === "PGRST204" && payload.person_number !== undefined) {
      delete payload.person_number;
      result = await supabase.from("events").insert(payload);
    }

    if (result.error) {
      console.error("Event insert error:", result.error);
      return NextResponse.json(
        { error: "Failed to record event." },
        { status: 500 }
      );
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (cookieHeader) {
      headers["Set-Cookie"] = cookieHeader;
    }

    return new NextResponse(null, { status: 204, headers });
  } catch (e) {
    console.error("POST /api/event error:", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
