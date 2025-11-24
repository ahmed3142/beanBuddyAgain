// app/page.js
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicCourses } from './lib/api';

export default function HomePage() {
  // Data fetch korar logic-take amra "useEffect"-e niye ashchi
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getPublicCourses();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // Shudhu page load howar shomoy ekbar-i cholbe

  return (
    <div>
      <h1 className="page-title">Explore Courses</h1>
      
      {/* Loading ebong Error state handle kora */}
      {loading && <p>Loading courses...</p>}
      {error && <p className="error-message">{error}</p>}
      
      {!loading && !error && (
        <div className="course-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <Link href={`/course/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="course-card-content">
                  <h2 className="course-card-title">{course.title}</h2>
                  <p className="course-card-desc">{course.description}</p>
                </div>
              </Link>
              <div className="course-card-footer" style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                <span className="course-card-price">${course.price}</span>
                <Link 
                  href={`/profile/${course.instructorName}`} 
                  className="course-card-instructor"
                  style={{ zIndex: 10, position: 'relative' }} 
                >
                  By {course.instructorName}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}