import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSpeechRequestSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate speech endpoint
  app.post("/api/generate-speech", async (req, res) => {
    try {
      const validatedData = generateSpeechRequestSchema.parse(req.body);
      const { paragraphs, apiKey } = validatedData;

      if (!apiKey || !apiKey.startsWith('sk_')) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid API key format. ElevenLabs API key should start with 'sk_'" 
        });
      }

      // Combine all paragraph texts with silence intervals
      let combinedText = "";
      paragraphs.forEach((paragraph, index) => {
        combinedText += paragraph.text;
        if (index < paragraphs.length - 1) {
          const silenceMs = Math.round(paragraph.settings.silenceInterval * 1000);
          combinedText += ` <break time="${silenceMs}ms"/> `;
        }
      });

      // Use the first paragraph's voice settings for the combined audio
      const firstParagraph = paragraphs[0];
      
      // Prepare ElevenLabs API request
      const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${firstParagraph.voiceId}`;
      
      const elevenLabsBody = {
        text: combinedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: firstParagraph.settings.stability,
          similarity_boost: firstParagraph.settings.similarity_boost,
          style: 0,
          use_speaker_boost: true
        }
      };

      // Add speed and pitch modulation if supported
      if (firstParagraph.settings.speed !== 1.0 || firstParagraph.settings.pitch !== 1.0) {
        elevenLabsBody.voice_settings = {
          ...elevenLabsBody.voice_settings,
          stability: Math.max(0, Math.min(1, firstParagraph.settings.stability * firstParagraph.settings.speed)),
        };
      }

      const response = await fetch(elevenLabsUrl, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify(elevenLabsBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to generate speech";
        
        if (response.status === 401) {
          errorMessage = "Invalid API key. Please check your ElevenLabs API key.";
        } else if (response.status === 422) {
          errorMessage = "Invalid voice ID or request parameters.";
        } else if (response.status === 429) {
          errorMessage = "API rate limit exceeded. Please try again later.";
        } else {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.detail?.message || errorJson.message || errorMessage;
          } catch {
            errorMessage = `API Error (${response.status}): ${errorText}`;
          }
        }
        
        return res.status(400).json({ 
          success: false, 
          error: errorMessage 
        });
      }

      // Get audio buffer from response
      const audioBuffer = Buffer.from(await response.arrayBuffer());
      
      if (audioBuffer.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Received empty audio response from ElevenLabs" 
        });
      }

      // Store audio file
      const filename = `speech_${randomUUID()}.mp3`;
      await storage.storeAudioFile(filename, audioBuffer);

      res.json({ 
        success: true, 
        audioUrl: `/api/audio/${filename}`,
        message: "Speech generated successfully" 
      });

    } catch (error) {
      console.error('Generate speech error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'ZodError') {
          return res.status(400).json({ 
            success: false, 
            error: "Invalid request data. Please check your input." 
          });
        }
        
        if (error.message.includes('fetch')) {
          return res.status(500).json({ 
            success: false, 
            error: "Network error connecting to ElevenLabs API. Please check your internet connection." 
          });
        }
      }

      res.status(500).json({ 
        success: false, 
        error: "Internal server error while generating speech" 
      });
    }
  });

  // Serve audio files
  app.get("/api/audio/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      
      if (!filename || !filename.endsWith('.mp3')) {
        return res.status(400).json({ error: "Invalid filename" });
      }

      const audioData = await storage.getAudioFile(filename);
      
      if (!audioData) {
        return res.status(404).json({ error: "Audio file not found" });
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioData.length);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(audioData);

    } catch (error) {
      console.error('Audio serve error:', error);
      res.status(500).json({ error: "Failed to serve audio file" });
    }
  });

  // Test API key endpoint
  app.post("/api/test-api-key", async (req, res) => {
    try {
      const { apiKey } = req.body;

      if (!apiKey || !apiKey.startsWith('sk_')) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid API key format. ElevenLabs API key should start with 'sk_'" 
        });
      }

      // Test with ElevenLabs voices endpoint
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey
        }
      });

      if (response.ok) {
        res.json({ success: true, message: "API key is valid" });
      } else {
        res.status(400).json({ 
          success: false, 
          error: "Invalid API key or API service unavailable" 
        });
      }

    } catch (error) {
      console.error('API key test error:', error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to validate API key" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
