import { Paragraph } from "../types";

export function countWords(text: string): number {
  // Remove extra whitespace and split by word boundaries
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

export function countTotalWords(paragraphs: Paragraph[]): number {
  return paragraphs.reduce((total, paragraph) => {
    return total + countWords(paragraph.text);
  }, 0);
}

export function formatWordCount(count: number): string {
  if (count === 1) {
    return "1 word";
  }
  return `${count.toLocaleString()} words`;
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