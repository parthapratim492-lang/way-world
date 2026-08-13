"use client";

import { useEffect, useState } from "react";
import { Users2 } from "lucide-react";

export default function CommunityPanel() {
  const [stats, setStats] = useState<{ placesCount: number; explorersCount: number } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="panel glass bottom-panel">
      <div className="panel-header">
        <span>Community</span>
      </div>
      <div className="community-body">
        <Users2 size={26} color="var(--accent)" />
        <div>
          <div className="stat-num">{stats?.explorersCount ?? "–"}</div>
          <div className="feed-sub">explorers so far</div>
        </div>
      </div>
      <div className="feed-sub" style={{ marginTop: 8 }}>
        {stats?.placesCount ?? "–"} places documented in total
      </div>
    </div>
  );
}
