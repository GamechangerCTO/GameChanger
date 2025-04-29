import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processAnalysis } from '@/lib/api'; // נייבא את פונקציית העיבוד המרכזית

// הגדרת זמן מקסימלי להמתנה לתשובה - Serverless Node.js
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 דקות

export async function POST(request: NextRequest) {
  console.log('[API:ANALYZE] ✉️ התקבלה בקשה לניתוח שיחה (Node.js Serverless)');
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('[API:ANALYZE] ❌ שגיאה בפענוח ה-JSON של הבקשה:', parseError);
      return NextResponse.json(
        { error: 'JSON לא תקין בבקשה' },
        { status: 400 }
      );
    }
    
    const { analysisId } = requestData;
    console.log(`[API:ANALYZE] 🔍 מזהה ניתוח שהתקבל: ${analysisId || 'חסר'}`);

    if (!analysisId) {
      console.error('[API:ANALYZE] ❌ חסר מזהה ניתוח בבקשה');
      return NextResponse.json(
        { error: 'חסר מזהה ניתוח' },
        { status: 400 }
      );
    }

    // כאן פשוט נפעיל את תהליך הניתוח הארוך ברקע
    // הפונקציה processAnalysis כבר כוללת בדיקות ובקרה על הסטטוסים
    console.log(`[API:ANALYZE] 🚀 מפעיל את processAnalysis עבור ניתוח ${analysisId}`);
    
    // הפעלת הפונקציה באופן אסינכרוני (לא מחכים לסיום)
    processAnalysis(analysisId).catch(error => {
      // חשוב לתפוס שגיאות מהפונקציה האסינכרונית
      console.error(`[API:ANALYZE] ❌ שגיאה חמורה בתהליך processAnalysis עבור ${analysisId}:`, error);
      // כאן אפשר להוסיף לוגיקה נוספת אם רוצים לעדכן את הסטטוס ל-error במקרה כזה
    });
    
    // מחזירים תשובה מיידית ללקוח שהתהליך התחיל
    console.log(`[API:ANALYZE] ✓ הבקשה לניתוח ${analysisId} התקבלה והתהליך התחיל ברקע`);
    return NextResponse.json({ 
      success: true, 
      message: 'התהליך התחיל בהצלחה',
      analysisId 
    });

  } catch (error: any) {
    console.error('[API:ANALYZE] ❌ שגיאה כללית בטיפול בבקשה:', error);
    
    return NextResponse.json(
      { error: 'שגיאה בעיבוד בקשת הניתוח', details: error.message },
      { status: 500 }
    );
  }
}

// הסרת הקוד הישן שבדק סטטוס וקרא לפונקציית Edge 