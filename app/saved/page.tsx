"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookmarkX } from "lucide-react";
import { categoryMeta } from "@/lib/categories";

type SavedPlace = { _id: string; name: string; category: string; photoUrl?: string };

export default function SavedPage() {
  const { data: session, status } = useSession();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [loaded, setLoaded] = useState(false);

  function load() {
    fetch("/api/me/saved")
      .then((r) => r.json())
      .then((data) => {
        setPlaces(data.places || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  useEffect(() => {
    if (session) load();
  }, [session]);

  async function unsave(placeId: string) {
    setPlaces((prev) => prev.filter((p) => p._id !== placeId)); // optimistic
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId }),
    });
  }

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
          <h2>Sign in to see your saves</h2>
          <Link href="/login" className="discover-btn" style={{ display: "inline-block", marginTop: 12 }}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        ← Back to the map
      </Link>

      <div className="detail-card panel glass" style={{ maxWidth: 640 }}>
        <div className="detail-body">
          <div className="panel-header">
            <span>Your Saves</span>
          </div>

          {loaded && places.length === 0 && (
            <p className="status">
              Nothing saved yet — open any place and tap the bookmark icon to save it here.
            </p>
          )}

          <div className="saved-list">
            {places.map((p) => {
              const meta = categoryMeta(p.category);
              return (
                <div key={p._id} className="saved-row">
                  <Link href={`/place/${p._id}`} className="saved-row-link">
                    <div
                      className="trending-thumb"
                      style={{
                        backgroundImage: p.photoUrl ? `url(${p.photoUrl})` : undefined,
                        background: p.photoUrl ? undefined : `${meta.color}22`,
                        width: 52,
                        height: 52,
                        marginBottom: 0,
                        flexShrink: 0,
                      }}
                    >
                      {!p.photoUrl && <span>{meta.emoji}</span>}
                    </div>
                    <div>
                      <div className="feed-title">{p.name}</div>
                      <div className="feed-sub">{meta.label}</div>
                    </div>
                  </Link>
                  <button className="icon-btn" onClick={() => unsave(p._id)} title="Remove from saves">
                    <BookmarkX size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
