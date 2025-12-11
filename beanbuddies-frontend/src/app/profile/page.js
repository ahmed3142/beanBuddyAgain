// app/profile/page.js
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getMyDashboard, updateMyProfile, deleteMyAccount } from '../lib/api';
import Link from 'next/link';

// Explicit role formatter
function formatRole(role) {
  if (!role) return '';

  switch (role) {
    case 'ROLE_INSTRUCTOR':
      return 'INSTRUCTOR';
    case 'ROLE_STUDENT':
      return 'STUDENT';
    case 'ROLE_ADMIN':
      return 'ADMIN';
    default:
      // Show whatever comes if it's something unexpected
      return String(role).toUpperCase();
  }
}

export default function ProfilePage() {
  const { session, profile, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dashboard, setDashboard] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); 

  const [isEditing, setIsEditing] = useState(false); 
  const [username, setUsername] = useState(''); 
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoading) return; 
    if (!session) {
      router.push('/login');
      return;
    }

    if (profile) {
      console.log('PROFILE ROLE:', profile.role); // Debugging
      setUsername(profile.username || '');
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = session.access_token;
        const dashboardData = await getMyDashboard(token);
        setDashboard(dashboardData.enrolledCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, authLoading, router, profile]); 


  const handleUpdateProfile = async (e) => {
    e.preventDefault(); 
    setMessage('');
    setError('');

    try {
      const token = session.access_token;
      const updateData = { username: username }; 
      
      await updateMyProfile(token, updateData); 
      
      setMessage('Profile updated successfully! Reloading...');
      
      setTimeout(() => {
        window.location.reload(); 
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUsername(profile.username || ''); 
    setError('');
    setMessage('');
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    setMessage('');
    setError('');

    if (!window.confirm("ARE YOU SURE you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const token = session.access_token;
      await deleteMyAccount(token);
      
      setMessage("Account deleted successfully. Logging you out...");
      
      setTimeout(() => {
        signOut();
        router.push('/');
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };


  if (authLoading || (loading && !profile)) {
    return <div style={{padding: '1rem'}}>Loading profile...</div>;
  }

  if (error && !profile) { 
    return (
      <div style={{padding: '1rem', color: 'red'}}>
        <p>Error: {error}</p>
        <button
          onClick={handleLogout}
          className="btn btn-primary"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="animate-blob-up">
      <div className="profile-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      {/* Profile Details Card */}
      <div className="card profile-details">
        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Account Details</h2>
        
        {isEditing ? (
          <form onSubmit={handleUpdateProfile}>
            <div>
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
            
            <div>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your full name"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  color: '#000',
                  marginTop: '4px'
                }}
              />
            </div>

            <div>
              <label>Your Role</label>
              <p>{formatRole(profile.role)}</p>
            </div>

            <div style={{marginTop: '1.5rem', display: 'flex', gap: '0.5rem'}}>
              <button 
                type="submit" 
                className="btn btn-primary" 
              >
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="btn btn-danger" 
                style={{backgroundColor: '#6b7280'}}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div>
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
            
            <div>
              <label>Full Name</label>
              <p style={{marginTop: '4px'}}>{profile.username || 'Not set'}</p> 
            </div>

            <div>
              <label>Your Role</label>
              <p>{formatRole(profile.role)}</p>
            </div>

            <div style={{marginTop: '1.5rem'}}>
              <button 
                type="button" 
                onClick={() => setIsEditing(true)} 
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
        
        {message && <p style={{color: 'green', marginTop: '1rem'}}>{message}</p>}
        {error && <p className="error-message" style={{marginTop: '1rem', color: 'red'}}>{error}</p>}
        
        {!isEditing && (
          <div style={{marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem'}}>
            <h3 style={{color: '#dc2626'}}>Delete Account</h3>
            <p style={{color: '#4b5563'}}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="btn btn-danger"
            >
              Delete My Account
            </button>
          </div>
        )}
        
      </div>

      {/* Enrolled Courses Card */}
      <div className="card">
        <h2>My Enrolled Courses</h2>
        {dashboard.length > 0 ? (
          <div className="course-grid">
            {dashboard.map(course => (
              <Link href={`/course/${course.id}`} key={course.id} className="course-card">
                <div className="course-card-content">
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-desc">{course.description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>You are not enrolled in any courses.</p>
        )}
      </div>
    </div>
  );
}
