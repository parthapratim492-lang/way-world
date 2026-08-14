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
import WorldPulseMini from "@/components/WorldPulseMini";

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
  const [chromeExpanded, setChromeExpanded] = useState(true);

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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const [lat, lng] = center;
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radiusKm: "25",
      categories: activeCategories.join(","),
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
    <div className="immersive-shell">
      {/* The map fills the entire screen — everything else floats on top of it. */}
      <div className="immersive-map">
        <MapView center={center} places={places} />
      </div>

      <CompassRose />

      <NavRail profile={profile} />

      <div className="floating-top">
        <div className="floating-brand">
          WAY <span className="dot">◇</span>
        </div>

        <div className="floating-search">
          <Search size={15} color="var(--muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to find?"
          />
          {intentUsed && query.trim() && (
            <span className="ai-badge" title="AI understood this search beyond literal words">
              <Sparkles size={11} /> AI
            </span>
          )}
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

      {chromeExpanded && (
        <div className="floating-filters">
          <div className="filter-bar-inline">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`chip-select small ${activeCategories.includes(c.id) ? "active" : ""}`}
                style={{
                  borderColor: c.color,
                  color: activeCategories.includes(c.id) ? "#0a0e14" : c.color,
                  background: activeCategories.includes(c.id) ? c.color : "transparent",
                }}
                onClick={() => toggleCategory(c.id)}
              >
                {c.emoji} {c.label}
              </button>
            ))}
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
        </div>
      )}

      <button className="chrome-toggle" onClick={() => setChromeExpanded((v) => !v)}>
        {chromeExpanded ? "Hide filters" : "Show filters"}
      </button>

      <div className="floating-status">
        <span>{statusMsg || `${places.length} discoveries · ${SORT_MODES.find((s) => s.id === sort)?.label}`}</span>
      </div>

      <div className="floating-pulse">
        <WorldPulseMini />
      </div>
    </div>
  );
}
