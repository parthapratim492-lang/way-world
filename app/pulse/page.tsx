import Link from "next/link";
import WorldPulse from "@/components/WorldPulse";
import TrendingPanel from "@/components/TrendingPanel";
import CommunityPanel from "@/components/CommunityPanel";

export default function PulsePage() {
  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        ← Back to the map
      </Link>
      <div className="page-title-row">
        <h1 className="page-title">World Pulse</h1>
        <p className="status">What's happening across WAY right now.</p>
      </div>
      <div className="focused-page-grid">
        <WorldPulse />
        <TrendingPanel />
        <CommunityPanel />
      </div>
    </div>
  );
}
