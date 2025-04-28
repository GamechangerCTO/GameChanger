import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// קובץ זה מוסיף שכבת אבטחה לכל נתיבי ה-API במערכת
// הוא בודק שהמשתמש מחובר לפני שהוא מאפשר גישה לנתיבי API רגישים

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function middleware(req: NextRequest) {
  // יצירת לקוח Supabase מיוחד למידלוור
  const res = NextResponse.next();
  
  // בקשות OPTIONS מותרות לכל משתמש (עבור CORS)
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  // נתיבים שדורשים אימות
  const protectedPaths = ['/api/analyze-call', '/api/check-analysis-access'];

  // בדיקה אם הנתיב הנוכחי הוא בין הנתיבים המוגנים
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );
  
  // אם זה נתיב מוגן, בדוק אימות
  if (isProtectedPath) {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    
    // אם אין משתמש מחובר, מחזיר שגיאת אימות
    if (!session) {
      // ודא שה-cookie מועבר בתגובה
      // מדפדפן זה חשוב כדי לשמור על אחידות המשתמש
      res.cookies.set('sb-auth-token', '', {
        expires: new Date(0),
        path: '/'
      });
      
      return NextResponse.json(
        { error: 'אין הרשאת גישה - נדרש להתחבר' },
        { 
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // שמירת ה-token ב-cookie שהקוד שלנו יודע לקרוא
    // זה חשוב כי לקוד שלנו אין גישה ישירה ל-session
    if (session) {
      const token = session.access_token;
      res.cookies.set('sb-auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // שבוע
      });
    }
  }

  // הוסף CORS headers לכל התגובות
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  return res;
}

// הגדרת הנתיבים שהמידלוור יפעל עליהם
export const config = {
  matcher: [
    // הגנה על כל הנתיבים תחת /api
    '/api/:path*'
  ],
}; 