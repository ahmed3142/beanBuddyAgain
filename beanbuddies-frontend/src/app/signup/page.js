// app/signup/page.js
"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter(); // <-- useRouter hook

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      
      // --- UPDATE KORA HOYECHE ---
      setMessage("Sign up successful! Please check your email to verify. Redirecting to login...");
      
      // 2 second pore login page e redirect korbe
      setTimeout(() => {
        router.push('/login'); // <-- NOTUN REDIRECT
      }, 2000);


    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-card">
        <h1>
          Create Your Account
        </h1>
        
        <form onSubmit={handleSignUp}>
          <div>
            <label htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="error-message">{error}</p>
          )}
          
          {message && (
             <p style={{color: 'green', textAlign: 'center'}}>{message}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full-width"
              style={{marginTop: '1rem'}}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <p className="switch-link">
          Already have an account?{' '}
          <Link href="/login">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}