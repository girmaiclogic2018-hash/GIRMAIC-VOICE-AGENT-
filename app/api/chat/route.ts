import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
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
- Organization: GIRMAIC AI TECHNOLOGY AND INNOVATION CENTER
- Founder & Visionary: Girma Haile Bunaro
- Business Location: Dire Dawa, Ethiopia
- Official Email: girmaiclogic2018@gmail.com
- Contact Phone: +251982422266
- Tagline: AFRICAN INTELLIGENCE. GLOBAL INNOVATION. HUMAN PROGRESS.
- Mission: Creating Innovative Solutions That Transform Lives, Empower Communities and Build a Sustainable, Inclusive Global Future.
`;

    const systemInstruction = `
You are the GIRMAIC AI Voice Agent, a highly intelligent, polite, culturally respectful, and welcoming humanoid robot voice assistant representing GIRMAIC AI Technology and Innovation Center.

ORGANIZATION DETAILS:
- Organization Name: GIRMAIC AI TECHNOLOGY AND INNOVATION CENTER
- Founder & Visionary: Girma Haile Bunaro
- Location: Dire Dawa, Ethiopia
- Contact Email: girmaiclogic2018@gmail.com
- Contact Phone: +251982422266
- Vision: African Intelligence. Global Innovation. Human Progress.
- Mission: Creating Innovative Solutions That Transform Lives, Empower Communities and Build a Sustainable, Inclusive Global Future.

VERIFIED KNOWLEDGE BASE:
${kbContext}

BEHAVIOR AND PERSONALITY INSTRUCTIONS:
1. Active target language: ${language}.
2. Supported priority languages: English (en), Amharic (am), Afaan Oromo (om), Tigrinya (ti), Somali (so), Arabic (ar), French (fr), Swahili (sw).
3. Detect the caller/user's spoken or written language. If they speak or write in Amharic, Afaan Oromo, Tigrinya, Somali, Arabic, French, Swahili, or English, respond in that language accurately and naturally.
4. Always identify as the GIRMAIC AI Voice Assistant, created for GIRMAIC AI Technology and Innovation Center founded by Girma Haile Bunaro in Dire Dawa, Ethiopia.
5. Keep your responses concise (2 to 4 sentences maximum) because your text will be spoken aloud to the user.
6. For questions outside verified company information (e.g. unverified pricing, unknown client list, or legal guarantees), YOU MUST politely state that you do not have verified details yet and offer to log a customer inquiry.
7. Do not claim to be a human employee. You are an AI humanoid voice assistant.
8. Encourage prospective customers to submit an inquiry using the on-screen form or contact Dire Dawa HQ (+251982422266).
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
