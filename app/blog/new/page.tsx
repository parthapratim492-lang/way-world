"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";

export default function NewBlogPost() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", coverImage: "", tags: "" });
  const [statusMsg, setStatusMsg] = useState("");

  if (status === "loading") {
    return (
      <div className="form-page">
        <p className="status">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="form-page">
        <div className="panel glass" style={{ textAlign: "center" }}>
          <h2>Sign in to write</h2>
          <Link href="/login" className="discover-btn" style={{ display: "inline-block", marginTop: 12 }}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMsg("Publishing…");

    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/blog/${data.post.slug}`);
    } else {
      const data = await res.json();
      setStatusMsg("Error: " + (data.error || "something went wrong"));
    }
  }

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="panel glass" style={{ maxWidth: 600 }}>
        <h2>Write a post</h2>
        <p className="status">
          Guides, city write-ups, or your own travel story — either way it lands in the same
          journal. Whether something's marked "WAY Editorial" is decided automatically, not by
          this form.
        </p>

        <div>
          <label>Title</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label>Excerpt (optional — auto-generated from your content if left blank)</label>
          <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </div>

        <div>
          <label>Content</label>
          <textarea
            required
            rows={12}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write freely — leave a blank line between paragraphs."
          />
        </div>

        <div>
          <label>Cover image (optional)</label>
          <PhotoUpload onChange={(dataUrl) => setForm({ ...form, coverImage: dataUrl })} />
        </div>

        <div>
          <label>Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="guwahati, majuli, monsoon"
          />
        </div>

        <button type="submit" className="discover-btn" style={{ marginTop: 8 }}>
          Publish
        </button>

        {statusMsg && <p className="status">{statusMsg}</p>}
      </form>
    </div>
  );
}
