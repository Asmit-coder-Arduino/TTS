import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSpeechRequestSchema, wordCountSchema, type WordCountResponse, type UsageValidationResult } from "@shared/schema";
import { randomUUID } from "crypto";
import { countTotalWords, hashApiKey, getCurrentMonth } from "./utils/wordCounter";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Helper function to validate word usage
  async function validateWordUsage(apiKey: string, requestedWords: number): Promise<UsageValidationResult> {
    const apiKeyHash = hashApiKey(apiKey);
    const currentMonth = getCurrentMonth();
    
    let usage = await storage.getApiKeyUsage(apiKeyHash);
    
    if (!usage || usage.currentMonth !== currentMonth) {
      // Create new usage record for current month
      usage = await storage.createOrUpdateApiKeyUsage({
        apiKeyHash,
        wordsUsed: 0,
        monthlyLimit: 10000,
        currentMonth
      });
    }
    
    const wordsRemaining = usage.monthlyLimit - usage.wordsUsed;
    const canProceed = requestedWords <= wordsRemaining;
    
    return {
      canProceed,
      wordsUsed: usage.wordsUsed,
      monthlyLimit: usage.monthlyLimit,
      wordsRemaining,
      requestedWords,
      message: canProceed 
        ? `You have ${wordsRemaining} words remaining this month.`
        : `Insufficient words remaining. You need ${requestedWords} words but only have ${wordsRemaining} remaining.`
    };
  }
  
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

      // Count total words in all paragraphs
      const totalWords = countTotalWords(paragraphs);
      
      // Validate word usage before making API call
      const usageValidation = await validateWordUsage(apiKey, totalWords);
      
      if (!usageValidation.canProceed) {
        return res.status(400).json({
          success: false,
          error: usageValidation.message,
          wordsUsed: usageValidation.wordsUsed,
          monthlyLimit: usageValidation.monthlyLimit,
          wordsRemaining: usageValidation.wordsRemaining,
          requestedWords: usageValidation.requestedWords
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

      // Update word usage after successful generation
      const apiKeyHash = hashApiKey(apiKey);
      await storage.updateWordsUsed(apiKeyHash, totalWords);
      
      // Get updated usage stats
      const updatedUsage = await storage.getApiKeyUsage(apiKeyHash);
      const wordsRemaining = updatedUsage ? updatedUsage.monthlyLimit - updatedUsage.wordsUsed : 0;

      res.json({ 
        success: true, 
        audioUrl: `/api/audio/${filename}`,
        message: "Speech generated successfully",
        wordsUsed: totalWords,
        totalWordsUsed: updatedUsage?.wordsUsed || 0,
        wordsRemaining,
        monthlyLimit: updatedUsage?.monthlyLimit || 10000
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

  // Get word usage statistics
  app.post("/api/word-usage", async (req, res) => {
    try {
      const validatedData = wordCountSchema.parse(req.body);
      const { apiKey } = validatedData;

      if (!apiKey || !apiKey.startsWith('sk_')) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid API key format. ElevenLabs API key should start with 'sk_'" 
        });
      }

      const apiKeyHash = hashApiKey(apiKey);
      const currentMonth = getCurrentMonth();
      
      let usage = await storage.getApiKeyUsage(apiKeyHash);
      
      if (!usage || usage.currentMonth !== currentMonth) {
        // Create new usage record for current month
        usage = await storage.createOrUpdateApiKeyUsage({
          apiKeyHash,
          wordsUsed: 0,
          monthlyLimit: 10000,
          currentMonth
        });
      }

      const response: WordCountResponse = {
        success: true,
        wordsUsed: usage.wordsUsed,
        monthlyLimit: usage.monthlyLimit,
        wordsRemaining: usage.monthlyLimit - usage.wordsUsed,
        currentMonth: usage.currentMonth
      };

      res.json(response);

    } catch (error) {
      console.error('Word usage error:', error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to get word usage statistics" 
      });
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
