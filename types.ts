
export type Sign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' 
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' 
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface ZodiacSignInfo {
  id: Sign;
  name: string;
  date: string;
  icon: string;
  color: string;
}

export interface FortuneResult {
  summary: string;
  love: number;
  work: number;
  health: number;
  money: number;
  luckyColor: string;
  luckyNumber: number;
  bestMatch: string;
  suggestion: string;
}

export interface MatchResult {
  score: number;
  analysis: string;
  advice: string;
}

export interface MysteryBoxResult {
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  outlook: string;
  spiritAnimal: string;
}
