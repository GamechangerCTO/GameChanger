import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API לבדיקת הרשאות גישה לניתוח
 * 
 * מחליף את פונקציית ה-RPC של Supabase - check_analysis_access
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysis_id } = body;
    
    if (!analysis_id) {
      return NextResponse.json({ error: 'מזהה ניתוח חסר' }, { status: 400 });
    }

    // קבלת מידע אימות מה-cookie
    const authCookie = req.cookies.get('sb-auth-token');
    if (!authCookie || !authCookie.value) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }
    
    // יצירת לקוח סופאבייס
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // פענוח הטוקן כדי לקבל את מזהה המשתמש
    // נשים לב שזה מבוצע כאן בקוד במקום ב-PostgreSQL
    const { data: userData, error: authError } = await supabase.auth.getUser(authCookie.value);
    
    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'משתמש לא תקף' }, { status: 401 });
    }
    
    const userId = userData.user.id;
    
    // בדיקת גישה לניתוח - האם הוא שייך למשתמש עצמו
    const { data: directAccess, error: directError } = await supabase
      .from('call_analyses')
      .select('id')
      .eq('id', analysis_id)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (directAccess) {
      return NextResponse.json({ has_access: true });
    }
    
    // בדיקת גישה לניתוח - האם הוא שייך לחברה של המשתמש
    const { data: companyAccess, error: companyError } = await supabase
      .from('call_analyses')
      .select('id, company_id')
      .eq('id', analysis_id)
      .single();
      
    if (companyError || !companyAccess) {
      return NextResponse.json({ error: 'ניתוח לא נמצא' }, { status: 404 });
    }
    
    // בדיקה אם המשתמש שייך לחברה של הניתוח
    const { data: userCompany, error: userCompanyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyAccess.company_id)
      .eq('user_id', userId)
      .maybeSingle();
      
    // החזרת תוצאת בדיקת ההרשאות
    return NextResponse.json({ 
      has_access: !!userCompany 
    });
    
  } catch (error: any) {
    console.error('שגיאה בבדיקת הרשאות גישה:', error);
    return NextResponse.json(
      { error: 'שגיאת שרת פנימית' }, 
      { status: 500 }
    );
  }
} 