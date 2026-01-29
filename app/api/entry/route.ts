import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateSessionId } from "@/lib/session";
import { supabase } from "@/lib/supabase-server";

const bodySchema = z.object({
  journal: z
    .string()
    .min(20, "Journal must be at least 20 characters")
    .max(4000, "Journal must be under 4000 characters"),
  reframe: z.string().min(1, "Reframe is required"),
  prayer: z.string().min(1, "Prayer is required"),
  blessing: z.string().optional().default(""),
  blessingCard: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse({
      ...raw,
      blessing: raw.blessing ?? raw.blessingCard ?? "",
    });
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first).flat()[0] ?? "Invalid request";
      return NextResponse.json({ error: String(msg) }, { status: 400 });
    }

    const { journal, reframe, prayer, blessing } = parsed.data;
    const { sessionId, cookieHeader } = getOrCreateSessionId(req);

    const { data: entry, error: entryError } = await supabase
      .from("entries")
      .insert({ session_id: sessionId, journal })
      .select("id")
      .single();

    if (entryError || !entry) {
      console.error("Entry insert error:", entryError);
      return NextResponse.json(
        { error: "Failed to save entry." },
        { status: 500 }
      );
    }

    const entryId = entry.id as string;

    const { error: genError } = await supabase.from("generated").insert({
      entry_id: entryId,
      reframe,
      prayer,
      blessing,
    });

    if (genError) {
      console.error("Generated insert error:", genError);
      return NextResponse.json(
        { error: "Failed to save generated content." },
        { status: 500 }
      );
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (cookieHeader) {
      headers["Set-Cookie"] = cookieHeader;
    }

    return NextResponse.json({ entry_id: entryId }, { status: 201, headers });
  } catch (e) {
    console.error("POST /api/entry error:", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
