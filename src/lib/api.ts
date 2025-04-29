import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { salesCallPrompt, serviceCallPrompt, appointmentSettingPrompt } from './prompts';

// פונקציה ליצירת מופע של OpenAI עם מפתח ה-API
export const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is missing');
  }
  return new OpenAI({ apiKey });
};

// פונקציה ליצירת מופע של Supabase עם מפתחות ה-API
export function getSupabaseAdmin() {
  console.log('[DEBUG] מנסה ליצור חיבור ל-Supabase Admin');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[FATAL] חסרים משתני סביבה NEXT_PUBLIC_SUPABASE_URL או SUPABASE_SERVICE_ROLE_KEY');
    throw new Error(
      'Missing environment variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }
  
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(180000) // 180 שניות timeout (3 דקות)
          });
        }
      }
    });
    
    return supabase;
  } catch (error) {
    console.error('[FATAL] שגיאה ביצירת חיבור ל-Supabase Admin:', error);
    throw error;
  }
}

// פונקציה לקבלת URL עם גישה ישירה לקובץ באמצעות Edge Function
export async function getFileSignedUrl(bucketName: string, filePath: string): Promise<string> {
  try {
    console.log(`[GET-URL] מבקש URL לקובץ ${filePath} בדלי ${bucketName}`);
    
    // קריאה לפונקציית Edge לקבלת URL חתום
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('חסר כתובת Supabase URL');
    }
    
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/get-file-url`;
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        bucketName,
        filePath
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`[GET-URL] שגיאה בקבלת URL: ${error}`);
      throw new Error(`שגיאה בקבלת URL לקובץ: ${error}`);
    }
    
    const data = await response.json();
    console.log(`[GET-URL] התקבל URL לקובץ: ${data.url?.substring(0, 50)}...`);
    
    return data.url;
  } catch (error: any) {
    console.error(`[GET-URL] שגיאה בקבלת URL לקובץ:`, error);
    throw new Error(`שגיאה בקבלת URL לקובץ: ${error.message}`);
  }
}

// פונקציה לתמלול קובץ שמע באמצעות whisper
export async function transcribeAudio(audioUrl: string): Promise<string> {
  console.log(`[TRANSCRIBE] מתחיל תמלול קובץ מ-URL: ${audioUrl.substring(0, 50)}...`);
  console.log(`[TRANSCRIBE-DEBUG] סוג ה-URL:`, typeof audioUrl);
  try {
    // וידוא שה-URL תקין
    if (!audioUrl || !audioUrl.startsWith('http')) {
      throw new Error(`כתובת URL לא תקינה: ${audioUrl}`);
    }
    
    // בדיקה אם זהו URL של Supabase Storage - אם כן, נבקש URL חתום
    if (audioUrl.includes('supabase.co/storage/v1/object')) {
      try {
        // הפרדת נתיב הקובץ מה-URL
        const urlParts = audioUrl.split('/storage/v1/object/');
        if (urlParts.length > 1) {
          const pathParts = urlParts[1].split('/');
          const bucketName = pathParts[1];  // אחרי public/
          const filePath = pathParts.slice(2).join('/');
          
          console.log(`[TRANSCRIBE] מבקש URL חתום לקובץ בנתיב: ${filePath} בדלי: ${bucketName}`);
          audioUrl = await getFileSignedUrl(bucketName, filePath);
        }
      } catch (urlError: any) {
        console.warn(`[TRANSCRIBE] שגיאה בהמרת URL לחתום: ${urlError.message}. ממשיך עם ה-URL המקורי.`);
      }
    }
    
    console.log(`[TRANSCRIBE] מוריד קובץ שמע מ-URL: ${audioUrl}`);
    
    // הורדת קובץ השמע מהשרת עם ניסיונות חוזרים
    let audioResponse;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        audioResponse = await fetch(audioUrl, { 
          headers: { 'Cache-Control': 'no-cache' } // מניעת שימוש במטמון 
        });
        
        if (audioResponse.ok) {
          break; // יציאה מהלולאה אם ההורדה הצליחה
        } else {
          console.warn(`[TRANSCRIBE] ניסיון ${retries + 1}/${maxRetries}: שגיאה בהורדת הקובץ. סטטוס: ${audioResponse.status} ${audioResponse.statusText}`);
          retries++;
          
          if (retries === maxRetries) {
            throw new Error(`נכשלו ${maxRetries} נסיונות להוריד את קובץ השמע. סטטוס: ${audioResponse.status} ${audioResponse.statusText}`);
          }
          
          // המתנה לפני הניסיון הבא
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (fetchError: any) {
        console.error(`[TRANSCRIBE] ניסיון ${retries + 1}/${maxRetries}: שגיאת רשת בהורדת הקובץ:`, fetchError);
        retries++;
        
        if (retries === maxRetries) {
          throw new Error(`נכשלו ${maxRetries} נסיונות להוריד את קובץ השמע: ${fetchError.message || 'שגיאה לא ידועה'}`);
        }
        
        // המתנה לפני הניסיון הבא
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!audioResponse || !audioResponse.ok) {
      throw new Error(`לא ניתן להוריד את קובץ השמע לאחר ${maxRetries} נסיונות`);
    }
    
    console.log(`[TRANSCRIBE] קובץ השמע הורד בהצלחה. סוג תוכן: ${audioResponse.headers.get('content-type')}. גודל: ${audioResponse.headers.get('content-length') || 'לא ידוע'} בייטים`);
    
    const audioBlob = await audioResponse.blob();
    console.log(`[TRANSCRIBE] גודל ה-Blob שהתקבל: ${audioBlob.size} בייטים. סוג MIME: ${audioBlob.type}`);
    
    if (audioBlob.size === 0) {
      throw new Error('קובץ השמע שהורד ריק (0 בייטים)');
    }
    
    // שליחת בקשה ישירה ל-API של OpenAI
    try {
      // יצירת קובץ מהבלוב עם שם
      // נוודא שיש סוג MIME תקין
      const contentType = audioBlob.type || 'audio/mpeg';
      // קביעת סיומת הקובץ בהתאם לסוג התוכן
      let fileExtension = 'mp3'; // ברירת מחדל
      if (contentType === 'audio/wav' || contentType === 'audio/wave' || contentType === 'audio/x-wav') {
        fileExtension = 'wav';
      } else if (contentType === 'audio/mp4' || contentType === 'audio/x-m4a') {
        fileExtension = 'm4a';
      } else if (contentType === 'audio/webm') {
        fileExtension = 'webm';
      } else if (contentType === 'audio/ogg' || contentType === 'audio/x-ogg') {
        fileExtension = 'ogg';
      }
      const fileName = `audio.${fileExtension}`;
      const file = new File([audioBlob], fileName, { type: contentType });
      console.log(`[TRANSCRIBE] נוצר קובץ לשליחה ל-OpenAI. שם: ${fileName}, סוג: ${contentType}, גודל: ${file.size} בייטים`);
      
      // תמלול השמע באמצעות OpenAI
      console.log('[TRANSCRIBE] שולח קובץ לתמלול ב-OpenAI עם מודל gpt-4o-transcribe');
      const openai = getOpenAI();
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: file,
        model: 'gpt-4o-transcribe',
        language: 'he', // שפה עברית
      });
      
      if (!transcriptionResponse.text) {
        console.warn('[TRANSCRIBE] התקבל תמלול ריק מ-OpenAI');
        return 'תמלול ריק';
      }
      
      console.log(`[TRANSCRIBE] תמלול הושלם בהצלחה. אורך התמלול: ${transcriptionResponse.text.length} תווים`);
      return transcriptionResponse.text;
    } catch (error: any) {
      console.error('[TRANSCRIBE] שגיאה בתמלול עם OpenAI SDK:', error);
      throw new Error(`שגיאה בתמלול עם OpenAI: ${error.message}`);
    }
  } catch (error: any) {
    console.error('[TRANSCRIBE] שגיאה כללית בתמלול השמע:', error);
    throw new Error(`שגיאה בתמלול השמע: ${error.message}`);
  }
}

// פונקציה לניתוח טקסט באמצעות gpt-4.1-2025-04-14
export async function analyzeTranscript(
  transcript: string,
  companyData: any,
  analysisType: string
): Promise<string> {
  try {
    // בחירת הפרומפט המתאים לסוג הניתוח
    let promptContent = '';
    
    switch (analysisType) {
      case 'sales':
        promptContent = salesCallPrompt(companyData, transcript);
        break;
      case 'service':
        promptContent = serviceCallPrompt(companyData, transcript);
        break;
      case 'appointment':
        promptContent = appointmentSettingPrompt(companyData, transcript);
        break;
      default:
        promptContent = salesCallPrompt(companyData, transcript);
    }
    
    // ניתוח הטקסט באמצעות OpenAI עם המודל החדש gpt-4.1-2025-04-14
    const openai = getOpenAI();
    const analysisCompletion = await openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: promptContent },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });
    
    return analysisCompletion.choices[0].message.content || '';
  } catch (error: any) {
    console.error('Error analyzing transcript:', error);
    throw new Error(`Failed to analyze transcript: ${error.message}`);
  }
}

// פונקציה לעדכון סטטוס הניתוח במסד הנתונים
export async function updateAnalysisStatus(
  analysisId: string,
  status: 'pending' | 'processing' | 'done' | 'error',
  data?: { transcript?: string, analysis_result?: string, error_message?: string }
): Promise<void> {
  try {
    console.log(`[LOG] עדכון סטטוס ניתוח ${analysisId} ל: ${status}`, data ? 'עם נתונים נוספים' : 'ללא נתונים נוספים');
    const supabase = getSupabaseAdmin();
    
    // יצירת אובייקט עדכון עם המרת שמות השדות לשמות הנכונים בטבלה
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // המרת השדות לשמות הנכונים (במקרה שיש אי התאמה בשמות שדות)
    if (data?.transcript) {
      updateData.transcription = data.transcript;
    }
    
    if (data?.analysis_result) {
      try {
        // ניסיון להמיר את תוצאת הניתוח ל-JSON אם היא מגיעה כמחרוזת
        const parsedResult = typeof data.analysis_result === 'string' 
          ? JSON.parse(data.analysis_result) 
          : data.analysis_result;
        
        updateData.report_data = parsedResult;
      } catch (error) {
        console.error('שגיאה בהמרת תוצאת ניתוח ל-JSON:', error);
        updateData.report_data = { error: 'שגיאה בהמרת תוצאת ניתוח' };
      }
    }
    
    if (data?.error_message) {
      updateData.report_data = { error: data.error_message };
    }
    
    console.log(`[LOG] מעדכן ניתוח ${analysisId} עם נתונים:`, updateData);
    
    const { error } = await supabase
      .from('call_analyses')
      .update(updateData)
      .eq('id', analysisId);
      
    if (error) {
      console.error(`[ERROR] שגיאה בעדכון הניתוח ${analysisId}:`, error);
      throw new Error(`שגיאה בעדכון הניתוח: ${error.message}`);
    }
    
    console.log(`[LOG] הניתוח ${analysisId} עודכן בהצלחה ל-${status}`);
  } catch (error) {
    console.error(`[ERROR] שגיאה בתהליך עדכון הניתוח ${analysisId}:`, error);
    throw error; // re-throw the error to handle it upstream
  }
}

// פונקציה לעיבוד ניתוח חדש
export async function processAnalysis(analysisId: string): Promise<void> {
  console.log(`[START] מתחיל עיבוד ניתוח ${analysisId} - גרסה משופרת ללא מגבלות זמן`);
  let supabase = null;
  
  // בדיקת משתני סביבה קריטיים
  console.log('[ENV-CHECK] בדיקת משתני סביבה:');
  console.log('[ENV-CHECK] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'קיים' : 'חסר!');
  console.log('[ENV-CHECK] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'קיים' : 'חסר!');
  console.log('[ENV-CHECK] OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'קיים' : 'חסר!');
  
  try {
    // יצירת חיבור supabase בתוך try-catch
    try {
      console.log('[DEBUG] לפני יצירת חיבור ל-Supabase Admin');
      supabase = getSupabaseAdmin();
      console.log('[DEBUG] חיבור ל-Supabase נוצר בהצלחה');
    } catch (supabaseError: any) {
      console.error('[FATAL] שגיאה ביצירת חיבור ל-Supabase:', supabaseError);
      // לא ניתן להמשיך אם אין חיבור תקין לסופאבייס
      throw new Error(`שגיאה ביצירת חיבור ל-Supabase: ${supabaseError.message}`);
    }
    
    console.log(`[LOG] מבקש נתוני ניתוח ${analysisId}`);
    
    // קבלת נתוני הניתוח
    const { data: existingAnalysis, error: checkError } = await supabase
      .from('call_analyses')
      .select('*, company:company_id(*)')
      .eq('id', analysisId)
      .single();
      
    if (checkError) {
      console.error(`[ERROR] שגיאה בקבלת נתוני ניתוח ${analysisId}:`, JSON.stringify(checkError, null, 2));
      await updateAnalysisStatus(analysisId, 'error', { error_message: `שגיאה בקבלת נתוני ניתוח: ${checkError.message}` });
      throw new Error(`שגיאה בקבלת נתוני ניתוח: ${checkError.message}`);
    }
    
    if (!existingAnalysis) {
      console.error(`[ERROR] ניתוח ${analysisId} לא נמצא במסד הנתונים`);
      await updateAnalysisStatus(analysisId, 'error', { error_message: 'ניתוח לא נמצא במסד הנתונים' });
      throw new Error('ניתוח לא נמצא');
    }
    
    // עדכון סטטוס לניתוח בתהליך
    await supabase
      .from('call_analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    const audioUrl = existingAnalysis.recording_url;
    console.log(`[LOG] התחלת תהליך ניתוח מלא. URL הקלטה: ${audioUrl?.substring(0, 50)}...`);

    // 1. בדיקת תקינות נתונים
    if (!audioUrl) {
      console.error(`[ERROR] חסר URL הקלטה לניתוח ${analysisId}`);
      await updateAnalysisStatus(analysisId, 'error', {
        error_message: 'חסר URL הקלטה לניתוח'
      });
      throw new Error('חסר URL הקלטה לניתוח');
    }
    
    if (!audioUrl.startsWith('http')) {
      console.error(`[ERROR] URL הקלטה לא תקין: ${audioUrl}`);
      await updateAnalysisStatus(analysisId, 'error', {
        error_message: 'URL הקלטה לא תקין'
      });
      throw new Error('URL הקלטה לא תקין');
    }

    // 2. תמלול ההקלטה
    console.log(`[LOG] מתחיל תמלול הקלטה`);
    let transcript;
    try {
      transcript = await transcribeAudio(audioUrl);
      console.log(`[LOG] תמלול הושלם בהצלחה, אורך: ${transcript.length} תווים`);
      
      // עדכון התמלול במסד הנתונים
      await supabase
        .from('call_analyses')
        .update({
          transcription: transcript
        })
        .eq('id', analysisId);
    } catch (transcribeError: any) {
      console.error(`[ERROR] שגיאה בתמלול:`, transcribeError);
      await updateAnalysisStatus(analysisId, 'error', {
        error_message: `שגיאה בתמלול: ${transcribeError.message}`
      });
      throw transcribeError;
    }
    
    // 3. ניתוח התמלול
    console.log(`[LOG] מתחיל ניתוח תמלול`);
    try {
      const analysisResult = await analyzeTranscript(
        transcript,
        existingAnalysis.company,
        existingAnalysis.analysis_type
      );
      console.log(`[LOG] ניתוח תמלול הושלם בהצלחה`);
      
      // פירוש התוצאות ועדכון הניתוח כמושלם
      let parsedResult;
      try {
        parsedResult = typeof analysisResult === 'string' 
          ? JSON.parse(analysisResult) 
          : analysisResult;
      } catch (parseError) {
        console.error(`[ERROR] שגיאה בפירוש תוצאות ניתוח כ-JSON:`, parseError);
        parsedResult = { error: 'שגיאה בפירוש תוצאות הניתוח' };
      }
      
      await supabase
        .from('call_analyses')
        .update({ 
          report_data: parsedResult,
          status: 'done'
        })
        .eq('id', analysisId);
        
      console.log(`[SUCCESS] ניתוח ${analysisId} הושלם בהצלחה`);
      return;
    } catch (analysisError: any) {
      console.error(`[ERROR] שגיאה בניתוח התמלול:`, analysisError);
      await updateAnalysisStatus(analysisId, 'error', {
        error_message: `שגיאה בניתוח התמלול: ${analysisError.message}`
      });
      throw analysisError;
    }
  } catch (error: any) {
    console.error(`[ERROR] שגיאה כללית בניתוח ${analysisId}:`, error);
    
    // וידוא שהסטטוס מעודכן לשגיאה בכל מקרה
    try {
      await updateAnalysisStatus(analysisId, 'error', {
        error_message: error.message || 'שגיאה לא ידועה'
      });
    } catch (updateError) {
      console.error(`[ERROR] שגיאה בעדכון סטטוס שגיאה:`, updateError);
    }
    
    throw error;
  }
}

// פונקציה למחיקת ניתוח
export async function deleteAnalysis(analysisId: string): Promise<void> {
  console.log(`[START] מתחיל מחיקת ניתוח ${analysisId}`);
  try {
    const supabase = getSupabaseAdmin();
    
    // קבלת פרטי הניתוח כדי לדעת את כתובת הקובץ
    console.log(`[LOG] מבקש נתוני ניתוח ${analysisId} לפני מחיקה`);
    const { data: analysis, error: fetchError } = await supabase
      .from('call_analyses')
      .select('recording_url')
      .eq('id', analysisId)
      .single();
      
    if (fetchError) {
      console.error(`[ERROR] שגיאה בקבלת פרטי ניתוח ${analysisId}:`, fetchError);
    }
    
    // מחיקת הניתוח ממסד הנתונים
    console.log(`[LOG] מוחק ניתוח ${analysisId} ממסד הנתונים`);
    const { error: deleteError } = await supabase
      .from('call_analyses')
      .delete()
      .eq('id', analysisId);
      
    if (deleteError) {
      console.error(`[ERROR] שגיאה במחיקת ניתוח ${analysisId}:`, deleteError);
      throw new Error(`Failed to delete analysis: ${deleteError.message}`);
    }
    
    // אם יש כתובת הקלטה, מחק גם את הקובץ
    if (analysis?.recording_url) {
      try {
        // הפרדת הנתיב מה-URL המלא של הקובץ
        console.log(`[LOG] מנסה למחוק קובץ הקלטה: ${analysis.recording_url}`);
        const fileUrl = new URL(analysis.recording_url);
        const pathParts = fileUrl.pathname.split('/');
        // יש להפריד מהמסלול את הנתיב בתוך ה-storage
        // בד"כ הפורמט הוא /storage/v1/object/public/[bucket]/[path]
        const storagePath = pathParts.slice(5).join('/');
        
        if (storagePath) {
          const { error: storageError } = await supabase.storage
            .from('call_recordings')
            .remove([storagePath]);
            
          if (storageError) {
            console.warn(`[WARN] שגיאה במחיקת קובץ הקלטה:`, storageError);
          } else {
            console.log(`[LOG] קובץ הקלטה נמחק בהצלחה`);
          }
        }
      } catch (fileError) {
        console.warn(`[WARN] שגיאה בניסיון למחוק קובץ הקלטה:`, fileError);
      }
    }
    
    console.log(`[SUCCESS] ניתוח ${analysisId} נמחק בהצלחה`);
  } catch (error: any) {
    console.error(`[ERROR] שגיאה במחיקת ניתוח ${analysisId}:`, error);
    throw error;
  }
}