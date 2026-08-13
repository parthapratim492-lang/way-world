import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Place from "@/models/Place";
import Follow from "@/models/Follow";
import Signal from "@/models/Signal";
import { QUESTS } from "@/lib/quests";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [discoveredToday, cafeCount, nightCountResult, followingCount, signalCount] = await Promise.all([
    Place.countDocuments({ createdBy: userId, createdAt: { $gte: startOfToday } }),
    Place.countDocuments({ createdBy: userId, category: "cafe" }),
    Place.aggregate([
      { $match: { createdBy: userId } },
      { $addFields: { hour: { $hour: "$createdAt" } } },
      { $match: { $expr: { $or: [{ $gte: ["$hour", 19] }, { $lt: ["$hour", 5] }] } } },
      { $count: "count" },
    ]),
    Follow.countDocuments({ follower: userId }),
    Signal.countDocuments({ user: userId }),
  ]);

  const nightCount = nightCountResult[0]?.count || 0;

  const progressById: Record<string, number> = {
    "daily-discovery": discoveredToday,
    "cafe-hunter": cafeCount,
    "night-walker": nightCount,
    "social-butterfly": followingCount,
    "signal-booster": signalCount,
  };

  const quests = QUESTS.map((q) => ({
    ...q,
    progress: Math.min(progressById[q.id] || 0, q.target),
    completed: (progressById[q.id] || 0) >= q.target,
  }));

  return NextResponse.json({ quests });
}
