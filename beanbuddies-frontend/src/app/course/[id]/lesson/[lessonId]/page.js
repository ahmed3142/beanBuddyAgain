"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getLessonDetails, markLessonComplete } from '../../../../lib/api';
import Comments from '../../../../components/Comments';
import Link from 'next/link';

export default function LessonPage() {
  const { id, lessonId } = useParams();
  const { session } = useAuth();
  const router = useRouter();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // --- YOUTUBE URL PARSER HELPER ---
  // Raw link theke Video ID ber kore Embed URL banabe
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // Regular expression for YouTube ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    // Jodi match na kore, tobe original URL-tai return korbo (fallback)
    return url;
  };

  useEffect(() => {
    if (!session || !lessonId) return;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await getLessonDetails(session.access_token, lessonId);
        setLesson(data);
        setIsCompleted(data.isCompleted); 
      } catch (err) {
        console.error(err);
        // Error hole course page-e ferot pathano jete pare
        // router.push(`/course/${id}`);
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

  if (loading) return <div className="flex justify-center p-10"><span className="spinner" style={{borderLeftColor:'#1877f2'}}></span></div>;
  if (!lesson) return <div className="card p-10 text-center">Lesson not found.</div>;

  const embedUrl = getEmbedUrl(lesson.videoUrl);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
      
      {/* Navigation Breadcrumb */}
      <div className="animate-blob-up" style={{ marginBottom: '20px' }}>
        <Link href={`/course/${id}`} className="btn" style={{ backgroundColor: '#e4e6eb', color: '#050505', gap: '5px', textDecoration: 'none' }}>
          ⬅ Back to Course
        </Link>
      </div>

      {/* Video Player Section (Responsive 16:9) */}
      <div className="card animate-blob-up" style={{ padding: '0', overflow: 'hidden', background: '#000', border: 'none' }}>
        {embedUrl ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src={embedUrl}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
            <div style={{ padding: '100px', textAlign: 'center', color: '#fff' }}>
                <p>No video content available for this lesson.</p>
            </div>
        )}
      </div>

      {/* Content & Actions */}
      <div className="card animate-blob-up delay-100" style={{marginTop: '20px'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#050505' }}>{lesson.title}</h1>
            
            <button 
                onClick={handleComplete}
                disabled={isCompleted}
                className="btn"
                style={{ 
                    minWidth: '160px',
                    backgroundColor: isCompleted ? '#42b72a' : '#1877f2',
                    color: '#fff',
                    cursor: isCompleted ? 'default' : 'pointer'
                }}
            >
                {isCompleted ? '✅ Completed' : 'Mark as Complete'}
            </button>
        </div>

        <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#1c1e21' }}>
            {lesson.textContent ? (
                <p style={{ whiteSpace: 'pre-wrap' }}>{lesson.textContent}</p>
            ) : (
                <p style={{ fontStyle: 'italic', color: '#65676b' }}>No text content provided.</p>
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