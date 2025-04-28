'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { AnalysisList } from '@/components/analyses/AnalysisList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewAnalysisForm } from '@/components/analyses/NewAnalysisForm';

export default function AnalysesPage() {
  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-8">
          <div className="space-y-3 mb-8">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-orange-500">ניתוח </span>שיחות
            </h1>
            <p className="text-gray-400 text-lg">
              העלו הקלטות שיחה לניתוח וקבלו תובנות מעמיקות על בסיס AI
            </p>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800 border border-gray-700">
              <TabsTrigger 
                value="list" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                רשימת ניתוחים
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                ניתוח חדש
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-6">
              <AnalysisList />
            </TabsContent>
            <TabsContent value="new" className="mt-6">
              <NewAnalysisForm />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </RequireAuth>
  );
} 