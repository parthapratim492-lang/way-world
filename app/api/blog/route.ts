import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { slugify } from "@/lib/blog";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "30", 10), 100);

    const posts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title slug excerpt coverImage authorName isOfficial createdAt tags")
      .lean();

    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to write a post." }, { status: 401 });
    }

    await connectDB();
    const { title, excerpt, content, coverImage, tags } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    const baseSlug = slugify(title);
    if (!baseSlug) {
      return NextResponse.json({ error: "Title must contain some letters or numbers" }, { status: 400 });
    }

    // Handle slug collisions honestly rather than silently overwriting an
    // existing post with the same title.
    let slug = baseSlug;
    let attempt = 1;
    while (await BlogPost.exists({ slug })) {
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

    // The only place this is decided — a user's own request body is never
    // trusted for this. ADMIN_EMAIL is a plain env var, not a role system;
    // see .env.example for how to set it.
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
    const isOfficial = Boolean(adminEmail) && session.user.email?.toLowerCase() === adminEmail;

    const post = await BlogPost.create({
      title,
      slug,
      excerpt: excerpt || content.slice(0, 160),
      content,
      coverImage,
      tags,
      authorId: session.user.id,
      authorName: session.user.name || "Anonymous Explorer",
      isOfficial,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
