'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { CallAnalysis, Company } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Send } from 'lucide-react';

type AnalysisStatus = 'pending' | 'processing' | 'done' | 'error' | 'failed' | 'completed';

const statusLabels: Record<AnalysisStatus, string> = {
  pending: 'ממתין',
  processing: 'מעבד',
  done: 'הושלם',
  error: 'שגיאה',
  failed: 'נכשל',
  completed: 'הושלם',
};

const statusColors: Record<AnalysisStatus, string> = {
  pending: 'bg-yellow-500 text-yellow-900 border-yellow-600',
  processing: 'bg-blue-500 text-blue-900 border-blue-600',
  done: 'bg-green-500 text-green-900 border-green-600',
  error: 'bg-red-500 text-red-900 border-red-600',
  failed: 'bg-red-500 text-red-900 border-red-600',
  completed: 'bg-green-500 text-green-900 border-green-600',
};

const analysisTypeLabels: Record<string, string> = {
  sales: 'שיחת מכירה',
  service: 'שיחת שירות',
  appointment_setting: 'תיאום פגישה',
  sales_followup: 'פולו אפ מכירה טלפונית',
  appointment_followup: 'פולו-אפ תיאום פגישה',
};

export function AnalysisList() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<CallAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [hasProcessingAnalyses, setHasProcessingAnalyses] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processingAnalysisIds, setProcessingAnalysisIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        if (!user) return;

        // Dynamically fetch the Supabase client
        const { supabase } = await import('@/lib/supabase');

        // First get the user's company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (companyError && companyError.code !== 'PGRST116') {
          throw new Error('שגיאה בטעינת נתוני חברה: ' + companyError.message);
        }

        if (companyData) {
          setCompany(companyData);

          // Then get all analyses for this company
          const { data: analysesData, error: analysesError } = await supabase
            .from('call_analyses')
            .select('*')
            .eq('company_id', companyData.id)
            .order('created_at', { ascending: false });
          
          if (analysesError) {
            throw new Error('שגיאה בטעינת ניתוחים: ' + analysesError.message);
          }
          
          const fetchedAnalyses = analysesData || [];
          
          // בדיקה אם יש הבדל בין הנתונים הקודמים לחדשים
          const hasChanges = JSON.stringify(fetchedAnalyses) !== JSON.stringify(analyses);
          if (hasChanges) {
            console.log('[AnalysisList] עדכון רשימת הניתוחים - זוהו שינויים');
            setAnalyses(fetchedAnalyses);
          } else {
            console.log('[AnalysisList] אין שינויים בנתוני הניתוחים');
          }
          
          // Check if any analyses are still processing
          const stillProcessing = fetchedAnalyses.some(analysis => 
            analysis.status === 'pending' || analysis.status === 'processing'
          );
          
          if (stillProcessing !== hasProcessingAnalyses) {
            console.log(`[AnalysisList] עדכון מצב הניתוחים: ${stillProcessing ? 'יש' : 'אין'} ניתוחים בעיבוד`);
            setHasProcessingAnalyses(stillProcessing);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'אירעה שגיאה בטעינת הנתונים');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // Poll for updates with a longer interval to reduce refreshes
    const intervalId = setInterval(() => {
      if (hasProcessingAnalyses) {
        console.log('[AnalysisList] בדיקת עדכונים לניתוחים בעיבוד');
        fetchData();
      }
    }, 20000); // Increased from 10s to 20s

    return () => clearInterval(intervalId);
  }, [user, hasProcessingAnalyses, analyses]);

  // Format date to dd/mm/yyyy hh:mm
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDeleteClick = (analysisId: string) => {
    setAnalysisToDelete(analysisId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!analysisToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // קריאה ל-API במקום ישירות לפונקציה
      const response = await fetch(`/api/analyses/${analysisToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שגיאה במחיקת ניתוח');
      }
      
      // עדכון הרשימה המקומית
      setAnalyses(analyses.filter(a => a.id !== analysisToDelete));
      
      toast.success('הניתוח נמחק בהצלחה');
    } catch (error: any) {
      console.error('שגיאה במחיקת ניתוח:', error);
      toast.error(error.message || 'אירעה שגיאה במחיקת הניתוח');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setAnalysisToDelete(null);
    }
  };

  // פונקציה לשליחת ניתוח לעיבוד
  const startAnalysis = async (analysisId: string) => {
    if (processingAnalysisIds.has(analysisId)) return;
    
    setProcessingAnalysisIds(prev => new Set([...prev, analysisId]));
    try {
      const currentAnalysis = analyses.find(a => a.id === analysisId);
      const currentStatus = currentAnalysis?.status || 'unknown';
      console.log(`[AnalysisList] שולח בקשה לניתוח/ניתוח מחדש: ${analysisId}, סטטוס נוכחי: ${currentStatus}`);
      
      // עכשיו תמיד קוראים לאותו API Route
      const response = await fetch('/api/analyze/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysisId,
        }),
      });
      
      if (!response.ok) {
        let errorMsg = 'שגיאה בהתחלת הניתוח';
        try {
          const errorData = await response.json();
          errorMsg += ': ' + (errorData.error || response.statusText);
        } catch (jsonError) {
          errorMsg += ': ' + response.statusText;
        }
        throw new Error(errorMsg);
      }
      
      // תגובה התקבלה בהצלחה
      const responseData = await response.json();
      console.log(`[AnalysisList] ה-API החזיר תשובה שהתהליך התחיל:`, responseData);
      
      // עדכון הרשימה המקומית (מעדכנים ל-processing בכל מקרה)
      setAnalyses(prevAnalyses => 
        prevAnalyses.map(analysis => 
          analysis.id === analysisId 
            ? { ...analysis, status: 'processing' as AnalysisStatus } 
            : analysis
        )
      );
      
      // נודיע למשתמש
      toast.success('הניתוח החל, התהליך עשוי להימשך מספר דקות. הדף יתעדכן אוטומטית.');
    } catch (error: any) {
      console.error('[AnalysisList] שגיאה בהפעלת הניתוח:', error);
      toast.error(error.message || 'שגיאה בהפעלת ניתוח');
    } finally {
      setProcessingAnalysisIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(analysisId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">טוען ניתוחים...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="w-16 h-16 border-t-4 border-orange-500 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card className="overflow-hidden bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">יש צורך בהגדרת פרטי חברה</CardTitle>
          <CardDescription className="text-gray-400">
            לפני שתוכל לצפות בניתוחי שיחות, יש להגדיר את פרטי החברה שלך במערכת.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            <Link href="/settings/company">הגדרת פרטי חברה</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="overflow-hidden bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">אין ניתוחים זמינים</CardTitle>
          <CardDescription className="text-gray-400">
            לא נמצאו ניתוחי שיחות. התחל בניתוח שיחה חדשה כדי לראות תוצאות.
          </CardDescription>
        </CardHeader>
        {/* כפתור לניתוח חדש כבר נמצא בטאב למעלה, אין צורך כאן */}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gray-900 border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">רשימת ניתוחים</CardTitle>
        <CardDescription className="text-gray-400">רשימת ניתוחי השיחות האחרונים שלך</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption className="text-gray-400">סה"כ {analyses.length} ניתוחים</TableCaption>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800/50">
              <TableHead className="w-[180px] text-white">תאריך</TableHead>
              <TableHead className="text-white">סוג</TableHead>
              <TableHead className="text-white">סטטוס</TableHead>
              <TableHead className="text-right text-white">ציון</TableHead>
              <TableHead className="text-right text-white">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyses.map((analysis) => (
              <TableRow key={analysis.id} className="border-gray-700 hover:bg-gray-800/50">
                <TableCell className="font-medium text-gray-300">
                  {formatDate(analysis.created_at)}
                </TableCell>
                <TableCell className="text-gray-300">
                  {analysisTypeLabels[analysis.analysis_type] || analysis.analysis_type}
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColors[analysis.status as AnalysisStatus] || 'bg-gray-500'} border px-2 py-1 text-xs font-semibold`}>
                    {statusLabels[analysis.status as AnalysisStatus] || analysis.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {analysis.status === 'done' && analysis.report_data?.summary?.totalScore ? (
                    <span className="font-semibold">
                      {Math.round(
                        (analysis.report_data.summary.totalScore / 
                         (7 * (analysis.report_data?.analysis?.length || 28))) * 100
                      )}/100
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2 rtl:space-x-reverse">
                  {analysis.status === 'pending' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startAnalysis(analysis.id)}
                      disabled={processingAnalysisIds.has(analysis.id)}
                      className="border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
                    >
                      {processingAnalysisIds.has(analysis.id) ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin"></div>
                          מתחיל...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-3 w-3" />
                          שלח לניתוח
                        </span>
                      )}
                    </Button>
                  ) : null}

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                  >
                    <Link href={`/analyses/${analysis.id}`}>הצג</Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(analysis.id)}
                    className="border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

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
    </Card>
  );
} 