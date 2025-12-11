// File Path: app/payment/thank-you/page.js
"use client";

import Link from 'next/link';

export default function PaymentSuccessPage() {
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
      <h1 style={{ color: '#22c55e', fontSize: '2.5rem', marginBottom: '1rem' }}>
        Payment Successful!
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '2rem' }}>
        Thank you! Your enrollment is being processed.
      </p>
      <Link href="/dashboard" className="btn btn-primary">
        Go to My Dashboard
      </Link>
    </div>
  );
}