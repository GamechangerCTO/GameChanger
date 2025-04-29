/**
 * Edge Function לעיבוד ניתוחי שיחות
 * 
 * פונקציה זו פועלת כעבודת רקע שמטפלת בניתוחים חדשים
 * היא רצה בטריגר עיתי ומעבדת ניתוחים שנמצאים במצב 'processing'
 */

// @ts-ignore - דרוש רק בסביבת Deno
/// <reference types="https://raw.githubusercontent.com/denoland/deno/main/cli/dts/lib.deno.ns.d.ts" />
// @ts-ignore - דרוש רק בסביבת Deno
/// <reference types="https://esm.sh/v128/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-ignore
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import { OpenAI } from 'https://esm.sh/openai@4.26.0';
// @ts-ignore
import { getPromptByAnalysisType } from './promptTemplates.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('[BATCH-PROCESSOR] התחלת פונקציית עיבוד ניתוחים מרובים');
  console.log('[BATCH-PROCESSOR] קיבלתי בקשה:', req.method, req.url);
  
  try {
    // אתחול לקוח Supabase
    // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // אתחול לקוח OpenAI
    // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';
    const openai = new OpenAI({ apiKey: openaiApiKey });

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // קבלת רשימת ניתוחים במצב 'pending'
    const batchSize = 10; // מגדיל לעשרה ניתוחים בכל פעם
    const { data: analyses, error: fetchError } = await supabase
      .from('call_analyses')
      .select('*, company:company_id(*)')
      .eq('status', 'pending')
      .limit(batchSize);
      
    if (fetchError) {
      throw new Error(`Failed to fetch pending analyses: ${fetchError.message}`);
    }
    
    console.log(`[BATCH-PROCESSOR] נמצאו ${analyses.length} ניתוחים בסטטוס 'ממתין' לעיבוד`);
    
    if (analyses.length === 0) {
      console.log('[BATCH-PROCESSOR] אין ניתוחים בהמתנה לעיבוד');
      return new Response(JSON.stringify({
        message: 'No pending analyses found',
        processed: 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const results: Array<{ id: string, status: string, success: boolean }> = [];
    
    for (const analysis of analyses) {
      try {
        console.log(`[BATCH-PROCESSOR] מתחיל עיבוד ניתוח ${analysis.id}, סוג: ${analysis.analysis_type}`);
        
        // עדכון סטטוס ל-processing
        await supabase
          .from('call_analyses')
          .update({ status: 'processing' })
          .eq('id', analysis.id);
          
        // הורדת קובץ השמע
        console.log(`[BATCH-PROCESSOR] מוריד קובץ שמע: ${analysis.recording_url}`);
        const audioResponse = await fetch(analysis.recording_url);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio file: ${audioResponse.statusText}`);
        }
        
        const audioBlob = await audioResponse.blob();
        console.log(`[BATCH-PROCESSOR] קובץ שמע הורד בהצלחה, גודל: ${audioBlob.size} בייטים`);
        
        // תמלול עם GPT-4o-Transcribe
        console.log(`[BATCH-PROCESSOR] מתחיל תמלול עם GPT-4o-Transcribe`);
        const transcriptionResponse = await openai.audio.transcriptions.create({
          file: audioBlob,
          model: 'gpt-4o-transcribe',
        });
        
        const transcription = transcriptionResponse.text;
        console.log(`[BATCH-PROCESSOR] תמלול הושלם בהצלחה, אורך: ${transcription.length} תווים`);

        // עדכון התמלול במסד הנתונים
        console.log(`[BATCH-PROCESSOR] מעדכן תמלול במסד הנתונים`);
        const { error: transcriptError } = await supabase
          .from('call_analyses')
          .update({ transcript: transcription })
          .eq('id', analysis.id);
          
        if (transcriptError) {
          console.error(`[BATCH-PROCESSOR] שגיאה בעדכון תמלול: ${transcriptError.message}`);
        }

        // בחירת תבנית פרומפט מתאימה לסוג הניתוח
        const company = analysis.company || {};
        console.log(`[BATCH-PROCESSOR] יוצר פרומפט לניתוח סוג: ${analysis.analysis_type}`);
        const promptContent = getPromptByAnalysisType(
          company, 
          transcription,
          analysis.analysis_type
        );

        // ניתוח עם GPT-4.1-2025-04-14
        console.log(`[BATCH-PROCESSOR] מתחיל ניתוח עם GPT-4.1-2025-04-14`);
        const analysisCompletion = await openai.chat.completions.create({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: promptContent },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        });

        const analysisResult = analysisCompletion.choices[0].message.content;
        console.log(`[BATCH-PROCESSOR] ניתוח הושלם בהצלחה`);

        // עדכון תוצאות הניתוח במסד הנתונים
        console.log(`[BATCH-PROCESSOR] מעדכן תוצאות ניתוח במסד הנתונים`);
        const { error: resultError } = await supabase
          .from('call_analyses')
          .update({
            analysis_result: analysisResult,
            status: 'done'
          })
          .eq('id', analysis.id);
          
        if (resultError) {
          console.error(`[BATCH-PROCESSOR] שגיאה בעדכון תוצאות ניתוח: ${resultError.message}`);
        } else {
          console.log(`[BATCH-PROCESSOR] ניתוח ${analysis.id} הושלם בהצלחה ועודכן במסד הנתונים`);
        }
          
        results.push({
          id: analysis.id,
          status: 'done',
          success: true
        });
      } catch (analysisError: any) {
        console.error(`[BATCH-PROCESSOR] שגיאה בעיבוד ניתוח ${analysis.id}:`, analysisError);
        
        // עדכון סטטוס לכישלון
        await supabase
          .from('call_analyses')
          .update({ 
            status: 'failed', 
            error_message: analysisError.message || 'Unknown error' 
          })
          .eq('id', analysis.id);
          
        results.push({
          id: analysis.id,
          status: 'failed',
          success: false
        });
      }
    }
    
    console.log(`[BATCH-PROCESSOR] עיבוד מנה הסתיים בהצלחה. עובדו ${results.length} ניתוחים`);
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[BATCH-PROCESSOR] שגיאה כללית בעיבוד מנת ניתוחים:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process analyses batch', 
        details: errorMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 