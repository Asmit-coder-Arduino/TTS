import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
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
    <div className="p-6 bg-card border border-border rounded-lg shadow-sm" data-testid={`paragraph-${paragraph.id}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">
          Paragraph {index + 1}
        </h3>
        {showDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            data-testid={`button-delete-paragraph-${paragraph.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Text Area */}
      <div className="mb-4">
        <Textarea
          value={paragraph.text}
          onChange={(e) => updateParagraph({ text: e.target.value })}
          className="w-full h-32 resize-none"
          placeholder="Enter your text here..."
          data-testid={`textarea-paragraph-${paragraph.id}`}
        />
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label className="block text-sm font-medium text-muted-foreground mb-2">
            Language
          </Label>
          <Select
            value={paragraph.language}
            onValueChange={(value: 'en' | 'hi') => updateParagraph({ language: value })}
          >
            <SelectTrigger data-testid={`select-language-${paragraph.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-muted-foreground mb-2">
            Voice
          </Label>
          <Select
            value={paragraph.voiceId}
            onValueChange={(value) => updateParagraph({ voiceId: value })}
          >
            <SelectTrigger data-testid={`select-voice-${paragraph.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} ({voice.gender})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-muted-foreground mb-2">
            Voice Age
          </Label>
          <Input
            type="number"
            min={10}
            max={100}
            value={paragraph.age}
            onChange={(e) => updateParagraph({ age: parseInt(e.target.value) || 30 })}
            placeholder="Voice Age (10-100)"
            data-testid={`input-age-${paragraph.id}`}
          />
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
