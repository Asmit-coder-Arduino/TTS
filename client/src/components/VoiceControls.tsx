import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { VoiceSettings } from "../types";

interface VoiceControlsProps {
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
}

export function VoiceControls({ settings, onSettingsChange }: VoiceControlsProps) {
  const updateSetting = (key: keyof VoiceSettings, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="p-4 bg-secondary/50 rounded-lg border border-border">
      <h4 className="text-lg font-semibold mb-4 text-foreground">Voice Controls</h4>
      
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-muted-foreground mb-2">
            Speed ({settings.speed.toFixed(1)}x)
          </Label>
          <Slider
            value={[settings.speed]}
            onValueChange={([value]) => updateSetting('speed', value)}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
            data-testid="slider-speed"
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-muted-foreground mb-2">
            Pitch ({settings.pitch.toFixed(1)})
          </Label>
          <Slider
            value={[settings.pitch]}
            onValueChange={([value]) => updateSetting('pitch', value)}
            min={0}
            max={2}
            step={0.1}
            className="w-full"
            data-testid="slider-pitch"
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-muted-foreground mb-2">
            Stability ({settings.stability.toFixed(1)})
          </Label>
          <Slider
            value={[settings.stability]}
            onValueChange={([value]) => updateSetting('stability', value)}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
            data-testid="slider-stability"
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-muted-foreground mb-2">
            Clarity ({settings.similarity_boost.toFixed(1)})
          </Label>
          <Slider
            value={[settings.similarity_boost]}
            onValueChange={([value]) => updateSetting('similarity_boost', value)}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
            data-testid="slider-clarity"
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-muted-foreground mb-2">
            Silence Interval ({settings.silenceInterval.toFixed(1)} seconds)
          </Label>
          <Slider
            value={[settings.silenceInterval]}
            onValueChange={([value]) => updateSetting('silenceInterval', value)}
            min={0}
            max={10}
            step={0.5}
            className="w-full"
            data-testid="slider-silence"
          />
        </div>
      </div>
    </div>
  );
}
