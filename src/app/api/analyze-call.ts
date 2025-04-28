/**
 * API לניתוח שיחות מכירה ושירות
 * 
 * תהליך:
 * 1. מקבל URL לקובץ שמע ומזהה ניתוח
 * 2. מוריד את קובץ השמע
 * 3. מבצע תמלול עם Whisper של OpenAI
 * 4. מנתח את התמלול באמצעות GPT לפי תבנית מתאימה
 * 5. שומר את התוצאות במסד הנתונים
 * 
 * אבטחה:
 * - המידלוור מוודא שרק משתמשים מחוברים יכולים לגשת ל-API
 * - בדיקות נוספות מוודאות שלמשתמש יש גישה לחברה ולניתוח המבוקש
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { getPromptByAnalysisType } from '@/lib/promptTemplates';

/**
 * פונקציה לבדיקת הרשאות גישה לניתוח
 * מחליפה את הקריאה ל-API החיצוני
 */
async function checkAnalysisAccess(supabase: any, analysisId: string, userId: string): Promise<boolean> {
  try {
    // בדיקה אם הניתוח שייך למשתמש ישירות
    const { data: directAccess } = await supabase
      .from('call_analyses')
      .select('id')
      .eq('id', analysisId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (directAccess) {
      return true;
    }
    
    // בדיקה אם הניתוח שייך לחברה של המשתמש
    const { data: analysisData } = await supabase
      .from('call_analyses')
      .select('company_id')
      .eq('id', analysisId)
      .single();
      
    if (!analysisData) {
      return false;
    }
    
    const { data: userCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('id', analysisData.company_id)
      .eq('user_id', userId)
      .maybeSingle();
      
    return !!userCompany;
  } catch (error) {
    console.error('שגיאה בבדיקת הרשאות:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  console.log('[API-ROUTE] התחלת תהליך ניתוח שיחה');

  try {
    const body = await req.json();
    const { analysisId, analysisType = 'sales' } = body;
    
    if (!analysisId) {
      console.error('[API-ROUTE] חסר מזהה ניתוח');
      return NextResponse.json(
        { error: 'נדרש מזהה ניתוח (analysisId)' },
        { status: 400 }
      );
    }
    
    // לקבל את המשתמש מהסשן
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error('[API-ROUTE] משתמש לא מזוהה');
      return NextResponse.json(
        { error: 'נדרשת התחברות לביצוע ניתוח' },
        { status: 401 }
      );
    }
    
    // לבדוק שלמשתמש יש הרשאות לנתח את השיחה הזו
    const userId = session.user.id;
    console.log(`[API-ROUTE] בדיקת הרשאות למשתמש ${userId} לניתוח ${analysisId}`);
    
    // מקבל את המידע על הניתוח
    const { data: analysis, error: analysisError } = await supabase
      .from('call_analyses')
      .select('*, company:company_id(*)')
      .eq('id', analysisId)
      .single();
      
    if (analysisError || !analysis) {
      console.error(`[API-ROUTE] שגיאה בקבלת פרטי ניתוח: ${analysisError?.message || 'ניתוח לא נמצא'}`);
      return NextResponse.json(
        { error: 'הניתוח המבוקש לא נמצא' }, 
        { status: 404 }
      );
    }
    
    // בדיקה שהמשתמש שייך לאותה חברה
    const { data: userCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .eq('id', analysis.company_id)
      .single();
    
    const hasAccess = !!userCompany;
    console.log(`[API-ROUTE] האם למשתמש יש הרשאה לניתוח: ${hasAccess}`);
    
    if (!hasAccess) {
      console.error('[API-ROUTE] אין הרשאה לניתוח זה');
      return NextResponse.json(
        { error: 'אין הרשאת גישה לניתוח זה' }, 
        { status: 403 }
      );
    }

    console.log(`[API-ROUTE] מתחיל לנתח שיחה. מזהה: ${analysisId}, סוג: ${analysisType}`);
    
    // עדכון סטטוס ל-processing
    await supabase
      .from('call_analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    // קבלת פרטי החברה ועדכון
    console.log('[API-ROUTE] מבקש נתוני חברה וניתוח');
    const { data: analysisData, error: analysisError2 } = await supabase
      .from('call_analyses')
      .select('*, company:company_id(*)')
      .eq('id', analysisId)
      .single();
      
    if (analysisError2 || !analysisData) {
      console.error(`[API-ROUTE] שגיאה בקבלת נתוני ניתוח או חברה: ${analysisError2?.message || 'נתונים חסרים'}`);
      throw new Error(`לא נמצאו נתוני ניתוח או חברה: ${analysisError2?.message || 'נתונים חסרים'}`);
    }
    
    const callFileUrl = analysisData.recording_url;
    if (!callFileUrl) {
      console.error(`[API-ROUTE] קובץ הקלטה חסר בניתוח ${analysisId}`);
      throw new Error('קובץ הקלטה חסר');
    }
    
    const companyData = analysisData.company || {};
    console.log(`[API-ROUTE] נתוני חברה התקבלו: ${companyData?.name || 'חברה לא מזוהה'}`);

    // הורדת קובץ השמע
    console.log(`[API-ROUTE] מוריד קובץ שמע: ${callFileUrl}`);
    const audioResponse = await fetch(callFileUrl);
    if (!audioResponse.ok) {
      console.error(`[API-ROUTE] שגיאה בהורדת קובץ השמע: ${audioResponse.statusText}`);
      throw new Error(`שגיאה בהורדת קובץ השמע: ${audioResponse.statusText}`);
    }
    
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer]);
    console.log(`[API-ROUTE] קובץ שמע הורד בהצלחה, גודל: ${audioBlob.size} בייטים`);

    // תמלול עם GPT-4o-Transcribe
    console.log('[API-ROUTE] מתחיל תהליך תמלול עם GPT-4o-Transcribe');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    
    // בדיקה שיש מפתח API תקף
    if (!process.env.OPENAI_API_KEY) {
      console.error('[API-ROUTE] מפתח API של OpenAI חסר');
      throw new Error('מפתח API של OpenAI חסר');
    }
    
    // המרת ה-Blob לקובץ עם שם וסוג שיתאים ל-OpenAI API
    const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });
    
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-transcribe',
    });
    
    const transcription = transcriptionResponse.text;
    console.log(`[API-ROUTE] תמלול הושלם, אורך: ${transcription.length} תווים`);

    // עדכון התמלול במסד הנתונים
    console.log('[API-ROUTE] מעדכן תמלול במסד הנתונים');
    const { error: updateError } = await supabase
      .from('call_analyses')
      .update({ transcript: transcription })
      .eq('id', analysisId);
      
    if (updateError) {
      console.error(`[API-ROUTE] שגיאה בעדכון התמלול:`, updateError);
    }

    // ניתוח עם GPT-4.1-2025-04-14
    console.log('[API-ROUTE] מתחיל ניתוח עם GPT-4.1-2025-04-14');
    const promptContent = getPromptByAnalysisType(companyData, transcription, analysisType);
    const analysisCompletion = await openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: promptContent },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });
    
    const analysisResult = analysisCompletion.choices[0].message.content;
    console.log('[API-ROUTE] ניתוח הושלם בהצלחה');

    // עדכון תוצאות הניתוח במסד הנתונים
    console.log('[API-ROUTE] מעדכן תוצאות ניתוח במסד הנתונים');
    const { error: resultError } = await supabase
      .from('call_analyses')
      .update({
        analysis_result: analysisResult,
        status: 'done',
      })
      .eq('id', analysisId);
      
    if (resultError) {
      console.error('[API-ROUTE] שגיאה בעדכון תוצאות הניתוח:', resultError);
    }

    console.log('[API-ROUTE] תהליך ניתוח השיחה הושלם בהצלחה');
    return NextResponse.json({
      success: true,
      transcription,
      analysisResult,
    });
  } catch (error: any) {
    console.error('[API-ROUTE] שגיאה כללית בניתוח שיחה:', error);
    
    return NextResponse.json({
      error: error.message || 'אירעה שגיאה בניתוח השיחה',
    }, { status: 500 });
  }
} 