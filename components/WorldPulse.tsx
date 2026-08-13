"use client";

import { useEffect, useRef, useState } from "react";
import { categoryMeta } from "@/lib/categories";

type PulseEvent = {
  _id: string;
  type: "DISCOVERY";
  placeName: string;
  category?: string;
  userName: string;
  createdAt: string;
};

const POLL_MS = 20000; // honest polling, not a websocket — good enough at this scale, cheap to build

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function WorldPulse() {
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const latestTimestamp = useRef<string | null>(null);

  // Initial load
  useEffect(() => {
    fetch("/api/pulse")
      .then((r) => r.json())
      .then((data) => {
        const evs: PulseEvent[] = data.events || [];
        setEvents(evs);
        if (evs.length > 0) latestTimestamp.current = evs[0].createdAt;
      })
      .catch(() => {});
  }, []);

  // Poll for new events, animate them in at the top
  useEffect(() => {
    const interval = setInterval(() => {
      const after = latestTimestamp.current;
      const url = after ? `/api/pulse?after=${encodeURIComponent(after)}` : "/api/pulse";
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          const fresh: PulseEvent[] = data.events || [];
          if (fresh.length === 0) return;

          latestTimestamp.current = fresh[0].createdAt;
          setNewIds(new Set(fresh.map((e) => e._id)));
          setEvents((prev) => [...fresh, ...prev].slice(0, 20));

          // clear the "new" highlight after the entrance animation plays once
          setTimeout(() => setNewIds(new Set()), 1200);
        })
        .catch(() => {});
    }, POLL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel glass side-panel">
      <div className="panel-header">
        <span>World Pulse</span>
        <span className="live-tag">LIVE</span>
      </div>
      {events.length === 0 && <p className="status">Nothing has happened yet — be the first.</p>}
      {events.map((event) => {
        const meta = categoryMeta(event.category || "other");
        const isNew = newIds.has(event._id);
        return (
          <div key={event._id} className={`feed-row ${isNew ? "pulse-in" : ""}`}>
            <div className="feed-dot pulsing" style={{ background: meta.color }} />
            <div>
              <div className="feed-event">
                <span className="feed-event-name">{event.userName}</span> discovered something
              </div>
              <div className="feed-title">
                {meta.emoji} {event.placeName}
              </div>
              <div className="feed-sub">{timeAgo(event.createdAt)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
