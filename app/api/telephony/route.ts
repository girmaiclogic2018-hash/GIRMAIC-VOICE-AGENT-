import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRecord } from '@/lib/types';

/**
 * AUTONOMOUS TELEPHONY & APPOINTMENT ENGINE
 * 
 * GIRMAIC AI Voice Agent - Answers real telephone calls, manages conversations,
 * and books appointments automatically WITHOUT human intervention.
 */

// In-memory appointments store for server API session
const serverAppointmentsStore: AppointmentRecord[] = [
  {
    id: 'apt-auto-101',
    callerName: 'Solomon Bekele',
    callerPhone: '+251911998877',
    appointmentDate: '2026-11-15',
    appointmentTime: '11:00 AM',
    serviceCategory: 'AI Voice Automation Consultation',
    notes: 'Autonomous Telephone Booking: Scheduled directly via GIRMAIC AI Phone Operator call without human staff intervention.',
    timestamp: new Date().toISOString(),
    status: 'Confirmed',
    autoBooked: true,
  },
];

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'AUTONOMOUS_OPERATOR_ONLINE',
    organization: 'GIRMAIC AI TECHNOLOGY AND TRADING ONE PLC MEMBER',
    founder: 'Girma Haile Bunaro',
    headquarters: 'Dire Dawa, Ethiopia',
    telephonyCapability: 'Fully Autonomous Incoming Call Answering & Voice Appointment Booking',
    escalationPhone: '+251982422266',
    activeAppointmentsCount: serverAppointmentsStore.length,
    appointments: serverAppointmentsStore,
    sipWebhooks: {
      autoAnswerCall: '/api/telephony?action=incoming',
      processCallSpeech: '/api/telephony?action=process',
      bookAppointment: '/api/telephony?action=appointment',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'process';
    const body = await req.json().catch(() => ({}));

    // 1. AUTONOMOUS CALL ANSWERING (NO HUMAN INTERVENTION)
    if (action === 'incoming') {
      const callerPhone = body.From || body.fromNumber || '+251982422266';
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Hello! You have reached GIRMAIC AI Technology and Trading in Dire Dawa, Ethiopia. I am your autonomous GIRMAIC AI Phone Assistant. I can answer your questions, explain our AI and technology services, or book an appointment for you automatically without human intervention. How may I assist you today?
  </Say>
  <Gather input="speech" action="/api/telephony?action=process" timeout="6" method="POST">
    <Say>Please speak your question or state the date and time you would like to book an appointment.</Say>
  </Gather>
</Response>`;

      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // 2. DIRECT APPOINTMENT BOOKING ENDPOINT
    if (action === 'appointment') {
      const {
        callerName = 'Valued Customer',
        callerPhone = '+251982422266',
        appointmentDate = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        appointmentTime = '10:00 AM',
        serviceCategory = 'AI Technology Consultation',
        notes = 'Autonomous Voice Booking',
      } = body;

      const newAppointment: AppointmentRecord = {
        id: `apt-phone-${Date.now()}`,
        callerName,
        callerPhone,
        appointmentDate,
        appointmentTime,
        serviceCategory,
        notes: notes || 'Autonomous voice appointment created without human intervention.',
        timestamp: new Date().toISOString(),
        status: 'Confirmed',
        autoBooked: true,
      };

      serverAppointmentsStore.unshift(newAppointment);

      return NextResponse.json({
        success: true,
        message: `Appointment confirmed for ${callerName} on ${appointmentDate} at ${appointmentTime}.`,
        appointment: newAppointment,
      });
    }

    // 3. AUTONOMOUS CALL SPEECH & CONVERSATION PROCESSING WITH INTENT EXTRACTION
    const userSpeech = body.SpeechResult || body.prompt || body.userSpeech || 'Hello, I want to book an appointment';
    const callerPhone = body.From || body.callerPhone || '+251982422266';
    const language = /[ሀ-፿]/.test(userSpeech) ? 'am' : 'en';

    const apiKey = process.env.GEMINI_API_KEY;

    let aiReplyText = '';
    let bookedAppointment: AppointmentRecord | null = null;

    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const systemInstruction = `
You are the Autonomous GIRMAIC AI Phone Operator for GIRMAIC AI TECHNOLOGY AND TRADING ONE PLC MEMBER, founded by Girma Haile Bunaro in Dire Dawa, Ethiopia.

YOUR KEY RESPONSIBILITIES:
1. Answer caller questions autonomously in English or Amharic (አማርኛ) without human intervention.
2. Recognize when the caller wants to schedule or book an appointment.
3. If an appointment request is detected, gather: Caller Name, Date, Time, and Service Category.
4. Keep responses warm, professional, concise (2-3 sentences), and suitable for telephone speech.
5. Organization Info: Location in Dire Dawa, Ethiopia; Contact: girmaiclogic2018@gmail.com, +251982422266.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `The phone caller said: "${userSpeech}". Respond as the GIRMAIC AI Phone Operator in ${language === 'am' ? 'Amharic' : 'English'}. If they ask for an appointment, confirm their booking details clearly.`,
        config: { systemInstruction },
      });

      aiReplyText = response.text || 'Thank you for calling GIRMAIC AI Technology and Trading. How else may I assist you today?';
    } else {
      aiReplyText = language === 'am'
        ? 'ወደ GIRMAIC AI Technology በስልክ ስለደወሉ እናመሰግናለን። የቀጠሮ ጥያቄዎ በራስ-ሰር ተመዝግቧል።'
        : 'Thank you for calling GIRMAIC AI Technology and Trading. Your appointment request has been recorded automatically.';
    }

    // Check if appointment intent is in speech
    const isAppointmentIntent = /appointment|schedule|book|meet|ቀጠሮ|ሰዓት|ቀን/i.test(userSpeech);

    if (isAppointmentIntent) {
      bookedAppointment = {
        id: `apt-auto-${Date.now()}`,
        callerName: 'Autonomous Phone Caller',
        callerPhone,
        appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        appointmentTime: '10:00 AM',
        serviceCategory: 'AI Voice Service Consultation',
        notes: `Auto-Booked from phone conversation: "${userSpeech}"`,
        timestamp: new Date().toISOString(),
        status: 'Confirmed',
        autoBooked: true,
      };

      serverAppointmentsStore.unshift(bookedAppointment);
    }

    // Return JSON & TwiML compatible response
    const formatTwiml = body.SpeechResult ? true : false;

    if (formatTwiml) {
      const responseTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${aiReplyText}</Say>
  <Gather input="speech" action="/api/telephony?action=process" timeout="5" method="POST">
    <Say>Is there anything else I can do for you today?</Say>
  </Gather>
</Response>`;
      return new NextResponse(responseTwiml, { headers: { 'Content-Type': 'text/xml' } });
    }

    return NextResponse.json({
      success: true,
      text: aiReplyText,
      language,
      autoBooked: !!bookedAppointment,
      appointment: bookedAppointment,
    });
  } catch (error: any) {
    console.error('Telephony route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process autonomous phone call' },
      { status: 500 }
    );
  }
}
