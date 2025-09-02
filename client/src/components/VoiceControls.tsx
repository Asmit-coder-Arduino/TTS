import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Settings, Zap, Volume2, Clock, Gauge } from "lucide-react";
import { VoiceSettings } from "../types";

interface VoiceControlsProps {
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
}

export function VoiceControls({ settings, onSettingsChange }: VoiceControlsProps) {
  // Voice Fine-Tuning section has been removed as requested
  return null;
}
