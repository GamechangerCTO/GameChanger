/**
 * API למעבר בין שלבי עיבוד הניתוח
 * מאפשר לעקוף מגבלות חוזקות על ידי ביצוע העיבוד בצד השרת
 */

import { NextRequest, NextResponse } from 'next/server';
import { processAnalysis } from '@/lib/api';

/**
 * הפעלת API של process-analysis
 * 
 * - GET: מחזיר את מצב הניתוח הנוכחי
 * - POST: מפעיל את התהליך / ממשיך לשלב הבא
 * 
 * @param req בקשת HTTP
 * @returns תשובת HTTP
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const analysisId = searchParams.get('id');
    
    if (!analysisId) {
      return NextResponse.json(
        { error: 'חסר מזהה ניתוח (id)' },
        { status: 400 }
      );
    }
    
    // כאן אפשר להרחיב ולהוסיף בדיקת סטטוס במסד הנתונים
    return NextResponse.json({ 
      id: analysisId,
      message: 'בדיקת מצב התהליך - יש לבדוק את המצב במסד הנתונים'
    });
  } catch (error: any) {
    console.error('[API] שגיאה כללית בבדיקת מצב ניתוח:', error);
    return NextResponse.json(
      { error: `שגיאה כללית: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * תחילת או המשך עיבוד ניתוח שיחה
 * 
 * @param req בקשת HTTP 
 * @returns תשובת HTTP
 */
export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const analysisId = searchParams.get('id');
  
  if (!analysisId) {
    return NextResponse.json(
      { error: 'חסר מזהה ניתוח (id)' },
      { status: 400 }
    );
  }
  
  // שליחת תשובה מהירה וריצה במקביל של התהליך בלי לחכות לסיום
  try {
    console.log(`[API:PROCESS-ANALYSIS] מתחיל תהליך עיבוד ניתוח ${analysisId}`);
    
    try {
      console.log('[API:PROCESS-ANALYSIS] לפני קריאה לפונקציית processAnalysis');
      // הפעלת התהליך בלי לחכות - לא חלק מה-Promise שחוזר למשתמש
      processAnalysis(analysisId).catch(error => {
        console.error(`[API:PROCESS-ANALYSIS] שגיאה בעיבוד ניתוח ${analysisId}:`, error);
      });
      console.log('[API:PROCESS-ANALYSIS] אחרי קריאה לפונקציית processAnalysis - הקריאה נשלחה בהצלחה');
    } catch (processError) {
      console.error('[API:PROCESS-ANALYSIS] שגיאה בקריאה לפונקציית processAnalysis:', processError);
    }
    
    // החזרת תשובה מיידית ללקוח
    return NextResponse.json({
      id: analysisId,
      message: 'התהליך החל לרוץ',
      status: 'pending'
    }, { status: 202 });
  } catch (error: any) {
    console.error('[API] שגיאה כללית בהפעלת ניתוח:', error);
    return NextResponse.json(
      { error: `שגיאה כללית: ${error.message}` },
      { status: 500 }
    );
  }
} 