export type RobotState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
export type Language = 'en' | 'am' | 'om' | 'ti' | 'so' | 'ar' | 'fr' | 'sw';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  bcp47: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-US' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', bcp47: 'am-ET' },
  { code: 'om', name: 'Afaan Oromo', nativeName: 'Afaan Oromoo', bcp47: 'om-ET' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', bcp47: 'ti-ET' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', bcp47: 'so-ET' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', bcp47: 'ar-SA' },
  { code: 'fr', name: 'French', nativeName: 'Français', bcp47: 'fr-FR' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', bcp47: 'sw-KE' },
];

export interface ChatMessage {
  id: string;
  sender: 'user' | 'robot';
  text: string;
  language: Language;
  timestamp: string;
  audioUrl?: string;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  contact: string; // Phone or Email
  businessInterest: 'Services' | 'Trading' | 'Partnership' | 'Appointment' | 'General Inquiry';
  message: string;
  timestamp: string;
  status: 'New' | 'In Progress' | 'Contacted';
}

export interface CompanyKnowledgeItem {
  id: string;
  category: 'General' | 'Founder' | 'Services' | 'Location' | 'Contact';
  title: string;
  contentEN: string;
  contentAM: string;
}

export interface AgentSettings {
  robotName: string;
  greetingEN: string;
  greetingAM: string;
  voicePitch: number;
  voiceRate: number;
  voiceGender: 'female' | 'male' | 'neutral';
  autoListen: boolean;
  lowPowerMode: boolean;
  reducedMotion: boolean;
}

export interface AppointmentRecord {
  id: string;
  callerName: string;
  callerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceCategory: string;
  notes: string;
  timestamp: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  autoBooked: boolean;
}
