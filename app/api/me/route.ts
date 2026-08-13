import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Place from "@/models/Place";
import { computeLevel } from "@/lib/gamification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { level, rank, progress } = computeLevel((user as any).xp || 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const discoveredToday = await Place.exists({
    createdBy: session.user.id,
    createdAt: { $gte: startOfToday },
  });

  return NextResponse.json({
    id: session.user.id,
    name: (user as any).name,
    xp: (user as any).xp,
    discoveriesCount: (user as any).discoveriesCount,
    level,
    rank,
    progress,
    discoveredToday: Boolean(discoveredToday),
  });
}
