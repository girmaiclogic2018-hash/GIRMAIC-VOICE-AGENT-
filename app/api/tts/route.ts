import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'en' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required for TTS' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured for TTS endpoint' },
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

    // Request TTS generation using supported gemini-3.8-flash-lite-tts model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: `Read the following text aloud with a clear, friendly, human-like voice persona representing GIRMAIC AI Voice Assistant (${language === 'am' ? 'Amharic' : 'English'}):\n\n"${text}"`,
      config: {
        responseMimeType: 'audio/mp3',
      },
    });

    // If audio parts are returned
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
      const audioBase64 = candidates[0].content.parts[0].inlineData.data;
      const mimeType = candidates[0].content.parts[0].inlineData.mimeType || 'audio/mp3';
      return NextResponse.json({
        audioUrl: `data:${mimeType};base64,${audioBase64}`,
        success: true,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Server TTS fallback generated text response.',
    });
  } catch (error: any) {
    console.warn('Server TTS API call notice:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server TTS unavailable' },
      { status: 200 }
    );
  }
}
