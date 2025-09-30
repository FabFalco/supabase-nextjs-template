'use client';
import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@/lib/context/GlobalContext';
import { useUser } from '@/hooks/use-user';
import { Dashboard } from '@/components/dashboard/dashboard';
import { LoadingSpinner } from '@/components/dashboard/ui/loading-spinner';

export default function DashboardPage() {
  //const { loading, user } = useGlobal();

  /*if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }*/

  const { user, loading } = useUser();
  const router = useRouter();

  /*useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    }
  }, [user, router]);*/

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  return <Dashboard />;
}