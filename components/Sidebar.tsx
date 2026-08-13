"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Compass, Home, Rss, Bookmark, Trophy, Users, Settings, MapPin } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, active: true },
  { label: "Explore", icon: Compass },
  { label: "Feed", icon: Rss },
  { label: "Collections", icon: Bookmark },
  { label: "Quests", icon: Trophy },
  { label: "People", icon: Users },
  { label: "Settings", icon: Settings },
];

export default function Sidebar({
  profile,
}: {
  profile: { name: string; level: number; rank: string; xp: number } | null;
}) {
  const { data: session } = useSession();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <MapPin size={20} color="var(--accent)" />
        <span>
          WAY<span className="accent-dot">.</span>
        </span>
      </div>

      {session && profile && (
        <div className="sidebar-user">
          <div className="sidebar-avatar">{profile.name?.[0]?.toUpperCase() || "?"}</div>
          <div className="sidebar-user-name">{profile.name}</div>
          <div className="sidebar-user-rank">
            {profile.rank} · Lv.{profile.level}
          </div>
          <div className="sidebar-user-xp">{profile.xp.toLocaleString()} XP</div>
        </div>
      )}

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <div key={item.label} className={`sidebar-nav-item ${item.active ? "active" : "disabled"}`}>
            <item.icon size={16} />
            <span>{item.label}</span>
            {!item.active && <span className="soon-tag">soon</span>}
          </div>
        ))}
      </nav>

      {!session && (
        <Link href="/login" className="sidebar-signin">
          Sign in
        </Link>
      )}
    </aside>
  );
}
