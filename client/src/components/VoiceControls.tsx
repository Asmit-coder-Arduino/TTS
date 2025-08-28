import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Settings, Zap, Volume2, Clock, Gauge } from "lucide-react";
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
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
      <h4 className="text-lg font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Settings className="w-5 h-5" />
        Voice Fine-Tuning
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="space-y-3">
          <Label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Gauge className="w-4 h-4" />
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Variable</span>
            <span>Consistent</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Natural</span>
            <span>Crisp</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Silence ({settings.silenceInterval.toFixed(1)}s)
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>None</span>
            <span>10s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
