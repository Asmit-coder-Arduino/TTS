import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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

  const handleSave = () => {
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
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Testing API connection...</AlertDescription>
          </Alert>
        );
      case 'success':
        return (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>API connection established successfully</AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-settings">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-1">
              ElevenLabs API Key
            </Label>
            <Input
              type="password"
              placeholder="sk-..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="w-full"
              data-testid="input-api-key"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter your ElevenLabs API key for speech generation
            </p>
          </div>

          {getStatusAlert()}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testApiKeyMutation.isPending || !tempApiKey.trim()}
              data-testid="button-test-connection"
            >
              {testApiKeyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!tempApiKey.trim()}
              data-testid="button-save"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
