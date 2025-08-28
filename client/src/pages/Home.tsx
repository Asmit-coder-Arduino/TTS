import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Volume2, Settings, Plus, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Paragraph, VoiceSettings, AudioState, WordUsageStats } from "../types";
import { ParagraphEditor } from "../components/ParagraphEditor";
import { SettingsModal } from "../components/SettingsModal";
import { WordUsageDisplay } from "../components/WordUsageDisplay";
import { countTotalWords } from "../lib/wordCounter";

const defaultVoiceSettings: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.5,
  speed: 1.0,
  pitch: 1.0,
  silenceInterval: 1.0
};

const createDefaultParagraph = (id: string): Paragraph => ({
  id,
  text: "",
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel (female)
  language: 'en',
  age: 30,
  settings: { ...defaultVoiceSettings }
});

export default function Home() {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([
    createDefaultParagraph('1')
  ]);
  const [audioState, setAudioState] = useState<AudioState>({
    isGenerating: false,
    audioUrl: null,
    error: null
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('elevenlabs_api_key') || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [wordUsage, setWordUsage] = useState<WordUsageStats | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const { toast } = useToast();

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('elevenlabs_api_key', apiKey);
    }
  }, [apiKey]);

  // Fetch word usage when API key changes
  useEffect(() => {
    const fetchWordUsage = async () => {
      if (!apiKey || !apiKey.startsWith('sk_')) return;
      
      setIsLoadingUsage(true);
      try {
        const response = await apiRequest('POST', '/api/word-usage', { apiKey });
        const data = await response.json();
        if (data.success) {
          setWordUsage({
            wordsUsed: data.wordsUsed,
            monthlyLimit: data.monthlyLimit,
            wordsRemaining: data.wordsRemaining,
            currentMonth: data.currentMonth
          });
        }
      } catch (error) {
        console.error('Failed to fetch word usage:', error);
      } finally {
        setIsLoadingUsage(false);
      }
    };

    fetchWordUsage();
  }, [apiKey]);

  const generateSpeechMutation = useMutation({
    mutationFn: async ({ paragraphs, apiKey }: { paragraphs: Paragraph[], apiKey: string }) => {
      const response = await apiRequest('POST', '/api/generate-speech', {
        paragraphs,
        apiKey
      });
      return response.json();
    },
    onMutate: () => {
      setAudioState(prev => ({ ...prev, isGenerating: true, error: null }));
    },
    onSuccess: (data) => {
      if (data.success) {
        setAudioState({
          isGenerating: false,
          audioUrl: data.audioUrl,
          error: null,
          wordsUsed: data.wordsUsed,
          totalWordsUsed: data.totalWordsUsed,
          wordsRemaining: data.wordsRemaining,
          monthlyLimit: data.monthlyLimit
        });
        
        // Update word usage state
        if (wordUsage) {
          setWordUsage({
            ...wordUsage,
            wordsUsed: data.totalWordsUsed,
            wordsRemaining: data.wordsRemaining
          });
        }
        
        toast({
          title: "Success",
          description: `Speech generated successfully! Used ${data.wordsUsed} words.`,
        });
      } else {
        setAudioState(prev => ({
          ...prev,
          isGenerating: false,
          error: data.error || 'Failed to generate speech'
        }));
      }
    },
    onError: (error) => {
      setAudioState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message || 'Failed to generate speech'
      }));
    }
  });

  const updateParagraph = (id: string, updatedParagraph: Paragraph) => {
    setParagraphs(prev => prev.map(p => p.id === id ? updatedParagraph : p));
  };

  const deleteParagraph = (id: string) => {
    setParagraphs(prev => prev.filter(p => p.id !== id));
  };

  const addParagraph = () => {
    const newId = Date.now().toString();
    setParagraphs(prev => [...prev, createDefaultParagraph(newId)]);
  };

  const handleGenerateSpeech = () => {
    // Validation
    if (!apiKey.trim()) {
      setAudioState(prev => ({
        ...prev,
        error: 'Please configure your API key in settings before generating speech.'
      }));
      return;
    }

    const validParagraphs = paragraphs.filter(p => p.text.trim());
    if (validParagraphs.length === 0) {
      setAudioState(prev => ({
        ...prev,
        error: 'Please add some text to generate speech.'
      }));
      return;
    }

    // Check word count against remaining limit
    const totalWords = countTotalWords(validParagraphs);
    if (wordUsage && totalWords > wordUsage.wordsRemaining) {
      setAudioState(prev => ({
        ...prev,
        error: `Word limit exceeded. You need ${totalWords} words but only have ${wordUsage.wordsRemaining} remaining this month.`
      }));
      return;
    }

    generateSpeechMutation.mutate({ paragraphs: validParagraphs, apiKey });
  };

  const handleDownloadAudio = () => {
    if (audioState.audioUrl) {
      const link = document.createElement('a');
      link.href = audioState.audioUrl;
      link.download = 'generated-speech.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your audio file is being downloaded.",
      });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Text to Speech Converter
            </h1>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Word Usage Display */}
        {wordUsage && !isLoadingUsage && (
          <WordUsageDisplay 
            usage={wordUsage} 
            currentWords={countTotalWords(paragraphs.filter(p => p.text.trim()))}
          />
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Success Message */}
          {audioState.audioUrl && !audioState.error && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Speech generated successfully! Audio is ready for playback.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {audioState.error && (
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{audioState.error}</AlertDescription>
            </Alert>
          )}

          {/* Paragraph Editors */}
          {paragraphs.map((paragraph, index) => (
            <ParagraphEditor
              key={paragraph.id}
              paragraph={paragraph}
              index={index}
              onUpdate={(updated) => updateParagraph(paragraph.id, updated)}
              onDelete={() => deleteParagraph(paragraph.id)}
              showDelete={paragraphs.length > 1}
            />
          ))}

          {/* Add Paragraph Button */}
          <Button
            variant="outline"
            onClick={addParagraph}
            className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 border-green-600"
            data-testid="button-add-paragraph"
          >
            <Plus className="w-4 h-4" />
            Add Paragraph
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleGenerateSpeech}
              disabled={audioState.isGenerating}
              className="flex-1 flex items-center justify-center gap-2 font-medium"
              data-testid="button-generate-speech"
            >
              {audioState.isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  Generate Speech
                </>
              )}
            </Button>

            {audioState.audioUrl && (
              <Button
                onClick={handleDownloadAudio}
                variant="outline"
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 border-green-600"
                data-testid="button-download-audio"
              >
                <Download className="w-4 h-4" />
                Download MP3
              </Button>
            )}
          </div>

          {/* Audio Player */}
          {audioState.audioUrl && (
            <div className="p-4 bg-card border border-border rounded-lg" data-testid="audio-container">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Generated Audio
              </h4>
              <audio
                controls
                className="w-full"
                src={audioState.audioUrl}
                data-testid="audio-player"
              >
                Your browser does not support the audio element.
              </audio>
              <p className="text-xs text-muted-foreground mt-2">
                Audio ready for playback and download
              </p>
            </div>
          )}
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
        />
      </div>
    </div>
  );
}
