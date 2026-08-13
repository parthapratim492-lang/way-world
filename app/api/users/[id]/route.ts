import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Place from "@/models/Place";
import Follow from "@/models/Follow";
import { computeLevel } from "@/lib/gamification";
import { BADGES } from "@/lib/badges";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userId = new mongoose.Types.ObjectId(params.id);

    const user = await User.findById(params.id).lean();
    if (!user) return NextResponse.json({ error: "Explorer not found" }, { status: 404 });

    const [discoveries, followerCount, followingCount, isFollowing, cafeCount, firstLightCount, nightCountResult] =
      await Promise.all([
        Place.find({ createdBy: userId })
          .sort({ createdAt: -1 })
          .select("name category photoUrl createdAt location")
          .lean(),
        Follow.countDocuments({ following: userId }),
        Follow.countDocuments({ follower: userId }),
        session?.user?.id
          ? Follow.exists({ follower: session.user.id, following: params.id })
          : Promise.resolve(false),
        Place.countDocuments({ createdBy: userId, category: "cafe" }),
        Place.countDocuments({ createdBy: userId, isFirstDiscovery: true }),
        Place.aggregate([
          { $match: { createdBy: userId } },
          { $addFields: { hour: { $hour: "$createdAt" } } },
          { $match: { $expr: { $or: [{ $gte: ["$hour", 19] }, { $lt: ["$hour", 5] }] } } },
          { $count: "count" },
        ]),
      ]);

    const nightCount = nightCountResult[0]?.count || 0;
    const { level, rank, progress } = computeLevel((user as any).xp || 0);

    // Real streak: consecutive calendar days (ending today or yesterday) with
    // at least one discovery. No fabricated momentum — if you stopped adding
    // places, the streak actually goes to 0.
    const dayStrings = new Set(
      discoveries.map((d: any) => new Date(d.createdAt).toISOString().slice(0, 10))
    );
    let currentStreak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    // Allow the streak to still count if today has nothing yet but yesterday does.
    if (!dayStrings.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (dayStrings.has(cursor.toISOString().slice(0, 10))) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Real category breakdown — actual counts, not estimated proportions.
    const categoryBreakdown: Record<string, number> = {};
    discoveries.forEach((d: any) => {
      categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + 1;
    });

    const unlockedIds = new Set<string>();
    if (firstLightCount >= 1) unlockedIds.add("first-light");
    if (discoveries.length >= 10) unlockedIds.add("deep-explorer");
    if (nightCount >= 5) unlockedIds.add("night-walker");
    if (cafeCount >= 3) unlockedIds.add("cafe-hunter");
    if (followerCount >= 5) unlockedIds.add("community-builder");

    const badges = BADGES.map((b) => ({ ...b, unlocked: unlockedIds.has(b.id) }));

    return NextResponse.json({
      id: params.id,
      name: (user as any).name,
      xp: (user as any).xp,
      level,
      rank,
      progress,
      discoveriesCount: discoveries.length,
      followerCount,
      followingCount,
      isFollowing: Boolean(isFollowing),
      isOwnProfile: session?.user?.id === params.id,
      discoveries,
      badges,
      currentStreak,
      categoryBreakdown,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
