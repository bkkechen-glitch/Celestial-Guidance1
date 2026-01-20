
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ZODIAC_SIGNS } from '../constants';
import { MatchResult, ZodiacSignInfo } from '../types';
import { getMatchAnalysis } from '../services/gemini';
import { CelestialLoading, useTheme } from '../App';

const saveToHistory = (type: string, data: any) => {
  const history = JSON.parse(localStorage.getItem('zodiac_history') || '[]');
  const newItem = { id: Date.now(), type, timestamp: new Date().toLocaleString(), data };
  localStorage.setItem('zodiac_history', JSON.stringify([newItem, ...history].slice(0, 50)));
};

export const MatchView: React.FC = () => {
  const { theme } = useTheme();
  const [sign1, setSign1] = useState<ZodiacSignInfo | null>(null);
  const [sign2, setSign2] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async () => {
    if (!sign1 || !sign2) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMatchAnalysis(sign1.name, sign2.name);
      setResult(data);
      saveToHistory('星盘配对', { 
        signs: `${sign1.name} & ${sign2.name}`, 
        score: data.score,
        analysis: data.analysis.substring(0, 60) + '...'
      });
    } catch (err) {
      setError('星盘解析失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result || !sign1 || !sign2) return;
    const currentUrl = window.location.origin + window.location.pathname + window.location.hash;
    
    const shareData = {
      title: '星座配对结果',
      text: `【星语占卜】${sign1.name}与${sign2.name}的默契指数为 ${result.score}%！\n分析：${result.analysis}`,
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
        await navigator.clipboard.writeText(`${shareData.text}\n查看详情：${shareData.url}`);
        alert('配对结果已复制！');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const resetMatch = () => {
    setResult(null);
    setSign1(null);
    setSign2(null);
  };

  if (loading) {
    return <CelestialLoading message="正在排列星盘，测算缘分..." />;
  }

  return (
    <div className="animate-fade-in space-y-8 pb-8">
      <div className="flex flex-col items-center">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}>星盘配对</h2>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-sm`}>选择两个星座，探索星象间的奇妙反应</p>
      </div>

      {!result ? (
        <div className="space-y-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1">
              <div 
                onClick={() => setSign1(null)}
                className={`h-24 w-full glass-card rounded-2xl flex items-center justify-center text-4xl border-dashed border-2 cursor-pointer transition-all ${sign1 ? `border-purple-500/50 scale-105 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.2)]` : theme === 'dark' ? 'border-slate-700 hover:border-slate-500' : 'border-slate-300 hover:border-indigo-400'}`}
              >
                {sign1 ? (
                  <span className={`bg-gradient-to-br ${sign1.color} bg-clip-text text-transparent`}>{sign1.icon}</span>
                ) : (
                  <i className={`fas fa-plus ${theme === 'dark' ? 'text-slate-700' : 'text-slate-300'} text-xl`}></i>
                )}
              </div>
              <p className={`text-center text-xs mt-2 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{sign1 ? sign1.name : '选择星座一'}</p>
            </div>
            
            <div className={`text-2xl transition-colors duration-500 ${sign1 && !sign2 ? 'text-pink-500 animate-pulse' : theme === 'dark' ? 'text-slate-700' : 'text-slate-300'}`}>
              <i className="fas fa-heart"></i>
            </div>
            
            <div className="flex-1">
              <div 
                onClick={() => setSign2(null)}
                className={`h-24 w-full glass-card rounded-2xl flex items-center justify-center text-4xl border-dashed border-2 cursor-pointer transition-all ${sign2 ? `border-pink-500/50 scale-105 bg-pink-500/5 shadow-[0_0_15px_rgba(236,72,153,0.2)]` : sign1 ? 'border-pink-400/50 animate-pulse bg-pink-500/5' : theme === 'dark' ? 'border-slate-700 hover:border-slate-500' : 'border-slate-300 hover:border-indigo-400'}`}
              >
                {sign2 ? (
                   <span className={`bg-gradient-to-br ${sign2.color} bg-clip-text text-transparent`}>{sign2.icon}</span>
                ) : sign1 ? (
                  <i className="fas fa-sparkles text-pink-400/60 text-xl"></i>
                ) : (
                  <i className={`fas fa-plus ${theme === 'dark' ? 'text-slate-700' : 'text-slate-300'} text-xl`}></i>
                )}
              </div>
              <p className={`text-center text-xs mt-2 font-medium transition-colors ${sign1 && !sign2 ? 'text-pink-400' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {sign2 ? sign2.name : '选择星座二'}
              </p>
            </div>
          </div>
          
          <div className="relative">
            {sign1 && !sign2 && (
              <div className="absolute -top-6 left-0 right-0 text-center text-[10px] text-pink-500 font-bold uppercase tracking-widest animate-fade-in">
                请选择另一个心动星座
              </div>
            )}
            <div className={`grid grid-cols-3 gap-4 h-80 overflow-y-auto p-4 glass-card rounded-2xl custom-scrollbar transition-all ${sign1 && !sign2 ? 'ring-2 ring-pink-500/20' : ''}`}>
              {ZODIAC_SIGNS.map((s) => {
                const isSelected = sign1?.id === s.id || sign2?.id === s.id;
                const isAvailable = sign1 && !sign2 && !isSelected;
                
                return (
                  <button 
                    key={s.id} 
                    onClick={() => {
                      if (!sign1) setSign1(s);
                      else if (!sign2 && sign1.id !== s.id) setSign2(s);
                    }} 
                    disabled={isSelected}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative group ${ 
                      isSelected ? 'scale-90 opacity-40 grayscale-[0.5]' : 
                      isAvailable ? `${theme === 'dark' ? 'bg-pink-500/5' : 'bg-pink-50'} hover:bg-pink-500/10 text-slate-700 dark:text-slate-200 ring-1 ring-pink-500/10 active:scale-95 shadow-sm` :
                      `${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} hover:bg-black/5 dark:hover:bg-white/5 border border-transparent` 
                    }`}
                  >
                    <div className={`text-3xl transition-all duration-300 bg-gradient-to-br ${s.color} bg-clip-text text-transparent ${isAvailable ? 'group-hover:scale-110 drop-shadow-sm' : ''}`}>
                      {s.icon}
                    </div>
                    <div className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{s.name}</div>
                    {isAvailable && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <button 
              disabled={!sign1 || !sign2 || loading} 
              onClick={handleMatch} 
              className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><i className="fas fa-circle-notch animate-spin"></i> 正在通灵...</span> : '查看缘分'}
            </button>
            
            <div className="flex justify-center">
              <NavLink to="/profile" className={`flex items-center gap-2 text-xs transition-colors py-2 px-4 rounded-full border ${theme === 'dark' ? 'text-slate-500 hover:text-purple-400 bg-white/5 border-white/5' : 'text-slate-500 hover:text-indigo-600 bg-black/5 border-black/5'}`}>
                <i className="fas fa-clock-rotate-left"></i>
                查看历史配对
              </NavLink>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 rounded-3xl space-y-6 border-pink-500/30 shadow-2xl shadow-pink-500/5">
          <div className="flex justify-between items-start">
            <button onClick={resetMatch} className="text-slate-400 hover:text-indigo-600 p-2">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button onClick={handleShare} className="text-slate-400 hover:text-pink-400 p-2">
              <i className="fas fa-share-nodes"></i>
            </button>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-2 drop-shadow-sm">{result.score}%</div>
            <div className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-sm font-medium tracking-wide`}>默契指数</div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-purple-600 dark:text-purple-300 mb-2 flex items-center gap-2">
                <i className="fas fa-magnifying-glass-chart text-xs"></i> 契合度解析
              </h4>
              <p className={`text-sm leading-relaxed p-4 rounded-2xl border ${theme === 'dark' ? 'text-slate-300 bg-white/5 border-white/5' : 'text-slate-600 bg-black/5 border-black/5'}`}>
                {result.analysis}
              </p>
            </div>
            <div className={`${theme === 'dark' ? 'bg-pink-900/10 border-pink-500/20' : 'bg-pink-50 border-pink-200'} p-4 rounded-2xl border`}>
              <h4 className="text-sm font-bold text-pink-600 dark:text-pink-300 mb-1 flex items-center gap-2">
                <i className="fas fa-wand-magic-sparkles text-xs"></i> 相处建议
              </h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>{result.advice}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={resetMatch} className={`w-full py-4 rounded-xl text-sm font-bold transition-all ${theme === 'dark' ? 'bg-white/10 text-slate-200 hover:bg-white/20 border-white/5' : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100 border-indigo-100'} border`}>重新配对</button>
            <NavLink to="/profile" className="text-center text-xs text-slate-500 hover:text-purple-500 py-2 transition-colors">
              <i className="fas fa-history mr-1"></i> 查看所有记录
            </NavLink>
          </div>
        </div>
      )}
      {error && <p className="text-center text-rose-400 text-sm">{error}</p>}
    </div>
  );
};
