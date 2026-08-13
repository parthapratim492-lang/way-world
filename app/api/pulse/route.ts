import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorldEvent from "@/models/WorldEvent";

// GET /api/pulse            → most recent 20 events
// GET /api/pulse?after=<ISO> → only events newer than that timestamp (for polling)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const after = searchParams.get("after");

    const query = after ? { createdAt: { $gt: new Date(after) } } : {};

    const events = await WorldEvent.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ events });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
