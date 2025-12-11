"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { createCourse } from "../../lib/api";

export default function CreateCoursePage() {
  const { session, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0.0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check role
  const isInstructor =
    profile?.role === "ROLE_INSTRUCTOR" || profile?.role === "ROLE_ADMIN";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = session.access_token;
      const courseData = {
        title,
        description,
        price: Number(price),
      };

      const newCourse = await createCourse(token, courseData);
      router.push(`/course/${newCourse.id}`);
    } catch (err) {
      setError(err.message || "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div
        className="animate-blob-up"
        style={{ padding: "1.5rem", display: "flex", alignItems: "center" }}
      >
        <span className="spinner" />{" "}
        <span style={{ marginLeft: 8, color: "var(--text-muted)" }}>
          Checking permissions...
        </span>
      </div>
    );
  }

  // Access control
  if (!isInstructor) {
    return (
      <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <div className="card animate-blob-up">
          <h1
            style={{
              marginBottom: "0.5rem",
              fontSize: "1.4rem",
              background:
                "linear-gradient(120deg,#f97373,#fb7185,#fbbf24)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Access Denied
          </h1>
          <p style={{ color: "var(--text-soft)", marginBottom: "0.75rem" }}>
            You must be an <strong>Instructor</strong> or{" "}
            <strong>Admin</strong> to create courses.
          </p>
          <Link
            href="/"
            style={{
              color: "var(--accent)",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            ← Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <h1
        className="animate-blob-up"
        style={{
          marginBottom: "1.25rem",
          fontSize: "1.8rem",
          fontWeight: 800,
          background:
            "linear-gradient(120deg,#38bdf8,#a855f7,#22c55e)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Create a New Course
      </h1>

      <div className="card animate-blob-up delay-100">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="title"
              style={{
                fontWeight: "bold",
                marginBottom: "6px",
                display: "block",
                fontSize: "0.95rem",
              }}
            >
              Course Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "0.6rem",
                border: "1px solid var(--border-subtle)",
                boxSizing: "border-box",
                background: "rgba(15,23,42,0.9)",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="description"
              style={{
                fontWeight: "bold",
                marginBottom: "6px",
                display: "block",
                fontSize: "0.95rem",
              }}
            >
              Course Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "0.6rem",
                border: "1px solid var(--border-subtle)",
                boxSizing: "border-box",
                background: "rgba(15,23,42,0.9)",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          {/* Price */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="price"
              style={{
                fontWeight: "bold",
                marginBottom: "6px",
                display: "block",
                fontSize: "0.95rem",
              }}
            >
              Price ($)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "0.6rem",
                border: "1px solid var(--border-subtle)",
                boxSizing: "border-box",
                background: "rgba(15,23,42,0.9)",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                outline: "none",
                MozAppearance: "textfield",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#fb7185",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full-width"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
