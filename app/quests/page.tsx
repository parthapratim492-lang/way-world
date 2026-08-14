"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import QuestPanel from "@/components/QuestPanel";

export default function QuestsPage() {
  const { data: session } = useSession();

  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        ← Back to the map
      </Link>
      <div className="page-title-row">
        <h1 className="page-title">Quests</h1>
        <p className="status">Real progress toward real badges.</p>
      </div>
      <div className="focused-page-single">
        {session ? (
          <QuestPanel />
        ) : (
          <div className="panel glass bottom-panel">
            <p className="status">Sign in to start earning XP and unlocking badges.</p>
            <Link href="/login" className="discover-btn" style={{ display: "inline-block", marginTop: 12 }}>
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
