"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryMeta } from "@/lib/categories";

type PulseEvent = {
  _id: string;
  placeName: string;
  category?: string;
  userName: string;
  createdAt: string;
};

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function WorldPulseMini() {
  const [events, setEvents] = useState<PulseEvent[]>([]);

  useEffect(() => {
    fetch("/api/pulse")
      .then((r) => r.json())
      .then((data) => setEvents((data.events || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="pulse-mini panel glass">
      <div className="pulse-mini-header">
        <span className="live-tag">LIVE</span>
        <Link href="/pulse" className="pulse-mini-link">
          View all →
        </Link>
      </div>
      {events.map((e) => {
        const meta = categoryMeta(e.category || "other");
        return (
          <div key={e._id} className="pulse-mini-row">
            <span style={{ color: meta.color }}>{meta.emoji}</span>
            <span className="pulse-mini-text">
              <strong>{e.userName}</strong> found {e.placeName}
            </span>
            <span className="pulse-mini-time mono">{timeAgo(e.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}
