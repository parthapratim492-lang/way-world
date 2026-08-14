"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { categoryMeta } from "@/lib/categories";
import { SIGNALS } from "@/lib/signals";

type PlaceDetail = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  photoUrl?: string;
  isFirstDiscovery?: boolean;
  tags?: string[];
  createdByName: string;
  createdAt: string;
};

export default function PlaceDetailClient({ id }: { id: string }) {
  const { data: session } = useSession();
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [creator, setCreator] = useState<{ id: string; name: string; level: number; rank: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [signalCounts, setSignalCounts] = useState<Record<string, number>>({});
  const [myActiveSignals, setMyActiveSignals] = useState<string[]>([]);
  const [signalBusy, setSignalBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    fetch(`/api/places/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setPlace(data.place);
        setCreator(data.creator);
        setIsSaved(Boolean(data.isSaved));
        setSignalCounts(data.signalCounts || {});
        setMyActiveSignals(data.myActiveSignals || []);
      })
      .catch(() => setError("Couldn't load this discovery."));
  }

  useEffect(load, [id]);

  async function toggleSave() {
    if (!session) return;
    setSaveBusy(true);
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setIsSaved(data.saved);
    }
    setSaveBusy(false);
  }

  async function toggleSignal(signalId: string) {
    if (!session) return;
    setSignalBusy(signalId);
    const res = await fetch("/api/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId: id, signalId }),
    });
    if (res.ok) {
      const data = await res.json();
      setMyActiveSignals((prev) =>
        data.active ? [...prev, signalId] : prev.filter((s) => s !== signalId)
      );
      setSignalCounts((prev) => ({
        ...prev,
        [signalId]: Math.max(0, (prev[signalId] || 0) + (data.active ? 1 : -1)),
      }));
    }
    setSignalBusy(null);
  }

  if (error) {
    return (
      <div className="form-page">
        <div className="panel glass">
          <p>{error}</p>
          <Link href="/" className="discover-btn" style={{ display: "inline-block", marginTop: 12 }}>
            Back to the map
          </Link>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="form-page">
        <p className="status">Loading…</p>
      </div>
    );
  }

  const meta = categoryMeta(place.category);
  const activeSignals = SIGNALS.filter((s) => (signalCounts[s.id] || 0) > 0 || myActiveSignals.includes(s.id));

  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        ← Back to the map
      </Link>

      <div className="detail-card panel glass">
        {place.photoUrl && (
          <div className="detail-photo" style={{ backgroundImage: `url(${place.photoUrl})` }} />
        )}

        <div className="detail-body">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="chip" style={{ borderColor: meta.color, color: meta.color }}>
              {meta.emoji} {meta.label}
            </span>
            {place.isFirstDiscovery && (
              <span className="chip" style={{ borderColor: "var(--discovery)", color: "var(--discovery)" }}>
                🏆 First Discovery
              </span>
            )}
            <div style={{ flex: 1 }} />

            {session && (
              <button
                className="icon-btn"
                onClick={toggleSave}
                disabled={saveBusy}
                title={isSaved ? "Saved" : "Save this place"}
              >
                {isSaved ? <BookmarkCheck size={16} color="var(--discovery)" /> : <Bookmark size={16} />}
              </button>
            )}
          </div>

          <h1>{place.name}</h1>

          {place.description && <p className="detail-desc">{place.description}</p>}

          {place.tags && place.tags.length > 0 && (
            <div className="tag-row">
              {place.tags.map((t) => (
                <span key={t} className="tag">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="panel-header" style={{ marginTop: 6 }}>
            <span>The World Says</span>
          </div>

          {activeSignals.length === 0 && !session && (
            <p className="status" style={{ marginBottom: 14 }}>
              No signals yet.
            </p>
          )}

          <div className="signal-grid">
            {(session ? SIGNALS : activeSignals).map((s) => {
              const count = signalCounts[s.id] || 0;
              const mine = myActiveSignals.includes(s.id);
              if (!session && count === 0) return null;
              return (
                <button
                  key={s.id}
                  className={`signal-chip ${s.sentiment} ${mine ? "active" : ""}`}
                  onClick={() => toggleSignal(s.id)}
                  disabled={!session || signalBusy === s.id}
                  title={session ? "Tap to toggle" : "Sign in to add a signal"}
                >
                  {s.sentiment === "positive" ? "+" : "–"} {s.label}
                  {count > 0 && <span className="signal-count">{count}</span>}
                </button>
              );
            })}
          </div>
          {session && (
            <p className="status" style={{ marginTop: 8 }}>
              Tap a signal you agree with — it's a real, aggregated community vote, not a
              star rating.
            </p>
          )}

          <div className="detail-footer">
            <div>
              <p className="status" style={{ marginBottom: 2 }}>
                Discovered by
              </p>
              {creator ? (
                <Link href={`/profile/${creator.id}`} style={{ fontWeight: 600 }}>
                  {place.createdByName}
                  <span className="status" style={{ marginLeft: 8 }}>
                    Lv.{creator.level} · {creator.rank}
                  </span>
                </Link>
              ) : (
                <p style={{ fontWeight: 600 }}>{place.createdByName}</p>
              )}
            </div>
            <p className="status">{new Date(place.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
