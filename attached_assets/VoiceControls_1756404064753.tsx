import React from 'react';
import { VoiceSettings } from '../types';

interface VoiceControlsProps {
  settings: VoiceSettings;
  onChange: (settings: VoiceSettings) => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ settings, onChange }) => {
  const handleChange = (key: keyof VoiceSettings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Voice Controls</h3>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Speed ({settings.speed}x)
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.speed}
            onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="block text-sm font-medium">
          Pitch ({settings.pitch})
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.pitch}
            onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="block text-sm font-medium">
          Stability ({settings.stability})
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.stability}
            onChange={(e) => handleChange('stability', parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="block text-sm font-medium">
          Clarity ({settings.similarity_boost})
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.similarity_boost}
            onChange={(e) => handleChange('similarity_boost', parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="block text-sm font-medium">
          Silence Interval ({settings.silenceInterval} seconds)
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={settings.silenceInterval}
            onChange={(e) => handleChange('silenceInterval', parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
    </div>
  );
};