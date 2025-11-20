"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getCourseDetails, checkEnrollmentStatus } from '../../lib/api'; 
import LessonManager from '../../components/LessonManager';
import EnrollButton from '../../components/EnrollButton';
import Comments from '../../components/Comments';
import ChatWindow from '../../components/ChatWindow'; 
import InboxList from '../../components/InboxList';

export default function CoursePage() {
  const { id } = useParams();
  const { session, profile } = useAuth();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  // --- CHAT STATES ---
  const [showStudentChat, setShowStudentChat] = useState(false); // For Students
  const [showInstructorInbox, setShowInstructorInbox] = useState(false); // For Instructor (Popup List)
  const [instructorChatUser, setInstructorChatUser] = useState(null); // For Instructor (Active Chat Window)

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

  if (!course) return <div className="flex justify-center p-10"><span className="spinner" style={{borderLeftColor:'#1877f2'}}></span></div>;

  const isInstructor = profile?.username === course.instructor?.username;
  const instructorUsername = course.instructor?.username;

  // --- HANDLER FOR INSTRUCTOR INBOX ---
  const handleInboxSelect = (studentUsername) => {
    setInstructorChatUser(studentUsername); // Active chat set koro
    setShowInstructorInbox(false); // Inbox list bondho kore dao (clean UI er jonno)
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '100px' }}>
      
      {/* Hero Section */}
      <div className="card animate-blob-up" style={{ borderTop: '5px solid #1877f2' }}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
                <h1 style={{fontSize: '2.5rem', fontWeight: '800', margin: '0 0 10px 0'}}>{course.title}</h1>
                <p style={{fontSize: '1.1rem', color: '#65676b'}}>{course.description}</p>
            </div>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#42b72a'}}>${course.price}</div>
        </div>

        <div style={{marginTop: '20px'}}>
            {!isInstructor && !isEnrolled && <EnrollButton courseId={id} />}
            
            {isEnrolled && !isInstructor && (
                <div style={{padding: '10px', background: '#e7f3ff', color: '#1877f2', borderRadius: '8px', display: 'inline-block'}}>
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
      
      {/* 1. STUDENT VIEW: Chat with Instructor */}
      {isEnrolled && !isInstructor && instructorUsername && (
        <div style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999}}>
            <button 
                onClick={() => setShowStudentChat(!showStudentChat)}
                style={{
                    width: '60px', height: '60px', borderRadius: '50%', 
                    backgroundColor: '#0084ff', color: 'white', border: 'none', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer',
                    fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                💬
            </button>
        </div>
      )}

      {/* 2. INSTRUCTOR VIEW: Inbox Button */}
      {isInstructor && (
        <div style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999}}>
             {/* Inbox Popup List (Above the button) */}
             {showInstructorInbox && (
                <div className="animate-blob-up" style={{
                    position: 'absolute', bottom: '70px', right: '0', 
                    width: '300px', backgroundColor: 'white', 
                    borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                    overflow: 'hidden', border: '1px solid #ddd'
                }}>
                    <div style={{padding: '12px', background: '#0084ff', color: 'white', fontWeight: 'bold', fontSize:'15px'}}>
                        Student Messages
                    </div>
                    
                    {/* --- HERE IS THE FIX: Passing the function --- */}
                    <InboxList onSelectUser={handleInboxSelect} />
                </div>
             )}

             {/* Main Trigger Button */}
             <button 
                onClick={() => setShowInstructorInbox(!showInstructorInbox)}
                style={{
                    width: '60px', height: '60px', borderRadius: '50%', 
                    backgroundColor: '#0084ff', color: 'white', border: 'none', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer',
                    fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                {showInstructorInbox ? '✕' : '📥'}
            </button>
        </div>
      )}

      {/* --- CHAT WINDOWS (Fixed Position) --- */}

      {/* A. Student's Chat Window */}
      {showStudentChat && instructorUsername && (
        <ChatWindow 
          otherUser={instructorUsername} 
          onClose={() => setShowStudentChat(false)} 
        />
      )}

      {/* B. Instructor's Chat Window (Driven by state from InboxList) */}
      {instructorChatUser && (
        <ChatWindow 
          otherUser={instructorChatUser} 
          onClose={() => setInstructorChatUser(null)} 
        />
      )}

    </div>
  );
}