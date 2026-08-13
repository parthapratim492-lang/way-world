import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Place from "@/models/Place";

export async function GET() {
  try {
    await connectDB();
    const places = await Place.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("name category createdByName createdAt photoUrl")
      .lean();

    return NextResponse.json({ places });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
