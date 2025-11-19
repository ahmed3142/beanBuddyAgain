// app/course/[id]/page.js
"use client"; // <-- SERVER COMPONENT THEKE CLIENT COMPONENT KORA HOYECHE

import { useEffect, useState } from 'react'; // <-- NOTUN IMPORT
import { useAuth } from '../../context/AuthContext'; // <-- NOTUN IMPORT
import { useParams } from 'next/navigation'; // <-- NOTUN IMPORT
import { getCourseDetails } from '../../lib/api'; // <-- "getPublicCourseDetails" er bodole
import EnrollButton from '../../components/EnrollButton';
import Link from 'next/link'; 
import LessonManager from '../../components/LessonManager'; 
import Comments from '../../components/Comments'; 

export default function CourseDetailPage() { 
  
  const { session, loading: authLoading } = useAuth();
  const params = useParams();
  const { id: courseId } = params; // "id"-take "courseId" name e rename kora
  
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Auth load howa porjonto wait
    if (!session) {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }
    
    if (!courseId) return; // params load howa porjonto wait

    const fetchCourse = async () => {
      try {
        setLoading(true);
        // Notun protected function-take call kora hocche
        const courseData = await getCourseDetails(session.access_token, courseId);
        setCourse(courseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [session, authLoading, courseId]);


  if (loading || authLoading) {
    return <div style={{textAlign: 'center', padding: '40px'}}>Loading course...</div>;
  }

  if (error) {
    return <div style={{textAlign: 'center', padding: '40px', color: 'red'}}>Error: {error}</div>;
  }

  if (!course) {
    return <div style={{textAlign: 'center', padding: '40px'}}>Course not found.</div>;
  }

  return (
    <div>
      {/* Course Header */}
      <div className="course-detail-header">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="course-detail-meta">
          <span className="course-detail-instructor">
            {course.instructor ? (
              <Link href={`/profile/${course.instructor.username}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                By {course.instructor.username}
              </Link>
            ) : (
              'By Unknown Instructor'
            )}
          </span>
          <span className="course-detail-price">${course.price}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="course-detail-grid">
        
        {/* LessonManager ekhon "initialCourse" data-ta pabe */}
        <LessonManager initialCourse={course} />

        {/* Right Side: Enroll Card */}
        <div>
          <div className="enroll-card">
            <h3>Start Learning</h3>
            <EnrollButton courseId={course.id} />
          </div>
        </div>
      </div>

      <Comments courseId={course.id} />
    </div>
  );
}