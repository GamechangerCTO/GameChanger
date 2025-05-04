'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function DigitalAssetsPage() {
  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-8">
          <div className="space-y-3 mb-8">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-orange-500">נכסים </span>דיגיטליים
            </h1>
            <p className="text-gray-400 text-lg">ניתוח וייעול של האתר ונכסים דיגיטליים אחרים</p>
          </div>
          
          <Card className="overflow-hidden bg-gray-900 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">בקרוב...</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">אזור ניתוח הנכסים הדיגיטליים נמצא בפיתוח ויזמין בקרוב.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RequireAuth>
  );
} 