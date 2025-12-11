"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPublicCourses } from "./lib/api";

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getPublicCourses();
        setCourses(data);
      } catch (err) {
        setError(err.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Hero / Title */}
      <div
        className="animate-blob-up"
        style={{ marginBottom: "1.5rem", marginTop: "0.75rem" }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "2.1rem",
            fontWeight: 800,
            background: "linear-gradient(120deg,#38bdf8,#a855f7,#22c55e)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.03em",
          }}
        >
          Explore Courses
        </h1>
        <p
          style={{
            marginTop: "0.4rem",
            color: "var(--text-soft)",
            fontSize: "0.95rem",
          }}
        >
          Hey, ki Obostha?
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div
          className="animate-blob-up"
          style={{
            padding: "2.5rem 0",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span className="spinner" style={{ width: 24, height: 24 }}></span>
          <span style={{ color: "var(--text-muted)" }}>
            Loading courses...
          </span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          className="card animate-blob-up"
          style={{
            maxWidth: "600px",
            marginTop: "1rem",
            color: "#fecaca",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "0.5rem",
              fontSize: "1.2rem",
            }}
          >
            Couldn&apos;t load courses
          </h2>
          <p style={{ color: "var(--text-soft)", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Course grid */}
      {!loading && !error && (
        <div className="course-grid animate-blob-up delay-100">
          {courses.length === 0 ? (
            <div
              className="card"
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                color: "var(--text-soft)",
              }}
            >
              No courses found. Check back later!
            </div>
          ) : (
            courses.map((course, index) => (
              <div
                key={course.id}
                className="course-card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  animationDelay: `${0.03 * index}s`,
                  cursor: "pointer",
                }}
                onClick={() => router.push(`/course/${course.id}`)}
              >
                <div className="course-card-content">
                  <h2 className="course-card-title">{course.title}</h2>
                  <p className="course-card-desc">
                    {course.description}
                  </p>
                </div>
                <div className="course-card-footer">
                  <span className="course-card-price">
                    ${course.price}
                  </span>
                  <Link
                    href={`/profile/${course.instructorName}`}
                    className="course-card-instructor"
                    style={{
                      zIndex: 10,
                      position: "relative",
                      textDecoration: "none",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    By {course.instructorName}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
