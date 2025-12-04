// app/dashboard/page.js
"use client";

import useSWR from 'swr'; // <-- IMPORT ADDED (Make sure to run: npm install swr)
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getMyDashboard } from '../lib/api';
import Link from 'next/link';
import { useEffect } from 'react';

// --- Progress Bar Component ---
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

// SWR fetcher function
const fetcher = ([url, token]) => getMyDashboard(token);

export default function DashboardPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [session, authLoading, router]);

  // --- SWR Implementation ---
  // Only fetch when we have a token
  const shouldFetch = session?.access_token ? ['/users/me/dashboard', session.access_token] : null;

  const { data: dashboard, error, isLoading } = useSWR(shouldFetch, fetcher, {
    revalidateOnFocus: false, // Don't re-fetch when window gets focus
    dedupingInterval: 60000,  // Cache for 1 minute
  });

  if (authLoading || (isLoading && !dashboard)) {
    return <div style={{textAlign: 'center', padding: '40px'}}>Loading your dashboard...</div>;
  }

  if (error) {
    return <div style={{textAlign: 'center', padding: '40px', color: 'red'}}>Error loading dashboard.</div>;
  }
  
  if (!dashboard) return null; // Waiting for redirect

  const isInstructor = profile?.role === 'ROLE_INSTRUCTOR' || profile?.role === 'ROLE_ADMIN';
  const hasCreatedCourses = dashboard?.createdCourses?.length > 0;
  const hasEnrolledCourses = dashboard?.enrolledCourses?.length > 0;

  return (
    <div>
      <h1 className="page-title">My Dashboard</h1>

      {/* === INSTRUCTOR SECTION === */}
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

      {/* === STUDENT SECTION === */}
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
                  
                  {/* Progress Bar */}
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