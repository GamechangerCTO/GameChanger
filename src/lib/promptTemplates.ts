/**
 * קובץ תבניות פרומפטים (Prompt Templates) עבור ניתוחי שיחות
 * קובץ זה מכיל את כל התבניות לניתוחי AI לסוגים שונים של שיחות
 */

/**
 * בונה את הקונטקסט של החברה מפרטי החברה
 */
export const buildCompanyContext = (company: any): string => {
  return `
מידע אודות החברה:

שם: ${company.name || 'לא צוין'}
סגמנט: ${company.segment || 'לא צוין'}
פרטי מוצר: ${company.product_details || 'לא צוין'}
קהל יעד: ${company.target_audience || 'לא צוין'}
יתרונות: ${company.advantages || 'לא צוין'}
בידול: ${company.differentiation || 'לא צוין'}
תיאור: ${company.description || 'לא צוין'}
תעשייה: ${company.industry || 'לא צוין'}
מוצרים ושירותים: ${company.products_services || 'לא צוין'}
הצעת ערך: ${company.value_proposition || 'לא צוין'}
תחרות: ${company.competition || 'לא צוין'}
`;
};

/**
 * פרומפט לניתוח שיחת מכירה
 */
export const salesCallPrompt = (companyContext: string, transcription: string): string => {
  return `אתה מומחה בניתוח שיחות מכירה. אנא נתח את התמלול הבא של שיחת מכירה:

${companyContext}

תמלול השיחה:
${transcription}

אנא נתח את השיחה בהתאם לקריטריונים הבאים:

1. הצגת מוצר/שירות
2. זיהוי צרכים ושאלות אפקטיביות
3. התמודדות עם התנגדויות
4. תהליך סגירה
5. ביטחון עצמי ומקצועיות המוכר

הפק ניתוח מובנה, כולל:
- פרמטרים מרכזיים שזוהו בשיחה
- חוזקות בשיחה
- נקודות לשיפור
- המלצות מעשיות
- ציון כולל מ-1 עד 100

ענה בפורמט JSON בלבד עם המבנה הבא:
{
  "analysis": "ניתוח מפורט של השיחה כולל התייחסות לכל הקריטריונים",
  "parameters": ["פרמטר 1", "פרמטר 2", "..."],
  "strengths": ["חוזקה 1", "חוזקה 2", "..."],
  "improvements": ["נקודה לשיפור 1", "נקודה לשיפור 2", "..."],
  "recommendations": ["המלצה 1", "המלצה 2", "..."],
  "totalScore": 85
}`;
};

/**
 * פרומפט לניתוח שיחת שירות
 */
export const serviceCallPrompt = (companyContext: string, transcription: string): string => {
  return `אתה מומחה בניתוח שיחות שירות לקוחות. אנא נתח את התמלול הבא של שיחת שירות:

${companyContext}

תמלול השיחה:
${transcription}

אנא נתח את השיחה בהתאם לקריטריונים הבאים:

1. הפגנת אמפתיה והבנה
2. זמן תגובה וטיפול בבעיה
3. הצעת פתרונות יצירתיים
4. הרגעת לקוחות מתוסכלים
5. מקצועיות ובקיאות בפתרונות

הפק ניתוח מובנה, כולל:
- פרמטרים מרכזיים שזוהו בשיחה
- חוזקות בשיחה
- נקודות לשיפור
- המלצות מעשיות
- ציון כולל מ-1 עד 100

ענה בפורמט JSON בלבד עם המבנה הבא:
{
  "analysis": "ניתוח מפורט של השיחה כולל התייחסות לכל הקריטריונים",
  "parameters": ["פרמטר 1", "פרמטר 2", "..."],
  "strengths": ["חוזקה 1", "חוזקה 2", "..."],
  "improvements": ["נקודה לשיפור 1", "נקודה לשיפור 2", "..."],
  "recommendations": ["המלצה 1", "המלצה 2", "..."],
  "totalScore": 85
}`;
};

/**
 * פרומפט לניתוח שיחת תיאום פגישה
 */
export const appointmentSettingPrompt = (companyContext: string, transcription: string): string => {
  return `אתה מומחה בניתוח שיחות תיאום פגישות. אנא נתח את התמלול הבא של שיחת תיאום פגישה:

${companyContext}

תמלול השיחה:
${transcription}

אנא נתח את השיחה בהתאם לקריטריונים הבאים:

1. יצירת עניין וערך בפגישה
2. התמודדות עם דחיות
3. יכולת קביעת מועד ספציפי
4. סיכום ותיאום ציפיות
5. מקצועיות והתאמה לצרכי הלקוח

הפק ניתוח מובנה, כולל:
- פרמטרים מרכזיים שזוהו בשיחה
- חוזקות בשיחה
- נקודות לשיפור
- המלצות מעשיות
- ציון כולל מ-1 עד 100

ענה בפורמט JSON בלבד עם המבנה הבא:
{
  "analysis": "ניתוח מפורט של השיחה כולל התייחסות לכל הקריטריונים",
  "parameters": ["פרמטר 1", "פרמטר 2", "..."],
  "strengths": ["חוזקה 1", "חוזקה 2", "..."],
  "improvements": ["נקודה לשיפור 1", "נקודה לשיפור 2", "..."],
  "recommendations": ["המלצה 1", "המלצה 2", "..."],
  "totalScore": 85
}`;
};

/**
 * פונקציה ראשית לקבלת פרומפט המתאים לסוג הניתוח
 */
export const getPromptByAnalysisType = (company: any, transcription: string, analysisType: string): string => {
  const companyContext = buildCompanyContext(company);
  
  const promptMap = {
    sales: salesCallPrompt(companyContext, transcription),
    service: serviceCallPrompt(companyContext, transcription),
    appointment_setting: appointmentSettingPrompt(companyContext, transcription)
  };
  
  return promptMap[analysisType as keyof typeof promptMap] || promptMap.sales;
}; 