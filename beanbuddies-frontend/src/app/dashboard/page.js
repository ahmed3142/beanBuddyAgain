// app/dashboard/page.js
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getMyDashboard } from '../lib/api';
import Link from 'next/link';

// --- Notun Progress Bar Component ---
const ProgressBar = ({ completed, total }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div style={{width: '100%', backgroundColor: '#e5e7eb', borderRadius: '99px', height: '8px', marginTop: '0.5rem'}}>
      <div 
        style={{width: `${percentage}%`, backgroundColor: '#2563eb', borderRadius: '99px', height: '100%'}}
      ></div>
    </div>
  );
};

export default function DashboardPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getMyDashboard(session.access_token);
        setDashboard(data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();

  }, [session, authLoading, router]);

  if (loading || authLoading) {
    return <div style={{textAlign: 'center', padding: '40px'}}>Loading your dashboard...</div>;
  }

  if (error) {
    return <div style={{textAlign: 'center', padding: '40px', color: 'red'}}>Error: {error}</div>;
  }
  
  const isInstructor = profile?.role === 'ROLE_INSTRUCTOR' || profile?.role === 'ROLE_ADMIN';
  const hasCreatedCourses = dashboard?.createdCourses?.length > 0;
  const hasEnrolledCourses = dashboard?.enrolledCourses?.length > 0;

  return (
    <div>
      <h1 className="page-title">My Dashboard</h1>

      {/* === INSTRUCTOR-ER SECTION === */}
      {isInstructor && (
        <div className="card">
          <h2 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '1rem'}}>My Created Courses</h2>
          {hasCreatedCourses ? (
            <div className="course-grid">
              {dashboard.createdCourses.map((course) => (
                <Link 
                  href={`/course/${course.id}`} 
                  key={course.id} 
                  className="course-card"
                >
                  <div className="course-card-content">
                    <h2 className="course-card-title">{course.title}</h2>
                    <p className="course-card-desc">{course.description}</p>
                    <div className="course-card-footer">
                      <span className="course-card-price">${course.price}</span>
                      <span className="course-card-instructor">By You</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>You have not created any courses yet. <Link href="/instructor/create-course">Create one now</Link></p>
          )}
        </div>
      )}

      {/* === STUDENT-ER SECTION (PROGRESS BAR SHOHO) === */}
      <div className="card">
        <h2 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '1rem'}}>My Enrolled Courses</h2>
        {hasEnrolledCourses ? (
          <div className="course-grid">
            {dashboard.enrolledCourses.map((course) => (
              <Link 
                href={`/course/${course.id}`} 
                key={course.id} 
                className="course-card"
              >
                <div className="course-card-content">
                  <h2 className="course-card-title">{course.title}</h2>
                  <p className="course-card-desc">{course.description}</p>
                  
                  {/* --- PROGRESS BAR EKHANE ADD KORA HOYECHE --- */}
                  <ProgressBar completed={course.completedLessons} total={course.totalLessons} />
                  <small style={{color: '#6b7280', marginTop: '4px', display: 'block'}}>
                    {course.completedLessons} / {course.totalLessons} lessons
                  </small>
                  
                  <div className="course-card-footer" style={{paddingTop: '1rem'}}>
                    <span className="course-card-price">${course.price}</span>
                    <span className="course-card-instructor">
                      By {course.instructorName}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>You are not enrolled in any courses yet. <Link href="/">Explore courses</Link></p>
        )}
      </div>

    </div>
  );
}