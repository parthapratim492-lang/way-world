import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Place from "@/models/Place";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const [placesCount, explorersCount] = await Promise.all([
      Place.countDocuments(),
      User.countDocuments(),
    ]);
    return NextResponse.json({ placesCount, explorersCount });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
