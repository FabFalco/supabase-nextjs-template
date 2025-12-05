'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/webapp/ui/card';
import { Button } from '@/components/webapp/ui/button';
import { ArrowLeft, CreditCard, ExternalLink, CircleAlert as AlertCircle } from 'lucide-react';
import TopNavBar from '@/components/webapp/TopNavBar';
import HomePricing from "@/components/HomePricing";

export default function StripeSettingsPage() {
  const router = useRouter()

    const buttonBack = (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/webapp')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </div>
      );

  return (
    <>
      <TopNavBar title = {buttonBack} />
      <HomePricing />
    </>
  );
}
