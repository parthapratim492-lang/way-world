import Link from "next/link";
import LeaderboardPanel from "@/components/LeaderboardPanel";

export default function LeaderboardPage() {
  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        ← Back to the map
      </Link>
      <div className="page-title-row">
        <h1 className="page-title">Top Explorers</h1>
        <p className="status">Ranked by real XP, earned from real discoveries.</p>
      </div>
      <div className="focused-page-single">
        <LeaderboardPanel />
      </div>
    </div>
  );
}
