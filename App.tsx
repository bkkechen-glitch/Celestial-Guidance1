
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ZODIAC_SIGNS } from './constants';
import { FortuneResult, ZodiacSignInfo, MatchResult, MysteryBoxResult, UserProfile } from './types';
import { getDailyFortune } from './services/gemini';
import { dbService } from './services/database';
import { FortuneCard } from './components/FortuneCard';
import { MatchView } from './components/MatchView';
import { MysteryBoxView } from './components/MysteryBoxView';
import { ZodiacDetailView } from './components/ZodiacDetailView';
import { PetSanctuary } from './components/PetSanctuary';

type Theme = 'dark' | 'light';
const ThemeContext = createContext<{ 
  theme: Theme; 
  toggleTheme: () => void;
  isInputActive: boolean;
  setIsInputActive: (active: boolean) => void;
  userProfile: UserProfile | null;
  syncProfile: (updates: Partial<UserProfile>) => Promise<void>;
  handleShareReward: () => Promise<void>;
  isSyncing: boolean;
}>({
  theme: 'dark',
  toggleTheme: () => {},
  isInputActive: false,
  setIsInputActive: () => {},
  userProfile: null,
  syncProfile: async () => {},
  handleShareReward: async () => {},
  isSyncing: false,
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('zodiac_theme') as Theme;
    return (saved as Theme) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  const [isInputActive, setIsInputActive] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setIsSyncing(true);
      const uid = dbService.getOrCreateUID();
      const profile = await dbService.getProfile(uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        const oldName = localStorage.getItem('zodiac_user_name');
        // 初始化新用户提供 1000 星能
        const initialProfile: UserProfile = {
          uid,
          name: oldName || '',
          birthday: localStorage.getItem('zodiac_user_birthday') || '',
          gender: localStorage.getItem('zodiac_user_gender') || '女',
          starEnergy: 1000,
          shareCount: 0,
          lastSync: new Date().toISOString(),
          badges: ['新晋观察员']
        };
        setUserProfile(initialProfile);
        await dbService.saveProfile(initialProfile);
      }
      setIsSyncing(false);
    };
    loadProfile();
  }, []);

  const syncProfile = async (updates: Partial<UserProfile>) => {
    setIsSyncing(true);
    const uid = dbService.getOrCreateUID();
    const current = userProfile || {
      uid,
      name: '',
      birthday: '',
      gender: '女',
      starEnergy: 1000,
      shareCount: 0,
      lastSync: '',
      badges: ['新晋观察员']
    };
    const updated = { ...current, ...updates };
    setUserProfile(updated);
    await dbService.saveProfile(updated);
    setIsSyncing(false);
  };

  const handleShareReward = async () => {
    if (!userProfile) return;
    const newShareCount = (userProfile.shareCount || 0) + 1;
    let newBadges = [...userProfile.badges];
    
    if (newShareCount >= 3 && !newBadges.includes('星际传播者')) {
      newBadges.push('星际传播者');
    }

    await syncProfile({ 
      shareCount: newShareCount, 
      starEnergy: userProfile.starEnergy + 5,
      badges: newBadges
    });
  };

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('zodiac_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ 
      theme, toggleTheme, isInputActive, setIsInputActive, 
      userProfile, syncProfile, handleShareReward, isSyncing 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export const CelestialLoading: React.FC<{ message: string }> = ({ message }) => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in space-y-8 text-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className={`absolute inset-0 border-2 border-dashed ${theme === 'dark' ? 'border-purple-500/30' : 'border-indigo-500/20'} rounded-full animate-spin`}></div>
        <div className="relative z-10 text-5xl animate-pulse">✨</div>
      </div>
      <p className={`text-lg font-bold tracking-widest ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{message}</p>
    </div>
  );
};

const StarCheckIn: React.FC = () => {
  const { theme, userProfile, syncProfile, isSyncing } = useTheme();
  const [checked, setChecked] = useState(false);
  const [showAnim, setShowAnim] = useState(false);

  useEffect(() => {
    const lastCheck = localStorage.getItem('last_check_in');
    const today = new Date().toISOString().split('T')[0];
    if (lastCheck === today) setChecked(true);
  }, []);

  const handleCheckIn = async () => {
    if (checked || isSyncing) return;
    const today = new Date().toISOString().split('T')[0];
    const currentEnergy = userProfile?.starEnergy || 0;
    await syncProfile({ starEnergy: currentEnergy + 10 });
    localStorage.setItem('last_check_in', today);
    setChecked(true);
    setShowAnim(true);
    setTimeout(() => setShowAnim(false), 1000);
  };

  return (
    <div className={`glass-card p-4 rounded-3xl mb-6 flex items-center justify-between border-none shadow-lg relative overflow-hidden transition-all ${checked ? 'opacity-80' : 'scale-[1.02]'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${theme === 'dark' ? 'bg-indigo-500/20 text-yellow-400' : 'bg-indigo-100 text-indigo-600'}`}>
          {checked ? '✨' : '⭐'}
        </div>
        <div>
          <div className="text-sm font-black">每日星能签到</div>
          <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest">
            {isSyncing ? '同步中...' : `Balance: ${userProfile?.starEnergy || 0} Star Energy`}
          </div>
        </div>
      </div>
      <button 
        onClick={handleCheckIn}
        disabled={checked || isSyncing}
        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${checked ? 'bg-slate-500/20 text-slate-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 active:scale-90 disabled:opacity-50'}`}
      >
        {isSyncing ? '同步中' : checked ? '已充能' : '开启观测'}
      </button>
      {showAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-4xl animate-star-burst">🌟 +10</div>
        </div>
      )}
    </div>
  );
};

const generateSeed = (name: string, birthday: string): number => {
  const today = new Date().toISOString().split('T')[0];
  const str = `${name.trim().toLowerCase()}-${birthday}-${today}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const FortuneView: React.FC = () => {
  const { theme, setIsInputActive, userProfile, syncProfile, isSyncing } = useTheme();
  const navigate = useNavigate();
  const { signId: routeSignId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userName, setUserName] = useState(userProfile?.name || '');
  const [userBirthday, setUserBirthday] = useState(userProfile?.birthday || '');
  const [userGender, setUserGender] = useState(userProfile?.gender || '女');
  const [showInput, setShowInput] = useState(false);
  const [selectedSign, setSelectedSign] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setUserName(userProfile.name);
      setUserBirthday(userProfile.birthday);
      setUserGender(userProfile.gender);
    }
  }, [userProfile]);

  const closeInput = useCallback(() => {
    setShowInput(false);
    setIsInputActive(false);
  }, [setIsInputActive]);

  const handleFetchFortune = useCallback(async (sign: ZodiacSignInfo, name: string, bday: string, gen: string) => {
    if (!name.trim() || !bday) {
        setError("请完整填写次元档案以开启同步");
        setShowInput(true);
        setIsInputActive(true);
        return;
    }
    setLoading(true);
    setError(null);
    setShowInput(false);
    setIsInputActive(false);
    await syncProfile({ name: name.trim(), birthday: bday, gender: gen });
    const seed = generateSeed(name, bday);
    try {
      const result = await getDailyFortune(sign.name, name, bday, gen, seed);
      setFortune(result);
    } catch (err: any) {
      setError(`星象感应中断: ${err.message || "请检查网络或重试"}`);
    } finally {
      setLoading(false);
    }
  }, [setIsInputActive, syncProfile]);

  useEffect(() => {
    const sign = ZODIAC_SIGNS.find(s => s.id === routeSignId);
    if (sign) {
      setSelectedSign(sign);
      if (userProfile?.name && userProfile?.birthday) {
        handleFetchFortune(sign, userProfile.name, userProfile.birthday, userProfile.gender);
      } else {
        setShowInput(true);
        setIsInputActive(true);
      }
    }
  }, [routeSignId, handleFetchFortune, setIsInputActive, userProfile]);

  if (loading) return <CelestialLoading message={`正在为 ${userName} 调取星轨档案...`} />;
  if (fortune && selectedSign) return (
    <FortuneCard 
      fortune={fortune} 
      onBack={() => { setFortune(null); setSearchParams({}); navigate(`/fortune/${selectedSign.id}`); }} 
      signId={selectedSign.id}
      signName={selectedSign.name} 
      userName={userName} 
      userBirthday={userBirthday}
      userGender={userGender}
    />
  );

  return (
    <div className="space-y-6 animate-fade-in relative pb-10 text-center">
      {/* 恢复 Logo */}
      <div className="relative w-24 h-24 mx-auto mb-2 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="text-6xl animate-breathe relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">🔮</div>
      </div>
      
      <StarCheckIn />
      
      <div className={`glass-card p-6 rounded-[2rem] border-none mb-6 text-left ${theme === 'dark' ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
         <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🪐</span>
            <span className="text-sm font-black uppercase tracking-tighter">今日星象快讯</span>
            {isSyncing && <span className="ml-auto text-[8px] animate-pulse text-amber-500">正在同步云端...</span>}
         </div>
         <p className={`text-xs leading-relaxed opacity-70 italic font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
           金星与海王星呈合相，感性思维爆发。适合进行深度艺术创作或与旧友叙旧。
         </p>
      </div>

      <div className="mb-6">
        <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>选择你的星座</h2>
        <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} mt-1 font-bold uppercase tracking-[0.3em]`}>点击图标，同步今日星系能量</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ZODIAC_SIGNS.map((sign) => (
          <button
            key={sign.id}
            onClick={() => navigate(`/fortune/${sign.id}`)}
            className="group relative flex flex-col items-center justify-center p-3 rounded-[2.5rem] glass-card transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-transparent hover:border-purple-500/30"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
              <img src={sign.image} alt={sign.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-xs font-black">{sign.name}</div>
            <div className="text-[8px] text-slate-500 font-medium tracking-tighter opacity-70">{sign.date}</div>
            <div onClick={(e) => { e.stopPropagation(); navigate(`/zodiac/${sign.id}`); }} className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500/20 backdrop-blur-md flex items-center justify-center text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-info"></i>
            </div>
          </button>
        ))}
      </div>
      
      {showInput && selectedSign && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/80 backdrop-blur-md text-left">
          <div className="glass-card w-full max-w-sm p-8 rounded-t-[3rem] sm:rounded-[3rem] border-purple-500/30 shadow-2xl space-y-6 relative overflow-hidden">
             <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden shadow-2xl mb-4 border-2 border-white/20">
                  <img src={selectedSign.image} alt={selectedSign.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-black uppercase">完善档案 · {selectedSign.name}</h3>
             </div>
             <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">昵称</label>
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none text-sm font-bold" />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">出生日期</label>
                  <input type="date" value={userBirthday} onChange={e => setUserBirthday(e.target.value)} className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none text-sm font-bold" />
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={closeInput} className="flex-1 py-4 rounded-2xl text-xs font-bold bg-white/5 text-slate-500">取消</button>
                <button 
                  onClick={() => handleFetchFortune(selectedSign, userName, userBirthday, userGender)} 
                  disabled={isSyncing}
                  className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black shadow-lg disabled:opacity-50"
                >
                  {isSyncing ? '同步档案...' : '开始感应'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileView: React.FC = () => {
  const { theme, userProfile, isSyncing } = useTheme();
  
  const badges = [
    { id: 'new', name: '新晋观察员', icon: '🔭', unlocked: true },
    { id: 'pet_medal', name: '国际星宠勋章', icon: '🐾', unlocked: !!userProfile?.pet },
    { id: 'social', name: '星际传播者', icon: '📡', unlocked: (userProfile?.shareCount || 0) >= 3 },
    { id: 'master', name: '星空主宰', icon: '👑', unlocked: (userProfile?.starEnergy || 0) >= 200 },
  ];
  
  const handleResetProfile = async () => {
    const confirmed = window.confirm("确定要重置当前次元档案吗？\n(星能将被保留，但姓名、生日和性别将被清除)");
    if (confirmed) {
      await dbService.deleteProfile(dbService.getOrCreateUID());
      localStorage.removeItem('zodiac_user_name');
      localStorage.removeItem('zodiac_user_birthday');
      localStorage.removeItem('zodiac_user_gender');
      localStorage.removeItem('last_check_in');
      alert("档案已重置。");
      window.location.reload();
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-end">
        <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>我的星语</h2>
        <button onClick={handleResetProfile} className="text-[10px] font-bold text-slate-500 hover:text-rose-500 uppercase tracking-widest transition-colors">重置云端档案</button>
      </div>
      
      <div className="glass-card p-6 rounded-[2.5rem] flex items-center gap-5 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/20">
          <i className="fas fa-user-astronaut text-white"></i>
        </div>
        <div className="flex-1">
           <div className="text-lg font-black flex items-center gap-2">
             {userProfile?.name || '宇宙旅者'}
             {userProfile?.lastSync && <span className="text-[8px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-bold">已同步</span>}
           </div>
           <div className="text-[10px] opacity-60 font-black tracking-widest mt-1">
             ⚡ {userProfile?.starEnergy || 0} 星能 · 📤 {userProfile?.shareCount || 0} 分享
           </div>
        </div>
        {isSyncing && <div className="absolute right-4 top-4"><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div></div>}
      </div>

      <div className="space-y-4">
         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">星际勋章墙</h3>
         <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className={`glass-card p-6 rounded-[2rem] flex items-center gap-4 transition-all duration-700 ${badge.unlocked ? 'opacity-100 scale-100' : 'opacity-20 grayscale scale-95'}`}>
                 <span className={`text-3xl ${badge.unlocked && badge.id === 'pet_medal' ? 'animate-breathe' : ''}`}>{badge.icon}</span>
                 <div className="flex-1">
                    <div className="text-[11px] font-black tracking-tighter block">{badge.name}</div>
                    {!badge.unlocked && (
                      <div className="text-[8px] mt-1 opacity-60 font-bold uppercase">未解锁</div>
                    )}
                    {badge.unlocked && (
                      <div className="text-[8px] mt-1 text-emerald-500 font-bold uppercase tracking-widest">已同步</div>
                    )}
                 </div>
              </div>
            ))}
         </div>
      </div>
      
      <div className="text-center pt-8">
         <p className="text-[9px] text-slate-500 opacity-40">UID: {userProfile?.uid || 'Loading...'} <br/>最后同步: {userProfile?.lastSync ? new Date(userProfile.lastSync).toLocaleString() : '从不'}</p>
      </div>
    </div>
  );
};

const Layout: React.FC = () => {
  const { theme, toggleTheme, isInputActive, isSyncing } = useTheme();
  return (
    <HashRouter>
      <div className="max-w-md mx-auto px-4 py-8 pb-32 min-h-screen relative overflow-x-hidden">
        {isSyncing && <div className="fixed top-0 left-0 right-0 h-0.5 bg-indigo-500 z-[100] animate-pulse"></div>}
        {!isInputActive && (
          <div className="absolute top-8 right-4 z-50">
            <button onClick={toggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center glass-card border-none shadow-lg transition-transform active:scale-90">
              {theme === 'dark' ? <span className="text-yellow-400">☀️</span> : <span className="text-indigo-600">🌙</span>}
            </button>
          </div>
        )}
        <header className={`text-center mb-8 transition-all ${isInputActive ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
          <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">星语占卜</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] mt-2 opacity-50">Celestial Guidance</p>
        </header>
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<FortuneView />} />
            <Route path="/fortune/:signId" element={<FortuneView />} />
            <Route path="/zodiac/:id" element={<ZodiacDetailView />} />
            <Route path="/match" element={<MatchView />} />
            <Route path="/mystery" element={<MysteryBoxView />} />
            <Route path="/pet" element={<PetSanctuary />} />
            <Route path="/profile" element={<ProfileView />} />
          </Routes>
        </main>
        {!isInputActive && (
          <div className="fixed bottom-6 left-0 right-0 p-4 pointer-events-none z-50 animate-fade-in">
            <div className="max-w-md mx-auto">
              <nav className={`glass-card rounded-[2.5rem] p-1.5 flex items-center justify-around px-4 shadow-2xl pointer-events-auto border-white/10 ${theme === 'dark' ? 'bg-slate-900/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'}`}>
                
                <NavLink to="/" className={({ isActive }) => `flex flex-col items-center p-2 transition-all duration-500 ${isActive ? '-translate-y-1' : 'opacity-50'}`}>
                  {({ isActive }) => (
                    <>
                       <div className={`text-xl transition-all ${isActive ? 'text-indigo-500 scale-125 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-slate-400'}`}>
                         <i className="fas fa-sparkles"></i>
                       </div>
                       <span className={`text-[10px] font-black mt-1 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>运势</span>
                       {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 animate-pulse"></div>}
                    </>
                  )}
                </NavLink>

                <NavLink to="/match" className={({ isActive }) => `flex flex-col items-center p-2 transition-all duration-500 ${isActive ? '-translate-y-1' : 'opacity-50'}`}>
                  {({ isActive }) => (
                    <>
                       <div className={`text-xl transition-all ${isActive ? 'text-rose-500 scale-125 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'text-slate-400'}`}>
                         <i className="fas fa-heart"></i>
                       </div>
                       <span className={`text-[10px] font-black mt-1 ${isActive ? 'text-rose-600' : 'text-slate-400'}`}>配对</span>
                       {isActive && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 animate-pulse"></div>}
                    </>
                  )}
                </NavLink>

                <NavLink to="/pet" className={({ isActive }) => `flex flex-col items-center p-2 transition-all duration-500 ${isActive ? '-translate-y-1' : 'opacity-50'}`}>
                  {({ isActive }) => (
                    <>
                       <div className={`text-xl transition-all ${isActive ? 'text-sky-500 scale-125 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'text-slate-400'}`}>
                         <i className="fas fa-paw"></i>
                       </div>
                       <span className={`text-[10px] font-black mt-1 ${isActive ? 'text-sky-600' : 'text-slate-400'}`}>宠物</span>
                       {isActive && <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1 animate-pulse"></div>}
                    </>
                  )}
                </NavLink>

                <NavLink to="/mystery" className={({ isActive }) => `flex flex-col items-center p-2 transition-all duration-500 ${isActive ? '-translate-y-1' : 'opacity-50'}`}>
                  {({ isActive }) => (
                    <>
                       <div className={`text-xl transition-all ${isActive ? 'text-fuchsia-500 scale-125 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]' : 'text-slate-400'}`}>
                         <i className="fas fa-gift"></i>
                       </div>
                       <span className={`text-[10px] font-black mt-1 ${isActive ? 'text-fuchsia-600' : 'text-slate-400'}`}>盲盒</span>
                       {isActive && <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1 animate-pulse"></div>}
                    </>
                  )}
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center p-2 transition-all duration-500 ${isActive ? '-translate-y-1' : 'opacity-50'}`}>
                  {({ isActive }) => (
                    <>
                       <div className={`text-xl transition-all ${isActive ? 'text-amber-500 scale-125 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-400'}`}>
                         <i className="fas fa-user-astronaut"></i>
                       </div>
                       <span className={`text-[10px] font-black mt-1 ${isActive ? 'text-amber-600' : 'text-slate-400'}`}>我的</span>
                       {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 animate-pulse"></div>}
                    </>
                  )}
                </NavLink>

              </nav>
            </div>
          </div>
        )}
      </div>
    </HashRouter>
  );
};

const App: React.FC = () => <ThemeProvider><Layout /></ThemeProvider>;
export default App;
