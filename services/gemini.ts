
import { GoogleGenAI, Type } from "@google/genai";
import { FortuneResult, MatchResult, MysteryBoxResult } from "../types";

/**
 * 获取 API Key 的最终解决方案
 */
const getApiKey = () => {
  // 1. 优先尝试 Vite 规范的客户端变量 (VITE_API_KEY)
  // @ts-ignore
  const viteKey = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_API_KEY || import.meta.env.API_KEY) : '';
  
  // 2. 尝试标准 process.env (Vercel 环境)
  // @ts-ignore
  const processKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';

  // 3. 尝试从 window 对象获取 (作为最后手段)
  // @ts-ignore
  const windowKey = typeof window !== 'undefined' ? (window.VITE_API_KEY || window.API_KEY) : '';

  const finalKey = viteKey || processKey || windowKey;
  
  return finalKey ? finalKey.trim() : '';
};

const getAIInstance = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("未找到 API_KEY。请确保在 Vercel 中配置了 VITE_API_KEY 环境变量。");
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const getDailyFortune = async (sign: string): Promise<FortuneResult> => {
  try {
    const ai = getAIInstance();
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

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini API 错误详情:", error);
    if (error.message === "API_KEY_MISSING") {
      throw new Error("配置缺失：请在 Vercel 设置中添加 VITE_API_KEY。");
    }
    const msg = error.toString();
    if (msg.includes("fetch") || msg.includes("Network")) {
      throw new Error("网络错误：浏览器无法连接到 Google API，请检查网络环境。");
    }
    throw new Error(`星象解析失败: ${error.message || '未知错误'}`);
  }
};

export const getMatchAnalysis = async (sign1: string, sign2: string): Promise<MatchResult> => {
  try {
    const ai = getAIInstance();
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
  } catch (error: any) {
    throw error;
  }
};

export const getMysteryBox = async (sign: string): Promise<MysteryBoxResult> => {
  try {
    const ai = getAIInstance();
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
    return JSON.parse(response.text);
  } catch (error: any) {
    throw error;
  }
};
