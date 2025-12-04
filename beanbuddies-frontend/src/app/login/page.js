"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    // Full screen container for centering
    <div style={{
      minHeight: '80vh', // Takes up most of the viewport height
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card animate-blob-up" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-float)',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)'
      }}>
        
        {/* Brand Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h2 style={{color: 'var(--accent-color)', margin: 0, fontSize: '1.8rem', fontWeight: '800'}}>BeanBuddies</h2>
          <p style={{color: 'var(--text-secondary)', marginTop: '5px'}}>Welcome back!</p>
        </div>
        
        {error && (
          <div style={{
            padding: '10px', 
            backgroundColor: 'rgba(220, 38, 38, 0.1)', 
            color: 'var(--danger-color)', 
            borderRadius: '6px', 
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--danger-color)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{marginBottom: '1.2rem'}}>
            <label htmlFor="email" style={{display:'block', marginBottom:'0.5rem', fontWeight:'600', color:'var(--text-primary)', fontSize:'0.9rem'}}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '1rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
          
          <div style={{marginBottom: '1.5rem'}}>
            <label htmlFor="password" style={{display:'block', marginBottom:'0.5rem', fontWeight:'600', color:'var(--text-primary)', fontSize:'0.9rem'}}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '1rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px'}}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{width:'20px', height:'20px'}}></span> : 'Sign In'}
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Don't have an account? <Link href="/signup" style={{color: 'var(--accent-color)', fontWeight: '600'}}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}