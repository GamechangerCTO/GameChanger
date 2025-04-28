import { NextApiRequest, NextApiResponse } from 'next';
import { processAnalysis } from '../../lib/api';

/**
 * API endpoint לעיבוד ניתוח בשלבים
 * מפוצל לקריאות קצרות שמסתיימות תוך פחות מ-10 שניות כדי לעקוף את מגבלת הזמן של הורסל
 * 
 * ניתן להפעיל את ה-API:
 * 1. POST /api/process-analysis?id=XXX - התחלת ניתוח חדש או המשך ניתוח בתהליך
 * 2. GET /api/process-analysis?id=XXX - בדיקת מצב ניתוח
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // בדיקה שיש מזהה ניתוח
    const analysisId = req.query.id as string;
    if (!analysisId) {
      return res.status(400).json({ error: 'חסר מזהה ניתוח (id)' });
    }
    
    // במקרה של GET - החזרת סטטוס תהליך
    if (req.method === 'GET') {
      // כאן אפשר להרחיב ולהוסיף בדיקת סטטוס במסד הנתונים
      return res.status(200).json({ 
        id: analysisId,
        message: 'בדיקת מצב התהליך - יש לבדוק את המצב במסד הנתונים'
      });
    }
    
    // במקרה של POST - הפעלת התהליך
    if (req.method === 'POST') {
      // שליחת תשובה מהירה לשרת לפני תחילת העיבוד
      // כדי למנוע timeout של HTTP והתנתקות
      res.status(202).json({ 
        id: analysisId, 
        message: 'ניתוח בעיבוד בשלב הבא' 
      });
      
      // המשך הפעלת התהליך במקביל - הלקוח כבר קיבל תשובה
      try {
        await processAnalysis(analysisId);
      } catch (error) {
        console.error(`[API] שגיאה בעיבוד ניתוח ${analysisId}:`, error);
        // לא שולחים שגיאה ללקוח כי כבר שלחנו תשובה
      }
      
      return;
    }
    
    // שיטה לא נתמכת
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `שיטה ${req.method} אינה נתמכת` });
    
  } catch (error: any) {
    console.error('[API] שגיאה כללית:', error);
    // כדי למנוע שגיאת headers already sent לאחר שכבר שלחנו תשובה
    if (!res.headersSent) {
      res.status(500).json({ error: `שגיאה כללית: ${error.message}` });
    }
  }
} 