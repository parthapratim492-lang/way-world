"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LeaderRow = { id: string; name: string; xp: number; level: number; rank: string };

export default function LeaderboardPanel() {
  const [rows, setRows] = useState<LeaderRow[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setRows(data.leaderboard || []))
      .catch(() => {});
  }, []);

  return (
    <div className="panel glass side-panel">
      <div className="panel-header">
        <span>Top Explorers</span>
      </div>
      {rows.length === 0 && <p className="status">No explorers yet — sign up and start the board.</p>}
      {rows.map((row, i) => (
        <Link key={row.id} href={`/profile/${row.id}`} className="leader-row">
          <span className="leader-rank">{i + 1}</span>
          <div className="leader-avatar">{row.name?.[0]?.toUpperCase() || "?"}</div>
          <div style={{ flex: 1 }}>
            <div className="feed-title">{row.name}</div>
            <div className="feed-sub">{row.rank}</div>
          </div>
          <div className="leader-xp">{row.xp.toLocaleString()} XP</div>
        </Link>
      ))}
    </div>
  );
}
