export type RobotState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
export type Language = 'en' | 'am';

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
