/**
 * API לניתוח שיחות מכירה
 * 
 * מבוסס על Edge Functions של Supabase
 * הקובץ יכול לרוץ רק בסביבת Deno של Supabase
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

// JSON schema for the analysis response
const analysisResponseSchema = {
  type: 'object',
  properties: {
    analysis: { type: 'string' },
    parameters: { type: 'array', items: { type: 'string' } },
    strengths: { type: 'array', items: { type: 'string' } },
    improvements: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
    totalScore: { type: 'number' }
  },
  required: ['analysis', 'parameters', 'strengths', 'improvements', 'recommendations', 'totalScore']
};

// Initialize OpenAI API
// @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

/**
 * פונקציה לבדיקת הרשאות גישה לניתוח
 * מחליפה את הקריאה לפונקציית RPC של Supabase
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
    console.error('Error checking analysis access:', error);
    return false;
  }
}

// Get the analysis for a call based on the transcription
export async function handler(req: Request) {
  try {
    // Load the request body
    const requestData = await req.json();
    const { transcription, callAnalysisId, companyId, analysisType = 'sales', userId } = requestData;
    
    if (!transcription) {
      return new Response(
        JSON.stringify({ error: 'Transcription is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // אם יש מזהה ניתוח וגם מזהה משתמש, יש לבצע בדיקת הרשאות
    if (callAnalysisId && userId) {
      const hasAccess = await checkAnalysisAccess(supabase, callAnalysisId, userId);
      if (!hasAccess) {
        return new Response(
          JSON.stringify({ error: 'Access denied to this analysis' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Fetch company details for context
    let company = {};
    if (companyId) {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (error) {
        console.error('Error fetching company', error);
      } else if (data) {
        company = data;
      }
    }

    // Setup OpenAI API
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is required' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the appropriate prompt based on analysis type
    const promptContent = getPromptByAnalysisType(company, transcription, analysisType);

    // Make request to the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: promptContent }],
        temperature: 0.5,
      }),
    });

    const result = await response.json();

    if (!result.choices || result.choices.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate analysis', details: result }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract the analysis from the response
    const rawAnalysis = result.choices[0].message.content;
    
    // Parse the JSON in the response
    let analysisContent;
    try {
      // Find JSON in the response (it might be wrapped in markdown code blocks)
      const jsonMatch = rawAnalysis.match(/```json\s*([\s\S]*?)\s*```/) || 
                         rawAnalysis.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, rawAnalysis];
      
      const jsonStr = jsonMatch[1].trim();
      analysisContent = JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing GPT response', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse analysis', 
          rawResponse: rawAnalysis 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update the analysis in the database if an ID was provided
    if (callAnalysisId) {
      const { error } = await supabase
        .from('call_analyses')
        .update({ 
          analysis_json: analysisContent,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', callAnalysisId);

      if (error) {
        console.error('Error updating analysis', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update analysis', 
            details: error,
            analysis: analysisContent
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, analysis: analysisContent }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request', error);
    // טיפול בשגיאה כשסוג הטעות אינו ידוע
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Analyze Call Edge Function
// @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[EDGE-FUNCTION] התחלת פונקציית ניתוח שיחה');
    
    const requestData = await req.json();
    const { analysisId, callFileUrl, analysisType = 'sales', userId } = requestData;

    console.log(`[EDGE-FUNCTION] התקבלה בקשה לניתוח ${analysisId}, סוג: ${analysisType}`);
    console.log(`[EDGE-FUNCTION] URL קובץ שמע: ${callFileUrl?.substring(0, 50)}...`);

    if (!analysisId || !callFileUrl) {
      console.error('[EDGE-FUNCTION] חסרים פרמטרים נדרשים');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          debug_info: {
            analysisId: !!analysisId,
            callFileUrl: !!callFileUrl
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch company information from Supabase
    // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[EDGE-FUNCTION] חסרים פרטי התחברות ל-Supabase');
      return new Response(
        JSON.stringify({ 
          error: 'Missing Supabase credentials',
          debug_info: {
            supabaseUrl: !!supabaseUrl,
            supabaseKey: !!supabaseKey
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // בדיקת הרשאות גישה לניתוח אם יש מזהה משתמש
    if (userId) {
      console.log(`[EDGE-FUNCTION] בודק הרשאות למשתמש ${userId}`);
      const hasAccess = await checkAnalysisAccess(supabase, analysisId, userId);
      if (!hasAccess) {
        console.error(`[EDGE-FUNCTION] אין הרשאות למשתמש ${userId} לניתוח ${analysisId}`);
        return new Response(
          JSON.stringify({ error: 'Access denied to this analysis' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update analysis status to processing
    console.log(`[EDGE-FUNCTION] מעדכן סטטוס ניתוח ${analysisId} ל-processing`);
    const { error: updateError } = await supabase
      .from('call_analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);
      
    if (updateError) {
      console.error(`[EDGE-FUNCTION] שגיאה בעדכון סטטוס ניתוח: ${updateError.message}`);
    }

    // Fetch company data for the analysis
    console.log(`[EDGE-FUNCTION] מבקש נתוני ניתוח וחברה עבור ${analysisId}`);
    const { data: analysisData, error: analysisError } = await supabase
      .from('call_analyses')
      .select('*, company:company_id(*)')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysisData) {
      console.error(`[EDGE-FUNCTION] שגיאה בקבלת נתוני ניתוח: ${analysisError?.message || 'לא נמצא'}`);
      throw new Error(`Failed to fetch analysis data: ${analysisError?.message || 'Not found'}`);
    }

    const company = analysisData.company || {};
    console.log(`[EDGE-FUNCTION] נתוני חברה התקבלו: ${company?.name || 'לא מזוהה'}`);

    // Transcribe audio using OpenAI Whisper
    console.log(`[EDGE-FUNCTION] מתחיל הורדת קובץ שמע: ${callFileUrl}`);
    const audioResponse = await fetch(callFileUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio file: ${audioResponse.statusText}`);
    }
    
    const audioBlob = await audioResponse.blob();
    console.log(`[EDGE-FUNCTION] קובץ שמע הורד בהצלחה, גודל: ${audioBlob.size} בייטים`);
    
    // Create OpenAI client
    // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Transcribe audio using Whisper
    console.log(`[EDGE-FUNCTION] מתחיל תמלול עם GPT-4o-Transcribe`);
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: audioBlob,
      model: 'gpt-4o-transcribe',
    });
    
    const transcription = transcriptionResponse.text;
    console.log(`[EDGE-FUNCTION] תמלול הושלם בהצלחה, אורך: ${transcription.length} תווים`);

    // Update with transcription
    console.log(`[EDGE-FUNCTION] מעדכן תמלול במסד הנתונים`);
    const { error: transcriptError } = await supabase
      .from('call_analyses')
      .update({ transcript: transcription })
      .eq('id', analysisId);
      
    if (transcriptError) {
      console.error(`[EDGE-FUNCTION] שגיאה בעדכון תמלול:`, transcriptError);
      throw new Error(`Failed to update transcript: ${transcriptError.message}`);
    }

    // Get the appropriate prompt template based on analysis type
    console.log(`[EDGE-FUNCTION] יוצר פרומפט לניתוח סוג: ${analysisType}`);
    const promptContent = getPromptByAnalysisType(company, transcription, analysisType);

    // Analyze with GPT-4.1
    console.log(`[EDGE-FUNCTION] מתחיל ניתוח עם GPT-4.1-2025-04-14`);
    const analysisCompletion = await openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: promptContent },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const analysisResult = analysisCompletion.choices[0].message.content;
    console.log(`[EDGE-FUNCTION] ניתוח הושלם בהצלחה`);

    // Update with analysis results
    console.log(`[EDGE-FUNCTION] מעדכן תוצאות ניתוח במסד הנתונים`);
    const { error: resultError } = await supabase
      .from('call_analyses')
      .update({
        analysis_result: analysisResult,
        status: 'done'
      })
      .eq('id', analysisId);
      
    if (resultError) {
      console.error(`[EDGE-FUNCTION] שגיאה בעדכון תוצאות ניתוח:`, resultError);
      throw new Error(`Failed to update analysis results: ${resultError.message}`);
    }

    console.log(`[EDGE-FUNCTION] תהליך ניתוח שיחה הושלם בהצלחה`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        transcription,
        analysisResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[EDGE-FUNCTION] שגיאה כללית בביצוע הניתוח:', error);

    // Update analysis status to error if analysis_id was provided
    try {
      // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      // @ts-ignore - Deno API יהיה זמין בסביבת ריצה של סופהבייס
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const requestData = await req.json();
      const { analysisId } = requestData;
      
      if (analysisId) {
        console.log(`[EDGE-FUNCTION] מעדכן סטטוס ניתוח ${analysisId} לכישלון`);
        await supabase
          .from('call_analyses')
          .update({ status: 'failed' })
          .eq('id', analysisId);
      }
    } catch (updateError) {
      console.error('[EDGE-FUNCTION] שגיאה בעדכון סטטוס ניתוח לכישלון:', updateError);
    }

    // טיפול בשגיאה כשסוג הטעות אינו ידוע
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process analysis', 
        details: errorMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 