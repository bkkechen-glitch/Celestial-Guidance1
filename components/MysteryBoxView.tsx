
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ZODIAC_SIGNS } from '../constants';
import { MysteryBoxResult, ZodiacSignInfo } from '../types';
import { getMysteryBox } from '../services/gemini';
import { CelestialLoading, useTheme } from '../App';

const saveToHistory = (type: string, data: any) => {
  const history = JSON.parse(localStorage.getItem('zodiac_history') || '[]');
  const newItem = { id: Date.now(), type, timestamp: new Date().toLocaleString(), data };
  localStorage.setItem('zodiac_history', JSON.stringify([newItem, ...history].slice(0, 50)));
};

export const MysteryBoxView: React.FC = () => {
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSign, setSelectedSign] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MysteryBoxResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSeed, setCurrentSeed] = useState<number>(0);

  const handleOpenBox = useCallback(async (sign: ZodiacSignInfo, params?: { gen?: string, bday?: string, seed?: number }) => {
    setSelectedSign(sign);
    setLoading(true);
    setError(null);
    
    // Determine seed: use passed seed (from URL) or generate new random one
    const seedToUse = params?.seed || Math.floor(Math.random() * 1000000);
    setCurrentSeed(seedToUse);

    // Determine context: use passed context (from URL) or local storage
    const gender = params?.gen || localStorage.getItem('zodiac_user_gender') || '未设定';
    const birthday = params?.bday || localStorage.getItem('zodiac_user_birthday') || '';

    try {
      // Pass seed to API for deterministic result
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
    const sId = searchParams.get('s');
    if (sId) {
      const sign = ZODIAC_SIGNS.find(s => s.id === sId);
      if (sign) {
        const seedParam = searchParams.get('seed');
        const gen = searchParams.get('gen') || undefined;
        const bday = searchParams.get('bday') || undefined;
        const seed = seedParam ? parseInt(seedParam, 10) : undefined;
        
        handleOpenBox(sign, { gen, bday, seed });
      }
    }
  }, [searchParams, handleOpenBox]);

  const handleShare = async () => {
    if (!selectedSign || !result) return;
    
    // Capture the context used for this specific result
    const gender = localStorage.getItem('zodiac_user_gender') || '';
    const birthday = localStorage.getItem('zodiac_user_birthday') || '';

    const shareParams = new URLSearchParams({ 
        s: selectedSign.id,
        seed: currentSeed.toString(),
        gen: gender,
        bday: birthday
    });

    // Generate a deep link structure suitable for sharing or shortening
    const path = 'mystery';
    // In a real app, you would shorten this URL via a backend service here.
    const shareUrl = `${window.location.origin}${window.location.pathname}#/${path}?${shareParams.toString()}`;

    const shareText = `【性格盲盒】🎁 我拆开了 ${selectedSign.name} 的深层灵魂！\n我的灵魂图腾是：${result.spiritAnimal}\n核心特质：${result.traits.join(', ')}\n\n拆开你的性格盲盒：`;
    
    try {
      if (navigator.share) {
        await navigator.share({ title: '性格盲盒解析报告', text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('解析报告及专属链接已复制，去惊艳好友吧！');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CelestialLoading message={`正在感应 ${selectedSign?.name} 的深层灵魂...`} />;

  if (result && selectedSign) {
    return (
      <div className="animate-fade-in space-y-6 pb-20">
        <div className="flex justify-between items-center px-2">
          <button onClick={() => { setResult(null); setSearchParams({}); }} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-500"><i className="fas fa-chevron-left"></i></button>
          <div className="text-center">
            <h2 className="text-xl font-black">{selectedSign.name} · 性格盲盒</h2>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Soul Blueprint</div>
          </div>
          <button onClick={handleShare} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-500"><i className="fas fa-share-nodes"></i></button>
        </div>

        <div className={`glass-card p-8 rounded-[3rem] space-y-8 relative overflow-hidden border-2 ${theme === 'dark' ? 'border-white/5' : 'border-white/40'}`}>
          <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none text-[12rem] rotate-12"><i className="fas fa-paw"></i></div>
          
          {/* 彩色灵魂图腾头部 - 风格化设计 */}
          <div className={`flex items-center gap-5 p-5 rounded-[2.5rem] relative z-10 overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-white/40'}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${selectedSign.color} opacity-10`}></div>
            
            {/* 图标容器 */}
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSign.color} flex items-center justify-center text-white text-3xl shadow-lg ring-4 ring-white/20 animate-pulse shrink-0`}>
              <i className="fas fa-paw"></i>
            </div>

            <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">你的灵魂图腾是</div>
              <div className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${selectedSign.color} drop-shadow-sm`}>{result.spiritAnimal}</div>
            </div>
          </div>

          <section>
            <h3 className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fas fa-tags text-[8px]"></i> 核心特质标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.traits.map((t, i) => (
                <span key={i} className={`px-4 py-2 rounded-2xl text-[10px] font-bold border bg-gradient-to-r ${selectedSign.color} bg-opacity-10 bg-clip-text text-transparent border-current opacity-80`} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                   <span className={`${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>#{t}</span>
                </span>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-sun text-[8px]"></i> 光芒
              </h3>
              <ul className={`text-[11px] space-y-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {result.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">✦</span>{s}</li>)}
              </ul>
            </section>
            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-moon text-[8px]"></i> 阴影
              </h3>
              <ul className={`text-[11px] space-y-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {result.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span className="text-rose-400">✧</span>{w}</li>)}
              </ul>
            </section>
          </div>

          <section className="pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-3">生命展望</h3>
            <p className={`text-sm leading-relaxed italic font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>"{result.outlook}"</p>
          </section>

          <button onClick={() => { setResult(null); setSearchParams({}); }} className="w-full py-5 rounded-2xl bg-white/5 text-slate-500 text-xs font-black hover:bg-white/10 transition-colors">探索其他星座</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 text-center">
      <div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-pink-400 drop-shadow-sm">性格盲盒</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Diving Deep Into Your Soul</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 px-1">
        {ZODIAC_SIGNS.map((sign) => (
          <button 
            key={sign.id} 
            onClick={() => handleOpenBox(sign)} 
            className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] bg-gradient-to-br ${sign.color} transition-all active:scale-90 border-2 border-white/20 group shadow-xl shadow-black/20 relative overflow-hidden`}
          >
            {/* 内部高光效果 */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <i className="fas fa-gift text-4xl mb-3 text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 z-10"></i>
            <span className="text-[11px] font-black text-white uppercase tracking-tighter drop-shadow-md z-10">{sign.name}</span>
            
            {/* 底部装饰小点 */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-1 h-1 rounded-full bg-white/30"></div>
              <div className="w-1 h-1 rounded-full bg-white/60"></div>
              <div className="w-1 h-1 rounded-full bg-white/30"></div>
            </div>
          </button>
        ))}
      </div>
      {error && <p className="text-center text-rose-400 text-xs font-bold mt-4 px-6 py-3 bg-rose-500/10 rounded-xl border border-rose-500/20">{error}</p>}
    </div>
  );
};
