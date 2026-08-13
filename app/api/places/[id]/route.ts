import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Place from "@/models/Place";
import User from "@/models/User";
import Save from "@/models/Save";
import Signal from "@/models/Signal";
import { computeLevel } from "@/lib/gamification";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    const place = await Place.findById(params.id).lean();
    if (!place) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let creator = null;
    if ((place as any).createdBy) {
      const user = await User.findById((place as any).createdBy).lean();
      if (user) {
        const { level, rank } = computeLevel((user as any).xp || 0);
        creator = { id: (place as any).createdBy.toString(), name: (user as any).name, level, rank };
      }
    }

    const isSaved = session?.user?.id
      ? Boolean(await Save.exists({ user: session.user.id, place: params.id }))
      : false;

    // Real aggregated counts — how many distinct users applied each signal.
    const signalAgg = await Signal.aggregate([
      { $match: { place: (place as any)._id } },
      { $group: { _id: "$signalId", count: { $sum: 1 } } },
    ]);
    const signalCounts: Record<string, number> = {};
    signalAgg.forEach((row: any) => (signalCounts[row._id] = row.count));

    const myActiveSignals = session?.user?.id
      ? (
          await Signal.find({ place: (place as any)._id, user: session.user.id }).select("signalId").lean()
        ).map((s: any) => s.signalId)
      : [];

    return NextResponse.json({ place, creator, isSaved, signalCounts, myActiveSignals });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
