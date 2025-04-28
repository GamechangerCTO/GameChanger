import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deleteAnalysis } from '@/lib/api';

// Helper function to create a Supabase client with admin permissions
const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// קבלת פרטי ניתוח
export async function GET(req: NextRequest) {
  try {
    // שליפת ה-id מה-URL
    const url = req.nextUrl;
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'לא סופק מזהה ניתוח' },
        { status: 400 }
      );
    }
    const analysisId = id;
    const supabase = createServerClient();
    
    // בדיקת הרשאות - גישה רק למשתמשים מחוברים
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'נדרשת התחברות לצפייה בניתוח' },
        { status: 401 }
      );
    }
    
    // בדיקה שהמשתמש יכול לגשת לניתוח זה
    const userId = session.user.id;
    
    // קבלת פרטי הניתוח
    const { data: analysis, error: analysisError } = await supabase
      .from('call_analyses')
      .select('*, company:company_id(*)')
      .eq('id', analysisId)
      .single();
      
    if (analysisError) {
      return NextResponse.json(
        { error: 'הניתוח המבוקש לא נמצא' },
        { status: 404 }
      );
    }
    
    // בדיקה שהמשתמש שייך לאותה חברה
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .eq('id', analysis.company_id)
      .single();
      
    if (companyError || !company) {
      return NextResponse.json(
        { error: 'אין הרשאת גישה לניתוח זה' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'אירעה שגיאה בטעינת פרטי הניתוח' },
      { status: 500 }
    );
  }
}

// מחיקת ניתוח
export async function DELETE(req: NextRequest) {
  try {
    // שליפת ה-id מה-URL
    const url = req.nextUrl;
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'לא סופק מזהה ניתוח' },
        { status: 400 }
      );
    }
    const analysisId = id;
    const supabase = createServerClient();
    
    // בדיקת הרשאות - גישה רק למשתמשים מחוברים
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'נדרשת התחברות למחיקת ניתוח' },
        { status: 401 }
      );
    }
    
    // בדיקה שהמשתמש יכול לגשת לניתוח זה
    const userId = session.user.id;
    
    // קבלת פרטי הניתוח
    const { data: analysis, error: analysisError } = await supabase
      .from('call_analyses')
      .select('company_id')
      .eq('id', analysisId)
      .single();
      
    if (analysisError) {
      return NextResponse.json(
        { error: 'הניתוח המבוקש לא נמצא' },
        { status: 404 }
      );
    }
    
    // בדיקה שהמשתמש שייך לאותה חברה
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .eq('id', analysis.company_id)
      .single();
      
    if (companyError || !company) {
      return NextResponse.json(
        { error: 'אין הרשאת גישה למחיקת ניתוח זה' },
        { status: 403 }
      );
    }
    
    // מחיקת הניתוח
    await deleteAnalysis(analysisId);
    
    return NextResponse.json({
      success: true,
      message: 'הניתוח נמחק בהצלחה'
    });
  } catch (error: any) {
    console.error('[API-ROUTE] שגיאה במחיקת ניתוח:', error);
    return NextResponse.json(
      { error: error.message || 'אירעה שגיאה במחיקת הניתוח' },
      { status: 500 }
    );
  }
} 