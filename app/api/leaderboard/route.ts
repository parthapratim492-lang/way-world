import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { computeLevel } from "@/lib/gamification";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find().sort({ xp: -1 }).limit(5).lean();

    const leaderboard = users.map((u: any) => {
      const { level, rank } = computeLevel(u.xp || 0);
      return { id: u._id.toString(), name: u.name, xp: u.xp || 0, level, rank };
    });

    return NextResponse.json({ leaderboard });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
