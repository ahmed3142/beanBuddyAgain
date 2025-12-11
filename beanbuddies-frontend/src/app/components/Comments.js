"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getCourseComments,
  postCourseComment,
  getLessonComments,
  postLessonComment,
  checkEnrollmentStatus,
} from "../lib/api";
import Link from "next/link";

export default function Comments({ courseId, lessonId }) {
  const { session } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        let commentsData;

        if (lessonId) {
          setIsEnrolled(true);
          commentsData = await getLessonComments(
            session.access_token,
            lessonId
          );
        } else if (courseId) {
          const enrollmentStatus = await checkEnrollmentStatus(
            session.access_token,
            courseId
          );
          setIsEnrolled(enrollmentStatus.isEnrolled);

          if (enrollmentStatus.isEnrolled) {
            commentsData = await getCourseComments(
              session.access_token,
              courseId
            );
          } else {
            commentsData = [];
          }
        }
        setComments(commentsData);
      } catch (err) {
        setError("Failed to load comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, courseId, lessonId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setError("");
      let postedComment;
      const commentData = { content: newComment };

      if (lessonId) {
        postedComment = await postLessonComment(
          session.access_token,
          lessonId,
          commentData
        );
      } else if (courseId) {
        postedComment = await postCourseComment(
          session.access_token,
          courseId,
          commentData
        );
      }

      setComments([postedComment, ...comments]);
      setNewComment("");
    } catch (err) {
      setError("Failed to post comment.");
    }
  };

  if (!session) {
    return (
      <div className="card">
        <p>
          You must be <a href="/login">logged in</a> to view or add comments.
        </p>
      </div>
    );
  }

  if (!isEnrolled && !lessonId) {
    return (
      <div className="card">
        <h2>Comments</h2>
        <p>You must be enrolled in this course to view or add comments.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: "1rem" }}>Comments</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment here..."
          rows={4}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "0.6rem",
            border: "1px solid var(--border-subtle)",
            boxSizing: "border-box",
            background: "rgba(15,23,42,0.9)",
            color: "var(--text-main)",
            fontFamily: "inherit",
            marginBottom: "0.6rem",
            fontSize: "0.9rem",
          }}
        />
        <button type="submit" className="btn btn-primary">
          Post Comment
        </button>
        {error && (
          <p style={{ color: "#fb7185", marginTop: "0.5rem" }}>{error}</p>
        )}
      </form>

      {/* Comment List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                borderRadius: "0.75rem",
                border: "1px solid var(--border-subtle)",
                padding: "0.9rem",
                background: "rgba(15,23,42,0.9)",
              }}
            >
              <p style={{ margin: 0, color: "var(--text-main)" }}>
                {comment.content}
              </p>
              <small style={{ color: "var(--text-soft)" }}>
                By:{" "}
                <Link
                  href={`/profile/${comment.author.username}`}
                  style={{ fontWeight: "bold", color: "var(--accent)" }}
                >
                  {comment.author.username}
                </Link>{" "}
                on {new Date(comment.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--text-soft)" }}>
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
