
import { GoogleGenAI, Type } from "@google/genai";
import { FortuneResult } from "../types";

const getLifeStage = (birthday: string): string => {
  if (!birthday) return "全阶段";
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  if (age < 18) return `${age}岁的学生时代`;
  if (age < 25) return `${age}岁的青年才俊时代`;
  if (age < 35) return `${age}岁的黄金壮年期`;
  if (age < 50) return `${age}岁的中年稳健期`;
  return `${age}岁的睿智长者阶段`;
};

const cleanJsonResponse = (text: string | undefined): string => {
  if (!text) return "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text.replace(/```json\n?|```/g, "").trim();
};

export const getDailyFortune = async (
  sign: string, 
  userName: string, 
  birthday: string, 
  gender: string,
  seed: number
): Promise<FortuneResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const lifeStage = getLifeStage(birthday);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `你是一位精通心理学与占星术的导师。现在请为名为"${userName}"、性别为"${gender}"、处于"${lifeStage}"阶段的"${sign}"用户提供今日专属运势报告。`,
    config: {
      seed,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          overallScore: { type: Type.INTEGER },
          love: { type: Type.INTEGER },
          loveDetail: { type: Type.STRING },
          work: { type: Type.INTEGER },
          workDetail: { type: Type.STRING },
          health: { type: Type.INTEGER },
          healthDetail: { type: Type.STRING },
          money: { type: Type.INTEGER },
          moneyDetail: { type: Type.STRING },
          luckyColor: { type: Type.STRING },
          luckyNumber: { type: Type.INTEGER },
          bestMatch: { type: Type.STRING },
          suggestion: { type: Type.STRING }
        },
        required: ["summary", "overallScore", "love", "loveDetail", "work", "workDetail", "health", "healthDetail", "money", "moneyDetail", "luckyColor", "luckyNumber", "bestMatch", "suggestion"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const getPetResponse = async (
  petType: string,
  petName: string,
  userName: string,
  userSign: string,
  userInput?: string,
  currentMood: number = 100
): Promise<{ text: string, moodChange: number, emotion: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = userInput 
    ? `主人"${userName}"（${userSign}）说："${userInput}"。`
    : `主人"${userName}"在看你。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是${petType}"${petName}"。主人是${userSign}${userName}。回应主人(30字内)。返回心情变化和表情。`,
      config: {
        systemInstruction: `你是主人的星际宠物，性格极度符合${petType}。不要废话，保持极速回应。`,
        responseMimeType: "application/json",
        // 关键优化：禁用推理，降低延迟
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            moodChange: { type: Type.INTEGER },
            emotion: { type: Type.STRING }
          },
          required: ["text", "moodChange", "emotion"]
        }
      }
    });
    
    return JSON.parse(cleanJsonResponse(response.text));
  } catch (e) {
    console.error("Pet API Error:", e);
    return { text: "星际信号波动中...喵呜？", moodChange: 0, emotion: "📡" };
  }
};

export const getMatchAnalysis = async (sign1: string, sign2: string, userGender: string, userBirthday: string, seed: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `分析${sign1}和${sign2}的配对。`,
    config: {
      seed,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          analysis: { type: Type.STRING },
          advice: { type: Type.STRING }
        },
        required: ["score", "analysis", "advice"]
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const getMysteryBox = async (sign: string, gender: string, birthday: string, seed?: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `为${sign}分析盲盒性格。`,
    config: {
      seed,
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
  return JSON.parse(cleanJsonResponse(response.text));
};

export const askZodiacAdvisor = async (
  message: string,
  history: any[],
  userName: string,
  userSign: string,
  birthday: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = [...history, { role: 'user', parts: [{ text: message }] }];
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.shift();
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction: `你是一位精通心理学与占星术的导师。你正在为名为"${userName}"、星座为"${userSign}"、出生日期为"${birthday}"的旅者提供解答。`,
    },
  });
  return response.text || "星象模糊...";
};
