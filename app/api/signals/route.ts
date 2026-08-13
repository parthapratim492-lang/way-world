import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Signal from "@/models/Signal";
import { SIGNALS } from "@/lib/signals";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to add a signal." }, { status: 401 });
    }

    await connectDB();
    const { placeId, signalId } = await req.json();

    if (!placeId || !signalId) {
      return NextResponse.json({ error: "placeId and signalId are required" }, { status: 400 });
    }
    if (!SIGNALS.some((s) => s.id === signalId)) {
      return NextResponse.json({ error: "Unknown signal" }, { status: 400 });
    }

    const existing = await Signal.findOne({ place: placeId, user: session.user.id, signalId });

    if (existing) {
      await existing.deleteOne();
      return NextResponse.json({ active: false });
    } else {
      await Signal.create({ place: placeId, user: session.user.id, signalId });
      return NextResponse.json({ active: true });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
