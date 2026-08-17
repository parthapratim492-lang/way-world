"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Compass, Home, Rss, Bookmark, Trophy, Users, LogOut, Sparkles, BookOpen } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/", active: true },
  { label: "Explore", icon: Compass, active: false },
  { label: "Pulse", icon: Rss, href: "/pulse", active: true },
  { label: "Journal", icon: BookOpen, href: "/blog", active: true },
  { label: "Saved", icon: Bookmark, href: "/saved", active: true },
  { label: "Quests", icon: Trophy, href: "/quests", active: true },
  { label: "Explorers", icon: Users, href: "/leaderboard", active: true },
];

export default function NavRail({
  profile,
}: {
  profile: { id: string; name: string; level: number; rank: string; xp: number } | null;
}) {
  const { data: session } = useSession();

  return (
    <nav className="nav-rail">
      <Link href="/" className="nav-rail-brand" title="WAY">
        <Sparkles size={18} />
      </Link>

      <div className="nav-rail-items">
        {NAV_ITEMS.map((item) =>
          item.active && item.href ? (
            <Link key={item.label} href={item.href} className="nav-rail-item active" title={item.label}>
              <item.icon size={18} />
            </Link>
          ) : (
            <div
              key={item.label}
              className="nav-rail-item disabled"
              title={`${item.label} — coming soon`}
            >
              <item.icon size={18} />
            </div>
          )
        )}
      </div>

      <div className="nav-rail-footer">
        {session && profile ? (
          <>
            <Link
              href={`/profile/${profile.id}`}
              className="nav-rail-avatar"
              title={`${profile.name} · Lv.${profile.level} ${profile.rank} — view profile`}
            >
              {profile.name?.[0]?.toUpperCase() || "?"}
            </Link>
            <button className="nav-rail-item" title="Sign out" onClick={() => signOut()}>
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <Link href="/login" className="nav-rail-item" title="Sign in">
            <Users size={18} />
          </Link>
        )}
      </div>
    </nav>
  );
}
