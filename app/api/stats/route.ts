import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("prayer_count")
      .select("count")
      .eq("id", 1)
      .single();

    if (error || data == null) {
      console.error("prayer_count select error:", error);
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const count = Number(data.count) || 0;
    return NextResponse.json({ count });
  } catch (e) {
    console.error("GET /api/stats error:", e);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
