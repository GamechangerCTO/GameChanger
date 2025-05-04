'use client';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewAnalysisForm } from '@/components/analyses/NewAnalysisForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Upload, Play, FileText, ArrowRight } from 'lucide-react';

export default function NewAnalysisPage() {
  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">ניתוח שיחה חדשה</h1>
              <p className="text-muted-foreground max-w-2xl">
                על בסיס מודל של חברת GAME CHANGER (www.marketings.co.il)
                <br/>בשילוב מודלים מתקדמים ב-AI
                <br/>מושתת על מתודולוגיה ייחודית עם מעל 12,000 ניתוחים
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/analyses">לרשימת הניתוחים</Link>
            </Button>
          </div>
          
          {/* תהליך העבודה עם חצים ואלמנטים גרפיים */}
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl mx-auto border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">תהליך העבודה</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* שלב 1 */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">1. העלאת קובץ</h3>
                <p className="text-muted-foreground text-sm">העלאת קובץ שמע של השיחה ומילוי פרטים</p>
              </div>
              
              {/* חץ ראשון */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-orange-500 transform rotate-180" />
              </div>
              
              {/* שלב 2 */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-3">
                  <Play className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">2. הפעלת ניתוח</h3>
                <p className="text-muted-foreground text-sm">המערכת מבצעת תמלול וניתוח מתקדם של השיחה</p>
              </div>
              
              {/* חץ שני */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-orange-500 transform rotate-180" />
              </div>
              
              {/* שלב 3 */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">3. קבלת תוצאה</h3>
                <p className="text-muted-foreground text-sm">צפייה בתוצאות הניתוח, כולל נקודות לשימור ולשיפור</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <NewAnalysisForm />
          </div>
        </div>
      </MainLayout>
    </RequireAuth>
  );
} 