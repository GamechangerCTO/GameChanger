import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, analyzeTranscript } from '@/lib/api';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { analysisId } = await request.json();
    if (!analysisId) {
      return NextResponse.json({ error: 'חסר מזהה ניתוח' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    // עדכון סטטוס ל-analyzing
    await supabase
      .from('call_analyses')
      .update({ status: 'analyzing', updated_at: new Date().toISOString() })
      .eq('id', analysisId);

    // שליפת תמלול, סוג ניתוח ונתוני חברה
    const { data, error } = await supabase
      .from('call_analyses')
      .select('transcription, analysis_type, company:company_id(*)')
      .eq('id', analysisId)
      .single();
    if (error || !data?.transcription) {
      await supabase
        .from('call_analyses')
        .update({ status: 'error', report_data: { error: 'חסר תמלול' } })
        .eq('id', analysisId);
      return NextResponse.json({ error: 'חסר תמלול' }, { status: 400 });
    }

    // ניתוח
    let analysisResult = '';
    try {
      analysisResult = await analyzeTranscript(
        data.transcription,
        data.company,
        data.analysis_type
      );
    } catch (err: any) {
      await supabase
        .from('call_analyses')
        .update({ status: 'error', report_data: { error: err.message } })
        .eq('id', analysisId);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    // שמירת תוצאת הניתוח וסיום
    let reportDataToSave = analysisResult;
    try {
      // ננסה להמיר ל-JSON אם זו מחרוזת JSON
      if (typeof analysisResult === 'string') {
        reportDataToSave = JSON.parse(analysisResult);
      }
    } catch (e) {
      // אם לא הצליח להמיר, נשמור כמחרוזת
      reportDataToSave = analysisResult;
    }
    await supabase
      .from('call_analyses')
      .update({ report_data: reportDataToSave, status: 'done', updated_at: new Date().toISOString() })
      .eq('id', analysisId);

    return NextResponse.json({ success: true, message: 'הניתוח הסתיים', analysisId, result: reportDataToSave });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'שגיאה לא ידועה' }, { status: 500 });
  }
} 