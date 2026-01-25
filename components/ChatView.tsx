
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../App';
import { askZodiacAdvisor } from '../services/gemini';
import { ChatMessage } from '../types';
import { ZODIAC_SIGNS } from '../constants';

export const ChatView: React.FC = () => {
  const { theme, userProfile, setIsInputActive } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `亲爱的旅者 ${userProfile?.name || ''}，欢迎来到星语神殿。有什么关于星空的秘密或未来的迷茫，想让我为你解读吗？`, timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Helper function to determine the user's zodiac sign based on their birthday
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

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await askZodiacAdvisor(
        inputValue,
        history,
        userProfile?.name || '旅者',
        getUserSignName(),
        userProfile?.birthday || ''
      );

      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: response || '星象受阻，我未能听清星语的呢喃...', 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: '星轨出现了短暂的扰动，请稍后再试。', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] animate-fade-in">
      <div className="text-center mb-4">
        <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>星语问答</h2>
        <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-[0.3em]`}>AI Powered Astrology Advisor</p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 px-2 pb-4 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
              msg.role === 'user' 
                ? (theme === 'dark' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-indigo-500 text-white rounded-tr-sm')
                : (theme === 'dark' ? 'bg-white/10 text-slate-200 rounded-tl-sm backdrop-blur-md border border-white/5' : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100')
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className={`p-4 rounded-3xl rounded-tl-sm text-xs italic ${theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
              正在聆听星空回响...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 relative group">
        <input 
          type="text"
          value={inputValue}
          onFocus={() => setIsInputActive(true)}
          onBlur={() => setIsInputActive(false)}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="向星语者提问..."
          className={`w-full h-14 pl-6 pr-14 rounded-2xl outline-none border-2 transition-all font-medium ${
            theme === 'dark' 
              ? 'bg-white/5 border-white/10 text-white focus:border-purple-500/50 focus:bg-white/10' 
              : 'bg-white border-slate-100 text-slate-800 focus:border-indigo-400 focus:shadow-xl'
          }`}
        />
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className={`absolute right-2 top-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            inputValue.trim() && !isLoading 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg active:scale-90' 
              : 'bg-slate-500/20 text-slate-400'
          }`}
        >
          <i className="fas fa-paper-plane text-xs"></i>
        </button>
      </div>
    </div>
  );
};
