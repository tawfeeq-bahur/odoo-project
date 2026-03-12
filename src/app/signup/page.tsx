
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Signup is now part of the combined Login/Signup page
// This page redirects to /login with a query param to open signup panel
export default function SignupRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?mode=signup');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}
