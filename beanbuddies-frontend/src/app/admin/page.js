// app/admin/page.js
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getPublicCourses, deleteCourseAsAdmin } from '../lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const { session, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'ROLE_ADMIN';

  // Shob course fetch kora
  useEffect(() => {
    if (authLoading) return; // Auth load howa porjonto wait
    if (!isAdmin) return; // Admin na hole kichu korar dorkar nai

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const allCourses = await getPublicCourses(); // Shob public course load kora
        setCourses(allCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [authLoading, isAdmin]);

  // Delete function
  const handleDeleteCourse = async (courseId) => {
    setError('');
    setMessage('');

    if (!window.confirm("ARE YOU SURE you want to delete this course? This will delete all lessons and enrollments.")) {
      return;
    }

    try {
      await deleteCourseAsAdmin(session.access_token, courseId);
      setMessage('Course deleted successfully.');
      // List theke course-take remove kore deya
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Auth check
  if (authLoading || loading) {
    return <div style={{padding: '1rem'}}>Loading Admin Panel...</div>;
  }

  // Security check
  if (!isAdmin) {
    return (
      <div style={{padding: '1rem', color: 'red'}}>
        <h1>Access Denied</h1>
        <p>You must be an Admin to access this page.</p>
        <Link href="/">Go to Homepage</Link>
      </div>
    );
  }

  // Admin Panel UI
  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>

      {message && <p style={{color: 'green'}}>{message}</p>}
      {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

      <div className="card">
        <h2>Manage All Courses</h2>
        
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '2px solid #333'}}>
              <th style={{textAlign: 'left', padding: '8px'}}>ID</th>
              <th style={{textAlign: 'left', padding: '8px'}}>Title</th>
              <th style={{textAlign: 'left', padding: '8px'}}>Instructor</th>
              <th style={{textAlign: 'right', padding: '8px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '8px'}}>{course.id}</td>
                <td style={{padding: '8px'}}>
                  <Link href={`/course/${course.id}`} style={{fontWeight: 'bold'}}>
                    {course.title}
                  </Link>
                </td>
                <td style={{padding: '8px'}}>
                  <Link href={`/profile/${course.instructorName}`}>
                    {course.instructorName}
                  </Link>
                </td>
                <td style={{textAlign: 'right', padding: '8px'}}>
                  <button 
                    className="btn btn-danger" 
                    style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}