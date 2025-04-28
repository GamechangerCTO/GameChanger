'use client';

import { useState, useEffect } from 'react';
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
  // השתמש ב-useParams במקום לקבל את params כפרמטר
  const params = useParams();
  const analysisId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setIsLoading(true);
        console.log(`טוען ניתוח עם מזהה: ${analysisId}`);
        
        if (!user || !analysisId) {
          console.log('אין משתמש מחובר או מזהה ניתוח');
          return;
        }

        // Dynamically fetch the Supabase client
        const { supabase } = await import('@/lib/supabase');
        console.log('מתחבר לסופאבייס לקבלת פרטי הניתוח');

        // Fetch the analysis by ID
        const { data: analysisData, error: analysisError } = await supabase
          .from('call_analyses')
          .select('*, company:company_id(*)')  // מוסיף את פרטי החברה
          .eq('id', analysisId)
          .single();
        
        if (analysisError) {
          console.error('שגיאה בשליפת הניתוח:', analysisError);
          if (analysisError.code === 'PGRST116') { // Not found
            throw new Error('הניתוח המבוקש לא נמצא או שאין לך הרשאה לצפות בו');
          } else {
            throw new Error('שגיאה בטעינת פרטי הניתוח: ' + analysisError.message);
          }
        }

        if (analysisData) {
          console.log('התקבלו פרטי הניתוח:', {
            id: analysisData.id, 
            status: analysisData.status,
            analysis_type: analysisData.analysis_type
          });
          
          setAnalysis(analysisData);
          
          // אם הניתוח במצב מושלם, בדוק אם יש תוצאות ותמלול
          if (analysisData.status === 'done') {
            console.log('הניתוח הושלם');
            if (analysisData.transcription) {
              console.log(`יש תמלול באורך ${analysisData.transcription.length} תווים`);
            } else {
              console.warn('אין תמלול למרות שהניתוח הושלם');
            }
            
            if (analysisData.report_data) {
              console.log('התקבלו תוצאות ניתוח:', analysisData.report_data);
            } else {
              console.warn('אין תוצאות ניתוח למרות שהניתוח הושלם');
            }
          } else {
            console.log(`סטטוס הניתוח: ${analysisData.status}`);
          }
        } else {
          console.error('לא התקבלו פרטי ניתוח למרות שלא הייתה שגיאה');
          throw new Error('הניתוח המבוקש לא נמצא');
        }
      } catch (error: any) {
        console.error('שגיאה כללית בטעינת הניתוח:', error);
        toast.error(error.message || 'אירעה שגיאה בטעינת פרטי הניתוח');
        // Redirect back to list if analysis not found or error occurs
        router.push('/analyses'); 
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalysis();

    // Poll for updates if the analysis is still in progress
    const intervalId = setInterval(() => {
      if (analysis && (analysis.status === 'pending' || analysis.status === 'processing')) {
        console.log('מתבצע עדכון אוטומטי של סטטוס הניתוח...');
        fetchAnalysis();
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [user, analysisId, analysis?.status, router]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // קריאה ל-API במקום ישירות לפונקציה
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שגיאה במחיקת ניתוח');
      }
      
      toast.success('הניתוח נמחק בהצלחה');
      // ניווט חזרה לדף הניתוחים
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

        {/* דיאלוג אישור מחיקה */}
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