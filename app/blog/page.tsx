"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Feather } from "lucide-react";

type BlogListItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  authorName: string;
  isOfficial: boolean;
  createdAt: string;
  tags?: string[];
};

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        ← Back to the map
      </Link>

      <div className="page-title-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 720 }}>
        <div>
          <h1 className="page-title">The Journal</h1>
          <p className="status">Guides from WAY, and stories from explorers.</p>
        </div>
        {session && (
          <Link href="/blog/new">
            <button className="discover-btn">
              <Feather size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              Write
            </button>
          </Link>
        )}
      </div>

      {loaded && posts.length === 0 && (
        <div className="focused-page-single">
          <p className="status">No posts yet — be the first to write one.</p>
        </div>
      )}

      <div className="blog-grid">
        {posts.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug}`} className="blog-card panel glass">
            {post.coverImage && (
              <div className="blog-card-cover" style={{ backgroundImage: `url(${post.coverImage})` }} />
            )}
            <div className="blog-card-body">
              <span className={`blog-badge ${post.isOfficial ? "official" : ""}`}>
                {post.isOfficial ? "WAY Editorial" : "Explorer Story"}
              </span>
              <h3 className="blog-card-title">{post.title}</h3>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <p className="feed-sub">
                {post.authorName} · {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
