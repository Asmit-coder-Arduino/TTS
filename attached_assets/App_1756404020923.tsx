import React, { useState } from 'react';
import { ParagraphEditor } from './components/ParagraphEditor';
import { SettingsModal } from './components/SettingsModal';
import { voices } from './config/voices';
import { textToSpeech, setApiKey } from './services/api';
import { Paragraph, AudioState, Settings } from './types';
import { Download, Plus, Volume2, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([
    {
      id: '1',
      text: '',
      voiceId: voices[0].id,
      language: 'en',
      age: 30,
      settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        speed: 1,
        pitch: 1,
        silenceInterval: 0,
      },
    },
  ]);

  const [audioState, setAudioState] = useState<AudioState>({
    isGenerating: false,
    audioUrl: null,
    error: null,
  });

  const [settings, setSettings] = useState<Settings>({
    apiKey: "sk_ea800981c7ee4e34b2a9c2c1174a0e37218f9ad95d4f2c90",
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const addParagraph = () => {
    setParagraphs([
      ...paragraphs,
      {
        id: (paragraphs.length + 1).toString(),
        text: '',
        voiceId: voices[0].id,
        language: 'en',
        age: 30,
        settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          speed: 1,
          pitch: 1,
          silenceInterval: 0,
        },
      },
    ]);
  };

  const updateParagraph = (index: number, updated: Paragraph) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index] = updated;
    setParagraphs(newParagraphs);
  };

  const deleteParagraph = (index: number) => {
    setParagraphs(paragraphs.filter((_, i) => i !== index));
  };

  const handleSettingsSave = (newSettings: Settings) => {
    setSettings(newSettings);
    setApiKey(newSettings.apiKey);
  };

  const generateSpeech = async () => {
    try {
      setAudioState({ isGenerating: true, audioUrl: null, error: null });
      
      const audioBlobs: Blob[] = [];
      
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        
        if (paragraph.text.trim()) {
          // Generate speech for the paragraph
          const speechBlob = await textToSpeech(
            paragraph.text,
            paragraph.voiceId,
            paragraph.settings
          );
          audioBlobs.push(speechBlob);
          
          // Add silence after paragraph if it's not the last one and has silence interval
          if (i < paragraphs.length - 1 && paragraph.settings.silenceInterval > 0) {
            try {
              const silenceBlob = await createSilentAudio(paragraph.settings.silenceInterval);
              audioBlobs.push(silenceBlob);
            } catch (error) {
              console.error('Error creating silence:', error);
              // Continue with the next paragraph even if silence creation fails
            }
          }
        }
      }
      
      if (audioBlobs.length > 0) {
        const combinedBlob = new Blob(audioBlobs, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(combinedBlob);
        setAudioState({ isGenerating: false, audioUrl, error: null });
      } else {
        setAudioState({
          isGenerating: false,
          audioUrl: null,
          error: 'No text to convert to speech',
        });
      }
    } catch (error) {
      setAudioState({
        isGenerating: false,
        audioUrl: null,
        error: 'Failed to generate speech',
      });
      console.error('Error generating speech:', error);
    }
  };

  const downloadAudio = () => {
    if (audioState.audioUrl) {
      const link = document.createElement('a');
      link.href = audioState.audioUrl;
      link.download = 'generated-speech.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Text to Speech Converter
          </h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            <SettingsIcon size={20} />
            Settings
          </button>
        </div>

        <div className="space-y-6">
          {paragraphs.map((paragraph, index) => (
            <ParagraphEditor
              key={paragraph.id}
              paragraph={paragraph}
              voices={voices}
              onUpdate={(updated) => updateParagraph(index, updated)}
              onDelete={() => deleteParagraph(index)}
            />
          ))}

          <button
            onClick={addParagraph}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <Plus size={20} />
            Add Paragraph
          </button>

          <div className="flex gap-4">
            <button
              onClick={generateSpeech}
              disabled={audioState.isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              <Volume2 size={20} />
              {audioState.isGenerating ? 'Generating...' : 'Generate Speech'}
            </button>

            {audioState.audioUrl && (
              <button
                onClick={downloadAudio}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                <Download size={20} />
                Download MP3
              </button>
            )}
          </div>

          {audioState.audioUrl && (
            <audio
              controls
              className="w-full mt-4"
              src={audioState.audioUrl}
            />
          )}

          {audioState.error && (
            <div className="text-red-500 mt-4">{audioState.error}</div>
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  );
}

export default App;