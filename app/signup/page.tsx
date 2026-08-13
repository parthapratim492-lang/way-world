"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    // Auto sign-in right after signup so it's one smooth step, not two.
    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (signInRes?.error) {
      router.push("/login");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="panel glass">
        <h2>Start exploring</h2>
        <p className="status">Every discovery you add becomes part of your world.</p>

        <div>
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label>Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label>Password (6+ characters)</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="status" style={{ color: "#ff6b6b" }}>{error}</p>}

        <button type="submit" className="discover-btn" style={{ marginTop: 8 }}>
          Create account
        </button>

        <p className="status" style={{ marginTop: 10 }}>
          Already exploring? <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}
