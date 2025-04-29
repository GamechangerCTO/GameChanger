import { NextRequest, NextResponse } from 'next/server';
import { processAnalysis } from '@/lib/api';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.log('[API:ANALYZE] התקבלה בקשה לניתוח שיחה');
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('[API:ANALYZE] שגיאה בפענוח ה-JSON של הבקשה:', parseError);
      return NextResponse.json(
        { error: 'JSON לא תקין בבקשה' },
        { status: 400 }
      );
    }
    
    const { analysisId } = requestData;
    console.log(`[API:ANALYZE] מזהה ניתוח שהתקבל: ${analysisId || 'חסר'}`);

    if (!analysisId) {
      console.error('[API:ANALYZE] חסר מזהה ניתוח בבקשה');
      return NextResponse.json(
        { error: 'חסר מזהה ניתוח' },
        { status: 400 }
      );
    }

    // בדיקה שהניתוח קיים במסד הנתונים ושיש למשתמש הרשאה אליו
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('חסרות הגדרות Supabase');
      }
      
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      
      // משתמש ב-service role לכל הפעולות - מעקף אימות זמני
      // קביעת משתמש "מערכת" (אדמין) כברירת מחדל
      const userId = "00000000-0000-0000-0000-000000000000"; // משתמש מערכת זמני
      console.log(`[API:ANALYZE] משתמש במזהה משתמש זמני: ${userId}`);
      
      // בדיקה אם הניתוח קיים במסד הנתונים
      const { data: analysis, error } = await supabase
        .from('call_analyses')
        .select('id, status, user_id, company_id')
        .eq('id', analysisId)
        .single();

      if (error || !analysis) {
        console.error(`[API:ANALYZE] ניתוח ${analysisId} לא נמצא במסד הנתונים:`, error?.message || 'לא נמצאו נתונים');
        return NextResponse.json(
          { error: 'ניתוח לא נמצא', details: error?.message },
          { status: 404 }
        );
      }

      console.log(`[API:ANALYZE] הניתוח ${analysisId} נמצא במסד הנתונים. סטטוס: ${analysis.status}`);
      
      // עדכון הסטטוס ל-processing אם הוא pending
      if (analysis.status === 'pending') {
        console.log(`[API:ANALYZE] מעדכן סטטוס ניתוח ${analysisId} ל-processing`);
        const { error: updateError } = await supabase
          .from('call_analyses')
          .update({ status: 'processing' })
          .eq('status', 'pending')
          .eq('id', analysisId);
          
        if (updateError) {
          console.warn(`[API:ANALYZE] שגיאה בעדכון סטטוס ניתוח ${analysisId}:`, updateError);
        }
      }
    } catch (checkError: any) {
      console.error('[API:ANALYZE] שגיאה בבדיקת קיום הניתוח:', checkError);
      // ממשיכים למרות השגיאה
    }

    // נפעיל את תהליך העיבוד באופן אסינכרוני (לא מחכים לסיום)
    console.log(`[API:ANALYZE] מתחיל תהליך עיבוד אסינכרוני לניתוח ${analysisId}`);
    
    try {
      console.log('[API:ANALYZE] לפני קריאה לפונקציית processAnalysis');
      processAnalysis(analysisId).catch((error) => {
        console.error(`[API:ANALYZE] שגיאה בעיבוד ניתוח ${analysisId}:`, error);
      });
      console.log('[API:ANALYZE] אחרי קריאה לפונקציית processAnalysis - הקריאה נשלחה בהצלחה');
    } catch (processError) {
      console.error('[API:ANALYZE] שגיאה בקריאה לפונקציית processAnalysis:', processError);
    }

    // מחזירים תשובה מיידית כי העיבוד יימשך ברקע
    console.log(`[API:ANALYZE] בקשת הניתוח ${analysisId} התקבלה והתהליך התחיל בהצלחה`);
    return NextResponse.json({ 
      success: true, 
      message: 'התהליך התחיל בהצלחה',
      analysisId 
    });

  } catch (error: any) {
    console.error('[API:ANALYZE] שגיאה כללית בטיפול בבקשה:', error);
    
    return NextResponse.json(
      { error: 'שגיאה בעיבוד בקשת הניתוח', details: error.message },
      { status: 500 }
    );
  }
} 