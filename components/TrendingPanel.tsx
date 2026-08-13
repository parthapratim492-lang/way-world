"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryMeta } from "@/lib/categories";

type Item = {
  _id: string;
  name: string;
  category: string;
  photoUrl?: string;
};

export default function TrendingPanel() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => setItems((data.places || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <div className="panel glass bottom-panel">
      <div className="panel-header">
        <span>New & Notable</span>
      </div>
      {items.length === 0 && <p className="status">Nothing added yet — add the first one.</p>}
      <div className="trending-grid">
        {items.map((item) => {
          const meta = categoryMeta(item.category);
          return (
            <Link key={item._id} href={`/place/${item._id}`} className="trending-card">
              <div
                className="trending-thumb"
                style={{
                  backgroundImage: item.photoUrl ? `url(${item.photoUrl})` : undefined,
                  background: item.photoUrl ? undefined : `${meta.color}22`,
                }}
              >
                {!item.photoUrl && <span>{meta.emoji}</span>}
              </div>
              <div className="feed-title" style={{ fontSize: 12 }}>
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
