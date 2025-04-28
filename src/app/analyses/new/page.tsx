'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewAnalysisForm } from '@/components/analyses/NewAnalysisForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewAnalysisPage() {
  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">ניתוח שיחה חדשה</h1>
              <p className="text-muted-foreground">
                העלה הקלטת שיחה לניתוח וקבל תובנות מעמיקות
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/analyses">לרשימת הניתוחים</Link>
            </Button>
          </div>

          <div className="max-w-2xl mx-auto">
            <NewAnalysisForm />
          </div>
        </div>
      </MainLayout>
    </RequireAuth>
  );
} 