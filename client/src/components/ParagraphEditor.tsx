import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Type, User, Globe } from "lucide-react";
import { Paragraph } from "../types";
import { getVoicesByLanguage } from "../lib/voices";
import { VoiceControls } from "./VoiceControls";

interface ParagraphEditorProps {
  paragraph: Paragraph;
  index: number;
  onUpdate: (paragraph: Paragraph) => void;
  onDelete: () => void;
  showDelete: boolean;
}

export function ParagraphEditor({ paragraph, index, onUpdate, onDelete, showDelete }: ParagraphEditorProps) {
  const voices = getVoicesByLanguage(paragraph.language);

  const updateParagraph = (updates: Partial<Paragraph>) => {
    onUpdate({
      ...paragraph,
      ...updates
    });
  };

  return (
    <div className="glass-card p-6 hover:shadow-xl transition-all duration-500 group" data-testid={`paragraph-${paragraph.id}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Type className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Paragraph {index + 1}
          </h3>
        </div>
        {showDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 
                       opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 hover:scale-100"
            data-testid={`button-delete-paragraph-${paragraph.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Text Area */}
      <div className="mb-6">
        <Label className="block text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Your Text Content
        </Label>
        <Textarea
          value={paragraph.text}
          onChange={(e) => updateParagraph({ text: e.target.value })}
          className="w-full h-36 resize-none enhanced-input text-base leading-relaxed 
                     focus:ring-2 focus:ring-purple-400 transition-all duration-300"
          placeholder="Type your message here... Let your words come alive with AI voices! ✨"
          data-testid={`textarea-paragraph-${paragraph.id}`}
        />
      </div>

      {/* Voice Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-3">
          <Label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Language
          </Label>
          <Select
            value={paragraph.language}
            onValueChange={(value: 'en' | 'hi') => updateParagraph({ language: value })}
          >
            <SelectTrigger 
              className="enhanced-input border-purple-200 hover:border-purple-300 transition-all duration-300" 
              data-testid={`select-language-${paragraph.id}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="en" className="cursor-pointer hover:bg-purple-50">
                🇺🇸 English
              </SelectItem>
              <SelectItem value="hi" className="cursor-pointer hover:bg-purple-50">
                🇮🇳 Hindi
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Voice Character
          </Label>
          <Select
            value={paragraph.voiceId}
            onValueChange={(value) => updateParagraph({ voiceId: value })}
          >
            <SelectTrigger 
              className="enhanced-input border-purple-200 hover:border-purple-300 transition-all duration-300" 
              data-testid={`select-voice-${paragraph.id}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card max-h-48">
              {voices.map((voice) => (
                <SelectItem 
                  key={voice.id} 
                  value={voice.id}
                  className="cursor-pointer hover:bg-purple-50"
                >
                  {voice.gender === 'male' ? '👨' : '👩'} {voice.name} ({voice.gender})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Voice Controls */}
      <VoiceControls
        settings={paragraph.settings}
        onSettingsChange={(settings) => updateParagraph({ settings })}
      />
    </div>
  );
}
