import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Follow from "@/models/Follow";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to follow explorers." }, { status: 401 });
    }

    await connectDB();
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (userId === session.user.id) {
      return NextResponse.json({ error: "You can't follow yourself." }, { status: 400 });
    }

    const existing = await Follow.findOne({ follower: session.user.id, following: userId });

    if (existing) {
      await existing.deleteOne();
      return NextResponse.json({ following: false });
    } else {
      await Follow.create({ follower: session.user.id, following: userId });
      return NextResponse.json({ following: true });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
