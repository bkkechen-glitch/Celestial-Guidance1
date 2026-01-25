
import React, { useState } from 'react';
import { FortuneResult } from '../types';
import { useTheme } from '../App';

interface FortuneCardProps {
  fortune: FortuneResult;
  onBack: () => void;
  signId: string;
  signName: string;
  userName?: string;
  userBirthday?: string;
  userGender?: string;
}

const StarDisplay: React.FC<{ score: number }> = ({ score }) => {
  const stars = Math.round(score / 20); // 0-100 -> 0-5
  return (
    <div className="flex gap-1.5 text-xl">
      {[1, 2, 3, 4, 5].map((s) => (
        <i 
          key={s} 
          className={`fas fa-star ${s <= stars ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'text-slate-300 dark:text-slate-700'}`}
        ></i>
      ))}
    </div>
  );
};

const FortuneDimension: React.FC<{ 
  label: string; 
  score: number; 
  detail: string; 
  color: string; 
  icon: string;
  theme: 'dark' | 'light';
}> = ({ label, score, detail, color, icon, theme }) => {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${color}`}>
            <i className={`fas ${icon} text-xs`}></i>
          </span>
          <span className="text-sm font-black">{label}</span>
        </div>
        <span className="text-xs font-bold font-mono">{score}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full bg-gradient-to-r ${color} transition-all duration-1000`} 
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        {detail}
      </p>
    </div>
  );
};

export const FortuneCard: React.FC<FortuneCardProps> = ({ fortune, onBack, signId, signName, userName, userBirthday, userGender }) => {
  const { theme, handleShareReward } = useTheme();
  const [showRewardToast, setShowRewardToast] = useState(false);
  
  const handleShare = async () => {
    const params = new URLSearchParams({
      name: userName || '',
      bday: userBirthday || '',
      gen: userGender || ''
    });
    
    const path = `fortune/${signId}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}#/${path}?${params.toString()}`;
    const shareText = `【星语占卜】✨${userName}的${signName}今日运势报告✨\n综合得分：${fortune.overallScore}分\n🌟 "${fortune.summary}"\n\n点击开启你的次元运势：`;
    
    try {
      if (navigator.share) {
        await navigator.share({ 
          title: `${signName}今日运势`, 
          text: shareText, 
          url: shareUrl 
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      }
      
      // 触发奖励
      await handleShareReward();
      setShowRewardToast(true);
      setTimeout(() => setShowRewardToast(false), 3000);
      
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20 relative">
      {showRewardToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-2xl animate-bounce">
          ✨ 星能同步成功 +5
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 border-none shadow-sm">
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black tracking-tight">{signName} · 今日运势</h2>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Celestial Report</div>
        </div>
        <button onClick={handleShare} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 border-none shadow-sm">
          <i className="fas fa-share-nodes"></i>
        </button>
      </div>

      <div className="glass-card p-8 rounded-[3rem] border-purple-500/30 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex flex-col items-center">
             <div className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-2">综合运势等级</div>
             <StarDisplay score={fortune.overallScore} />
          </div>
          <div className="pt-4">
            <p className={`text-lg leading-relaxed italic font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              "{fortune.summary}"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FortuneDimension 
            label="爱情桃花" 
            score={fortune.love} 
            detail={fortune.loveDetail} 
            color="from-pink-500 to-rose-400" 
            icon="fa-heart"
            theme={theme}
          />
          <FortuneDimension 
            label="事业学业" 
            score={fortune.work} 
            detail={fortune.workDetail} 
            color="from-blue-500 to-cyan-400" 
            icon="fa-briefcase"
            theme={theme}
          />
          <FortuneDimension 
            label="身心能量" 
            score={fortune.health} 
            detail={fortune.healthDetail} 
            color="from-emerald-500 to-teal-400" 
            icon="fa-bolt"
            theme={theme}
          />
          <FortuneDimension 
            label="财富运筹" 
            score={fortune.money} 
            detail={fortune.moneyDetail} 
            color="from-amber-500 to-orange-400" 
            icon="fa-coins"
            theme={theme}
          />
        </div>

        <div className={`grid grid-cols-3 gap-3 p-6 rounded-3xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
          <div className="text-center">
            <div className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">幸运颜色</div>
            <div className="text-xs font-black">{fortune.luckyColor}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">幸运数字</div>
            <div className="text-xs font-black">{fortune.luckyNumber}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">速配星座</div>
            <div className="text-xs font-black">{fortune.bestMatch}</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-500/20">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
              <i className="fas fa-lightbulb"></i>
            </div>
            <div>
              <div className="text-xs font-black text-purple-400 mb-1">星语锦囊</div>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{fortune.suggestion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
