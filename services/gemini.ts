
import { GoogleGenAI, Type } from "@google/genai";
import { FortuneResult, MatchResult, MysteryBoxResult } from "../types";

/**
 * 辅助函数：清洗模型返回的内容
 */
const cleanJsonResponse = (text: string): string => {
  return text.replace(/```json\n?|```/g, "").trim();
};

/**
 * 获取 AI 实例
 * 根据规范，必须且仅能从 process.env.API_KEY 获取
 */
const getAiInstance = () => {
  // 注意：在 Vercel 静态部署中，构建工具会在打包时替换此值
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Critical Error: process.env.API_KEY is undefined. Please check Vercel Environment Variables.");
    throw new Error("API_KEY_MISSING");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const getDailyFortune = async (sign: string, userName: string, birthday: string, seed: number): Promise<FortuneResult> => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `请作为一名资深占星师，为名为"${userName}"（出生日期：${birthday}）的${sign}用户提供今日专属运势分析。请根据这些个人信息提供针对性的温暖且富有洞察力的语言。`,
      config: {
        seed: seed,
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

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    
    return JSON.parse(cleanJsonResponse(text));
  } catch (error: any) {
    console.error("Gemini API Error (DailyFortune):", error);
    if (error.message === "API_KEY_MISSING") throw error;
    throw new Error(error.message || "星象解析失败");
  }
};

export const getMatchAnalysis = async (sign1: string, sign2: string): Promise<MatchResult> => {
  try {
    const ai = getAiInstance();
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
    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(cleanJsonResponse(text));
  } catch (error: any) {
    console.error("Gemini API Error (Match):", error);
    throw error;
  }
};

export const getMysteryBox = async (sign: string): Promise<MysteryBoxResult> => {
  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `请为${sign}开启性格盲盒。分析其核心性格特征、优势、弱点以及未来的一段运势展望。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            outlook: { type: Type.STRING },
            spiritAnimal: { type: Type.STRING }
          },
          required: ["traits", "strengths", "weaknesses", "outlook", "spiritAnimal"]
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(cleanJsonResponse(text));
  } catch (error: any) {
    console.error("Gemini API Error (MysteryBox):", error);
    throw error;
  }
};
