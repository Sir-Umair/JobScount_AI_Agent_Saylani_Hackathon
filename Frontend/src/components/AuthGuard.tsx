'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const hasCV = localStorage.getItem('jobscout_dashboard_stats');
    
    // If no CV is uploaded and they aren't already on the upload page or settings page, redirect them.
    if (!hasCV && pathname !== '/dashboard/jobs' && pathname !== '/dashboard/settings') {
      router.push('/dashboard/jobs');
    } else {
      setIsAllowed(true);
    }
  }, [pathname, router]);

  // Don't render layout contents (which would show the sidebar) until we know they are allowed,
  // or if they are on the upload page, we can render the children directly.
  if (!isAllowed) {
    return null; 
  }

  return <>{children}</>;
}
