"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import { CATEGORIES } from "@/lib/categories";

export default function NewDiscovery() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "cafe",
    photoUrl: "",
    tags: "",
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  if (status === "loading") {
    return (
      <div className="form-page">
        <p className="status">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="form-page">
        <div className="panel glass" style={{ textAlign: "center" }}>
          <h2>Sign in to add a discovery</h2>
          <p className="status" style={{ marginBottom: 16 }}>
            Every place is tied to the explorer who found it.
          </p>
          <Link href="/login" className="discover-btn" style={{ display: "inline-block" }}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setStatusMsg("Could not get your location — check location permissions.")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) {
      setStatusMsg("Set the location first (tap 'Use my current location').");
      return;
    }
    setStatusMsg("Saving…");

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags, lat: coords.lat, lng: coords.lng }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setStatusMsg("Error: " + (data.error || "something went wrong"));
    }
  }

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="panel glass">
        <h2>+ Discover</h2>
        <p className="status">Tell the world what you found.</p>

        <div>
          <label>Place name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Hidden rooftop café"
          />
        </div>

        <div>
          <label>Category</label>
          <div className="chip-row">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`chip-select ${form.category === c.id ? "active" : ""}`}
                style={{
                  borderColor: c.color,
                  color: form.category === c.id ? "#0b0d10" : c.color,
                  background: form.category === c.id ? c.color : "transparent",
                }}
                onClick={() => setForm({ ...form, category: c.id })}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What makes this worth finding?"
          />
        </div>

        <div>
          <label>Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="quiet, wifi, sunset"
          />
        </div>

        <div>
          <label>Photo</label>
          <PhotoUpload onChange={(dataUrl) => setForm({ ...form, photoUrl: dataUrl })} />
        </div>

        <div>
          <label>Location</label>
          <button type="button" className="discover-btn" onClick={useMyLocation}>
            Use my current location
          </button>
          {coords && (
            <p className="status" style={{ marginTop: 6 }}>
              📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}
        </div>

        <button type="submit" className="discover-btn" style={{ marginTop: 8 }}>
          Publish
        </button>

        {statusMsg && <p className="status">{statusMsg}</p>}
      </form>
    </div>
  );
}
