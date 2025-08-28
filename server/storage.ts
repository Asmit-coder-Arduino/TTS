import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  storeAudioFile(filename: string, data: Buffer): Promise<string>;
  getAudioFile(filename: string): Promise<Buffer | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private audioFiles: Map<string, Buffer>;

  constructor() {
    this.users = new Map();
    this.audioFiles = new Map();
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
}

export const storage = new MemStorage();
