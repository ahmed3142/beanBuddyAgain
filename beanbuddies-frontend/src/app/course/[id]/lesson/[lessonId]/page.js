"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import {
  getLessonDetails,
  markLessonComplete,
} from "../../../../lib/api";
import Comments from "../../../../components/Comments";
import Link from "next/link";

export default function LessonPage() {
  const { id, lessonId } = useParams();
  const { session } = useAuth();
  const router = useRouter();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // --- YOUTUBE URL PARSER HELPER ---
  const getEmbedUrl = (url) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }

    return url;
  };

  useEffect(() => {
    if (!session || !lessonId) return;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await getLessonDetails(
          session.access_token,
          lessonId
        );
        setLesson(data);
        setIsCompleted(data.isCompleted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, session, id, router]);

  const handleComplete = async () => {
    try {
      await markLessonComplete(session.access_token, lessonId);
      setIsCompleted(true);
    } catch (err) {
      alert("Failed to mark complete: " + err.message);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "3rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span
          className="spinner"
          style={{ width: 24, height: 24 }}
        ></span>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div
        className="card"
        style={{ padding: "2.5rem", textAlign: "center" }}
      >
        Lesson not found.
      </div>
    );
  }

  const embedUrl = getEmbedUrl(lesson.videoUrl);

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        paddingBottom: "100px",
      }}
    >
      {/* Navigation Breadcrumb */}
      <div className="animate-blob-up" style={{ marginBottom: "20px" }}>
        <Link
          href={`/course/${id}`}
          className="btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            borderRadius: "999px",
            border: "1px solid var(--border-subtle)",
            background: "rgba(15,23,42,0.85)",
            color: "var(--text-main)",
            textDecoration: "none",
            paddingInline: "14px",
            paddingBlock: "8px",
            fontSize: "0.9rem",
          }}
        >
          ← Back to Course
        </Link>
      </div>

      {/* Video Player Section (Responsive 16:9) */}
      <div
        className="card animate-blob-up"
        style={{
          padding: 0,
          overflow: "hidden",
          background: "#000",
          border: "1px solid rgba(15,23,42,0.9)",
        }}
      >
        {embedUrl ? (
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
            }}
          >
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              src={embedUrl}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div
            style={{
              padding: "100px",
              textAlign: "center",
              color: "#e5e7eb",
            }}
          >
            <p>No video content available for this lesson.</p>
          </div>
        )}
      </div>

      {/* Content & Actions */}
      <div
        className="card animate-blob-up delay-100"
        style={{ marginTop: "20px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "15px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "1.8rem",
              color: "var(--text-main)",
            }}
          >
            {lesson.title}
          </h1>

          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className="btn"
            style={{
              minWidth: "160px",
              backgroundColor: isCompleted
                ? "#22c55e"
                : "rgba(37,99,235,0.95)",
              color: "#f9fafb",
              cursor: isCompleted ? "default" : "pointer",
              border:
                "1px solid " +
                (isCompleted
                  ? "rgba(34,197,94,0.7)"
                  : "rgba(59,130,246,0.7)"),
              fontWeight: 600,
            }}
          >
            {isCompleted ? "✅ Completed" : "Mark as Complete"}
          </button>
        </div>

        <div
          style={{
            fontSize: "1.02rem",
            lineHeight: "1.7",
            color: "var(--text-main)",
          }}
        >
          {lesson.textContent ? (
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
              {lesson.textContent}
            </p>
          ) : (
            <p
              style={{
                fontStyle: "italic",
                color: "var(--text-soft)",
                margin: 0,
              }}
            >
              No text content provided.
            </p>
          )}
        </div>
      </div>

      {/* Discussion/Comments Section */}
      <div className="animate-blob-up delay-200">
        <Comments lessonId={lessonId} />
      </div>
    </div>
  );
}
