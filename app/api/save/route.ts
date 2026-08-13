import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Save from "@/models/Save";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to save places." }, { status: 401 });
    }

    await connectDB();
    const { placeId } = await req.json();
    if (!placeId) return NextResponse.json({ error: "placeId is required" }, { status: 400 });

    const existing = await Save.findOne({ user: session.user.id, place: placeId });

    if (existing) {
      await existing.deleteOne();
      return NextResponse.json({ saved: false });
    } else {
      await Save.create({ user: session.user.id, place: placeId });
      return NextResponse.json({ saved: true });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
