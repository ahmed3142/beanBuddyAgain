// src/app/profile/[username]/page.js
"use client"; // <-- Shobcheye joruri line!

import { useEffect, useState } from 'react';
import { getPublicProfileByUsername, getPublicCoursesByUsername } from '../../lib/api'; 
import Link from 'next/link'; 
import { useParams } from 'next/navigation'; // <-- Notun import

export default function PublicProfilePage() {
  
  const params = useParams(); // <-- `useParams` hook use korte hobe
  const { username } = params;

  // State-gulo ekhane define kora
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data fetch korar jonno useEffect
  useEffect(() => {
    if (!username) return; // Jodi ekhono username na pay

    const loadData = async () => {
      try {
        setLoading(true);
        // Ekhon duita API call hobe
        const profileData = await getPublicProfileByUsername(username);
        const coursesData = await getPublicCoursesByUsername(username); 
        
        setProfile(profileData);
        setCourses(coursesData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setProfile(null);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [username]); // `username` change hole-i shudhu data load korbe

  if (loading) {
    return <div style={{textAlign: 'center', padding: '40px'}}>Loading profile...</div>;
  }
  
  if (error) {
    return <div style={{textAlign: 'center', padding: '40px', color: 'red'}}>Error: Could not find user '{username}'</div>;
  }

  if (!profile) {
    return <div style={{textAlign: 'center', padding: '40px'}}>Profile not found.</div>;
  }

  return (
    <div>
      <h1 className="page-title">{profile.username}'s Profile</h1>

      <div className="card profile-details">
        <h2>Instructor Details</h2>
        <div>
          <label>Full Name</label>
          <p>{profile.username || 'Not set'}</p>
        </div>
        <div>
          <label>Role</label>
          <p>{profile.role}</p>
        </div>
        <div>
          <label>Email</label>
          <p>{profile.email}</p>
        </div>
      </div>
      
      <div className="card">
        <h2>Courses by {profile.username}</h2>
        {courses.length > 0 ? (
          <div className="course-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <Link href={`/course/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="course-card-content">
                    <h2 className="course-card-title">{course.title}</h2>
                    <p className="course-card-desc">{course.description}</p>
                  </div>
                </Link>
                <div className="course-card-footer" style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                  <span className="course-card-price">${course.price}</span>
                  <span className="course-card-instructor">By {course.instructorName}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>{profile.username} has not created any courses yet.</p>
        )}
      </div>
    </div>
  );
}