import Taro from '@tarojs/taro';
import { FortuneResult, MatchResult, MysteryBoxResult } from '../types';

/**
 * ⚠️ 重要：微信小程序无法直接访问 Google API，也无法在前端运行 Node.js 环境。
 * 你必须搭建一个后端服务（如 Vercel, Cloudflare Worker, 或 Node.js 服务器）。
 * 
 * 下面的 URL 必须替换为你自己的后端地址，并且需要在微信后台配置 request 合法域名。
 */
const API_BASE_URL = 'https://api.your-domain.com/api'; 

const request = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const res = await Taro.request({
      url: `${API_BASE_URL}${endpoint}`,
      method: 'POST',
      data: data,
      header: {
        'content-type': 'application/json'
      }
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T;
    } else {
      throw new Error(res.data.message || '网络请求失败');
    }
  } catch (error) {
    console.error('API Request Error:', error);
    Taro.showToast({ title: '星象连接中断', icon: 'none' });
    throw error;
  }
};

export const getDailyFortune = (
  sign: string, 
  userName: string, 
  birthday: string, 
  gender: string,
  seed: number
) => {
  return request<FortuneResult>('/fortune', { sign, userName, birthday, gender, seed });
};

export const getMatchAnalysis = (
  sign1: string, 
  sign2: string, 
  userGender: string, 
  userBirthday: string,
  seed: number
) => {
  return request<MatchResult>('/match', { sign1, sign2, userGender, userBirthday, seed });
};

export const getMysteryBox = (
  sign: string, 
  gender: string, 
  birthday: string,
  seed?: number
) => {
  return request<MysteryBoxResult>('/mystery', { sign, gender, birthday, seed });
};