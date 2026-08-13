"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Wrong email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="panel glass">
        <h2>Welcome back</h2>
        <p className="status">Sign in to keep exploring.</p>

        <div>
          <label>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="status" style={{ color: "#ff6b6b" }}>{error}</p>}

        <button type="submit" className="discover-btn" style={{ marginTop: 8 }}>
          Sign in
        </button>

        <p className="status" style={{ marginTop: 10 }}>
          New here? <Link href="/signup" style={{ color: "var(--accent)" }}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}
