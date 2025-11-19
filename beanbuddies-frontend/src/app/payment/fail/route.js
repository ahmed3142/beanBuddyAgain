// File Path: app/payment/fail/route.js
import { NextResponse } from 'next/server';

// SSLCommerz theke asha POST request handle korar jonno
export async function POST(request) {
  // User-ke amader notun "status-failed" page-e redirect kora hocche
  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/payment/status-failed`, 303);
}

// SSLCommerz theke GET request ashleo jeno kaj kore (Fallback)
export async function GET(request) {
  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/payment/status-failed`, 303);
}