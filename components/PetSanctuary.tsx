
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../App';
import { PetInfo, ChatMessage } from '../types';
import { getPetResponse } from '../services/gemini';
import { ZODIAC_SIGNS } from '../constants';

const PET_TEMPLATES = [
  { 
    type: 'Cat', 
    name: '星尘猫', 
    icon: '🐱', 
    color: 'from-purple-400 to-indigo-500', 
    desc: '优雅、独立，能感应主人的情绪起伏。',
    // 本地预置语料库，用于瞬间响应
    localResponses: {
      greetings: ['喵~ 这种时候见到你，星光都变亮了。', '你在看我吗？我也在想你哦，喵~', '要来一点星之碎屑吗？'],
      love: ['呜哇！我也超级、超级喜欢主人的！❤️', '我的尾巴已经出卖了我的开心，喵呜~', '只要有你在，哪里都是我的星系。'],
      mood: ['现在的我，就像充满了能量的恒星一样灿烂！', '有一点点无聊，你可以陪我玩一会吗？', '我在感应银河的脉动，感觉很平静。']
    }
  },
  { 
    type: 'Fox', 
    name: '星云狐', 
    icon: '🦊', 
    color: 'from-orange-400 to-pink-500', 
    desc: '机敏、活泼，总是能发现星空中的小秘密。',
    localResponses: {
      greetings: ['呜呼！今天我们要去哪里探险？', '我刚才在那边的星云里藏了礼物，想看吗？', '嗅嗅...闻到了开心的气息！'],
      love: ['嘿嘿，我的耳朵都被你夸红了！❤️', '狐狸的一生只会认定一个主人哦。', '想让你摸摸我的头，可以吗？'],
      mood: ['心情像极光一样五彩斑斓！', '肚子里装满了好奇心，快跟我说话吧！', '在思考今天该吃哪颗星星，嘿嘿。']
    }
  },
  { 
    type: 'Owl', 
    name: '极光鸮', 
    icon: '🦉', 
    color: 'from-blue-400 to-emerald-500', 
    desc: '睿智、冷静，在深夜为你守护梦境。',
    localResponses: {
      greetings: ['嘘...听，那是远方恒星的跳动。', '智慧引导着我们的相遇，旅者。', '今夜的极光格外温柔，适合交流。'],
      love: ['虽然我不善表达，但我的目光始终追随你。❤️', '你是我星图中唯一的北极星。', '感受到了一股温暖的能量涌入心田。'],
      mood: ['我在冥想中找到了宁静。', '知识的海洋正如繁星般浩瀚。', '正在计算明天的运势轨迹，感觉不错。']
    }
  },
];

export const PetSanctuary: React.FC = () => {
  const { theme, userProfile, syncProfile, setIsInputActive } = useTheme();
  const [pet, setPet] = useState<PetInfo | undefined>(userProfile?.pet);
  const [isAdopting, setIsAdopting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [moodFeedback, setMoodFeedback] = useState<number | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userProfile?.pet) setPet(userProfile.pet);
  }, [userProfile]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // 当打开对话框时，瞬间发送本地问候
  useEffect(() => {
    if (isChatOpen && messages.length === 0 && pet) {
      const template = PET_TEMPLATES.find(t => t.type === pet.type);
      if (template) {
        const greetings = template.localResponses.greetings;
        const msg = greetings[Math.floor(Math.random() * greetings.length)];
        setMessages([{ role: 'model', text: msg, timestamp: Date.now() }]);
      }
    }
  }, [isChatOpen, pet]);

  const getUserSignName = () => {
    if (!userProfile?.birthday) return "未知星座";
    const date = new Date(userProfile.birthday);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const sign = ZODIAC_SIGNS.find(s => {
      const [start, end] = s.date.split('-').map(d => d.split('.').map(Number));
      if (month === start[0] && day >= start[1]) return true;
      if (month === end[0] && day <= end[1]) return true;
      return false;
    });
    return sign?.name || "探索者";
  };

  const handleAdopt = async (type: any, defaultName: string) => {
    const newPet: PetInfo = {
      type,
      name: defaultName,
      level: 1,
      exp: 0,
      hunger: 80,
      mood: 100,
      birthday: new Date().toISOString()
    };
    setIsProcessing(true);
    try {
      await syncProfile({ pet: newPet });
      setIsAdopting(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeed = async () => {
    if (!pet || (userProfile?.starEnergy || 0) < 10 || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const updatedPet: PetInfo = {
        ...pet,
        exp: (pet.exp + 15) % 100,
        level: Math.floor((pet.exp + 15) / 100) + pet.level,
        hunger: Math.min(100, pet.hunger + 35),
        mood: Math.min(100, pet.mood + 5)
      };
      
      await syncProfile({ 
        pet: updatedPet, 
        starEnergy: (userProfile?.starEnergy || 0) - 10 
      });
      setMoodFeedback(5);
      setCurrentEmotion('😋');
      setTimeout(() => { setMoodFeedback(null); setCurrentEmotion(''); }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  // 极速互动处理
  const handleQuickInteract = async (type: 'greetings' | 'love' | 'mood', userText: string) => {
    if (!pet || isProcessing) return;
    
    // 1. 瞬间上屏用户动作
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: Date.now() }]);
    
    // 2. 瞬间从本地库回复 (Perception: 0 latency)
    const template = PET_TEMPLATES.find(t => t.type === pet.type);
    if (template) {
      const responses = template.localResponses[type];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      
      // 模拟一点点真实的打字感
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: reply, timestamp: Date.now() }]);
        // 快捷互动也增加心情和经验
        const updatedPet = { ...pet, mood: Math.min(100, pet.mood + 3), exp: pet.exp + 2 };
        syncProfile({ pet: updatedPet });
      }, 300);
    }
  };

  const handleSendChat = async (customText?: string) => {
    const text = (customText || inputValue).trim();
    if (!pet || !text || isProcessing) return;
    
    if ((userProfile?.starEnergy || 0) < 2) {
      setErrorMessage("星能不足 (需要 2 点)");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 核心 API 调用，已在 services/gemini.ts 禁用推理加速
      const result = await getPetResponse(
        pet.type, 
        pet.name, 
        userProfile?.name || '主人', 
        getUserSignName(), 
        text, 
        pet.mood
      );
      
      const updatedPet: PetInfo = {
        ...pet,
        mood: Math.max(0, Math.min(100, pet.mood + result.moodChange)),
        exp: pet.exp + 8
      };
      
      syncProfile({ 
        pet: updatedPet,
        starEnergy: (userProfile?.starEnergy || 0) - 2
      });

      const modelMsg: ChatMessage = { role: 'model', text: result.text, timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsg]);
      
      setMoodFeedback(result.moodChange);
      setCurrentEmotion(result.emotion);
      setTimeout(() => { 
        setMoodFeedback(null); 
        setCurrentEmotion(''); 
      }, 3000);
      
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: '喵...星际信号似乎中断了，能再说一遍吗？', timestamp: Date.now() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pet && !isAdopting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
        <div className="text-6xl animate-bounce">🥚</div>
        <h2 className="text-2xl font-black">你还没有星际伴侣</h2>
        <p className="text-sm opacity-60">领养一只宠物，它将在漫漫星途中陪伴着你。</p>
        <button 
          onClick={() => setIsAdopting(true)}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-xl active:scale-95"
        >
          前往领养中心
        </button>
      </div>
    );
  }

  if (isAdopting) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-black text-center mb-8">领养你的星际伴侣</h2>
        <div className="grid grid-cols-1 gap-4">
          {PET_TEMPLATES.map((t) => (
            <div key={t.type} className="glass-card p-6 rounded-[2.5rem] flex items-center gap-6 border-2 border-transparent hover:border-indigo-500/30 transition-all">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${t.color} flex items-center justify-center text-4xl shadow-lg`}>
                {t.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg">{t.name}</h3>
                <p className="text-[11px] opacity-60 leading-relaxed mt-1">{t.desc}</p>
                <button 
                  onClick={() => handleAdopt(t.type, t.name)}
                  disabled={isProcessing}
                  className="mt-3 px-4 py-2 rounded-xl bg-white/10 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {isProcessing ? '契约建立中...' : '确认领养'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setIsAdopting(false)} className="w-full text-center text-xs opacity-40 font-bold uppercase tracking-widest pt-4">返回</button>
      </div>
    );
  }

  const currentTemplate = PET_TEMPLATES.find(t => t.type === pet.type);
  const levelNames = ['星尘态', '萌芽态', '幻化态', '守护态'];

  return (
    <div className="animate-fade-in space-y-6 flex flex-col min-h-[70vh]">
      {errorMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full bg-rose-500 text-white text-xs font-black shadow-2xl animate-fade-in">
          ⚠️ {errorMessage}
        </div>
      )}

      {!isChatOpen ? (
        <>
          <div className="relative flex flex-col items-center justify-center py-12 flex-1">
            <div className={`absolute w-64 h-64 rounded-full bg-gradient-to-br ${currentTemplate?.color} opacity-10 blur-3xl animate-pulse`}></div>
            
            <div className={`text-8xl transition-all duration-700 hover:scale-110 cursor-pointer ${isProcessing ? 'animate-pulse opacity-50' : 'animate-breathe'} relative`}>
              <div className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)]">
                {currentEmotion || currentTemplate?.icon}
              </div>
              {moodFeedback !== null && (
                <div className={`absolute -top-12 left-1/2 -translate-x-1/2 text-xl font-black animate-star-burst ${moodFeedback > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {moodFeedback > 0 ? `+${moodFeedback} 💗` : `${moodFeedback} ☁️`}
                </div>
              )}
            </div>

            <div className="text-center mt-6">
              <h2 className="text-2xl font-black tracking-tight">{pet.name}</h2>
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1 bg-indigo-500/10 px-3 py-1 rounded-full inline-block border border-indigo-500/20">Lv.{pet.level} · {levelNames[Math.min(3, pet.level - 1)]}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-4 rounded-3xl space-y-3 shadow-inner">
              <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                <span className="flex items-center gap-1">✨ 成长进化 (EXP)</span>
                <span>{pet.exp}/100</span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out progress-glow relative" style={{ width: `${pet.exp}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-3xl space-y-3 shadow-inner">
                <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                  <span className="flex items-center gap-1">🥣 饱食度</span>
                  <span>{pet.hunger}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000 ease-out progress-glow relative" style={{ width: `${pet.hunger}%` }}></div>
                </div>
              </div>
              <div className="glass-card p-4 rounded-3xl space-y-3 shadow-inner">
                <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                  <span className="flex items-center gap-1">💗 心情值</span>
                  <span>{pet.mood}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                  <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000 ease-out progress-glow relative" style={{ width: `${pet.mood}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              onClick={handleFeed}
              disabled={isProcessing || (userProfile?.starEnergy || 0) < 10}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-xl active:scale-95 disabled:opacity-50 transition-all hover:brightness-110"
            >
              🥣 能量投喂
            </button>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-black text-sm shadow-xl active:scale-95 transition-all hover:brightness-110"
            >
              💬 灵魂交流
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1 h-full animate-fade-in overflow-hidden relative">
           <div className="flex items-center justify-between mb-4 px-2">
              <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-colors">
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="text-center">
                <div className="text-sm font-black flex items-center gap-2">
                  <span>{pet.name}</span>
                  <span className="animate-breathe">{currentEmotion || currentTemplate?.icon}</span>
                </div>
                <div className="text-[9px] opacity-40 font-bold uppercase tracking-widest">心之感应中...</div>
              </div>
              <div className="w-10 h-10"></div>
           </div>

           <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-4 px-2 pb-6 scroll-smooth min-h-[40vh] max-h-[60vh]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : (theme === 'dark' ? 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5 backdrop-blur-sm' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-lg shadow-black/5')
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start animate-pulse">
                  <div className={`p-4 rounded-2xl rounded-tl-none text-[10px] italic ${theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                    {pet.name} 正在认真思考...
                  </div>
                </div>
              )}
           </div>

           {/* 快捷互动按钮 - 极速响应本地语料库 */}
           <div className="flex gap-2 px-2 py-3 overflow-x-auto no-scrollbar">
              <button onClick={() => handleQuickInteract('greetings', "👋 打个招呼")} className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-colors">👋 打招呼</button>
              <button onClick={() => handleQuickInteract('love', "❤️ 表达爱意")} className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-colors">❤️ 表达爱意</button>
              <button onClick={() => handleQuickInteract('mood', "🎭 问候心情")} className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-colors">🎭 表达心情</button>
              <button onClick={() => handleSendChat("✨ 跟我分享一个星空秘密吧")} disabled={isProcessing} className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-colors">✨ 听秘密</button>
           </div>

           <div className="mt-auto pt-2 relative flex items-center px-2 pb-4">
              <div className="relative w-full">
                <input 
                  type="text"
                  value={inputValue}
                  onFocus={() => setIsInputActive(true)}
                  onBlur={() => setIsInputActive(false)}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSendChat()}
                  placeholder={isProcessing ? "思考中..." : "跟它聊聊吧..."}
                  disabled={isProcessing}
                  className={`w-full h-14 pl-5 pr-16 rounded-2xl outline-none border transition-all text-xs font-medium shadow-sm ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-rose-500/50' : 'bg-white border-slate-100 text-slate-800 focus:border-indigo-400'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button 
                  onClick={() => handleSendChat()}
                  disabled={!inputValue.trim() || isProcessing}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    inputValue.trim() && !isProcessing ? 'bg-indigo-600 text-white shadow-md active:scale-90 hover:brightness-110' : 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-[12px]`}></i>
                </button>
              </div>
           </div>
           <p className="text-[8px] text-center text-slate-500 mb-2 font-bold opacity-40 uppercase tracking-widest">
             自由对话将消耗 2 点星能
           </p>
        </div>
      )}
    </div>
  );
};
