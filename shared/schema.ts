import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const voiceSettingsSchema = z.object({
  stability: z.number().min(0).max(1).default(0.5),
  similarity_boost: z.number().min(0).max(1).default(0.5),
  speed: z.number().min(0.5).max(2).default(1.0),
  pitch: z.number().min(0).max(2).default(1.0),
  silenceInterval: z.number().min(0).max(10).default(1.0)
});

export const paragraphSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Text is required"),
  voiceId: z.string().min(1, "Voice ID is required"),
  language: z.enum(['en', 'hi']).default('en'),
  age: z.number().min(10).max(100).default(30),
  settings: voiceSettingsSchema
});

export const generateSpeechRequestSchema = z.object({
  paragraphs: z.array(paragraphSchema).min(1, "At least one paragraph is required"),
  apiKey: z.string().min(1, "API key is required")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type VoiceSettings = z.infer<typeof voiceSettingsSchema>;
export type Paragraph = z.infer<typeof paragraphSchema>;
export type GenerateSpeechRequest = z.infer<typeof generateSpeechRequestSchema>;

export interface Voice {
  id: string;
  name: string;
  language: 'en' | 'hi';
  gender: 'male' | 'female';
}

export interface AudioResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}
