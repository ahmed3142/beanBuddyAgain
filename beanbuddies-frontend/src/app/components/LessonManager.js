// app/components/LessonManager.js
"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { addLessonToCourse, deleteLesson } from '../lib/api';
import Link from 'next/link'; 

export default function LessonManager({ initialCourse }) {
  const { session, profile } = useAuth();
  const router = useRouter(); 
  
  const [course, setCourse] = useState(initialCourse);
  const [error, setError] = useState('');
  
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);

  const isOwnerOrAdmin = profile && course.instructor && (
    profile.username === course.instructor.username || 
    profile.role === 'ROLE_ADMIN'
  );

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setError('');
    if (!session) {
      setError("You must be logged in.");
      return;
    }
    setIsAddingLesson(true); 

    try {
      const lessonData = { 
        title: lessonTitle, 
        videoUrl: lessonVideoUrl, 
        textContent: lessonText 
      };
      
      const newLesson = await addLessonToCourse(session.access_token, course.id, lessonData);
      
      setCourse(prevCourse => ({
        ...prevCourse,
        lessons: [...prevCourse.lessons, newLesson]
      }));

      setLessonTitle('');
      setLessonVideoUrl('');
      setLessonText('');
      setShowAddForm(false); // Form close kore deya hocche
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAddingLesson(false); 
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    setError('');
    if (!session) {
      setError("You must be logged in.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this lesson?")) {
      return;
    }
    try {
      await deleteLesson(session.access_token, lessonId);
      setCourse(prevCourse => ({
        ...prevCourse,
        lessons: prevCourse.lessons.filter(lesson => lesson.id !== lessonId)
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card course-lessons-list">
      <h2>Course Content</h2>
      
      {course.lessons && course.lessons.length > 0 ? (
        <ul>
          {course.lessons.map((lesson, index) => (
            <li key={lesson.id} className="lesson-item">
              <Link 
                href={`/course/${course.id}/lesson/${lesson.id}`} 
                className="lesson-item-link"
              >
                <span className="lesson-index">{index + 1}</span>
                <span className="lesson-title">{lesson.title}</span>
              </Link>
              
              {isOwnerOrAdmin && (
                <button 
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="btn btn-danger"
                  style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginLeft: '1rem'}}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No lessons have been added to this course yet.</p>
      )}

      {/* --- NOTUN LOGIC (TOGGLE BUTTON) --- */}
      {isOwnerOrAdmin && (
        <div style={{marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem'}}>
          
          {showAddForm ? (
            // --- ADD LESSON FORM ---
            <form onSubmit={handleAddLesson}>
              <h3 style={{marginTop: 0}}>Add a New Lesson</h3>
              {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
              
              <div>
                <label htmlFor="lessonTitle" style={{fontWeight: 'bold', display: 'block', marginBottom: '4px'}}>Title</label>
                <input
                  id="lessonTitle"
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                  style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#000', marginBottom: '1rem'}}
                />
              </div>
              
              <div>
                <label htmlFor="lessonVideoUrl" style={{fontWeight: 'bold', display: 'block', marginBottom: '4px'}}>Video URL (Optional)</label>
                <input
                  id="lessonVideoUrl"
                  type="text"
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#000', marginBottom: '1rem'}}
                />
              </div>

              <div>
                <label htmlFor="lessonText" style={{fontWeight: 'bold', display: 'block', marginBottom: '4px'}}>Text Content (Optional)</label>
                <textarea
                  id="lessonText"
                  value={lessonText}
                  onChange={(e) => setLessonText(e.target.value)}
                  rows={5}
                  style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#000', marginBottom: '1rem', fontFamily: 'inherit'}}
                />
              </div>

              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button
                  type="submit"
                  disabled={isAddingLesson}
                  className="btn btn-primary"
                >
                  {isAddingLesson ? 'Adding...' : 'Add Lesson'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="btn" 
                  style={{backgroundColor: '#ccc'}}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // --- "ADD NEW LESSON" BUTTON ---
            <button 
              type="button" 
              onClick={() => setShowAddForm(true)} 
              className="btn btn-primary"
            >
              + Add New Lesson
            </button>
          )}
        </div>
      )}
    </div>
  );
}