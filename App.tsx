
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ZODIAC_SIGNS } from './constants';
import { FortuneResult, ZodiacSignInfo, MatchResult, MysteryBoxResult } from './types';
import { getDailyFortune } from './services/gemini';
import { FortuneCard } from './components/FortuneCard';
import { MatchView } from './components/MatchView';
import { MysteryBoxView } from './components/MysteryBoxView';

/**
 * Theme Context
 */
type Theme = 'dark' | 'light';
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'dark',
  toggleTheme: () => {},
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('zodiac_theme') as Theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('zodiac_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Storage helpers for history
 */
const saveToHistory = (type: string, data: any) => {
  const history = JSON.parse(localStorage.getItem('zodiac_history') || '[]');
  const newItem = {
    id: Date.now(),
    type,
    timestamp: new Date().toLocaleString(),
    data
  };
  localStorage.setItem('zodiac_history', JSON.stringify([newItem, ...history].slice(0, 50)));
};

/**
 * Celestial Loading Component
 */
export const CelestialLoading: React.FC<{ message: string }> = ({ message }) => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in space-y-8">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className={`absolute inset-0 border-2 ${theme === 'dark' ? 'border-purple-500/20' : 'border-indigo-500/10'} rounded-full animate-[spin_10s_linear_infinite]`}></div>
        <div className={`absolute inset-4 border ${theme === 'dark' ? 'border-indigo-500/30' : 'border-purple-500/20'} rounded-full animate-[spin_6s_linear_infinite_reverse]`}></div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-yellow-400 animate-pulse">
          <i className="fas fa-star text-xs"></i>
        </div>
        <div className="absolute bottom-4 right-0 text-purple-400 animate-bounce">
          <i className="fas fa-sparkle text-[10px]"></i>
        </div>
        
        <div className="relative z-10 text-5xl text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-purple-400 animate-pulse">
          <i className="fas fa-shuttle-space"></i>
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <p className={`text-lg font-medium tracking-widest ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{message}</p>
        <div className="flex justify-center gap-1">
          <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};

/**
 * FortuneView Component
 */
const FortuneView: React.FC = () => {
  const { theme } = useTheme();
  const [selectedSign, setSelectedSign] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectSign = async (sign: ZodiacSignInfo) => {
    setSelectedSign(sign);
    setLoading(true);
    setError(null);
    try {
      const result = await getDailyFortune(sign.name);
      setFortune(result);
      saveToHistory('今日运势', { sign: sign.name, summary: result.summary, score: Math.round((result.love + result.work + result.health + result.money) / 4) });
    } catch (err) {
      setError('星象感应中断，请稍后再试...');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedSign(null);
    setFortune(null);
    setError(null);
  };

  if (selectedSign) {
    return (
      <div className="min-h-[400px]">
        {loading ? (
          <CelestialLoading message="正在观测星轨，解读星象..." />
        ) : error ? (
          <div className="text-center space-y-4 pt-20">
            <p className="text-rose-400">{error}</p>
            <button onClick={handleBack} className={`px-6 py-2 rounded-full text-indigo-400 border border-indigo-500/30 ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-indigo-50/50'}`}>返回重试</button>
          </div>
        ) : fortune ? (
          <FortuneCard fortune={fortune} onBack={handleBack} signName={selectedSign.name} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>选择你的星座</h2>
        <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>查看今日专属运势解析</p>
      </div>
      <div className="grid grid-cols-3 gap-4 pb-4">
        {ZODIAC_SIGNS.map((sign) => (
          <button
            key={sign.id}
            onClick={() => handleSelectSign(sign)}
            className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl glass-card transition-all duration-300 hover:scale-105 active:scale-95 border-white/5 hover:border-purple-500/50`}
          >
            <div className={`text-4xl mb-2 bg-gradient-to-br ${sign.color} bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]`}>
              {sign.icon}
            </div>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{sign.name}</span>
            <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} mt-1`}>{sign.date}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * ProfileView Component
 */
const ProfileView: React.FC = () => {
  const { theme } = useTheme();
  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('全部');
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('zodiac_history') || '[]');
    setHistory(data);
  }, []);

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];
    if (filter !== '全部') {
      result = result.filter(item => item.type === filter);
    }
    result.sort((a, b) => {
      return sortOrder === 'new' ? b.id - a.id : a.id - b.id;
    });
    return result;
  }, [history, filter, sortOrder]);

  const clearHistory = () => {
    if (confirm('确定要清空所有占卜记录吗？')) {
      localStorage.removeItem('zodiac_history');
      setHistory([]);
    }
  };

  const categories = ['全部', '今日运势', '星盘配对', '性格盲盒'];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>我的占卜记录</h2>
        {history.length > 0 && (
          <button onClick={clearHistory} className="text-xs text-slate-500 hover:text-rose-400 transition-colors">
            清空记录
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === cat 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25 scale-105' 
                  : `${theme === 'dark' ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-indigo-50 text-indigo-400 hover:bg-indigo-100'}`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex justify-end px-1">
          <button 
            onClick={() => setSortOrder(prev => prev === 'new' ? 'old' : 'new')}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500 hover:text-purple-400' : 'text-indigo-400 hover:text-indigo-600'} transition-colors`}
          >
            <i className={`fas ${sortOrder === 'new' ? 'fa-arrow-down-short-wide' : 'fa-arrow-up-wide-short'}`}></i>
            {sortOrder === 'new' ? '从新到旧' : '从旧到新'}
          </button>
        </div>
      </div>

      {filteredAndSortedHistory.length === 0 ? (
        <div className={`flex flex-col items-center justify-center h-64 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} opacity-40`}>
          <i className="fas fa-history text-4xl mb-4"></i>
          <p>{filter === '全部' ? '暂无占卜记录，快去探索星空吧' : `暂无${filter}记录`}</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
          {filteredAndSortedHistory.map((item) => (
            <div key={item.id} className="glass-card p-4 rounded-2xl border-white/5 relative overflow-hidden group animate-fade-in">
              <div className={`absolute top-0 right-0 p-2 text-[10px] ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'} font-mono`}>
                {item.timestamp}
              </div>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  item.type === '今日运势' ? 'bg-purple-500/20 text-purple-400' :
                  item.type === '星盘配对' ? 'bg-pink-500/20 text-pink-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.type[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} mb-1`}>{item.type}</div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} leading-relaxed truncate`}>
                    {item.type === '今日运势' && <span>{item.data.sign} · 综合评分: {item.data.score}</span>}
                    {item.type === '星盘配对' && <span>{item.data.signs} · 默契指数: {item.data.score}%</span>}
                    {item.type === '性格盲盒' && <span>{item.data.sign} · 灵魂动物: {item.data.animal}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <HashRouter>
      <div className="max-w-md mx-auto px-4 py-8 pb-24 min-h-screen relative">
        <div className="absolute top-8 right-4 z-50">
          <button 
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-full flex items-center justify-center glass-card border-none shadow-lg transition-transform active:scale-90`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <i className="fas fa-sun text-yellow-400"></i>
            ) : (
              <i className="fas fa-moon text-indigo-600"></i>
            )}
          </button>
        </div>

        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              星语占卜
            </h1>
          </div>
          <p className={`text-xs uppercase tracking-tighter ${theme === 'dark' ? 'text-slate-400' : 'text-indigo-500/70'}`}>Celestial Guidance</p>
        </header>

        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<FortuneView />} />
            <Route path="/match" element={<MatchView />} />
            <Route path="/mystery" element={<MysteryBoxView />} />
            <Route path="/profile" element={<ProfileView />} />
          </Routes>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none z-50">
          <div className="max-w-md mx-auto pointer-events-auto">
            <nav className={`glass-card rounded-3xl p-2.5 flex items-center justify-around border-white/10 shadow-2xl backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/95'}`}>
              <NavLink to="/" className={({ isActive }) => 
                `flex flex-col items-center p-2 transition-all duration-300 ${isActive ? 'text-purple-500 scale-110' : 'text-slate-300 dark:text-slate-500 hover:text-indigo-400'}`
              }>
                <i className="fas fa-sparkles text-lg"></i>
                <span className="text-[10px] mt-1 font-bold">运势</span>
              </NavLink>
              
              <NavLink to="/match" className={({ isActive }) => 
                `flex flex-col items-center p-2 transition-all duration-300 ${isActive ? 'text-pink-500 scale-110' : 'text-slate-300 dark:text-slate-500 hover:text-pink-400'}`
              }>
                <i className="fas fa-heart text-lg"></i>
                <span className="text-[10px] mt-1 font-bold">配对</span>
              </NavLink>
              
              <NavLink to="/mystery" className={({ isActive }) => 
                `flex flex-col items-center p-2 transition-all duration-300 ${isActive ? 'text-blue-500 scale-110' : 'text-slate-300 dark:text-slate-500 hover:text-blue-400'}`
              }>
                <i className="fas fa-box-open text-lg"></i>
                <span className="text-[10px] mt-1 font-bold">盲盒</span>
              </NavLink>
              
              <NavLink to="/profile" className={({ isActive }) => 
                `flex flex-col items-center p-2 transition-all duration-300 ${isActive ? 'text-amber-500 scale-110' : 'text-slate-300 dark:text-slate-500 hover:text-amber-500'}`
              }>
                <i className="fas fa-user text-lg"></i>
                <span className="text-[10px] mt-1 font-bold">我的</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
    </HashRouter>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <Layout />
  </ThemeProvider>
);

export default App;
