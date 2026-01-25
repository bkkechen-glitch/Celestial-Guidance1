
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSeed, setCurrentSeed] = useState<number>(0);
  const [sign1, setSign1] = useState<ZodiacSignInfo | null>(null);
  const [sign2, setSign2] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = useCallback(async (s1: ZodiacSignInfo, s2: ZodiacSignInfo) => {
    if (!s1 || !s2) return;
    setLoading(true);
    setError(null);
    const gender = localStorage.getItem('zodiac_user_gender') || '未设定';
    const birthday = localStorage.getItem('zodiac_user_birthday') || '';
    
    // 如果 URL 中有 seed，则使用它；否则生成新的
    let seedToUse = currentSeed;
    if (!seedToUse) {
        seedToUse = Math.floor(Math.random() * 1000000);
        setCurrentSeed(seedToUse);
    }

    try {
      const data = await getMatchAnalysis(s1.name, s2.name, gender, birthday, seedToUse);
      setResult(data);
      saveToHistory('星盘配对', { 
        signs: `${s1.name} & ${s2.name}`, 
        score: data.score,
        analysis: data.analysis.substring(0, 60) + '...'
      });
    } catch (err) {
      setError('星盘解析失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }, [currentSeed]);

  useEffect(() => {
    const s1Id = searchParams.get('s1');
    const s2Id = searchParams.get('s2');
    const seedParam = searchParams.get('seed');

    if (s1Id && s2Id) {
      const s1 = ZODIAC_SIGNS.find(s => s.id === s1Id);
      const s2 = ZODIAC_SIGNS.find(s => s.id === s2Id);
      if (s1 && s2) {
        setSign1(s1);
        setSign2(s2);
        if (seedParam) {
            setCurrentSeed(parseInt(seedParam, 10));
        }
        
        // Auto-load if we have a seed (Deep Link)
        if (seedParam) {
             const autoLoad = async () => {
                setLoading(true);
                // Prefer context from URL for exact reproduction
                const gender = searchParams.get('gen') || localStorage.getItem('zodiac_user_gender') || '未设定';
                const birthday = searchParams.get('bday') || localStorage.getItem('zodiac_user_birthday') || '';
                try {
                    const data = await getMatchAnalysis(s1.name, s2.name, gender, birthday, parseInt(seedParam, 10));
                    setResult(data);
                } catch(e) { setError("连接断开"); } finally { setLoading(false); }
             };
             autoLoad();
        }
      }
    }
  }, [searchParams]); // 移除依赖 handleMatch 避免循环

  // 手动点击测试按钮时
  const onStartMatch = () => {
      const newSeed = Math.floor(Math.random() * 1000000);
      setCurrentSeed(newSeed);
      if(sign1 && sign2) {
          // 重新调用 API 逻辑
          setLoading(true);
          const gender = localStorage.getItem('zodiac_user_gender') || '未设定';
          const birthday = localStorage.getItem('zodiac_user_birthday') || '';
          getMatchAnalysis(sign1.name, sign2.name, gender, birthday, newSeed).then(data => {
            setResult(data);
            setLoading(false);
            saveToHistory('星盘配对', { 
                signs: `${sign1.name} & ${sign2.name}`, 
                score: data.score,
                analysis: data.analysis.substring(0, 60) + '...'
            });
          }).catch(() => {
              setError("失败");
              setLoading(false);
          })
      }
  }


  const handleShare = async () => {
    if (!sign1 || !sign2 || !result) return;
    
    // Capture user context to ensure the deep link reproduces the analysis from the same perspective
    const gender = localStorage.getItem('zodiac_user_gender') || '';
    const birthday = localStorage.getItem('zodiac_user_birthday') || '';

    const shareParams = new URLSearchParams({ 
        s1: sign1.id, 
        s2: sign2.id,
        seed: currentSeed.toString(),
        gen: gender,
        bday: birthday
    });

    const path = 'match';
    // Deep link URL structure ready for backend shortening
    const shareUrl = `${window.location.origin}${window.location.pathname}#/${path}?${shareParams.toString()}`;
    
    const shareText = `【星语配对】💓 ${sign1.name} 与 ${sign2.name} 的缘分契合度：${result.score}%！\n分析：${result.analysis.substring(0, 50)}...\n\n测测你们的契合指数：`;
    
    try {
      if (navigator.share) {
        await navigator.share({ title: '缘分契合度报告', text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('缘分报告已复制，快去发给 TA 吧！');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CelestialLoading message="正在排列星盘，测算缘分..." />;

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <div className="flex flex-col items-center">
        <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-1`}>星盘配对</h2>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-[10px] font-bold uppercase tracking-widest`}>缘分次元链接</p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* 配对框区域 - 方形小尺寸布局 */}
          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={() => setSign1(null)}
                className={`w-24 h-24 glass-card rounded-3xl overflow-hidden flex items-center justify-center border-dashed border-2 cursor-pointer transition-all ${sign1 ? `border-purple-500/50 scale-105 shadow-xl` : theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}
              >
                {sign1 ? <img src={sign1.image} className="w-full h-full object-cover" /> : <i className="fas fa-plus text-slate-700/20 text-xl"></i>}
              </div>
              <p className={`text-center text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{sign1 ? sign1.name : '我的星座'}</p>
            </div>
            
            <div className="h-24 flex items-center justify-center">
               <div className={`text-2xl transition-colors ${sign1 && !sign2 ? 'text-pink-500 animate-pulse' : 'text-slate-700/20'}`}>
                 <i className="fas fa-heart"></i>
               </div>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={() => setSign2(null)}
                className={`w-24 h-24 glass-card rounded-3xl overflow-hidden flex items-center justify-center border-dashed border-2 cursor-pointer transition-all ${sign2 ? `border-pink-500/50 scale-105 shadow-xl` : theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}
              >
                {sign2 ? <img src={sign2.image} className="w-full h-full object-cover" /> : <i className="fas fa-plus text-slate-700/20 text-xl"></i>}
              </div>
              <p className={`text-center text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{sign2 ? sign2.name : '心动星座'}</p>
            </div>
          </div>

          {/* 测试按钮 */}
          <button 
            disabled={!sign1 || !sign2} 
            onClick={onStartMatch} 
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-black shadow-lg shadow-purple-500/20 disabled:opacity-30 active:scale-95 transition-all"
          >
            开启次元契合度测试
          </button>

          {/* 选择列表区域 - 调整为 3列4行布局 */}
          <div className="grid grid-cols-3 gap-4 p-5 glass-card rounded-[2rem] border-white/5">
            {ZODIAC_SIGNS.map((s) => (
              <button 
                key={s.id} 
                onClick={() => { if (!sign1) setSign1(s); else if (!sign2 && sign1.id !== s.id) setSign2(s); }} 
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${sign1?.id === s.id || sign2?.id === s.id ? 'opacity-20 scale-90 grayscale' : 'hover:bg-white/5 active:scale-95'}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden mb-2 shadow-md border-2 border-white/10">
                   <img src={s.image} className="w-full h-full object-cover" />
                </div>
                <div className="text-[11px] font-black text-slate-400">{s.name}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 rounded-[3rem] space-y-8 border-pink-500/30 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>
          <div className="flex justify-between items-center relative">
            <button onClick={() => { setResult(null); setSearchParams({}); }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400"><i className="fas fa-arrow-left text-sm"></i></button>
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-pink-400"><i className="fas fa-share-nodes text-sm"></i></button>
          </div>
          <div className="text-center relative">
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 drop-shadow-xl">{result.score}%</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3">默契同步率</div>
          </div>
          <div className="space-y-6">
            <div className={`p-8 rounded-[2rem] border transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-indigo-50/80 border-indigo-100'}`}>
              <h4 className="text-[10px] font-black text-purple-400 mb-4 flex items-center gap-2"><i className="fas fa-sparkles"></i> 深度契合分析</h4>
              <p className={`text-[15px] leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{result.analysis}</p>
            </div>
            <div className={`p-8 rounded-[2rem] border transition-colors ${theme === 'dark' ? 'bg-pink-500/5 border-pink-500/10' : 'bg-pink-50/80 border-pink-100'}`}>
              <h4 className="text-[10px] font-black text-pink-400 mb-3 flex items-center gap-2"><i className="fas fa-heart"></i> 次元共处建议</h4>
              <p className={`text-[15px] italic font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{result.advice}</p>
            </div>
          </div>
          <button onClick={() => { setResult(null); setSign1(null); setSign2(null); setSearchParams({}); }} className="w-full py-4 rounded-[1.5rem] bg-white/5 text-slate-500 text-xs font-black border border-white/5 hover:bg-white/10 transition-colors">开启新测算</button>
        </div>
      )}
    </div>
  );
};
