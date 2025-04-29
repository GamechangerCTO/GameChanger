/**
 * קובץ תבניות פרומפטים (Prompt Templates) עבור ניתוחי שיחות
 * קובץ זה מכיל את כל התבניות לניתוחי AI לסוגים שונים של שיחות
 */

/**
 * בונה את הקונטקסט של החברה מפרטי החברה
 */
export function buildCompanyContext(company) {
  return `
Company Information:
- Company Name: ${company.name || 'Unknown'}
- Industry: ${company.industry || 'Unknown'}
- Target Audience: ${company.target_audience || 'Unknown'}
- Key Products or Services: ${company.products_services || 'Unknown'}
- Unique Selling Proposition: ${company.usp || 'Unknown'}
- Standard Greeting: ${company.standard_greeting || 'None specified'}
- Common Pain Points of Customers: ${company.pain_points || 'Unknown'}
${company.additional_context ? `- Additional Context: ${company.additional_context}` : ''}
`;
}

/**
 * פרומפט לניתוח שיחת מכירה
 */
export function salesCallPrompt(company, transcript) {
  return `
You are an expert sales coach analyzing a sales call. Please evaluate the conversation based on the following criteria:
${buildCompanyContext(company)}

Analyze the following call transcript focusing on:
1. Did the salesperson effectively identify and address customer pain points?
2. Was the value proposition clearly communicated?
3. How well did the salesperson handle objections?
4. Did they use effective questioning techniques?
5. Did they build rapport effectively?
6. Did they set clear next steps?
7. Was their tone appropriate and professional?
8. Did they listen actively and avoid interrupting?
9. Did they effectively use silence/pauses?
10. Did they close appropriately?

Please provide:
1. A brief analysis summary (2-3 paragraphs)
2. A list of parameters evaluated (from the criteria above)
3. 3-5 strengths demonstrated in the call
4. 3-5 areas for improvement
5. Specific, actionable recommendations
6. An overall score from 1-10

Format your response in valid JSON matching this schema:
{
  "analysis": "string",
  "parameters": ["string"],
  "strengths": ["string"],
  "improvements": ["string"],
  "recommendations": ["string"],
  "totalScore": number
}

Call Transcript:
${transcript}`;
}

/**
 * פרומפט לניתוח שיחת שירות
 */
export function serviceCallPrompt(company, transcript) {
  return `
You are an expert customer service coach analyzing a service call. Please evaluate the conversation based on the following criteria:
${buildCompanyContext(company)}

Analyze the following call transcript focusing on:
1. Did the service rep greet the customer appropriately?
2. Did they show empathy and understanding of the customer's issue?
3. How well did they diagnose the problem?
4. Did they communicate solutions clearly?
5. Did they manage customer expectations effectively?
6. Did they follow company procedures correctly?
7. How was their tone and professionalism?
8. Did they provide clear next steps?
9. Was the resolution satisfactory?
10. Did they ask if there was anything else they could help with?

Please provide:
1. A brief analysis summary (2-3 paragraphs)
2. A list of parameters evaluated (from the criteria above)
3. 3-5 strengths demonstrated in the call
4. 3-5 areas for improvement
5. Specific, actionable recommendations
6. An overall score from 1-10

Format your response in valid JSON matching this schema:
{
  "analysis": "string",
  "parameters": ["string"],
  "strengths": ["string"],
  "improvements": ["string"],
  "recommendations": ["string"],
  "totalScore": number
}

Call Transcript:
${transcript}`;
}

/**
 * פרומפט לניתוח שיחת תיאום פגישה
 */
export function appointmentSettingPrompt(company, transcript) {
  return `
You are an expert appointment setter coach analyzing a call. Please evaluate the conversation based on the following criteria:
${buildCompanyContext(company)}

Analyze the following call transcript focusing on:
1. Did they create interest in the first 10-15 seconds?
2. Did they effectively handle gatekeepers?
3. Did they communicate the value proposition concisely?
4. Did they overcome objections to scheduling?
5. Were they persistent without being pushy?
6. Did they successfully secure a calendar appointment?
7. Did they confirm all appointment details?
8. Did they maintain a confident and enthusiastic tone?
9. Did they use effective questioning techniques?
10. Did they show respect for the prospect's time?

Please provide:
1. A brief analysis summary (2-3 paragraphs)
2. A list of parameters evaluated (from the criteria above)
3. 3-5 strengths demonstrated in the call
4. 3-5 areas for improvement
5. Specific, actionable recommendations
6. An overall score from 1-10

Format your response in valid JSON matching this schema:
{
  "analysis": "string",
  "parameters": ["string"],
  "strengths": ["string"],
  "improvements": ["string"],
  "recommendations": ["string"],
  "totalScore": number
}

Call Transcript:
${transcript}`;
}

/**
 * פונקציה ראשית לקבלת פרומפט המתאים לסוג הניתוח
 */
export function getPromptByAnalysisType(company, transcript, analysisType) {
  switch (analysisType) {
    case 'sales':
      return salesCallPrompt(company, transcript);
    case 'sales_followup':
      // כרגע משתמש בתבנית של מכירות רגילה עד שיהיה תבנית ייעודית
      return salesCallPrompt(company, transcript);
    case 'service':
      return serviceCallPrompt(company, transcript);
    case 'appointment':
    case 'appointment_setting':
      return appointmentSettingPrompt(company, transcript);
    case 'appointment_followup':
      // כרגע משתמש בתבנית של תיאום פגישה רגילה עד שיהיה תבנית ייעודית
      return appointmentSettingPrompt(company, transcript);
    default:
      console.warn(`[EDGE-PROMPT] סוג ניתוח לא מוכר: ${analysisType}. משתמש בפרומפט מכירות כברירת מחדל.`);
      return salesCallPrompt(company, transcript);
  }
} 