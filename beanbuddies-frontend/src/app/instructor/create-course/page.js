// app/instructor/create-course/page.js
"use client";

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { createCourse } from '../../lib/api';

export default function CreateCoursePage() {
  const { session, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0.0); // <-- NOTUN STATE
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check role
  const isInstructor = profile?.role === 'ROLE_INSTRUCTOR' || profile?.role === 'ROLE_ADMIN';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = session.access_token;
      // --- NOTUN DATA OBJECT ---
      const courseData = { title, description, price: Number(price) };
      
      const newCourse = await createCourse(token, courseData); // API call
      
      router.push(`/course/${newCourse.id}`); 

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auth load hocche
  if (authLoading) {
    return <div style={{padding: '1rem'}}>Loading...</div>;
  }

  // Jodi login kora na thake ba role thik na thake
  if (!isInstructor) {
    return (
      <div style={{padding: '1rem', color: 'red'}}>
        <h1>Access Denied</h1>
        <p>You must be an Instructor or Admin to access this page.</p>
        <Link href="/">Go to Homepage</Link>
      </div>
    );
  }

  // Main form
  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <h1 className="page-title">Create a New Course</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <label htmlFor="title" style={{fontWeight: 'bold', marginBottom: '8px', display: 'block'}}>
              Course Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#000', marginBottom: '1rem'}}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" style={{fontWeight: 'bold', marginBottom: '8px', display: 'block'}}>
              Course Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#000', marginBottom: '1rem', fontFamily: 'inherit'}}
            />
          </div>

          {/* --- NOTUN PRICE FIELD --- */}
          <div>
            <label htmlFor="price" style={{fontWeight: 'bold', marginBottom: '8px', display: 'block'}}>
              Price ($)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={{width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#000', marginBottom: '1rem'}}
            />
          </div>

          {error && (
            <p className="error-message" style={{color: 'red'}}>{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full-width"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}