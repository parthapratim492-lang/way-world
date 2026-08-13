"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";

export default function CollectionsPanel() {
  return (
    <div className="panel glass bottom-panel">
      <div className="panel-header">
        <span>Your Collections</span>
        <span className="soon-tag">custom lists soon</span>
      </div>
      <div className="community-body">
        <Bookmark size={26} color="var(--discovery)" />
        <div>
          <div className="feed-title">Saved places</div>
          <div className="feed-sub">One list for now — themed custom collections are next.</div>
        </div>
      </div>
      <Link href="/saved" className="discover-btn ghost" style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 12 }}>
        View your saves
      </Link>
    </div>
  );
}
