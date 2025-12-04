// app/components/EnrollButton.js
"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { initiatePayment } from '../lib/api'; 

export default function EnrollButton({ courseId }) {
  const { session } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEnroll = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // --- NOTUN PAYMENT LOGIC (ARGUMENT THIK KORA HOYECHE) ---
      const response = await initiatePayment(session.access_token, courseId);
      // Uporer line-e age (courseId, session.access_token) chilo
      
      // Redirect to payment gateway
      if (response && response.redirectGatewayURL) {
        window.location.href = response.redirectGatewayURL;
      } else {
        throw new Error("Could not get payment URL.");
      }
      
    } catch (err) {
      setError(err.message);
      setLoading(false); 
    }
  };

  return (
    <>
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="btn btn-primary btn-full-width"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {loading ? (
          <span className="spinner"></span>
        ) : (
          'Enroll Now'
        )}
      </button>
      {error && (
        <p className="enroll-error">{error}</p>
      )}
    </>
  );
}