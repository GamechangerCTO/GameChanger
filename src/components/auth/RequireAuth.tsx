'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Still loading auth state or redirecting
  if (isLoading || !user) {
    return (
      <div className="p-8 w-full max-w-5xl mx-auto rtl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[220px] rounded-md" />
            <Skeleton className="h-[220px] rounded-md" />
            <Skeleton className="h-[220px] rounded-md" />
            <Skeleton className="h-[220px] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
} 