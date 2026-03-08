import { redirect } from 'next/navigation';

/**
 * Conflicting entry point neutralized.
 * Home page logic unified in root app/page.tsx to avoid ambiguity in Turbopack.
 */
export default function Page() {
  redirect('/explore');
}
