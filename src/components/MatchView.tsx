import React, { useState, useEffect, useCallback } from 'react';
// Fix: Cast Taro components to any to resolve VueComponentType JSX mismatch
import { View as _View, Text as _Text, Image as _Image, Button as _Button } from '@tarojs/components'; 
import Taro, { useShareAppMessage, useRouter } from '@tarojs/taro'; 
import { ZODIAC_SIGNS } from '../constants';
import { MatchResult, ZodiacSignInfo } from '../types';
import { getMatchAnalysis } from '../services/api';
import { CelestialLoading, useTheme } from '../components/Layout';

const View = _View as any;
const Text = _Text as any;
const Image = _Image as any;
const Button = _Button as any;

const saveToHistory = (type: string, data: any) => {
  const history = Taro.getStorageSync('zodiac_history') || [];
  const newItem = { id: Date.now(), type, timestamp: new Date().toLocaleString(), data };
  Taro.setStorageSync('zodiac_history', [newItem, ...history].slice(0, 50));
};

export default function MatchView() {
  const { theme } = useTheme();
  const router = useRouter(); 
  
  const [currentSeed, setCurrentSeed] = useState<number>(0);
  const [sign1, setSign1] = useState<ZodiacSignInfo | null>(null);
  const [sign2, setSign2] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 追踪当前结果使用的上下文，确保分享时数据一致
  const [matchContext, setMatchContext] = useState({ gender: '', birthday: '' });

  // 初始化逻辑：处理从分享卡片进来的参数
  useEffect(() => {
    // router.params 自动解析 path 中的 query 参数
    const { s1: s1Id, s2: s2Id, seed, gen, bday } = router.params;

    if (s1Id && s2Id) {
      const s1 = ZODIAC_SIGNS.find(s => s.id === s1Id);
      const s2 = ZODIAC_SIGNS.find(s => s.id === s2Id);
      
      if (s1 && s2) {
        setSign1(s1);
        setSign2(s2);
        
        if (seed) {
            const seedNum = parseInt(seed as string, 10);
            setCurrentSeed(seedNum);
            // 如果存在 seed，说明是从分享进来的，自动加载结果
            autoLoadMatch(s1, s2, seedNum, gen as string, bday as string);
        }
      }
    }
  }, [router.params]);

  const autoLoadMatch = async (s1: ZodiacSignInfo, s2: ZodiacSignInfo, seed: number, urlGen?: string, urlBday?: string) => {
    setLoading(true);
    // 优先使用 URL 中的上下文，保证结果与分享者一致
    const gender = urlGen || Taro.getStorageSync('zodiac_user_gender') || '未设定';
    const birthday = urlBday || Taro.getStorageSync('zodiac_user_birthday') || '';
    
    // 更新当前上下文
    setMatchContext({ gender, birthday });

    try {
        const data = await getMatchAnalysis(s1.name, s2.name, gender, birthday, seed);
        setResult(data);
    } catch (e) {
        setError("星链连接中断");
    } finally {
        setLoading(false);
    }
  };

  const onStartMatch = async () => {
    if(!sign1 || !sign2) return;
    setLoading(true);
    setError(null);
    
    const newSeed = Math.floor(Math.random() * 1000000);
    setCurrentSeed(newSeed);
    
    const gender = Taro.getStorageSync('zodiac_user_gender') || '未设定';
    const birthday = Taro.getStorageSync('zodiac_user_birthday') || '';

    // 更新当前上下文
    setMatchContext({ gender, birthday });

    try {
      const data = await getMatchAnalysis(sign1.name, sign2.name, gender, birthday, newSeed);
      setResult(data);
      saveToHistory('星盘配对', { 
        signs: `${sign1.name} & ${sign2.name}`, 
        score: data.score,
        analysis: data.analysis.substring(0, 60) + '...'
      });
    } catch (err) {
      setError('连接失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
      setResult(null);
      setSign1(null);
      setSign2(null);
  };

  /**
   * 微信原生分享配置
   */
  useShareAppMessage(() => {
    if (result && sign1 && sign2) {
      const { gender, birthday } = matchContext;
      
      return {
        title: `【${result.score}%】${sign1.name} x ${sign2.name} 缘分契合度报告`,
        path: `/pages/match/index?s1=${sign1.id}&s2=${sign2.id}&seed=${currentSeed}&gen=${gender}&bday=${birthday}`,
        imageUrl: sign1.image
      };
    }
    return {
      title: '星语配对 - 测测你们的缘分契合度',
      path: '/pages/match/index'
    };
  });

  if (loading) return <CelestialLoading message="正在排列星盘，测算缘分..." />;

  return (
    <View className="animate-fade-in pb-8">
      <View className="flex flex-col items-center mb-6">
        <Text className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-1`}>星盘配对</Text>
        <Text className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-[10px] font-bold uppercase tracking-widest`}>缘分次元链接</Text>
      </View>

      {!result ? (
        <View className="space-y-6">
          {/* 配对槽位 */}
          <View className="flex justify-center gap-6">
            {/* 左侧星座 */}
            <View className="flex flex-col items-center gap-3">
              <View 
                onClick={() => setSign1(null)}
                className={`w-24 h-24 glass-card rounded-3xl overflow-hidden flex items-center justify-center border-dashed border-2 transition-all ${sign1 ? `border-purple-500/50 scale-105 shadow-xl` : theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}
              >
                {sign1 ? <Image src={sign1.image} className="w-full h-full" mode="aspectFill" /> : <Text className="text-2xl text-slate-500 opacity-50">+</Text>}
              </View>
              <Text className={`text-center text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{sign1 ? sign1.name : '我的星座'}</Text>
            </View>
            
            <View className="h-24 flex items-center justify-center">
               <View className={`text-2xl transition-colors ${sign1 && !sign2 ? 'text-pink-500 animate-pulse' : 'text-slate-700/20'}`}>
                 ❤️
               </View>
            </View>
            
            {/* 右侧星座 */}
            <View className="flex flex-col items-center gap-3">
              <View 
                onClick={() => setSign2(null)}
                className={`w-24 h-24 glass-card rounded-3xl overflow-hidden flex items-center justify-center border-dashed border-2 transition-all ${sign2 ? `border-pink-500/50 scale-105 shadow-xl` : theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}
              >
                {sign2 ? <Image src={sign2.image} className="w-full h-full" mode="aspectFill" /> : <Text className="text-2xl text-slate-500 opacity-50">+</Text>}
              </View>
              <Text className={`text-center text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{sign2 ? sign2.name : '心动星座'}</Text>
            </View>
          </View>

          {/* 按钮 */}
          <Button 
            disabled={!sign1 || !sign2} 
            onClick={onStartMatch} 
            className={`w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-black shadow-lg shadow-purple-500/20 active:scale-95 transition-all border-none`}
            style={{ lineHeight: '1.5' }}
          >
            开启次元契合度测试
          </Button>

          {/* 选单 */}
          <View className="grid grid-cols-3 gap-4 p-5 glass-card rounded-[2rem] border-white/5">
            {ZODIAC_SIGNS.map((s) => (
              <View 
                key={s.id} 
                onClick={() => { if (!sign1) setSign1(s); else if (!sign2 && sign1.id !== s.id) setSign2(s); }} 
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${sign1?.id === s.id || sign2?.id === s.id ? 'opacity-20 scale-90 grayscale' : 'active:scale-95'}`}
              >
                <View className="w-12 h-12 rounded-full overflow-hidden mb-2 shadow-md border-2 border-white/10">
                   <Image src={s.image} className="w-full h-full" mode="aspectFill" />
                </View>
                <Text className="text-[11px] font-black text-slate-400">{s.name}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="glass-card p-10 rounded-[3rem] space-y-8 border-pink-500/30 animate-fade-in relative overflow-hidden">
          <View className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></View>
          
          <View className="flex justify-between items-center relative">
            <View onClick={reset} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                <Text>↩</Text>
            </View>
            <Button 
                openType="share" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 p-0 m-0 border-none leading-none min-h-0"
                style={{ background: 'rgba(255,255,255,0.1)' }}
            >
                <Text className="text-sm">🔗</Text>
            </Button>
          </View>

          <View className="text-center relative">
            <Text className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">{result.score}%</Text>
            <View className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3">默契同步率</View>
          </View>
          
          <View className="space-y-6">
            <View className={`p-8 rounded-[2rem] border transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-indigo-50/80 border-indigo-100'}`}>
              <Text className="text-[10px] font-black text-purple-400 mb-4 block">✨ 深度契合分析</Text>
              <Text className={`text-[15px] leading-relaxed font-medium block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{result.analysis}</Text>
            </View>
            <View className={`p-8 rounded-[2rem] border transition-colors ${theme === 'dark' ? 'bg-pink-500/5 border-pink-500/10' : 'bg-pink-50/80 border-pink-100'}`}>
              <Text className="text-[10px] font-black text-pink-400 mb-3 block">❤️ 次元共处建议</Text>
              <Text className={`text-[15px] italic font-medium leading-relaxed block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{result.advice}</Text>
            </View>
          </View>

          <Button onClick={reset} className="w-full py-4 rounded-[1.5rem] bg-white/5 text-slate-500 text-xs font-black border-none hover:bg-white/10 transition-colors">开启新测算</Button>
        </View>
      )}
    </View>
  );
};