export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  speed: number;
  pitch: number;
  silenceInterval: number;
}

export interface Paragraph {
  id: string;
  text: string;
  voiceId: string;
  language: 'en' | 'hi';
  settings: VoiceSettings;
}

export interface Voice {
  id: string;
  name: string;
  language: 'en' | 'hi';
  gender: 'male' | 'female';
}

export interface AudioState {
  isGenerating: boolean;
  audioUrl: string | null;
  error: string | null;
  charactersUsed?: number;
  totalCharactersUsed?: number;
  charactersRemaining?: number;
  monthlyLimit?: number;
}

export interface Settings {
  apiKey: string;
}

export interface CharacterUsageStats {
  charactersUsed: number;
  monthlyLimit: number;
  charactersRemaining: number;
  currentMonth: string;
}

export interface CharacterUsageResponse {
  success: boolean;
  charactersUsed: number;
  monthlyLimit: number;
  charactersRemaining: number;
  currentMonth: string;
  error?: string;
}
