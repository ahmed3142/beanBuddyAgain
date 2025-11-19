// app/course/[id]/lesson/[lessonId]/page.js
"use client"; 

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getLessonDetails, markLessonComplete } from '../../../../lib/api';
import Comments from '../../../../components/Comments';
import Link from 'next/link';
import { useParams } from 'next/navigation'; 

export default function LessonPage() {
  const { session, loading: authLoading } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // --- EIKHANE "BACK TO COURSE" ERROR-TA FIX KORA HOYECHE ---
  const params = useParams();
  const courseId = params.id; // <-- 'courseId' er bodole 'id' (apnar folder name onujayi)
  const lessonId = params.lessonId; // URL theke [lessonId]

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setError("You must be logged in to view this lesson.");
      setLoading(false);
      return;
    }
    
    // Ekhon ar 'undefined' hobe na
    if (!lessonId || !courseId) return; 

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await getLessonDetails(session.access_token, lessonId);
        setLesson(data);
        setIsCompleted(data.isCompleted); 
        setError('');
      } catch (err) {
        setError(err.message); 
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [session, authLoading, lessonId, courseId]); 
  
  const handleMarkComplete = async () => {
    if (isCompleting) return;
    
    try {
      setIsCompleting(true);
      await markLessonComplete(session.access_token, lessonId);
      setIsCompleted(true); 
    } catch (err) {
      setError("Failed to mark as complete. " + err.message);
    } finally {
      setIsCompleting(false);
    }
  };


  if (loading || authLoading) {
    return <div style={{textAlign: 'center', padding: '40px'}}>Loading lesson...</div>;
  }

  // Error page ekhon "Back to Course" link-e shothik 'courseId' pabe
  if (error && !lesson) { 
    return (
      <div style={{textAlign: 'center', padding: '40px'}}>
        <h1 className="page-title" style={{color: 'red'}}>Access Denied</h1>
        <p style={{fontSize: '1.2rem'}}>{error}</p>
        <a href={`/course/${courseId}`}>&larr; Back to Course</a>
      </div>
    );
  }

  if (!lesson) {
    return <div style={{textAlign: 'center', padding: '40px'}}>Lesson not found.</div>;
  }
  
  const videoEmbedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {/* Ekhaneo "courseId" shothikbhabe kaj korbe */}
          <a href={`/course/${courseId}`}>&larr; Back to Course</a>
          <h1 className="page-title" style={{marginBottom: '0.5rem'}}>{lesson.title}</h1>
        </div>
        <div>
          <button 
            className="btn btn-primary"
            onClick={handleMarkComplete}
            disabled={isCompleted || isCompleting}
            style={isCompleted ? {backgroundColor: '#16a34a', cursor: 'default'} : {}}
          >
            {isCompleted ? '✓ Completed' : (isCompleting ? 'Saving...' : 'Mark as Complete')}
          </button>
        </div>
      </div>

      {error && <p style={{color: 'red'}}>{error}</p>}

      <div className="card">
        {videoEmbedUrl ? (
          <div style={{marginBottom: '1.5rem', position: 'relative', paddingBottom: '56.25%', height: 0}}>
            <iframe 
              src={videoEmbedUrl}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
            ></iframe>
          </div>
        ) : lesson.videoUrl ? (
          <div style={{padding: '1rem', backgroundColor: '#fff0f0', color: '#c00', border: '1px solid #fcc', borderRadius: '4px', marginBottom: '1.5rem'}}>
            Could not load video. Invalid YouTube URL provided.
          </div>
        ) : null} 
        
        {lesson.textContent && (
          <div 
            className="lesson-text-content" 
            style={{lineHeight: '1.6'}}
            dangerouslySetInnerHTML={{ __html: lesson.textContent.replace(/\n/g, '<br />') }} 
          />
        )}
      </div>

      <Comments lessonId={lesson.id} />

    </div>
  );
}

// YouTube URL fix korar function
const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.substring(1); 
    } else if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1];
      } else if (urlObj.pathname.startsWith('/watch')) {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/')) {
        return url; 
      }
    }
    if (videoId) {
      videoId = videoId.split('?')[0]; 
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {
    console.error("Invalid video URL", url, e);
    return ''; 
  }
  return ''; 
};