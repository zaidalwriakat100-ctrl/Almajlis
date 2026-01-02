
// Fix: Import Type from @google/genai as it's not exported from types.ts
import { GoogleGenAI, Type } from "@google/genai";
import { SessionKeyMoment, SessionOverview, Speech, TranscriptSegment, ExtractedEntity, NumberMention } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface SessionAnalysisResultV2 {
    sessionOverview: SessionOverview;
    segments: TranscriptSegment[];
    entitiesSummary: ExtractedEntity[];
    numbersSummary: NumberMention[];
    technicalNotes: string;
}

/**
 * تحليل نص الجلسة وتحويله إلى بيانات منظمة
 */
export const analyzeSessionTranscriptV2 = async (input: { 
    sessionId: string, 
    title?: string, 
    date?: string, 
    transcriptText: string 
}): Promise<SessionAnalysisResultV2 | null> => {
    try {
        const prompt = `
        أنت محلل بيانات برلماني خبير. حول نص الجلسة التالي إلى JSON منظم بدقة.
        
        سياق الجلسة: ${input.title} - بتاريخ ${input.date}
        
        المطلوب استخراجه في JSON:
        1. sessionOverview: ملخص تنفيذي (summaryBullets) وأهم المواضيع (mainTopics).
        2. segments: قائمة بالمداخلات لكل متحدث تشمل:
           - speakerName: اسم النائب.
           - textExcerpt: نص المداخلة باختصار.
           - topics: القضايا المرتبطة.
           - stanceTowardGovernment: الموقف السياسي ويجب أن يكون حصراً واحداً من الخمسة التالية فقط:
             ["مؤيد وداعم للحكومة", "منتقد للحكومة", "استيضاح رقابي", "ضمانات وحقوق", "نقطة اجرائية"].
        
        النص المراد تحليله:
        ${input.transcriptText.substring(0, 25000)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                responseMimeType: "application/json"
            }
        });

        // Use .text property to get the response string
        const text = response.text;
        if (!text) return null;
        return JSON.parse(text) as SessionAnalysisResultV2;
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
};

/**
 * تلخيص نص الجلسة
 */
export const summarizeSessionText = async (transcriptText: string): Promise<string> => {
  if (!transcriptText) return "لا يوجد نص للتحليل.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `قم بتلخيص هذه الجلسة البرلمانية: ${transcriptText}`,
    });
    return response.text || "تعذر إنشاء الملخص.";
  } catch (error) {
    return "حدث خطأ في التحليل.";
  }
};

// Fix: Add analyzeNewsSentiment to analyze news trends
/**
 * تحليل التوجهات العامة للأخبار
 */
export const analyzeNewsSentiment = async (titles: string[]): Promise<string> => {
  if (!titles || titles.length === 0) return "لا توجد أخبار للتحليل.";
  try {
    const prompt = `حلل نبض الشارع وتوجهات الأخبار التالية بخصوص الشأن البرلماني في الأردن، وقدم ملخصاً تحليلياً قصيراً ومركزاً:
    ${titles.join('\n')}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "تعذر تحليل التوجهات حالياً.";
  } catch (error) {
    console.error("Gemini Sentiment Error:", error);
    return "حدث خطأ في التحليل الذكي.";
  }
};
