// File Path: app/payment/fail/route.js
import { NextResponse } from 'next/server';

const getRedirectOrigin = (url) => {
  if (process.env.NODE_ENV === 'development') {
    return url.origin;
  }

  return process.env.NEXT_PUBLIC_PROD_URL || 'https://bean-buddy.vercel.app';
};

// SSLCommerz theke asha POST request handle korar jonno
export async function POST(request) {
  // User-ke amader notun "status-failed" page-e redirect kora hocche
  const url = new URL(request.url);
  const redirectOrigin = getRedirectOrigin(url);

  return NextResponse.redirect(`${redirectOrigin}/payment/status-failed`, 303);
}

// SSLCommerz theke GET request ashleo jeno kaj kore (Fallback)
export async function GET(request) {
  const url = new URL(request.url);
  const redirectOrigin = getRedirectOrigin(url);

  return NextResponse.redirect(`${redirectOrigin}/payment/status-failed`, 303);
}
