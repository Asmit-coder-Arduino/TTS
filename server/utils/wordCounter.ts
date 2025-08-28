import crypto from 'crypto';

export function countWords(text: string): number {
  // Remove extra whitespace and split by word boundaries
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

export function hashApiKey(apiKey: string): string {
  // Create a hash of the API key for storage (privacy protection)
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM format
}

export function countTotalWords(paragraphs: Array<{ text: string }>): number {
  return paragraphs.reduce((total, paragraph) => {
    return total + countWords(paragraph.text);
  }, 0);
}