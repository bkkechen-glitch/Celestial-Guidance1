import React, { useState, useEffect, useCallback } from 'react';
// Fix: Cast Taro components to any to resolve VueComponentType JSX mismatch
import { View as _View, Text as _Text, Button as _Button, Image as _Image } from '@tarojs/components';
import Taro, { useShareAppMessage, useRouter } from '@tarojs/taro';
import { ZODIAC_SIGNS } from '../constants';
import { MysteryBoxResult, ZodiacSignInfo } from '../types';
import { getMysteryBox } from '../services/api';
import { CelestialLoading, useTheme } from '../components/Layout';

const View = _View as any;
const Text = _Text as any;
const Button = _Button as any;
const Image = _Image as any;

const saveToHistory = (type: string, data: any) => {
  const history = Taro.getStorageSync('zodiac_history') || [];
  const newItem = { id: Date.now(), type, timestamp: new Date().toLocaleString(), data };
  Taro.setStorageSync('zodiac_history', [newItem, ...history].slice(0, 50));
};

// 灵动图腾 SVG：一个具有神秘感和星空感的通灵图标
const SpiritTotemIcon = ({ colorClass }: { colorClass: string }) => (
  <View className={`relative w-20 h-20 flex items-center justify-center`}>
    {/* 背景光晕 */}
    <View className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-20 blur-xl animate-pulse rounded-full`}></View>
    {/* 核心图标容器 */}
    <View className={`relative w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-2xl ring-2 ring-white/30 transform rotate-3`}>
      <View className="text-white text-3xl transform -rotate-3">
        <Text>✨</Text>
      </View>
      {/* 装饰线条 */}
      <View className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-lg"></View>
      <View className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-lg"></View>
    </View>
  </View>
);

export default function MysteryBoxView() {
  const { theme } = useTheme();
  const router = useRouter(); 
  
  const [selectedSign, setSelectedSign] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MysteryBoxResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSeed, setCurrentSeed] = useState<number>(0);
  
  const [boxContext, setBoxContext] = useState({ gender: '', birthday: '' });

  const handleOpenBox = useCallback(async (sign: ZodiacSignInfo, params?: { gen?: string, bday?: string, seed?: number }) => {
    setSelectedSign(sign);
    setLoading(true);
    setError(null);
    
    const seedToUse = params?.seed || Math.floor(Math.random() * 1000000);
    setCurrentSeed(seedToUse);

    const gender = params?.gen || Taro.getStorageSync('zodiac_user_gender') || '未设定';
    const birthday = params?.bday || Taro.getStorageSync('zodiac_user_birthday') || '';
    
    setBoxContext({ gender, birthday });

    try {
      const data = await getMysteryBox(sign.name, gender, birthday, seedToUse);
      setResult(data);
      saveToHistory('性格盲盒', { 
        sign: sign.name, 
        animal: data.spiritAnimal,
        outlook: data.outlook.substring(0, 60) + '...'
      });
    } catch (err) {
      setError('盲盒感应失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { s: sId, seed, gen, bday } = router.params;
    if (sId) {
      const sign = ZODIAC_SIGNS.find(s => s.id === sId);
      if (sign) {
        const seedNum = seed ? parseInt(seed as string, 10) : undefined;
        handleOpenBox(sign, { gen: gen as string, bday: bday as string, seed: seedNum });
      }
    }
  }, [router.params, handleOpenBox]);

  useShareAppMessage(() => {
    if (result && selectedSign) {
        const { gender, birthday } = boxContext;
        return {
            title: `【${selectedSign.name}】灵魂动物：${result.spiritAnimal}`,
            path: `/pages/mystery/index?s=${selectedSign.id}&seed=${currentSeed}&gen=${gender}&bday=${birthday}`,
            imageUrl: '' 
        };
    }
    return {
        title: '性格盲盒 - 揭示你的灵魂图腾',
        path: '/pages/mystery/index'
    };
  });

  if (loading) return <CelestialLoading message={`正在从星空中抽取 ${selectedSign?.name} 的性格盲盒...`} />;

  if (result && selectedSign) {
    return (
      <View className="animate-fade-in pb-24">
        <View className="flex justify-between items-center px-2 mb-8">
          <View onClick={() => { setResult(null); }} className={`w-10 h-10 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} flex items-center justify-center text-slate-500 shadow-sm`}>
             <Text className="text-xl">↩</Text>
          </View>
          <View className="text-center">
            <Text className={`text-xl font-black block ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{selectedSign.name} · 性格盲盒</Text>
            <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 block">Soul Archetype</Text>
          </View>
          <Button 
            openType="share"
            className={`w-10 h-10 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} flex items-center justify-center text-slate-500 border-none p-0 leading-none m-0 shadow-sm`}
            style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          >
             <Text className="text-lg">🎁</Text>
          </Button>
        </View>

        <View className={`glass-card p-10 rounded-[3.5rem] space-y-10 relative overflow-hidden border-2 transition-all duration-500 ${theme === 'dark' ? 'border-white/5 shadow-2xl' : 'border-white shadow-xl'}`}>
          {/* 背景装饰 */}
          <View className={`absolute -top-20 -right-20 opacity-10 pointer-events-none text-[15rem] rotate-12 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <Text>✨</Text>
          </View>
          
          {/* 灵魂图腾核心展示区 */}
          <View className="flex flex-col items-center justify-center gap-6 py-4">
            <SpiritTotemIcon colorClass={selectedSign.color} />
            
            <View className="text-center">
              <Text className="text-[11px] font-black uppercase tracking-[0.5em] mb-2 opacity-50 block">灵魂动物图腾</Text>
              <Text className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${selectedSign.color} drop-shadow-lg block`}>
                {result.spiritAnimal}
              </Text>
            </View>
          </View>

          <View className="space-y-8">
            {/* 特质标签 */}
            <View>
              <Text className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 block">
                <Text className="text-sm">🏷️</Text> 性格核心维度
              </Text>
              <View className="flex flex-wrap gap-2.5">
                {result.traits.map((t, i) => (
                  <View key={i} className={`px-5 py-2.5 rounded-full border border-white/10 ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                     <Text className={`text-[11px] font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 优势与挑战 */}
            <View className="grid grid-cols-2 gap-8">
              <View className="space-y-4">
                <View className="flex items-center gap-2 mb-1">
                  <Text className="text-emerald-400 text-lg">☀️</Text>
                  <Text className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">赋能之光</Text>
                </View>
                <View className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <View key={i} className="flex gap-2.5 items-start">
                      <Text className="text-emerald-500 text-[10px] mt-1">✦</Text>
                      <Text className={`text-[12px] font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View className="space-y-4">
                <View className="flex items-center gap-2 mb-1">
                  <Text className="text-rose-400 text-lg">🌙</Text>
                  <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest">进化之影</Text>
                </View>
                <View className="space-y-3">
                  {result.weaknesses.map((w, i) => (
                    <View key={i} className="flex gap-2.5 items-start">
                      <Text className="text-rose-400 text-[10px] mt-1">✧</Text>
                      <Text className={`text-[12px] font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{w}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* 生命展望 */}
            <View className={`pt-8 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
              <Text className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4 block">生命意向展望</Text>
              <View className={`p-6 rounded-[2rem] ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'} relative`}>
                <Text className="absolute top-4 left-4 text-4xl opacity-10 font-serif">"</Text>
                <Text className={`text-[15px] leading-relaxed italic font-medium block text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>
                  {result.outlook}
                </Text>
                <Text className="absolute bottom-2 right-6 text-4xl opacity-10 font-serif">"</Text>
              </View>
            </View>
          </View>

          <Button 
            onClick={() => { setResult(null); }} 
            className={`w-full py-5 rounded-[2rem] ${theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-600'} text-xs font-black border-none hover:opacity-80 transition-all active:scale-95 shadow-sm`}
          >
            探索其他星系图腾
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="animate-fade-in text-center space-y-10 pb-20">
      <View>
        <Text className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-pink-400 block mb-3">性格盲盒</Text>
        <Text className="text-xs text-slate-500 font-bold uppercase tracking-[0.4em] block">Celestial Blueprint</Text>
      </View>
      
      <View className="grid grid-cols-3 gap-5 px-1">
        {ZODIAC_SIGNS.map((sign) => (
          <View 
            key={sign.id} 
            onClick={() => handleOpenBox(sign)} 
            className={`flex flex-col items-center justify-center p-6 h-36 rounded-[2.5rem] bg-gradient-to-br ${sign.color} active:scale-90 transition-all border-2 border-white/20 relative overflow-hidden shadow-xl shadow-black/10`}
          >
            {/* 装饰性背景 */}
            <View className="absolute inset-0 bg-white/10 opacity-0 active:opacity-100 transition-opacity"></View>
            <View className="absolute -top-4 -right-4 text-6xl opacity-20 pointer-events-none transform rotate-12">
               <Text>📦</Text>
            </View>
            
            <Text className="text-4xl mb-4 text-white z-10 drop-shadow-2xl">🎁</Text>
            <Text className="text-[11px] font-black text-white uppercase tracking-tighter z-10">{sign.name}</Text>
            
            {/* 底部装饰小点 */}
            <View className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              <View className="w-1 h-1 rounded-full bg-white/30"></View>
              <View className="w-1 h-1 rounded-full bg-white/60"></View>
              <View className="w-1 h-1 rounded-full bg-white/30"></View>
            </View>
          </View>
        ))}
      </View>
      {error && (
        <View className="mx-6 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
           <Text className="text-center text-rose-400 text-xs font-bold">{error}</Text>
        </View>
      )}
    </View>
  );
};