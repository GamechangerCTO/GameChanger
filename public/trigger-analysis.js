/**
 * סקריפט פשוט להפעלת ניתוח באופן ישיר
 * 
 * איך להשתמש:
 * 1. פתח את הדפדפן ב-/trigger-analysis.js
 * 2. הוסף את הפרמטרים הרצויים בשורת הכתובת, לדוגמה:
 *    /trigger-analysis.js?id=123456&key=webhook_secret_key_2025
 */

// קבלת פרמטרים מה-URL
const urlParams = new URLSearchParams(window.location.search);
const analysisId = urlParams.get('id');
const secretKey = urlParams.get('key');

// וידוא שקיימים פרמטרים
if (!analysisId || !secretKey) {
  document.body.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #d97706;">חסרים פרמטרים</h2>
      <p>נדרש לספק מזהה ניתוח ומפתח סודי.</p>
      <p>דוגמה: <code>/trigger-analysis.js?id=123456&key=webhook_secret_key_2025</code></p>
    </div>
  `;
} else {
  // שליחת בקשה ישירות לwebhook
  fetch('/api/webhook/process-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysisId,
      secretKey
    }),
  })
  .then(response => response.json())
  .then(result => {
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: ${result.success ? '#059669' : '#dc2626'};">
          ${result.success ? 'תהליך הניתוח החל בהצלחה' : 'שגיאה בהפעלת התהליך'}
        </h2>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto;">${JSON.stringify(result, null, 2)}</pre>
        <p><a href="/analyses/${analysisId}" style="color: #d97706; text-decoration: none;">חזרה לדף הניתוח</a></p>
      </div>
    `;
  })
  .catch(error => {
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #dc2626;">שגיאה בהפעלת תהליך הניתוח</h2>
        <p>${error.message}</p>
        <p><a href="/analyses/${analysisId}" style="color: #d97706; text-decoration: none;">חזרה לדף הניתוח</a></p>
      </div>
    `;
  });
  
  document.body.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #d97706;">מפעיל תהליך ניתוח...</h2>
      <p>מזהה ניתוח: ${analysisId}</p>
      <div style="margin: 20px 0; text-align: center;">
        <div style="width: 50px; height: 50px; border: 5px solid #f3f4f6; border-top-color: #d97706; border-radius: 50%; display: inline-block; animation: spin 1s linear infinite;"></div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
} 