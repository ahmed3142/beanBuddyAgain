// app/components/Comments.js
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getCourseComments, 
  postCourseComment, 
  getLessonComments, 
  postLessonComment,
  checkEnrollmentStatus
} from '../lib/api';
import Link from 'next/link'; 

export default function Comments({ courseId, lessonId }) {
  const { session } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // --- NOTUN STATE ---
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Load comments AND check enrollment status
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
          // Lesson page-e gele user already enrolled (karon page-ta protected)
          setIsEnrolled(true); 
          commentsData = await getLessonComments(session.access_token, lessonId);
        } else if (courseId) {
          // Course page-e gele amader check korte hobe
          const enrollmentStatus = await checkEnrollmentStatus(session.access_token, courseId);
          setIsEnrolled(enrollmentStatus.isEnrolled);

          if (enrollmentStatus.isEnrolled) {
            commentsData = await getCourseComments(session.access_token, courseId);
          } else {
            commentsData = []; // Enroll kora na thakle comment load korbo na
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

  // Post comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setError('');
      let postedComment;
      const commentData = { content: newComment };

      if (lessonId) {
        postedComment = await postLessonComment(session.access_token, lessonId, commentData);
      } else if (courseId) {
        postedComment = await postCourseComment(session.access_token, courseId, commentData);
      }
      
      setComments([postedComment, ...comments]); 
      setNewComment(''); 
      
    } catch (err) {
      setError("Failed to post comment.");
    }
  };

  // --- NOTUN RENDER LOGIC ---
  if (!session) {
    return <div className="card"><p>You must be <a href="/login">logged in</a> to view or add comments.</p></div>;
  }
  
  // Jodi enroll kora na thake (ebong eta lesson page na hoy)
  if (!isEnrolled && !lessonId) {
    return (
      <div className="card">
        <h2>Comments</h2>
        <p>You must be enrolled in this course to view or add comments.</p>
      </div>
    );
  }
  
  // Jodi enroll kora thake
  return (
    <div className="card">
      <h2>Comments</h2>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment here..."
          rows={4}
          style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#000', fontFamily: 'inherit', marginBottom: '0.5rem'}}
        />
        <button type="submit" className="btn btn-primary">Post Comment</button>
        {error && <p style={{color: 'red', marginTop: '0.5rem'}}>{error}</p>}
      </form>

      {/* Comment List */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} style={{border: '1px solid #eee', padding: '1rem', borderRadius: '4px'}}>
              <p style={{margin: 0}}>{comment.content}</p>
              <small style={{color: '#6b7280'}}>
                By: <Link href={`/profile/${comment.author.username}`} style={{fontWeight: 'bold'}}>
                  {comment.author.username}
                </Link> on {new Date(comment.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}