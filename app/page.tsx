"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Sparkles } from "lucide-react";
import type { Place } from "@/components/MapView";
import { CATEGORIES } from "@/lib/categories";
import NavRail from "@/components/NavRail";
import CompassRose from "@/components/CompassRose";
import WorldPulse from "@/components/WorldPulse";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import QuestPanel from "@/components/QuestPanel";
import TrendingPanel from "@/components/TrendingPanel";
import CommunityPanel from "@/components/CommunityPanel";
import CollectionsPanel from "@/components/CollectionsPanel";
import MyWorldPanel from "@/components/MyWorldPanel";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const DEFAULT_CENTER: [number, number] = [26.1445, 91.7362]; // Guwahati

const SORT_MODES = [
  { id: "recommended", label: "Recommended" },
  { id: "nearest", label: "Nearest" },
  { id: "newest", label: "Newest" },
];

type Profile = {
  id: string;
  name: string;
  level: number;
  rank: string;
  progress: number;
  xp: number;
  discoveriesCount: number;
  discoveredToday: boolean;
};

export default function Home() {
  const { data: session } = useSession();
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [places, setPlaces] = useState<Place[]>([]);
  const [intentUsed, setIntentUsed] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Locating you…");
  const [activeCategories, setActiveCategories] = useState<string[]>(CATEGORIES.map((c) => c.id));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState("recommended");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatusMsg("Location not available — showing Guwahati by default.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setStatusMsg("");
      },
      () => setStatusMsg("Location denied — showing Guwahati by default.")
    );
  }, []);

  // Debounce search input so we're not hitting the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const [lat, lng] = center;
    const categoriesParam = activeCategories.join(",");
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radiusKm: "25",
      categories: categoriesParam,
      sort,
    });
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());

    fetch(`/api/places?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setPlaces(data.places || []);
        setIntentUsed(Boolean(data.intentUsed));
      })
      .catch(() => setStatusMsg("Could not reach the server. Is MongoDB connected?"));
  }, [center, activeCategories, debouncedQuery, sort]);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(() => {});
  }, [session]);

  function toggleCategory(id: string) {
    setActiveCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  return (
    <div className="world-shell">
      <NavRail profile={profile} />

      <div className="world-main">
        <div className="world-hero">
          <div className="world-hero-top">
            <div className="world-brand">
              WAY <span className="dot">◇</span>
            </div>
            {session ? (
              <Link href="/new">
                <button className="discover-btn">+ Discover</button>
              </Link>
            ) : (
              <Link href="/login">
                <button className="discover-btn ghost">Sign in</button>
              </Link>
            )}
          </div>

          <h1 className="world-title">
            <CompassRose />
            DISCOVER <em>YOUR</em> WORLD
          </h1>
          <p className="world-subtitle">Real people. Real places. Real stories.</p>

          <div className="world-search">
            <Search size={16} color="var(--muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to find? Try a word, a vibe, a tag…"
            />
            {intentUsed && query.trim() && (
              <span className="ai-badge" title="AI understood this search beyond literal words">
                <Sparkles size={12} /> AI
              </span>
            )}
          </div>

          <div className="sort-row">
            {SORT_MODES.map((s) => (
              <button
                key={s.id}
                className={`sort-chip ${sort === s.id ? "active" : ""}`}
                onClick={() => setSort(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="filter-bar-inline">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`chip-select small ${activeCategories.includes(c.id) ? "active" : ""}`}
                style={{
                  borderColor: c.color,
                  color: activeCategories.includes(c.id) ? "#02040a" : c.color,
                  background: activeCategories.includes(c.id) ? c.color : "transparent",
                }}
                onClick={() => toggleCategory(c.id)}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="hero-map-card panel glass">
            <MapView center={center} places={places} />
            <div className="hero-map-status">
              <span>{statusMsg || `${places.length} discoveries · ${SORT_MODES.find((s) => s.id === sort)?.label}`}</span>
            </div>
          </div>

          <div className="dashboard-side">
            <WorldPulse />
            <LeaderboardPanel />
          </div>
        </div>

        <div className="dashboard-bottom-grid">
          {session && profile ? (
            <QuestPanel />
          ) : (
            <div className="panel glass bottom-panel">
              <div className="panel-header">
                <span>Quests</span>
              </div>
              <p className="status">Sign in to start earning XP and unlocking badges.</p>
            </div>
          )}
          <TrendingPanel />
          <CollectionsPanel />
          <CommunityPanel />
          {session && profile && (
            <MyWorldPanel userId={profile.id} discoveriesCount={profile.discoveriesCount} level={profile.level} />
          )}
        </div>
      </div>
    </div>
  );
}
