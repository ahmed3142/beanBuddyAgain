"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { data, error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      if (data?.user && !data.session) {
         setMessage('Check your email for the confirmation link!');
      } else {
         router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '80vh',
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
        
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h2 style={{color: 'var(--accent-color)', margin: 0, fontSize: '1.8rem', fontWeight: '800'}}>BeanBuddies</h2>
          <p style={{color: 'var(--text-secondary)', marginTop: '5px'}}>Create your account</p>
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

        {message && (
           <div style={{
            padding: '10px', 
            backgroundColor: 'rgba(66, 183, 42, 0.1)', 
            color: 'var(--success-color)', 
            borderRadius: '6px', 
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--success-color)',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSignup}>
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
              minLength={6}
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
            className="btn btn-success" 
            style={{width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px'}}
            disabled={loading}
          >
             {loading ? <span className="spinner" style={{width:'20px', height:'20px'}}></span> : 'Create Account'}
          </button>
        </form>

        <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Already have an account? <Link href="/login" style={{color: 'var(--accent-color)', fontWeight: '600'}}>Login</Link>
        </p>
      </div>
    </div>
  );
}