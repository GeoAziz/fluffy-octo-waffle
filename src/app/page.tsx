import { BuyerHomePage } from '@/components/buyer/buyer-home-page';

/**
 * Root entry point — renders the main landing page.
 * Content is provided by BuyerHomePage; layout comes from src/app/(buyer)/layout.tsx.
 */
export default function RootPage() {
  return <BuyerHomePage />;
}
