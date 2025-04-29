import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, transcribeAudio } from '@/lib/api';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { analysisId } = await request.json();
    if (!analysisId) {
      return NextResponse.json({ error: 'חסר מזהה ניתוח' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    // עדכון סטטוס ל-transcribing
    await supabase
      .from('call_analyses')
      .update({ status: 'transcribing', updated_at: new Date().toISOString() })
      .eq('id', analysisId);

    // שליפת כתובת קובץ השמע
    const { data, error } = await supabase
      .from('call_analyses')
      .select('recording_url')
      .eq('id', analysisId)
      .single();
    if (error || !data?.recording_url) {
      await supabase
        .from('call_analyses')
        .update({ status: 'error', report_data: { error: 'חסר קובץ שמע' } })
        .eq('id', analysisId);
      return NextResponse.json({ error: 'חסר קובץ שמע' }, { status: 400 });
    }

    // תמלול
    let transcript = '';
    try {
      transcript = await transcribeAudio(data.recording_url);
    } catch (err: any) {
      await supabase
        .from('call_analyses')
        .update({ status: 'error', report_data: { error: err.message } })
        .eq('id', analysisId);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    // שמירת התמלול
    await supabase
      .from('call_analyses')
      .update({ transcription: transcript, updated_at: new Date().toISOString() })
      .eq('id', analysisId);

    // קריאה לפונקציית הניתוח (POST פנימי)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
      throw new Error('חסר משתנה סביבה NEXT_PUBLIC_SITE_URL. יש להגדיר אותו לכתובת הבסיס של האתר (כולל https://)');
    }
    await fetch(`${baseUrl}/api/analyze/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId }),
    });

    return NextResponse.json({ success: true, message: 'התמלול נשמר, תהליך הניתוח התחיל', analysisId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'שגיאה לא ידועה' }, { status: 500 });
  }
} 