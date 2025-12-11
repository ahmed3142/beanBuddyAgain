// app/payment/fail/page.js
"use client";

import Link from 'next/link';

export default function PaymentFailPage() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      maxWidth: '500px',
      margin: '40px auto'
    }}>
      <h1 style={{ color: '#ef4444', fontSize: '2.5rem', marginBottom: '1rem' }}>
        Payment Failed
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '2rem' }}>
        Unfortunately, your payment could not be processed. Please try again.
      </p>
      <Link href="/dashboard" className="btn" style={{backgroundColor: '#eee', color: '#333'}}>
        Back to Dashboard
      </Link>
    </div>
  );
}