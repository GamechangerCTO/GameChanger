/**
 * סקריפט לבדיקת תמלול קובץ שמע
 * 
 * להרצה:
 * node scripts/test-transcription.js URL_TO_AUDIO_FILE
 */

// מטען סביבה עבור משתני סביבה
require('dotenv').config({ path: '.env.local' });

const OpenAI = require('openai');

async function transcribeAudio(audioUrl) {
  try {
    // הורדת קובץ השמע
    const fetch = await import('node-fetch').then(mod => mod.default);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio file: ${audioResponse.statusText}`);
    }
    
    // קבלת הקובץ כ-ArrayBuffer
    const arrayBuffer = await audioResponse.arrayBuffer();
    // יצירת Buffer מה-ArrayBuffer
    const buffer = Buffer.from(arrayBuffer);
    
    // יצירת אינסטנס של OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    console.log('מתחיל תמלול...');
    
    // תמלול עם whisper
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: {
        data: buffer,
        name: 'audio.mp3',
        type: 'audio/mpeg'
      },
      model: 'whisper-1',
      language: 'he', // שפה עברית
    });
    
    console.log('סיים תמלול בהצלחה!');
    console.log('------ תמלול השיחה ------');
    console.log(transcriptionResponse.text);
    console.log('------ סוף תמלול ------');
    
    return transcriptionResponse.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

// קבלת URL לקובץ שמע מארגומנטים
const audioUrl = process.argv[2];

if (!audioUrl) {
  console.error('יש לספק URL לקובץ שמע');
  console.error('שימוש: node scripts/test-transcription.js URL_TO_AUDIO_FILE');
  process.exit(1);
}

// הרצת התמלול
transcribeAudio(audioUrl)
  .catch(error => {
    console.error('שגיאה:', error);
    process.exit(1);
  }); 