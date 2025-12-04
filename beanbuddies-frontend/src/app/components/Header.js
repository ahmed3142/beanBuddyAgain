// app/components/Header.js
"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { session, profile, signOut } = useAuth(); 
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/'); // Redirect to home after logout
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
              {/* --- NOTUN "ADMIN PANEL" LINK EIKHANE --- */}
              {isAdmin && (
                <Link href="/admin" style={{color: '#dc2626', fontWeight: 'bold'}}>
                  Admin Panel
                </Link>
              )}
              
              {isInstructor && (
                <Link href="/instructor/create-course">
                  Create Course
                </Link>
              )}

              <Link href="/dashboard">
                My Dashboard
              </Link>
              <Link href="/profile">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}