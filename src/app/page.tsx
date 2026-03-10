'use client';

import { BuyerHomePage } from '@/components/buyer/buyer-home-page';

/**
 * Root Landing Page.
 * This is the main entry point for the Kenya Land Trust platform.
 * NOTE: The layout (Header/Footer) is provided by the (buyer) route group 
 * if this file is moved there, but Next.js App Router root layout 
 * usually handles the very top level.
 * To resolve the 404, we ensure this file has a clear default export.
 */
export default function Page() {
  return <BuyerHomePage />;
}
