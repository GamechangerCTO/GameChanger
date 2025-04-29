import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/api';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { analysisId } = await request.json();
    if (!analysisId) {
      return NextResponse.json({ error: 'חסר מזהה ניתוח' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    // עדכון סטטוס ל-processing
    await supabase
      .from('call_analyses')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', analysisId);

    // קריאה לפונקציית התמלול (POST פנימי)
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/analyze/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId }),
    });

    return NextResponse.json({ success: true, message: 'השלב הראשוני הושלם, תהליך התמלול התחיל', analysisId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'שגיאה לא ידועה' }, { status: 500 });
  }
} 