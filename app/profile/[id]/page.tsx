"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Flame } from "lucide-react";
import { categoryMeta } from "@/lib/categories";
import type { Place } from "@/components/MapView";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type ProfileData = {
  id: string;
  name: string;
  xp: number;
  level: number;
  rank: string;
  progress: number;
  discoveriesCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
  discoveries: (Place & { photoUrl?: string })[];
  badges: { id: string; label: string; emoji: string; description: string; unlocked: boolean }[];
  currentStreak: number;
  categoryBreakdown: Record<string, number>;
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [followBusy, setFollowBusy] = useState(false);

  function load() {
    fetch(`/api/users/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setProfile)
      .catch(() => setError("Explorer not found."));
  }

  useEffect(load, [params.id]);

  async function toggleFollow() {
    if (!session) return;
    setFollowBusy(true);
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: params.id }),
    });
    if (res.ok) load();
    setFollowBusy(false);
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

  if (!profile) {
    return (
      <div className="form-page">
        <p className="status">Loading…</p>
      </div>
    );
  }

  const hasLocatedDiscoveries = profile.discoveries.some((d) => d.location);
  const sortedCategories = Object.entries(profile.categoryBreakdown).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = sortedCategories[0]?.[1] || 1;

  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        ← Back to the map
      </Link>

      <div className="detail-card panel glass" style={{ maxWidth: 640 }}>
        <div className="detail-body">
          <div className="profile-header">
            <div className="profile-header-avatar">{profile.name?.[0]?.toUpperCase() || "?"}</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: "0 0 4px" }}>{profile.name}</h1>
              <div className="feed-sub">
                Lv.{profile.level} · {profile.rank} · {profile.xp.toLocaleString()} XP
              </div>
            </div>
            {!profile.isOwnProfile && session && (
              <button
                className={`discover-btn ${profile.isFollowing ? "ghost" : ""}`}
                onClick={toggleFollow}
                disabled={followBusy}
              >
                {profile.isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          <div className="profile-stats-row">
            <div>
              <div className="stat-num">{profile.discoveriesCount}</div>
              <div className="feed-sub">Discoveries</div>
            </div>
            <div>
              <div className="stat-num">{profile.followerCount}</div>
              <div className="feed-sub">Followers</div>
            </div>
            <div>
              <div className="stat-num">{profile.followingCount}</div>
              <div className="feed-sub">Following</div>
            </div>
            <div>
              <div className="stat-num" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {profile.currentStreak}
                {profile.currentStreak > 0 && <Flame size={16} color="var(--discovery)" />}
              </div>
              <div className="feed-sub">Day streak</div>
            </div>
          </div>

          <div className="panel-header" style={{ marginTop: 20 }}>
            <span>My World</span>
          </div>

          {hasLocatedDiscoveries ? (
            <div className="my-world-map">
              <MapView places={profile.discoveries} fitToMarkers />
            </div>
          ) : (
            <p className="status">No discoveries plotted yet.</p>
          )}

          {sortedCategories.length > 0 && (
            <div className="category-bars">
              {sortedCategories.map(([cat, count]) => {
                const meta = categoryMeta(cat);
                return (
                  <div key={cat} className="category-bar-row">
                    <span className="feed-sub" style={{ width: 90, flexShrink: 0 }}>
                      {meta.emoji} {meta.label}
                    </span>
                    <div className="category-bar-track">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${(count / maxCategoryCount) * 100}%`, background: meta.color }}
                      />
                    </div>
                    <span className="feed-sub" style={{ width: 20, textAlign: "right" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="panel-header" style={{ marginTop: 20 }}>
            <span>Badges</span>
          </div>

          <div className="badge-grid">
            {profile.badges.map((b) => (
              <div key={b.id} className={`badge-item ${b.unlocked ? "unlocked" : "locked"}`} title={b.description}>
                <div className="badge-emoji">{b.emoji}</div>
                <div className="badge-label">{b.label}</div>
              </div>
            ))}
          </div>

          <div className="panel-header" style={{ marginTop: 20 }}>
            <span>Discoveries</span>
          </div>

          {profile.discoveries.length === 0 && (
            <p className="status">Nothing discovered yet.</p>
          )}

          <div className="trending-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {profile.discoveries.map((d: any) => {
              const meta = categoryMeta(d.category);
              return (
                <Link key={d._id} href={`/place/${d._id}`} className="trending-card">
                  <div
                    className="trending-thumb"
                    style={{
                      backgroundImage: d.photoUrl ? `url(${d.photoUrl})` : undefined,
                      background: d.photoUrl ? undefined : `${meta.color}22`,
                    }}
                  >
                    {!d.photoUrl && <span>{meta.emoji}</span>}
                  </div>
                  <div className="feed-title" style={{ fontSize: 12 }}>
                    {d.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
