
import { GoogleGenAI, Type } from "@google/genai";
import { FortuneResult, MatchResult, MysteryBoxResult, Sign } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDailyFortune = async (sign: string): Promise<FortuneResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `请作为一名资深占星师，为${sign}提供今日(包含爱情、事业、健康、财运)的运势分析。请用温暖且富有洞察力的语言。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "今日总评" },
          love: { type: Type.INTEGER, description: "爱情指数 0-100" },
          work: { type: Type.INTEGER, description: "事业指数 0-100" },
          health: { type: Type.INTEGER, description: "健康指数 0-100" },
          money: { type: Type.INTEGER, description: "财运指数 0-100" },
          luckyColor: { type: Type.STRING, description: "幸运颜色" },
          luckyNumber: { type: Type.INTEGER, description: "幸运数字" },
          bestMatch: { type: Type.STRING, description: "今日速配星座" },
          suggestion: { type: Type.STRING, description: "给今日的建议" }
        },
        required: ["summary", "love", "work", "health", "money", "luckyColor", "luckyNumber", "bestMatch", "suggestion"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getMatchAnalysis = async (sign1: string, sign2: string): Promise<MatchResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `分析${sign1}和${sign2}的恋爱匹配度，包括性格契合度、潜在矛盾和相处建议。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: "匹配得分 0-100" },
          analysis: { type: Type.STRING, description: "深度契合分析" },
          advice: { type: Type.STRING, description: "给这段关系的建议" }
        },
        required: ["score", "analysis", "advice"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getMysteryBox = async (sign: string): Promise<MysteryBoxResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `请为${sign}开启性格盲盒。分析其核心性格特征、优势、弱点以及未来的一段运势展望。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          traits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "核心性格标签" },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "性格优势" },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "性格弱点" },
          outlook: { type: Type.STRING, description: "未来展望" },
          spiritAnimal: { type: Type.STRING, description: "代表性的灵魂动物" }
        },
        required: ["traits", "strengths", "weaknesses", "outlook", "spiritAnimal"]
      }
    }
  });

  return JSON.parse(response.text);
};
