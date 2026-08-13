"use client";

import Link from "next/link";

export default function MyWorldPanel({
  userId,
  discoveriesCount,
  level,
}: {
  userId: string;
  discoveriesCount: number;
  level: number;
}) {
  return (
    <div className="panel glass bottom-panel my-world-panel">
      <div className="panel-header">
        <span>My World</span>
      </div>
      <div className="my-world-stats">
        <div>
          <div className="stat-num">{discoveriesCount}</div>
          <div className="feed-sub">Discoveries</div>
        </div>
        <div>
          <div className="stat-num">{level}</div>
          <div className="feed-sub">Level</div>
        </div>
      </div>
      <Link href={`/profile/${userId}`} className="discover-btn ghost" style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 12 }}>
        View full profile
      </Link>
    </div>
  );
}
