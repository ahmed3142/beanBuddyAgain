"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

// Correct Case-Sensitive Imports
import NotificationDropdown from './NotificationDropDown'; 
import MessagesDropdown from './MessageDropDown';         

export default function Header() {
  const { session, profile, signOut } = useAuth(); 
  const router = useRouter();
  
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/'); 
  };

  const isInstructor = profile?.role === 'ROLE_INSTRUCTOR' || profile?.role === 'ROLE_ADMIN';
  const isAdmin = profile?.role === 'ROLE_ADMIN'; 

  return (
    <header className="header">
      <nav className="header-nav">
        
        <Link href="/" className="header-logo">
          BeanBuddies
        </Link>

        <div className="header-links">
          {session ? (
            <>
              {/* --- DASHBOARD ADDED BACK --- */}
              <Link href="/dashboard" className="nav-link">
                 Dashboard
              </Link>

              {isAdmin && (
                <Link href="/admin" className="nav-link nav-link-admin">Admin Panel</Link>
              )}
              {isInstructor && (
                <Link href="/instructor/create-course" className="nav-link">Create Course</Link>
              )}

              {/* MESSAGES */}
              <div className="icon-btn-container">
                <button 
                  onClick={() => toggleDropdown('messages')}
                  className={`icon-btn ${activeDropdown === 'messages' ? 'active' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={activeDropdown === 'messages' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
                {activeDropdown === 'messages' && (
                  <MessagesDropdown onClose={() => setActiveDropdown(null)} />
                )}
              </div>

              {/* NOTIFICATIONS */}
              <div className="icon-btn-container">
                <button 
                  onClick={() => toggleDropdown('notifications')}
                  className={`icon-btn ${activeDropdown === 'notifications' ? 'active' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={activeDropdown === 'notifications' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
                {activeDropdown === 'notifications' && (
                  <NotificationDropdown onClose={() => setActiveDropdown(null)} />
                )}
              </div>

              <div className="header-profile-section">
                <Link href="/profile" className="header-username">{profile?.username}</Link>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
              </div>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}