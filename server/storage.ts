import { type User, type InsertUser, type ApiKeyUsage, type InsertApiKeyUsage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  storeAudioFile(filename: string, data: Buffer): Promise<string>;
  getAudioFile(filename: string): Promise<Buffer | undefined>;
  getApiKeyUsage(apiKeyHash: string): Promise<ApiKeyUsage | undefined>;
  createOrUpdateApiKeyUsage(usage: InsertApiKeyUsage): Promise<ApiKeyUsage>;
  updateWordsUsed(apiKeyHash: string, wordsUsed: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private audioFiles: Map<string, Buffer>;
  private apiKeyUsage: Map<string, ApiKeyUsage>;

  constructor() {
    this.users = new Map();
    this.audioFiles = new Map();
    this.apiKeyUsage = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async storeAudioFile(filename: string, data: Buffer): Promise<string> {
    this.audioFiles.set(filename, data);
    return filename;
  }

  async getAudioFile(filename: string): Promise<Buffer | undefined> {
    return this.audioFiles.get(filename);
  }

  async getApiKeyUsage(apiKeyHash: string): Promise<ApiKeyUsage | undefined> {
    return this.apiKeyUsage.get(apiKeyHash);
  }

  async createOrUpdateApiKeyUsage(usage: InsertApiKeyUsage): Promise<ApiKeyUsage> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const existing = this.apiKeyUsage.get(usage.apiKeyHash);
    
    if (existing && existing.currentMonth === currentMonth) {
      // Update existing usage for current month
      const updated: ApiKeyUsage = {
        ...existing,
        wordsUsed: usage.wordsUsed || existing.wordsUsed,
        lastUpdated: new Date().toISOString()
      };
      this.apiKeyUsage.set(usage.apiKeyHash, updated);
      return updated;
    } else {
      // Create new or reset for new month
      const newUsage: ApiKeyUsage = {
        id: randomUUID(),
        apiKeyHash: usage.apiKeyHash,
        wordsUsed: usage.wordsUsed || 0,
        monthlyLimit: usage.monthlyLimit || 10000,
        currentMonth,
        lastUpdated: new Date().toISOString()
      };
      this.apiKeyUsage.set(usage.apiKeyHash, newUsage);
      return newUsage;
    }
  }

  async updateWordsUsed(apiKeyHash: string, wordsUsed: number): Promise<void> {
    const existing = this.apiKeyUsage.get(apiKeyHash);
    if (existing) {
      const updated = {
        ...existing,
        wordsUsed: existing.wordsUsed + wordsUsed,
        lastUpdated: new Date().toISOString()
      };
      this.apiKeyUsage.set(apiKeyHash, updated);
    }
  }
}

export const storage = new MemStorage();
