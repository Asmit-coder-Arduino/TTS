import React from 'react';
import { Paragraph, Voice } from '../types';
import { VoiceControls } from './VoiceControls';
import { Trash2 } from 'lucide-react';

interface ParagraphEditorProps {
  paragraph: Paragraph;
  voices: Voice[];
  onUpdate: (updated: Paragraph) => void;
  onDelete: () => void;
}

export const ParagraphEditor: React.FC<ParagraphEditorProps> = ({
  paragraph,
  voices,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-4">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Paragraph {paragraph.id}</h3>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <textarea
        value={paragraph.text}
        onChange={(e) => onUpdate({ ...paragraph, text: e.target.value })}
        className="w-full h-32 p-2 border rounded-md mb-4"
        placeholder="Enter your text here..."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={paragraph.language}
          onChange={(e) => onUpdate({ ...paragraph, language: e.target.value })}
          className="p-2 border rounded-md"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>

        <select
          value={paragraph.voiceId}
          onChange={(e) => onUpdate({ ...paragraph, voiceId: e.target.value })}
          className="p-2 border rounded-md"
        >
          {voices
            .filter((v) => v.language === paragraph.language)
            .map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} ({voice.gender})
              </option>
            ))}
        </select>

        <input
          type="number"
          min="10"
          max="100"
          value={paragraph.age}
          onChange={(e) => onUpdate({ ...paragraph, age: parseInt(e.target.value) })}
          className="p-2 border rounded-md"
          placeholder="Voice Age (10-100)"
        />
      </div>

      <VoiceControls
        settings={paragraph.settings}
        onChange={(settings) => onUpdate({ ...paragraph, settings })}
      />
    </div>
  );
};