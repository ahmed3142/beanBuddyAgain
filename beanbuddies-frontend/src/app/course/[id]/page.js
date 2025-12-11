"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { getCourseDetails, checkEnrollmentStatus } from '../../lib/api';
import LessonManager from '../../components/LessonManager';
import EnrollButton from '../../components/EnrollButton';
import Comments from '../../components/Comments';
import InboxList from '../../components/InboxList';

export default function CoursePage() {
  const { id } = useParams();
  const { session, profile } = useAuth();
  const { setActiveChatUser } = useWebSocket();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Only need this now for showing the inbox popup
  const [showInstructorInbox, setShowInstructorInbox] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        const token = session?.access_token;
        const data = await getCourseDetails(token, id);
        setCourse(data);

        if (token) {
          const status = await checkEnrollmentStatus(token, id);
          setIsEnrolled(status.isEnrolled);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourse();
  }, [id, session]);

  if (!course)
    return (
      <div className="flex justify-center p-10">
        <span
          className="spinner"
          style={{ borderLeftColor: '#1877f2' }}
        ></span>
      </div>
    );

  const isInstructor = profile?.username === course.instructor?.username;
  const instructorUsername = course.instructor?.username;

  // Instructor selects a student from InboxList
  const handleInboxSelect = (studentUsername) => {
    setShowInstructorInbox(false);
    setActiveChatUser(studentUsername); // 🔥 open global chat
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Hero */}
      <div className="card animate-blob-up" style={{ borderTop: '5px solid #1877f2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                margin: '0 0 10px 0',
              }}
            >
              {course.title}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#65676b' }}>
              {course.description}
            </p>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#42b72a',
            }}
          >
            ${course.price}
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          {!isInstructor && !isEnrolled && <EnrollButton courseId={id} />}

          {isEnrolled && !isInstructor && (
            <div
              style={{
                padding: '10px',
                background: '#e7f3ff',
                color: '#1877f2',
                borderRadius: '8px',
                display: 'inline-block',
              }}
            >
              ✅ You are enrolled in this course.
            </div>
          )}
        </div>
      </div>

      {/* Lessons */}
      <div className="card animate-blob-up delay-100">
        <LessonManager initialCourse={course} />
      </div>

      {/* Comments */}
      <div className="animate-blob-up delay-200">
        <Comments courseId={id} />
      </div>

      {/* --- FLOATING ACTION BUTTONS (Bottom Right) --- */}

      {/* 1. STUDENT VIEW: open chat with instructor */}
      {isEnrolled && !isInstructor && instructorUsername && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setActiveChatUser(instructorUsername)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#0084ff',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              fontSize: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            💬
          </button>
        </div>
      )}

      {/* 2. INSTRUCTOR VIEW: inbox list → open global chat */}
      {isInstructor && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        >
          {showInstructorInbox && (
            <div
              className="animate-blob-up"
              style={{
                position: 'absolute',
                bottom: '70px',
                right: '0',
                width: '300px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                border: '1px solid #ddd',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  background: '#0084ff',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '15px',
                }}
              >
                Student Messages
              </div>

              <InboxList onSelectUser={handleInboxSelect} />
            </div>
          )}

          <button
            onClick={() => setShowInstructorInbox(!showInstructorInbox)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#0084ff',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              fontSize: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showInstructorInbox ? '✕' : '📥'}
          </button>
        </div>
      )}
    </div>
  );
}
