
import React, { useState } from 'react';
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
  const [selectedSign, setSelectedSign] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MysteryBoxResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenBox = async (sign: ZodiacSignInfo) => {
    setSelectedSign(sign);
    setLoading(true);
    setError(null);
    try {
      const data = await getMysteryBox(sign.name);
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
  };

  const handleShare = async () => {
    if (!result || !selectedSign) return;
    const currentUrl = window.location.origin + window.location.pathname + window.location.hash;

    const shareData = {
      title: '我的性格盲盒',
      text: `【星语占卜】我是${selectedSign.name}，我的灵魂动物是：${result.spiritAnimal}！我的性格标签：${result.traits.join(', ')}`,
      url: currentUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error('Fallback');
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n揭晓答案：${shareData.url}`);
        alert('盲盒结果已复制！');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleReset = () => {
    setSelectedSign(null);
    setResult(null);
    setError(null);
  };

  if (loading) {
    return <CelestialLoading message={`正在拆开 ${selectedSign?.name} 的性格盲盒...`} />;
  }

  if (result && selectedSign) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex justify-between items-center px-2">
          <button onClick={handleReset} className="text-slate-400 hover:text-indigo-600">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="text-center">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{selectedSign.name} · 性格盲盒</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="relative inline-flex">
                 <i className="fas fa-paw text-purple-500 animate-[bounce_3s_infinite] text-xs"></i>
                 <div className="absolute inset-0 bg-purple-500 blur-md opacity-20 animate-pulse"></div>
              </div>
              <div className="text-sm text-purple-500 dark:text-purple-400 italic font-medium">灵魂动物：{result.spiritAnimal}</div>
            </div>
          </div>
          <button onClick={handleShare} className="text-slate-400 hover:text-blue-500">
            <i className="fas fa-share-nodes"></i>
          </button>
        </div>
        <div className="glass-card p-6 rounded-3xl border-blue-500/30 space-y-6 shadow-xl shadow-blue-500/5 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
             <i className="fas fa-paw text-9xl rotate-12"></i>
          </div>

          <section>
            <h3 className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="fas fa-tags text-[10px]"></i> 性格标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.traits.map((t, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium border ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>#{t}</span>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-sun text-[10px]"></i> 光芒 (优势)
              </h3>
              <ul className={`text-xs space-y-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {result.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">✦</span>{s}</li>)}
              </ul>
            </section>
            <section className="space-y-2">
              <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-moon text-[10px]"></i> 阴影 (弱点)
              </h3>
              <ul className={`text-xs space-y-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {result.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span className="text-rose-500">✧</span>{w}</li>)}
              </ul>
            </section>
          </div>

          <section className={`pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
            <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <i className="fas fa-wand-magic-sparkles text-[10px]"></i> 星途展望
            </h3>
            <p className={`text-sm leading-relaxed italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>"{result.outlook}"</p>
          </section>

          <button onClick={handleReset} className={`w-full py-3 rounded-xl transition-colors text-sm font-medium ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-black/5 text-slate-500 hover:text-slate-800'}`}>开启另一个盲盒</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>性格盲盒</h2>
        <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>点击星座拆开未知的性格解析</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {ZODIAC_SIGNS.map((sign) => (
          <button key={sign.id} onClick={() => handleOpenBox(sign)} className={`flex flex-col items-center justify-center p-6 rounded-2xl glass-card transition-all active:scale-95 border-white/5 group`}>
            <div className="text-4xl mb-2 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 duration-500">🎁</div>
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{sign.name}</span>
          </button>
        ))}
      </div>
      {error && <p className="text-center text-rose-400 text-sm mt-4">{error}</p>}
    </div>
  );
};
