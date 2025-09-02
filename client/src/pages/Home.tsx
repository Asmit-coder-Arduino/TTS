import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Volume2, Settings, Plus, Download, CheckCircle, AlertCircle, Loader2, Sparkles, Wand2, Play } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Paragraph, VoiceSettings, AudioState, WordUsageStats } from "../types";
import { ParagraphEditor } from "../components/ParagraphEditor";
import { SettingsModal } from "../components/SettingsModal";
import { WordUsageDisplay } from "../components/WordUsageDisplay";
import { ThemeToggle } from "../components/ThemeToggle";
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
    <div className="min-h-screen py-8 px-4 text-foreground">
      <div className="max-w-6xl mx-auto">
        {/* Beautiful Header Section */}
        <div className="text-center mb-12 slide-up">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 btn-gradient rounded-2xl flex items-center justify-center pulse-glow">
                <Wand2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent mb-4">
            VoiceForge AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your text into natural, expressive speech with advanced AI voices. 
            Perfect for content creation, accessibility, and storytelling.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(true)}
              className="glass-card border-purple-200 hover:border-purple-300 transition-all duration-300"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure API
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Word Usage Display */}
        {wordUsage && !isLoadingUsage && (
          <div className="slide-up">
            <WordUsageDisplay 
              usage={wordUsage} 
              currentWords={countTotalWords(paragraphs.filter(p => p.text.trim()))}
            />
          </div>
        )}

        {/* Main Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Content - Paragraph Editors */}
          <div className="lg:col-span-8 space-y-6">
            {/* Success Message */}
            {audioState.audioUrl && !audioState.error && (
              <Alert className="glass-card border-green-200 bg-green-50/80 text-green-800 success-fade backdrop-blur-sm">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  🎉 Speech generated successfully! Audio is ready for playback.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {audioState.error && (
              <Alert className="glass-card border-red-200 bg-red-50/80 text-red-800 error-shake backdrop-blur-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{audioState.error}</AlertDescription>
              </Alert>
            )}

            {/* Paragraph Editors */}
            {paragraphs.map((paragraph, index) => (
              <div key={paragraph.id} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ParagraphEditor
                  paragraph={paragraph}
                  index={index}
                  onUpdate={(updated) => updateParagraph(paragraph.id, updated)}
                  onDelete={() => deleteParagraph(paragraph.id)}
                  showDelete={paragraphs.length > 1}
                />
              </div>
            ))}

            {/* Add Paragraph Button */}
            <div className="scale-in">
              <Button
                variant="outline"
                onClick={addParagraph}
                className="w-full glass-card border-dashed border-2 border-purple-300 hover:border-purple-400 
                           text-purple-600 hover:text-purple-700 py-6 transition-all duration-300 
                           hover:shadow-lg hover:scale-[1.02]"
                data-testid="button-add-paragraph"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Paragraph
              </Button>
            </div>
          </div>

          {/* Right Sidebar - Actions & Audio */}
          <div className="lg:col-span-4 space-y-6">
            {/* Action Buttons */}
            <div className="glass-card p-6 space-y-4 float-animation">
              <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Voice Generation
              </h3>
              
              <Button
                onClick={handleGenerateSpeech}
                disabled={audioState.isGenerating}
                className="w-full btn-gradient text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="button-generate-speech"
              >
                {audioState.isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Magic...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Voice
                  </>
                )}
              </Button>

              {audioState.audioUrl && (
                <Button
                  onClick={handleDownloadAudio}
                  variant="outline"
                  className="w-full glass-card border-green-300 text-green-600 hover:text-green-700 
                             hover:border-green-400 transition-all duration-300"
                  data-testid="button-download-audio"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download MP3
                </Button>
              )}
            </div>

            {/* Audio Player */}
            {audioState.audioUrl && (
              <div className="glass-card p-6 success-fade" data-testid="audio-container">
                <h4 className="text-lg font-semibold text-center mb-4 flex items-center justify-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Your Audio
                </h4>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
                  <audio
                    controls
                    className="w-full"
                    src={audioState.audioUrl}
                    data-testid="audio-player"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  🎵 Ready for playback and download
                </p>
              </div>
            )}

            {/* Statistics Card */}
            <div className="glass-card p-6">
              <h4 className="text-lg font-semibold mb-4 text-center">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Paragraphs</span>
                  <span className="font-semibold text-lg">{paragraphs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Words</span>
                  <span className="font-semibold text-lg">
                    {countTotalWords(paragraphs.filter(p => p.text.trim()))}
                  </span>
                </div>
                {wordUsage && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="font-semibold text-lg text-green-600">
                      {wordUsage.wordsRemaining.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
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
