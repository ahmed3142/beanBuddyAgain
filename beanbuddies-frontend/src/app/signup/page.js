"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      if (data?.user && !data.session) {
        setMessage("Check your email for the confirmation link!");
      } else {
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="card animate-blob-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.4rem 2.6rem",
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.9rem",
              fontWeight: 800,
              background:
                "linear-gradient(120deg,#38bdf8,#a855f7,#22c55e)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.03em",
            }}
          >
            BeanBuddies
          </h2>
          <p
            style={{
              color: "var(--text-soft)",
              marginTop: "6px",
              fontSize: "0.95rem",
            }}
          >
            Create your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "rgba(248,113,113,0.12)",
              color: "#fecaca",
              borderRadius: "0.6rem",
              fontSize: "0.9rem",
              marginBottom: "1.4rem",
              border: "1px solid rgba(248,113,113,0.6)",
            }}
          >
            {error}
          </div>
        )}

        {/* Success / info message */}
        {message && (
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "rgba(34,197,94,0.12)",
              color: "#bbf7d0",
              borderRadius: "0.6rem",
              fontSize: "0.9rem",
              marginBottom: "1.4rem",
              border: "1px solid rgba(34,197,94,0.6)",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSignup}>
          {/* Email */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "0.45rem",
                fontWeight: 600,
                color: "var(--text-main)",
                fontSize: "0.9rem",
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "0.65rem",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "var(--text-main)",
                outline: "none",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.6rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "0.45rem",
                fontWeight: 600,
                color: "var(--text-main)",
                fontSize: "0.9rem",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "0.65rem",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "var(--text-main)",
                outline: "none",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-full-width"
            disabled={loading}
          >
            {loading ? (
              <span
                className="spinner"
                style={{ width: "20px", height: "20px" }}
              ></span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "1.6rem",
            color: "var(--text-soft)",
            fontSize: "0.9rem",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
