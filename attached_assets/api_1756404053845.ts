let ELEVEN_LABS_API_KEY = "sk_ea800981c7ee4e34b2a9c2c1174a0e37218f9ad95d4f2c90"; // Default key
const API_BASE_URL = "https://api.elevenlabs.io/v1";

export const setApiKey = (key: string) => {
  ELEVEN_LABS_API_KEY = key;
};

// Function to get supported MIME type for MediaRecorder
const getSupportedMimeType = () => {
  const types = [
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
    'audio/wav',
    'audio/mp4'
  ];
  return types.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
};

// Function to create silent audio of specified duration
const createSilentAudio = async (durationInSeconds: number): Promise<Blob> => {
  let audioContext: AudioContext | null = null;
  let source: AudioBufferSourceNode | null = null;
  let mediaRecorder: MediaRecorder | null = null;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const numberOfChannels = 1;
    const frameCount = sampleRate * durationInSeconds;
    
    const buffer = audioContext.createBuffer(numberOfChannels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = 0; // Silence
    }

    source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);
    
    const mimeType = getSupportedMimeType();
    mediaRecorder = new MediaRecorder(destination.stream, {
      mimeType
    });
    
    const chunks: BlobPart[] = [];
    
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) {
        reject(new Error('Failed to create MediaRecorder'));
        return;
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(blob);
        } catch (err) {
          reject(err);
        } finally {
          cleanup();
        }
      };

      mediaRecorder.onerror = (err) => {
        reject(err);
        cleanup();
      };
      
      const cleanup = () => {
        if (source) {
          try {
            source.stop();
          } catch (e) {
            console.error('Error stopping source:', e);
          }
        }
        if (audioContext) {
          audioContext.close().catch(console.error);
        }
      };
      
      try {
        mediaRecorder.start();
        source.start();
        
        setTimeout(() => {
          try {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          } catch (err) {
            reject(err);
            cleanup();
          }
        }, durationInSeconds * 1000 + 100);
      } catch (err) {
        reject(err);
        cleanup();
      }
    });
  } catch (error) {
    if (source) {
      try {
        source.stop();
      } catch (e) {
        console.error('Error stopping source:', e);
      }
    }
    if (audioContext) {
      audioContext.close().catch(console.error);
    }
    console.error("Error creating silent audio:", error);
    throw error;
  }
};

export const textToSpeech = async (
  text: string,
  voiceId: string,
  settings: {
    stability: number;
    similarity_boost: number;
    speed: number;
    pitch: number;
    silenceInterval: number;
  }
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/text-to-speech/${voiceId}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarity_boost,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
      throw new Error(`Failed to generate speech: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};