import { Paragraph } from "../types";

export function countCharacters(text: string): number {
  // Count total characters (including spaces and punctuation)
  return text.length;
}

export function countTotalCharacters(paragraphs: Paragraph[]): number {
  return paragraphs.reduce((total, paragraph) => {
    return total + countCharacters(paragraph.text);
  }, 0);
}

export function formatCharacterCount(count: number): string {
  if (count === 1) {
    return "1 character";
  }
  return `${count.toLocaleString()} characters`;
}

export function getUsagePercentage(used: number, limit: number): number {
  return Math.round((used / limit) * 100);
}

export function getUsageStatus(used: number, limit: number): 'safe' | 'warning' | 'danger' {
  const percentage = (used / limit) * 100;
  if (percentage >= 90) return 'danger';
  if (percentage >= 75) return 'warning';
  return 'safe';
}