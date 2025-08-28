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
  age: number;
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
}

export interface Settings {
  apiKey: string;
}
