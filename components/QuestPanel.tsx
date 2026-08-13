"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

type Quest = {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  recurring: boolean;
};

export default function QuestPanel() {
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    fetch("/api/quests")
      .then((r) => r.json())
      .then((data) => setQuests(data.quests || []))
      .catch(() => {});
  }, []);

  return (
    <div className="panel glass bottom-panel">
      <div className="panel-header">
        <span>Quests</span>
        <span className="soon-tag">{quests.filter((q) => q.completed).length}/{quests.length}</span>
      </div>
      {quests.length === 0 && <p className="status">Loading quests…</p>}
      <div className="quest-list">
        {quests.map((q) => (
          <div key={q.id} className={`quest-row ${q.completed ? "done" : ""}`}>
            <div style={{ flex: 1 }}>
              <div className="feed-title">
                {q.title} {q.recurring && <span className="feed-sub">· daily</span>}
              </div>
              <div className="feed-sub">{q.description}</div>
              <div className="xp-bar" style={{ width: "100%", marginTop: 6 }}>
                <div
                  className="xp-bar-fill"
                  style={{ width: `${Math.min((q.progress / q.target) * 100, 100)}%` }}
                />
              </div>
            </div>
            {q.completed ? (
              <CheckCircle2 size={18} color="var(--community)" />
            ) : (
              <span className="feed-sub" style={{ whiteSpace: "nowrap" }}>
                {q.progress}/{q.target}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
