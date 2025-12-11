"use client";

import useSWR from "swr";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { getMyDashboard } from "../lib/api";
import Link from "next/link";
import { useEffect } from "react";

// --- Progress Bar Component ---
const ProgressBar = ({ completed, total }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "rgba(15,23,42,0.9)",
        borderRadius: "999px",
        height: "8px",
        marginTop: "0.5rem",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          background:
            "linear-gradient(90deg,#38bdf8,#6366f1)",
          borderRadius: "999px",
          height: "100%",
          boxShadow: "0 0 12px rgba(59,130,246,0.6)",
        }}
      ></div>
    </div>
  );
};

// SWR fetcher function
const fetcher = ([url, token]) => getMyDashboard(token);

export default function DashboardPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/login");
    }
  }, [session, authLoading, router]);

  const shouldFetch = session?.access_token
    ? ["/users/me/dashboard", session.access_token]
    : null;

  const {
    data: dashboard,
    error,
    isLoading,
  } = useSWR(shouldFetch, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  if (authLoading || (isLoading && !dashboard)) {
    return (
      <div
        style={{
          padding: "3rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span
          className="spinner"
          style={{ width: 22, height: 22 }}
        ></span>
        <span style={{ color: "var(--text-muted)" }}>
          Loading your dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="card animate-blob-up"
        style={{
          maxWidth: "700px",
          margin: "2rem auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "0.75rem",
            fontSize: "1.4rem",
            color: "#fecaca",
          }}
        >
          Error loading dashboard
        </h2>
        <p style={{ color: "var(--text-soft)" }}>
          Something went wrong while fetching your data.
        </p>
      </div>
    );
  }

  if (!dashboard) return null;

  const isInstructor =
    profile?.role === "ROLE_INSTRUCTOR" ||
    profile?.role === "ROLE_ADMIN";
  const hasCreatedCourses = dashboard?.createdCourses?.length > 0;
  const hasEnrolledCourses = dashboard?.enrolledCourses?.length > 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page title */}
      <h1
        className="animate-blob-up"
        style={{
          marginBottom: "1.5rem",
          fontSize: "2rem",
          fontWeight: 800,
          background:
            "linear-gradient(120deg,#38bdf8,#a855f7,#22c55e)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          letterSpacing: "-0.03em",
        }}
      >
        My Dashboard
      </h1>

      {/* === INSTRUCTOR SECTION === */}
      {isInstructor && (
        <div className="card animate-blob-up">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1.2rem",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "0.75rem",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.3rem",
                color: "var(--text-main)",
              }}
            >
              My Created Courses
            </h2>

            <Link
              href="/instructor/create-course"
              className="btn btn-primary"
              style={{
                textDecoration: "none",
                paddingInline: "1rem",
                paddingBlock: "0.45rem",
                fontSize: "0.9rem",
              }}
            >
              + Create Course
            </Link>
          </div>

          {hasCreatedCourses ? (
            <div className="course-grid">
              {dashboard.createdCourses.map((course) => (
                <Link
                  href={`/course/${course.id}`}
                  key={course.id}
                  className="course-card animate-blob-up delay-100"
                >
                  <div className="course-card-content">
                    <h2 className="course-card-title">
                      {course.title}
                    </h2>
                    <p className="course-card-desc">
                      {course.description}
                    </p>

                    <div className="course-card-footer">
                      <span className="course-card-price">
                        ${course.price}
                      </span>
                      <span className="course-card-instructor">
                        By You
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-soft)" }}>
              You haven&apos;t created any courses yet.{" "}
              <Link href="/instructor/create-course">
                Create one now
              </Link>
            </p>
          )}
        </div>
      )}

      {/* === STUDENT SECTION === */}
      <div className="card animate-blob-up delay-100">
        <h2
          style={{
            marginTop: 0,
            marginBottom: "1.2rem",
            fontSize: "1.3rem",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "0.75rem",
            color: "var(--text-main)",
          }}
        >
          My Enrolled Courses
        </h2>

        {hasEnrolledCourses ? (
          <div className="course-grid">
            {dashboard.enrolledCourses.map((course, index) => (
              <Link
                href={`/course/${course.id}`}
                key={course.id}
                className="course-card animate-blob-up"
                style={{
                  animationDelay: `${0.05 * index}s`,
                }}
              >
                <div className="course-card-content">
                  <h2 className="course-card-title">
                    {course.title}
                  </h2>
                  <p className="course-card-desc">
                    {course.description}
                  </p>

                  {/* Progress */}
                  <ProgressBar
                    completed={course.completedLessons}
                    total={course.totalLessons}
                  />
                  <small
                    style={{
                      color: "var(--text-soft)",
                      marginTop: "4px",
                      display: "block",
                      fontSize: "0.8rem",
                    }}
                  >
                    {course.completedLessons} /{" "}
                    {course.totalLessons} lessons
                  </small>

                  <div
                    className="course-card-footer"
                    style={{ marginTop: "0.75rem" }}
                  >
                    <span className="course-card-price">
                      ${course.price}
                    </span>
                    <span className="course-card-instructor">
                      By {course.instructorName}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-soft)" }}>
            You are not enrolled in any courses yet.{" "}
            <Link href="/">Explore courses</Link>
          </p>
        )}
      </div>
    </div>
  );
}
