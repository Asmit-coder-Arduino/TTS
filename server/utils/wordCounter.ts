import crypto from 'crypto';

export function countCharacters(text: string): number {
  // Count total characters (including spaces and punctuation)
  return text.length;
}

export function hashApiKey(apiKey: string): string {
  // Create a hash of the API key for storage (privacy protection)
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM format
}

export function countTotalCharacters(paragraphs: Array<{ text: string }>): number {
  return paragraphs.reduce((total, paragraph) => {
    return total + countCharacters(paragraph.text);
  }, 0);
}