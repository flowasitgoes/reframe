import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("site_stats")
      .select("value")
      .eq("key", "count_people")
      .single();

    if (error || data == null) {
      return NextResponse.json({ count_people: 0 });
    }

    const count_people = typeof data.value === "number" ? data.value : 0;
    return NextResponse.json({ count_people });
  } catch (e) {
    console.error("GET /api/stats error:", e);
    return NextResponse.json({ count_people: 0 });
  }
}
