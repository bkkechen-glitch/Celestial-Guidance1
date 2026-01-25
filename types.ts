
export type Sign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' 
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' 
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface PetInfo {
  type: 'Cat' | 'Fox' | 'Owl';
  name: string;
  level: number;
  exp: number;
  hunger: number;
  mood: number;
  birthday: string;
}

export interface ZodiacSignInfo {
  id: Sign;
  name: string;
  date: string;
  icon: string;
  image: string;
  color: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  birthday: string;
  gender: string;
  starEnergy: number;
  shareCount: number;
  lastSync: string;
  badges: string[];
  pet?: PetInfo; // 可选的宠物信息
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface FortuneResult {
  summary: string;
  overallScore: number;
  love: number;
  loveDetail: string;
  work: number;
  workDetail: string;
  health: number;
  healthDetail: string;
  money: number;
  moneyDetail: string;
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
