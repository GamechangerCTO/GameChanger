'use client';

import { useState, useEffect, useRef } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { AnalysisReport } from '@/components/analyses/AnalysisReport';
import { CallAnalysis } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { Trash2, ArrowLeft } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * דף לצפייה בפרטי ניתוח
 * משתמש ב-useParams כדי לקבל את מזהה הניתוח מה-URL
 */
export default function AnalysisPage() {
  const params = useParams();
  const analysisId = params?.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalysisData = async () => {
    console.log(`[fetchAnalysisData] התחלת טעינת נתונים לניתוח: ${analysisId}`);
    if (!user || !analysisId) {
      console.log('[fetchAnalysisData] אין משתמש או מזהה ניתוח, יוצא.');
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: analysisData, error: analysisError } = await supabase
        .from('call_analyses')
        .select('*, company:company_id(*)')
        .eq('id', analysisId)
        .single();

      if (analysisError) {
        console.error('[fetchAnalysisData] שגיאה בשליפת הניתוח:', analysisError);
        if (analysisError.code === 'PGRST116') {
          throw new Error('הניתוח המבוקש לא נמצא או שאין לך הרשאה לצפות בו');
        } else {
          throw new Error('שגיאה בטעינת פרטי הניתוח: ' + analysisError.message);
        }
      }

      if (analysisData) {
        console.log('[fetchAnalysisData] התקבלו פרטי הניתוח:', {
          id: analysisData.id, 
          status: analysisData.status,
          analysis_type: analysisData.analysis_type
        });
        
        setAnalysis(prevAnalysis => {
          if (JSON.stringify(prevAnalysis) !== JSON.stringify(analysisData)) {
            console.log(`[fetchAnalysisData] עדכון מצב הניתוח מ-${prevAnalysis?.status || 'ללא'} ל-${analysisData.status}`);
            return analysisData;
          }
          console.log(`[fetchAnalysisData] אין שינוי בסטטוס הניתוח (${analysisData.status})`);
          return prevAnalysis;
        });
        
      } else {
        console.error('[fetchAnalysisData] לא התקבלו פרטי ניתוח למרות שלא הייתה שגיאה');
        throw new Error('הניתוח המבוקש לא נמצא');
      }
      
      return analysisData;
    } catch (error: any) {
      console.error('[fetchAnalysisData] שגיאה כללית בטעינת הניתוח:', error);
      toast.error(error.message || 'אירעה שגיאה בטעינת פרטי הניתוח');
      router.push('/analyses');
      return null;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAnalysisData().finally(() => setIsLoading(false));
  }, [user, analysisId]);

  useEffect(() => {
    const pollStatus = async () => {
      console.log(`[Polling] בדיקת סטטוס ניתוח, מצב נוכחי: ${analysis?.status}`);
      if (analysis && (analysis.status === 'pending' || analysis.status === 'processing')) {
        console.log('[Polling] הניתוח עדיין בתהליך, טוען נתונים מחדש...');
        const updatedAnalysis = await fetchAnalysisData();
        if (updatedAnalysis && (updatedAnalysis.status === 'done' || updatedAnalysis.status === 'error')) {
          console.log('[Polling] הניתוח הסתיים או נכשל, מפסיק את הבדיקות התקופתיות.');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } else {
        console.log('[Polling] הניתוח לא במצב עיבוד או אין נתונים, מפסיק בדיקות.');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    if (!isLoading && analysis && (analysis.status === 'pending' || analysis.status === 'processing')) {
        console.log('[Polling] מתחיל בדיקות תקופתיות...');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(pollStatus, 15000);
    } else {
      if (intervalRef.current) {
          console.log('[Polling] מנקה אינטרוול קיים.');
          clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        console.log('[Cleanup] מנקה אינטרוול.');
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading, analysis]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שגיאה במחיקת ניתוח');
      }
      
      toast.success('הניתוח נמחק בהצלחה');
      router.push('/analyses');
    } catch (error: any) {
      console.error('שגיאה במחיקת ניתוח:', error);
      toast.error(error.message || 'אירעה שגיאה במחיקת הניתוח');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <RequireAuth>
      <MainLayout>
        <div className="space-y-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                פרטי <span className="text-orange-500">ניתוח</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick}
                className="border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                מחק ניתוח
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
              >
                <Link href="/analyses">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  חזרה לרשימה
                </Link>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <Card className="overflow-hidden bg-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">טוען פרטי ניתוח...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-8">
                  <div className="w-16 h-16 border-t-4 border-orange-500 rounded-full animate-spin"></div>
                </div>
              </CardContent>
            </Card>
          ) : analysis ? (
            <AnalysisReport analysis={analysis} />
          ) : (
            <Alert className="bg-red-900 border border-red-800 text-white">
              <AlertDescription>
                הניתוח המבוקש לא נמצא או שאין לך הרשאות גישה אליו.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-900 border border-gray-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">מחיקת ניתוח</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                האם אתה בטוח שברצונך למחוק את הניתוח? פעולה זו תמחק גם את קובץ ההקלטה ואינה ניתנת לביטול.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2 rtl:flex-row-reverse">
              <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
                ביטול
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  confirmDelete();
                }}
                className="bg-red-500 text-white hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? 'מוחק...' : 'מחק'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainLayout>
    </RequireAuth>
  );
} 