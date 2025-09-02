import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Key, Shield, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
}

export function SettingsModal({ isOpen, onClose, apiKey, onApiKeyChange }: SettingsModalProps) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const testApiKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest('POST', '/api/test-api-key', { apiKey: key });
      return response.json();
    },
    onMutate: () => {
      setConnectionStatus('testing');
      setErrorMessage('');
    },
    onSuccess: () => {
      setConnectionStatus('success');
      toast({
        title: "Success",
        description: "API key validated successfully",
      });
    },
    onError: (error) => {
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Failed to validate API key');
    }
  });

  const handleSave = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (tempApiKey.trim()) {
      onApiKeyChange(tempApiKey.trim());
      
      // Test the API key
      testApiKeyMutation.mutate(tempApiKey.trim());
      
      // Close modal after a short delay if testing is successful
      setTimeout(() => {
        if (connectionStatus === 'success') {
          onClose();
        }
      }, 1500);
    } else {
      setConnectionStatus('error');
      setErrorMessage('Please enter a valid API key');
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    // Reset state when closing
    setConnectionStatus('idle');
    setErrorMessage('');
    setTempApiKey(apiKey); // Reset to original API key
    onClose();
  };

  const handleClose = () => {
    // Reset state when closing via X button or backdrop
    setConnectionStatus('idle');
    setErrorMessage('');
    setTempApiKey(apiKey); // Reset to original API key
    onClose();
  };

  const handleTestConnection = () => {
    if (tempApiKey.trim()) {
      testApiKeyMutation.mutate(tempApiKey.trim());
    } else {
      setConnectionStatus('error');
      setErrorMessage('Please enter an API key first');
    }
  };

  const getStatusAlert = () => {
    switch (connectionStatus) {
      case 'testing':
        return (
          <Alert className="glass-card border-blue-200 bg-blue-50/80 text-blue-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription className="font-medium">Testing API connection...</AlertDescription>
          </Alert>
        );
      case 'success':
        return (
          <Alert className="glass-card border-green-200 bg-green-50/80 text-green-800 success-fade">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">🎉 API connection established successfully!</AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert className="glass-card border-red-200 bg-red-50/80 text-red-800 error-shake">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="max-w-lg glass-card border-2 dialog-no-slide" 
        data-testid="modal-settings"
      >
        <DialogHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            API Configuration
          </DialogTitle>
          <p className="text-muted-foreground">
            Connect your ElevenLabs account to start generating amazing voices
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              ElevenLabs API Key
            </Label>
            <Input
              type="password"
              placeholder="sk_..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="w-full enhanced-input border-purple-200 hover:border-purple-300 text-center text-lg"
              data-testid="input-api-key"
            />
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                🔐 Your API key is stored securely and never shared. Get yours from{" "}
                <a 
                  href="https://elevenlabs.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  elevenlabs.io
                </a>
              </p>
            </div>
          </div>

          {getStatusAlert()}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testApiKeyMutation.isPending || !tempApiKey.trim()}
              className="flex-1 glass-card border-blue-200 text-blue-600 hover:text-blue-700 hover:border-blue-300"
              data-testid="button-test-connection"
            >
              {testApiKeyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="glass-card border-gray-200 hover:border-gray-300"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!tempApiKey.trim()}
              className="flex-1 btn-gradient text-white font-medium"
              data-testid="button-save"
            >
              <Shield className="w-4 h-4 mr-2" />
              Save & Connect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
