'use client';

import { CompanySettings } from '@/components/settings/CompanySettings';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';

export default function CompanySettingsPage() {
  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-8">
          <div className="space-y-3 mb-8">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-orange-500">פרטי </span>החברה
            </h1>
            <p className="text-gray-400 text-lg">הגדר את פרטי החברה שלך לצורך ניתוח שיחות מותאם</p>
          </div>
          <CompanySettings />
        </div>
      </MainLayout>
    </RequireAuth>
  );
} 