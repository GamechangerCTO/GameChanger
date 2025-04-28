# GameChanger

מערכת לניתוח שיחות מכירה ושירות המבוססת על AI.

## תכונות

- ניתוח שיחות מכירה ושירות
- זיהוי חוזקות ונקודות לשיפור
- יצירת אוגדני מכירות ושירות
- ניתוח דאטה של לקוחות

## פריסה ב-Vercel

פרויקט זה מוכן לפריסה בשירות [Vercel](https://vercel.com).

### הוראות פריסה:

1. **העלה את הקוד ל-Git**
   ```bash
   git add .
   git commit -m "הכנה לפריסה בורסל"
   git push
   ```

2. **חבר את ה-Repository ל-Vercel**
   - היכנס ל-[Vercel Dashboard](https://vercel.com/dashboard)
   - לחץ על "New Project"
   - חבר את ה-Git repository
   - בחר את התיקייה הראשית של הפרויקט (`gamechang`)

3. **הגדר משתני סביבה**
   לאחר יצירת הפרויקט ב-Vercel, הגדר את משתני הסביבה הבאים:
   - `NEXT_PUBLIC_SUPABASE_URL` - כתובת ה-Supabase שלך
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - מפתח אנונימי של Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - מפתח שירות של Supabase
   - `OPENAI_API_KEY` - מפתח API של OpenAI

4. **הפעל פריסה**
   - לחץ על "Deploy" לפריסת האפליקציה

### פיתוח מקומי

```bash
# התקנת תלויות
npm install

# הפעלת שרת פיתוח
npm run dev

# בניית הפרויקט לפריסה
npm run build

# הפעלת שרת ייצור מקומי
npm run start
```

## טכנולוגיות

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [OpenAI API](https://openai.com/blog/openai-api/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## מידע נוסף

לשאלות או תמיכה, אנא צור קשר עם צוות הפיתוח.
