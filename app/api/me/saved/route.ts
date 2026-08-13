import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Save from "@/models/Save";
import Place from "@/models/Place";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  await connectDB();

  const saves = await Save.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();
  const placeIds = saves.map((s: any) => s.place);

  const places = await Place.find({ _id: { $in: placeIds } })
    .select("name category photoUrl")
    .lean();

  // Preserve save order (most recently saved first) rather than DB insertion order.
  const placeById = new Map(places.map((p: any) => [p._id.toString(), p]));
  const ordered = placeIds.map((id: any) => placeById.get(id.toString())).filter(Boolean);

  return NextResponse.json({ places: ordered });
}
