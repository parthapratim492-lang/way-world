import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

async function getPost(slug: string) {
  await connectDB();
  const post = await BlogPost.findOne({ slug }).lean();
  return post ? JSON.parse(JSON.stringify(post)) : null;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  // Plain paragraphs from line breaks — no markdown rendering yet, so what
  // you write is exactly what shows up, no surprises from unsupported syntax.
  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="detail-page">
      <Link href="/blog" className="back-link">
        ← Back to the journal
      </Link>

      <article className="detail-card panel glass blog-article">
        {post.coverImage && (
          <div className="detail-photo" style={{ backgroundImage: `url(${post.coverImage})` }} />
        )}
        <div className="detail-body">
          <span className={`blog-badge ${post.isOfficial ? "official" : ""}`}>
            {post.isOfficial ? "WAY Editorial" : "Explorer Story"}
          </span>

          <h1 className="blog-article-title">{post.title}</h1>

          <p className="status" style={{ marginBottom: 24 }}>
            {post.authorName} · {new Date(post.createdAt).toLocaleDateString()}
          </p>

          <div className="blog-article-body">
            {paragraphs.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="tag-row" style={{ marginTop: 24 }}>
              {post.tags.map((t: string) => (
                <span key={t} className="tag">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
