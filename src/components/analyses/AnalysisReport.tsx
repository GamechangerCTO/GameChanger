'use client';

import { useState, useEffect, useRef } from 'react';
import { CallAnalysis } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Play, Pause, AlertTriangle, AlertCircle, LockIcon, Send, Square, Download } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'react-hot-toast';

// הוספת טיפוס לתוצאת הניתוח
interface AnalysisResult {
  overall_score: number;
  parameters?: Record<string, { label: string; score: number }>;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  transcript?: string;
}

// הרחבת הטיפוס CallAnalysis
interface ExtendedCallAnalysis extends CallAnalysis {
  result?: AnalysisResult;
  error_message?: string;
  call_duration?: number;
  completed_at?: string;
  company?: {
    name: string;
  };
}

const analysisTypeLabels: Record<string, string> = {
  sales: 'שיחת מכירה',
  service: 'שיחת שירות',
  appointment_setting: 'תיאום פגישה',
  sales_followup: 'פולו אפ מכירה טלפונית',
  appointment_followup: 'פולו-אפ תיאום פגישה',
};

interface AnalysisReportProps {
  analysis: ExtendedCallAnalysis;
}

export function AnalysisReport({ analysis: initialAnalysis }: AnalysisReportProps) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [analysis, setAnalysis] = useState<ExtendedCallAnalysis>(initialAnalysis);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // בדיקת הרשאות בטעינה
  useEffect(() => {
    async function checkPermission() {
      setIsLoading(true);
      try {
        if (!user) {
          setHasPermission(false);
          return;
        }

        // אם המשתמש עצמו יצר את הניתוח - יש לו הרשאות
        if (analysis.user_id === user.id) {
          setHasPermission(true);
          return;
        }

        // בדיקה עם שרת ה-API האם למשתמש יש הרשאות (לחברה שלו)
        const { supabase } = await import('@/lib/supabase');
        const { data: companyData } = await supabase
          .from('companies')
          .select('id')
          .eq('id', analysis.company_id)
          .eq('user_id', user.id)
          .single();

        setHasPermission(!!companyData);
      } catch (error) {
        console.error('שגיאה בבדיקת הרשאות:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkPermission();
  }, [user, analysis.user_id, analysis.company_id]);

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

  // Initialize audio player on first play
  const initAudio = () => {
    if (!audioElement && analysis.recording_url) {
      const audio = new Audio(analysis.recording_url);
      audio.addEventListener('ended', () => {
        setAudioPlaying(false);
      });
      setAudioElement(audio);
      return audio;
    }
    return audioElement;
  };

  // Toggle play/pause
  const togglePlay = () => {
    const audio = initAudio();
    if (!audio) return;

    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      audio.play();
      setAudioPlaying(true);
    }
  };

  // Render status badge
  const renderStatusBadge = () => {
    const statusMap: Record<string, { label: string, className: string }> = {
      pending: { label: 'ממתין', className: 'bg-yellow-500 text-yellow-900 border-yellow-600' },
      processing: { label: 'מעבד', className: 'bg-blue-500 text-blue-900 border-blue-600' },
      done: { label: 'הושלם', className: 'bg-green-500 text-green-900 border-green-600' },
      error: { label: 'שגיאה', className: 'bg-red-500 text-red-900 border-red-600' },
    };

    const status = statusMap[analysis.status] || { label: analysis.status, className: 'bg-gray-500 text-gray-900 border-gray-600' };
    
    return (
      <Badge className={`${status.className} border px-2 py-1 text-xs font-semibold`}>
        {status.label}
      </Badge>
    );
  };

  // Render content based on analysis status
  const renderContent = () => {
    if (analysis.status === 'pending') {
      return (
        <Card className="overflow-hidden bg-gray-900 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">שיחה מוכנה לניתוח</CardTitle>
            <CardDescription className="text-gray-400">
              הקובץ הועלה בהצלחה. לחץ על הכפתור למטה להתחלת תהליך התמלול והניתוח
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-gray-400">יש להתחיל את תהליך הניתוח באופן יזום</p>
              <Button 
                onClick={startAnalysis} 
                disabled={isProcessing}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                    מתחיל...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    שלח לתמלול וניתוח
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (analysis.status === 'processing') {
      return (
        <Card className="overflow-hidden bg-gray-900 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">הניתוח בתהליך...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <p className="text-center text-gray-400">התוצאות יופיעו כאן בהקדם</p>
            <Progress value={70} className="w-full h-2 bg-gray-700 [&>*]:bg-orange-500" />
            
            <div className="space-y-4 mt-4 bg-gray-800 p-4 rounded-md border border-gray-700">
              <h3 className="text-white font-medium text-lg">שלבי התהליך:</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-green-400">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span>קבלת נתוני ההקלטה</span>
                </li>
                <li className="flex items-center text-green-400">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span>התחלת עיבוד</span>
                </li>
                <li className="flex items-center text-amber-400">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center mr-2 animate-pulse">
                    <div className="w-2 h-2 bg-amber-900 rounded-full"></div>
                  </div>
                  <span>ביצוע תמלול</span>
                </li>
                <li className="flex items-center text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                  <span>ניתוח תוכן השיחה</span>
                </li>
                <li className="flex items-center text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                  <span>יצירת דו"ח מסכם</span>
                </li>
              </ul>
            </div>
            
            <Button 
              onClick={stopAnalysis} 
              variant="destructive" 
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              עצור את תהליך הניתוח
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (analysis.status === 'error') {
      return (
        <Card className="overflow-hidden bg-gray-900 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>שגיאה בתהליך הניתוח</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                {analysis.error_message || 'אירעה שגיאה בתהליך עיבוד והניתוח. נא לנסות שוב מאוחר יותר.'}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4 justify-center mt-6">
              <Button 
                onClick={startAnalysis} 
                disabled={isProcessing}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isProcessing ? 'מתחיל...' : 'נסה שוב'}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (analysis.status === 'done' && analysis.result) {
      return (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="summary" className="data-[state=active]:bg-orange-500 text-white">סיכום</TabsTrigger>
            <TabsTrigger value="transcript" className="data-[state=active]:bg-orange-500 text-white">תמלול מלא</TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-orange-500 text-white">פרטים נוספים</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-4">
            <Card className="overflow-hidden bg-gray-900 border border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">
                    ניתוח {analysisTypeLabels[analysis.analysis_type] || 'שיחה'} עבור חברת {analysis.company?.name || 'לא ידוע'}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={downloadAsPdf}
                    disabled={isPdfLoading}
                    className="gap-2"
                  >
                    {isPdfLoading ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin mr-1"></div>
                        מכין...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        הורד דו"ח
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription className="text-gray-400">
                  {analysis.call_duration && (
                    <span className="flex items-center gap-1">
                      <span>משך השיחה: {formatDuration(analysis.call_duration)}</span>
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={reportRef} className="space-y-8">
                  {/* פריסה מחודשת בתצוגה אחת ללא גלילה */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* ציון כולל - 3 עמודות */}
                    <div className="md:col-span-3">
                      <Card className="bg-gray-800 border-gray-700 h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-white">ציון כולל</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center py-6">
                          <div className="relative flex items-center justify-center">
                            <div className="h-36 w-36 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-4xl font-bold text-white">
                                {Math.round(analysis.result.overall_score)}/100
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* פרמטרים - 4 עמודות */}
                    <div className="md:col-span-4">
                      <Card className="bg-gray-800 border-gray-700 h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-white">פרמטרים</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 overflow-auto max-h-[350px]">
                          {analysis.result.parameters && Object.entries(analysis.result.parameters).map(([key, value]) => {
                            const score = (value as any).score;
                            let color = 'bg-red-500';
                            if (score >= 70) color = 'bg-green-500';
                            else if (score >= 50) color = 'bg-yellow-500';
                            
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-white line-clamp-1">
                                    {(value as any).label || key}
                                  </span>
                                  <span className="text-sm font-medium text-white">{score}/100</span>
                                </div>
                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${color}`}
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    </div>

                    {/* נקודות לשימור - 2.5 עמודות */}
                    <div className="md:col-span-2">
                      <Card className="bg-gray-800 border-gray-700 h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-white">נקודות לשימור</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-auto max-h-[350px]">
                          {analysis.result.strengths && analysis.result.strengths.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 text-sm">
                              {analysis.result.strengths.map((strength, index) => (
                                <li key={index} className="text-white">
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 text-sm">לא זוהו נקודות לשימור ספציפיות</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* נקודות לשיפור - 2.5 עמודות */}
                    <div className="md:col-span-3">
                      <Card className="bg-gray-800 border-gray-700 h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-white">נקודות לשיפור</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-auto max-h-[350px]">
                          {analysis.result.weaknesses && analysis.result.weaknesses.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 text-sm">
                              {analysis.result.weaknesses.map((weakness, index) => (
                                <li key={index} className="text-white">
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 text-sm">לא זוהו נקודות לשיפור ספציפיות</p>
                          )}
                          
                          {/* Show recommendations as part of improvement points */}
                          {analysis.result.recommendations && analysis.result.recommendations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <ul className="list-disc list-inside space-y-2 text-sm">
                                {analysis.result.recommendations.map((recommendation, index) => (
                                  <li key={index} className="text-white">
                                    {recommendation}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transcript" className="mt-4">
            <Card className="overflow-hidden bg-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">תמלול מלא</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.result.transcript ? (
                  <div className="rounded bg-gray-800 p-4">
                    <pre className="text-white font-sans whitespace-pre-wrap">{analysis.result.transcript}</pre>
                  </div>
                ) : (
                  <Alert className="bg-yellow-900/30 border-yellow-700 text-yellow-300">
                    <AlertDescription>לא נמצא תמלול להקלטה זו.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details" className="mt-4">
            <Card className="overflow-hidden bg-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">פרטים נוספים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">מזהה ניתוח</h3>
                    <p className="text-white break-all">{analysis.id}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">סוג שיחה</h3>
                    <p className="text-white">{analysisTypeLabels[analysis.analysis_type] || analysis.analysis_type}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">תאריך העלאה</h3>
                    <p className="text-white">{formatDate(analysis.created_at)}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">תאריך ניתוח</h3>
                    <p className="text-white">{analysis.completed_at ? formatDate(analysis.completed_at) : 'לא הושלם'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <Card className="overflow-hidden bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">אין נתונים זמינים</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-yellow-900/30 border-yellow-700 text-yellow-300">
            <AlertDescription>
              לא נמצאו נתוני ניתוח. אם אתה סבור שזו שגיאה, אנא פנה לתמיכה.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  };

  // אם בבדיקת ההרשאות התגלה שאין הרשאות - מציג הודעת שגיאה
  if (isLoading) {
    return (
      <Card className="overflow-hidden bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">טוען...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="w-16 h-16 border-t-4 border-orange-500 rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission === false) {
    return (
      <Card className="overflow-hidden bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">אין הרשאות גישה</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-900/30 border-red-700 text-red-300">
            <LockIcon className="h-4 w-4" />
            <AlertDescription>
              אין לך הרשאות לצפות בניתוח זה. ניתוחים זמינים רק למשתמש שיצר אותם או לחברה שאליה הם שייכים.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // פונקציה לשליחת ניתוח לעיבוד
  const startAnalysis = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      console.log('שולח בקשה להתחלת ניתוח:', analysis.id);
      
      // הגדרת timeout לקריאה כדי למנוע תקיעה בסביבת פריסה
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // timeout של 30 שניות
      
      try {
        const response = await fetch('/api/analyze/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            analysisId: analysis.id,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId); // ניקוי ה-timeout לאחר שהקריאה הושלמה
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error('שגיאה בהתחלת הניתוח: ' + (errorData.error || response.statusText));
        }
        
        // תגובה התקבלה בהצלחה
        const responseData = await response.json();
        console.log('התהליך החל בהצלחה:', responseData);
        
        // נודיע למשתמש
        toast.success('התמלול והניתוח החלו, התהליך עשוי להימשך מספר דקות');
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          // במקרה של timeout, נניח שהבקשה התקבלה אבל התשובה לא חזרה בזמן
          console.log('הקריאה לא קיבלה תשובה בזמן סביר, אך תהליך הניתוח עשוי להתחיל בכל זאת');
          toast.success('הניתוח נשלח לעיבוד. התהליך עשוי להימשך מספר דקות');
        } else {
          throw fetchError; // העבר את השגיאה ל-catch הבא
        }
      }
      
      // רענון העמוד אחרי המתנה קצרה בכל מקרה
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('שגיאה בהפעלת הניתוח:', error);
      toast.error(error.message || 'שגיאה בהפעלת ניתוח');
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to stop the analysis
  const stopAnalysis = async () => {
    if (!hasPermission || !analysis) return;
    
    try {
      setIsProcessing(true);
      
      const response = await fetch(`/api/analyses/${analysis.id}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שגיאה בביטול תהליך הניתוח');
      }
      
      // Reload the analysis data
      await fetchAnalysisData();
      toast.success('תהליך הניתוח הופסק בהצלחה');
    } catch (error: any) {
      console.error('שגיאה בביטול הניתוח:', error);
      toast.error(error.message || 'אירעה שגיאה בביטול הניתוח');
    } finally {
      setIsProcessing(false);
    }
  };

  // פונקציה לטעינת נתוני הניתוח מחדש
  const fetchAnalysisData = async () => {
    try {
      if (!analysis?.id) return;
      
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('call_analyses')
        .select('*, company:companies(*)')
        .eq('id', analysis.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setAnalysis(data as ExtendedCallAnalysis);
      }
    } catch (error: any) {
      console.error('שגיאה בטעינת נתוני ניתוח:', error);
      toast.error('שגיאה בטעינת נתוני הניתוח');
    }
  };

  // Function to format duration in minutes and seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to download the report as PDF
  const downloadAsPdf = async () => {
    if (!analysis || !analysis.result) return;
    
    try {
      setIsPdfLoading(true);
      toast.loading('מכין הורדת דו"ח...');
      
      // דינמית טעינת הספריות הנדרשות
      const jspdfModule = await import('jspdf');
      const html2canvasModule = await import('html2canvas');
      const jsPDF = jspdfModule.default;
      const html2canvas = html2canvasModule.default;
      
      if (!reportRef.current) {
        throw new Error('לא ניתן למצוא את תכולת הדו"ח');
      }
      
      // יצירת צילום מסך של הדו"ח
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // הגדרת גודל הדף בהתאם לגודל התוכן
      const imgWidth = 210; // A4 רוחב במ"מ
      const pageHeight = 297; // A4 גובה במ"מ
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // יצירת מסמך PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pageHeight;
      
      // הוספת עמודים נוספים אם צריך
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }
      
      // שמירת הקובץ
      const companyName = analysis.company?.name || 'חברה';
      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`ניתוח_שיחה_${companyName}_${date}.pdf`);
      
      toast.dismiss();
      toast.success('הדו"ח הורד בהצלחה!');
    } catch (error: any) {
      console.error('שגיאה ביצירת PDF:', error);
      toast.dismiss();
      toast.error('שגיאה ביצירת הדו"ח: ' + (error.message || 'אנא נסה שוב'));
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gray-900 border border-gray-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-xl text-white">
                {analysisTypeLabels[analysis.analysis_type] || analysis.analysis_type}
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                נוצר ב-{formatDate(analysis.created_at)} | {renderStatusBadge()}
              </CardDescription>
            </div>
            
            {analysis.recording_url && (
              <Button 
                onClick={togglePlay} 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                size="sm"
                aria-label={audioPlaying ? 'השהה שמע' : 'נגן שמע'}
              >
                {audioPlaying ? (
                  <span className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    השהה
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    נגן הקלטה
                  </span>
                )}
              </Button>
            )}
            
            {/* הוספת כפתור עצור שמופיע תמיד כשהניתוח בתהליך */}
            {analysis.status === 'processing' && (
              <Button 
                onClick={stopAnalysis} 
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <span className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  עצור ניתוח
                </span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
} 