"use client";

import { useEffect, useState } from "react";
import { categoryMeta } from "@/lib/categories";

type FeedItem = {
  _id: string;
  name: string;
  category: string;
  createdByName: string;
  createdAt: string;
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function WorldFeedPanel() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => setItems(data.places || []))
      .catch(() => {});
  }, []);

  return (
    <div className="panel glass side-panel">
      <div className="panel-header">
        <span>World Feed</span>
        <span className="live-tag">LIVE</span>
      </div>
      {items.length === 0 && <p className="status">No discoveries yet — be the first.</p>}
      {items.map((item) => {
        const meta = categoryMeta(item.category);
        return (
          <div key={item._id} className="feed-row">
            <div className="feed-dot" style={{ background: meta.color }} />
            <div>
              <div className="feed-event">
                <span className="feed-event-name">{item.createdByName}</span> discovered something
              </div>
              <div className="feed-title">
                {meta.emoji} {item.name}
              </div>
              <div className="feed-sub">{timeAgo(item.createdAt)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
