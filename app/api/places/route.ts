import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Place from "@/models/Place";
import User from "@/models/User";
import WorldEvent from "@/models/WorldEvent";
import { XP_PER_DISCOVERY } from "@/lib/gamification";
import { discoveryScore } from "@/lib/discovery/ranking";
import { parseIntent } from "@/lib/discovery/intent";

// GET /api/places?lat=..&lng=..&radiusKm=..&categories=cafe,food&q=quiet+coffee&sort=recommended|nearest|newest
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radiusKm = parseFloat(searchParams.get("radiusKm") || "25");
    const categoriesParam = searchParams.get("categories");
    const categoryFilter = categoriesParam ? categoriesParam.split(",").filter(Boolean) : null;
    const q = (searchParams.get("q") || "").trim();
    const sort = searchParams.get("sort") || "recommended";
    const hasLocation = !isNaN(lat) && !isNaN(lng);

    const pipeline: any[] = [];

    if (hasLocation) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          maxDistance: radiusKm * 1000,
          spherical: true,
        },
      });
    }

    const match: any = {};
    if (categoryFilter && categoryFilter.length > 0) {
      match.category = { $in: categoryFilter };
    }

    const literalTerms = q.split(/\s+/).filter(Boolean);

    // Try AI intent parsing — adds extra relevant keywords beyond the literal
    // words typed (e.g. "somewhere to focus" → adds "quiet", "wifi", "work").
    // Falls back to literal terms only if no API key is set or the call fails.
    let intentUsed = false;
    let terms = literalTerms;
    if (literalTerms.length > 0) {
      const intent = await parseIntent(q);
      if (intent && intent.keywords.length > 0) {
        intentUsed = true;
        terms = Array.from(new Set([...literalTerms, ...intent.keywords]));
      }
    }

    if (terms.length > 0) {
      // Real multi-term matching across name/description/tags — matches if
      // ANY term (literal or AI-added) appears in any field.
      match.$or = terms.flatMap((t) => [
        { name: { $regex: t, $options: "i" } },
        { description: { $regex: t, $options: "i" } },
        { tags: { $regex: t, $options: "i" } },
        { category: { $regex: t, $options: "i" } },
      ]);
    }

    if (Object.keys(match).length > 0) pipeline.push({ $match: match });

    // Cap what we pull before scoring/sorting in application code — cheap at
    // this scale, and keeps the ranking logic simple and easy to reason about.
    pipeline.push({ $limit: 300 });

    const rawPlaces = hasLocation || Object.keys(match).length > 0
      ? await Place.aggregate(pipeline)
      : await Place.find().sort({ createdAt: -1 }).limit(300).lean();

    let places = rawPlaces;

    if (sort === "nearest" && hasLocation) {
      places = [...places].sort((a: any, b: any) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
    } else if (sort === "newest") {
      places = [...places].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      // recommended — real scoring from proximity + freshness + text relevance
      places = [...places].sort(
        (a: any, b: any) => discoveryScore(b, terms) - discoveryScore(a, terms)
      );
    }

    return NextResponse.json({ places: places.slice(0, 100), intentUsed });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/places — must be signed in
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You need to sign in to add a discovery." }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { name, description, category, photoUrl, lat, lng, tags } = body;

    if (!name || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "name, lat, and lng are required" }, { status: 400 });
    }

    // Real "first discovery" detection — check whether anyone has already
    // documented a place within 75m, rather than marking every submission
    // as first (which would make the badge meaningless).
    const FIRST_DISCOVERY_RADIUS_METERS = 75;
    const nearby = await Place.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          maxDistance: FIRST_DISCOVERY_RADIUS_METERS,
          spherical: true,
        },
      },
      { $limit: 1 },
    ]);
    const isFirstDiscovery = nearby.length === 0;

    const place = await Place.create({
      name,
      description,
      category,
      photoUrl,
      tags,
      createdBy: session.user.id,
      createdByName: session.user.name || "Anonymous Explorer",
      location: { type: "Point", coordinates: [lng, lat] },
      isFirstDiscovery,
    });

    // Reward the explorer — this is the seed of the XP/level system.
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { xp: XP_PER_DISCOVERY, discoveriesCount: 1 },
    });

    // Log a real event for the World Pulse feed — not synthetic activity,
    // an actual record of what just happened.
    await WorldEvent.create({
      type: "DISCOVERY",
      placeId: place._id,
      placeName: place.name,
      category: place.category,
      userName: session.user.name || "Anonymous Explorer",
    });

    return NextResponse.json({ place }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
