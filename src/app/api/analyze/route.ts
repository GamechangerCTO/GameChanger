import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// הגדרת זמן מקסימלי להמתנה לתשובה
export const runtime = 'edge';
export const maxDuration = 60;

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

    // בדיקה שהניתוח קיים במסד הנתונים ועדכון סטטוס
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('חסרות הגדרות Supabase');
      }
      
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      
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
      // ממשיכים למרות השגיאה, ננסה להפעיל את התהליך בכל זאת
    }

    // קריאה לwebhook לעיבוד ארוך טווח במקום לנסות לבצע את התהליך כאן
    console.log(`[API:ANALYZE] קורא ל-webhook לעיבוד ניתוח ${analysisId}`);
    
    const webhookSecretKey = process.env.WEBHOOK_SECRET_KEY || 'default_webhook_key';
    console.log(`[API:ANALYZE] מפתח webhook קיים בסביבה: ${!!process.env.WEBHOOK_SECRET_KEY}`);
    
    try {
      // שליחת בקשה לwebhook הייעודי לעיבוד ארוך
      // בניית כתובת מלאה של הwebhook באופן ישיר (לא משתמש במשתנה סביבה שעלול להיות חסר)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                      process.env.VERCEL_URL || 
                      'https://game-changer-alpha.vercel.app';
      
      console.log(`[API:ANALYZE] כתובת האתר שבשימוש: ${siteUrl}`);
      
      const webhookUrl = `${siteUrl}/api/webhook/process-analysis`;
      console.log(`[API:ANALYZE] שולח קריאה לwebhook בכתובת: ${webhookUrl}`);
      
      // יצירת מערך של ניסיונות שליחה
      const sendWebhookRequest = async () => {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            analysisId,
            secretKey: webhookSecretKey
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Webhook responded with status: ${response.status}`);
        }
        
        return await response.json();
      };
      
      // ננסה לשלוח את הwebhook, אך לא נחכה לתשובה (fire and forget)
      sendWebhookRequest()
        .then(result => {
          console.log('[API:ANALYZE] ה-webhook החזיר תשובה:', result);
        })
        .catch(error => {
          console.error(`[API:ANALYZE] שגיאה בשליחת בקשה לwebhook: ${error.message}`);
        });
      
      console.log('[API:ANALYZE] הבקשה ל-webhook נשלחה בהצלחה');
    } catch (webhookError) {
      console.error('[API:ANALYZE] שגיאה בשליחת בקשה לwebhook:', webhookError);
      // ממשיכים למרות הכל, כי הסטטוס כבר עודכן
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