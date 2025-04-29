import { NextRequest, NextResponse } from 'next/server';
import { processAnalysis } from '@/lib/api';

// הגדרת הפונקציה עם זמן ריצה ארוך יותר
export const maxDuration = 300; // 5 דקות מקסימום

export async function POST(request: NextRequest) {
  console.log('[API:WEBHOOK-PROCESS] התקבלה קריאת webhook לעיבוד ניתוח');
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('[API:WEBHOOK-PROCESS] שגיאה בפענוח ה-JSON של הבקשה:', parseError);
      return NextResponse.json(
        { error: 'JSON לא תקין בבקשה' },
        { status: 400 }
      );
    }
    
    const { analysisId, secretKey } = requestData;
    console.log(`[API:WEBHOOK-PROCESS] מזהה ניתוח שהתקבל: ${analysisId || 'חסר'}`);

    // בדיקת אבטחה בסיסית
    if (secretKey !== process.env.WEBHOOK_SECRET_KEY) {
      console.error('[API:WEBHOOK-PROCESS] מפתח סודי לא תקין');
      return NextResponse.json(
        { error: 'מפתח סודי לא תקין' },
        { status: 401 }
      );
    }

    if (!analysisId) {
      console.error('[API:WEBHOOK-PROCESS] חסר מזהה ניתוח בבקשה');
      return NextResponse.json(
        { error: 'חסר מזהה ניתוח' },
        { status: 400 }
      );
    }

    console.log(`[API:WEBHOOK-PROCESS] מתחיל עיבוד ניתוח: ${analysisId}`);
    
    // הפעלת פונקציית העיבוד בסינכרוניות (מחכים לסיום)
    try {
      await processAnalysis(analysisId);
      console.log(`[API:WEBHOOK-PROCESS] העיבוד הושלם בהצלחה: ${analysisId}`);
      
      return NextResponse.json({
        success: true,
        message: 'הניתוח עובד בהצלחה',
        analysisId
      });
    } catch (error: any) {
      console.error(`[API:WEBHOOK-PROCESS] שגיאה בעיבוד: ${error.message}`);
      
      return NextResponse.json({
        success: false,
        error: error.message,
        analysisId
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[API:WEBHOOK-PROCESS] שגיאה כללית:', error);
    
    return NextResponse.json(
      { error: 'שגיאה בעיבוד בקשת הניתוח', details: error.message },
      { status: 500 }
    );
  }
} 