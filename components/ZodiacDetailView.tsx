
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZODIAC_SIGNS } from '../constants';
import { MysteryBoxResult, ZodiacSignInfo } from '../types';
import { getMysteryBox } from '../services/gemini';
import { useTheme, CelestialLoading } from '../App';

export const ZodiacDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [signInfo, setSignInfo] = useState<ZodiacSignInfo | null>(null);
  const [personality, setPersonality] = useState<MysteryBoxResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sign = ZODIAC_SIGNS.find(s => s.id === id);
    if (sign) {
      setSignInfo(sign);
      loadPersonality(sign.name);
    } else {
      setError("未找到该星座信息");
      setLoading(false);
    }
  }, [id]);

  const loadPersonality = async (name: string) => {
    setLoading(true);
    try {
      const data = await getMysteryBox(name);
      setPersonality(data);
    } catch (err) {
      setError("无法获取性格解析，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CelestialLoading message="正在查阅星座典籍..." />;
  if (error || !signInfo) return (
    <div className="text-center py-20 space-y-4">
      <p className="text-rose-400">{error || "星座丢失在星际中"}</p>
      <button onClick={() => navigate('/')} className="px-6 py-2 rounded-full border border-indigo-500/30 text-indigo-400">返回主页</button>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      {/* Header Section */}
      <div className="relative flex flex-col items-center text-center pt-4">
        <button 
          onClick={() => navigate('/')} 
          className="absolute left-0 top-4 p-2 text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <i className="fas fa-chevron-left text-lg"></i>
        </button>
        
        <div className={`text-8xl mb-4 bg-gradient-to-br ${signInfo.color} bg-clip-text text-transparent drop-shadow-2xl`}>
          {signInfo.icon}
        </div>
        <h2 className={`text-3xl font-black tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          {signInfo.name}
        </h2>
        <div className={`mt-2 px-4 py-1 rounded-full text-xs font-medium border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-indigo-50 border-indigo-100 text-indigo-400'}`}>
          {signInfo.date}
        </div>
      </div>

      {personality && (
        <div className="space-y-6">
          {/* Personality Card */}
          <div className="glass-card p-6 rounded-3xl border-purple-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <i className="fas fa-quote-right text-5xl"></i>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-purple-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <i className="fas fa-fingerprint text-[10px]"></i> 性格底色
              </h3>
              <div className="flex flex-wrap gap-2">
                {personality.traits.map((tag, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${
                    theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-100 text-purple-600'
                  }`}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">✨ 光芒特征</h4>
                <ul className="text-xs space-y-2">
                  {personality.strengths.map((s, i) => (
                    <li key={i} className={`flex items-start gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="text-emerald-500 mt-0.5">✦</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">🌙 阴影特征</h4>
                <ul className="text-xs space-y-2">
                  {personality.weaknesses.map((w, i) => (
                    <li key={i} className={`flex items-start gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="text-rose-400 mt-0.5">✧</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Spirit Animal & Outlook */}
          <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'}`}>
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl shadow-lg">
                   <i className="fas fa-paw"></i>
                </div>
                <div>
                   <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>灵魂动物</div>
                   <div className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{personality.spiritAnimal}</div>
                </div>
             </div>
             <div className={`text-sm leading-relaxed italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
               "{personality.outlook}"
             </div>
          </div>
        </div>
      )}

      {/* Navigation Button */}
      <div className="pt-4">
        <button 
          onClick={() => navigate(`/fortune/${signInfo.id}`)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <i className="fas fa-sparkles"></i>
          开启今日运势
        </button>
      </div>
    </div>
  );
};
