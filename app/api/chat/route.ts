import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { prompt, language = 'en', history = [], knowledgeBase = [] } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY is not set.',
          fallbackText: language === 'am'
            ? 'ሰላም! ወደ GIRMAIC AI Technology and Trading እንኳን በደህና መጡ። እኔ የGIRMAIC ሰው ሰራሽ አስተውሎት የድምፅ ረዳትዎ ነኝ። እንዴት ልርዳዎት?'
            : 'Hello! Welcome to GIRMAIC AI Technology and Trading. I am your GIRMAIC AI Voice Assistant. How may I assist you today?'
        },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format knowledge base context
    const kbContext = knowledgeBase.length > 0
      ? knowledgeBase.map((item: any) => `[${item.title}]: ${item.contentEN} | ${item.contentAM}`).join('\n')
      : `
- Organization: GIRMAIC AI TECHNOLOGY AND TRADING ONE PLC MEMBER
- Founder: Girma Haile Bunaro (FOUNDER & VISIONARY)
- Business Location: Dire Dawa, Ethiopia
- Official Email: girmaiclogic2018@gmail.com
- Contact Phone: +251982422266
- Tagline: AFRICAN INTELLIGENCE. GLOBAL INNOVATION. HUMAN PROGRESS.
`;

    const systemInstruction = `
You are the GIRMAIC AI Voice Agent, a highly intelligent, polite, culturally respectful, and welcoming humanoid robot voice assistant representing GIRMAIC AI Technology and Trading.

ORGANIZATION DETAILS:
- Organization Name: GIRMAIC AI TECHNOLOGY AND TRADING ONE PLC MEMBER
- Founder & Visionary: Girma Haile Bunaro
- Location: Dire Dawa, Ethiopia
- Contact Email: girmaiclogic2018@gmail.com
- Contact Phone: +251982422266
- Tagline: AFRICAN INTELLIGENCE. GLOBAL INNOVATION. HUMAN PROGRESS.

VERIFIED KNOWLEDGE BASE:
${kbContext}

BEHAVIOR AND PERSONALITY INSTRUCTIONS:
1. Primary requested language: ${language === 'am' ? 'Amharic (አማርኛ)' : 'English'}.
2. If the user writes in Amharic or requests Amharic, respond in clear, grammatically correct, warm Amharic (አማርኛ).
3. If the user writes in English, respond in professional, friendly English.
4. Always identify as the GIRMAIC AI Voice Assistant, created for GIRMAIC AI Technology and Trading founded by Girma Haile Bunaro in Dire Dawa, Ethiopia.
5. Keep your responses concise (2 to 4 sentences maximum) because your text will be spoken aloud to the user.
6. For questions outside verified company information (e.g. specific pricing, unverified client list, exact product stock, or legal guarantees), YOU MUST politely state:
   - In English: "I don't yet have verified information about that. I can record your inquiry for the GIRMAIC team."
   - In Amharic: "ስለዚህ ጉዳይ የተረጋገጠ መረጃ እስካሁን የለኝም። ጥያቄዎን ለGIRMAIC ቡድን ማስተላለፍ እችላለሁ።"
7. Do not claim to be a human employee. You are a humanoid AI voice assistant.
8. Encourage prospective customers to submit an inquiry using the on-screen form or contact Dire Dawa HQ.
`;

    // Construct multi-turn contents
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach((msg: any) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || (
      language === 'am'
        ? 'የGIRMAIC AI ድምፅ ረዳት ነኝ። እንዴት ልርዳዎት እችላለሁ?'
        : 'I am the GIRMAIC AI Voice Agent. How can I assist you today?'
    );

    return NextResponse.json({
      text: replyText,
      language: /[ሀ-፿]/.test(replyText) ? 'am' : 'en',
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to generate response',
        fallbackText: 'I am experiencing a temporary connection issue. Please try speaking or typing again.'
      },
      { status: 500 }
    );
  }
}
