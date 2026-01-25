
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
    const gender = localStorage.getItem('zodiac_user_gender') || '未设定';
    const birthday = localStorage.getItem('zodiac_user_birthday') || '';
    try {
      const data = await getMysteryBox(name, gender, birthday);
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
      <div className="relative h-[400px] w-full rounded-[3rem] overflow-hidden shadow-2xl">
        <img src={signInfo.image} alt={signInfo.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        <button 
          onClick={() => navigate('/')} 
          className="absolute left-6 top-6 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <div className="absolute bottom-8 left-8 right-8 text-left">
          <div className={`text-5xl mb-2 bg-gradient-to-br ${signInfo.color} bg-clip-text text-transparent drop-shadow-lg animate-float`}>
            {signInfo.icon}
          </div>
          <h2 className="text-4xl font-black tracking-widest text-white drop-shadow-md">
            {signInfo.name}
          </h2>
          <div className="mt-2 px-4 py-1.5 rounded-full text-xs font-black bg-white/10 backdrop-blur-md border border-white/20 text-white inline-block">
            {signInfo.date}
          </div>
        </div>
      </div>

      {personality && (
        <div className="space-y-6 px-1">
          <div className="glass-card p-8 rounded-[2.5rem] border-purple-500/20 shadow-xl relative overflow-hidden">
            <div className="mb-6">
              <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <i className="fas fa-fingerprint"></i> 性格底色
              </h3>
              <div className="flex flex-wrap gap-2">
                {personality.traits.map((tag, i) => (
                  <span 
                    key={i} 
                    className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all animate-staggered-item ${
                      theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-100 text-purple-600'
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">✨ 光芒特征</h4>
                <ul className="text-xs space-y-2 leading-relaxed">
                  {personality.strengths.map((s, i) => (
                    <li key={i} className={`flex items-start gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="text-emerald-500 mt-1 text-[8px]">✦</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest">🌙 阴影特征</h4>
                <ul className="text-xs space-y-2 leading-relaxed">
                  {personality.weaknesses.map((w, i) => (
                    <li key={i} className={`flex items-start gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="text-rose-400 mt-1 text-[8px]">✧</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/20 shadow-inner' : 'bg-indigo-50/50 border-indigo-100'}`}>
             <div className="flex items-center gap-5 mb-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${signInfo.color} flex items-center justify-center text-white text-3xl shadow-xl shadow-indigo-500/20 ring-4 ring-white/10 animate-float`}>
                   <i className="fas fa-paw"></i>
                </div>
                <div>
                   <div className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest`}>灵魂动物图腾</div>
                   <div className={`text-2xl font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-700'}`}>{personality.spiritAnimal}</div>
                </div>
             </div>
             <div className={`text-sm leading-relaxed italic font-medium p-4 rounded-2xl bg-white/5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
               "{personality.outlook}"
             </div>
          </div>
        </div>
      )}

      <div className="pt-4 px-1">
        <button 
          onClick={() => navigate(`/fortune/${signInfo.id}`)}
          className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black tracking-widest shadow-2xl shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <i className="fas fa-sparkles"></i>
          开启今日运势
        </button>
      </div>
    </div>
  );
};
