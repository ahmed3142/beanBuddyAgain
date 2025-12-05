// File Path: app/payment/success/route.js
import { NextResponse } from 'next/server';

const getRedirectOrigin = (url) => {
  if (process.env.NODE_ENV === 'development') {
    return url.origin;
  }

  return process.env.NEXT_PUBLIC_PROD_URL || 'https://bean-buddy.vercel.app';
};

// SSLCommerz theke asha POST request handle korar jonno
export async function POST(request) {
  // Amader data check korar dorkar nai, karon IPN-e validation hoyeche.
  // Shudhu user-ke thank you page-e pathiye dibo.

  // Request theke base URL-ta nite hobe (e.g., https://bean-buddy.vercel.app)
  const url = new URL(request.url);
  const redirectOrigin = getRedirectOrigin(url);

  // Notun "thank you" page-er URL-e redirect kora hocche
  return NextResponse.redirect(`${redirectOrigin}/payment/thank-you`, 303);
}

// SSLCommerz theke GET request ashleo jeno kaj kore (Fallback)
export async function GET(request) {
  const url = new URL(request.url);
  const redirectOrigin = getRedirectOrigin(url);

  return NextResponse.redirect(`${redirectOrigin}/payment/thank-you`, 303);
}
