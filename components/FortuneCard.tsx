
import React from 'react';
import { FortuneResult } from '../types';
import { useTheme } from '../App';

interface FortuneCardProps {
  fortune: FortuneResult;
  onBack: () => void;
  signName: string;
  userName?: string;
}

const StarRating: React.FC<{ value: number; color: string }> = ({ value, color }) => {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
      <div 
        className={`h-full bg-gradient-to-r ${color} transition-all duration-1000`} 
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export const FortuneCard: React.FC<FortuneCardProps> = ({ fortune, onBack, signName, userName }) => {
  const { theme } = useTheme();
  
  const handleShare = async () => {
    const currentUrl = window.location.origin + window.location.pathname + window.location.hash;
    
    const shareData = {
      title: `${signName}今日运势`,
      text: `【星语占卜】${userName ? userName + '的' : ''}${signName}今日星语：${fortune.summary}\n建议：${fortune.suggestion}`,
      url: currentUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error('Fallback to clipboard');
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n查看更多：${shareData.url}`);
        alert('运势已复制到剪贴板，快去分享吧！');
      } catch (clipErr) {
        console.error('分享与复制均失败:', clipErr);
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-indigo-500 transition-colors">
          <i className="fas fa-chevron-left mr-2"></i> 返回
        </button>
        <div className="text-right">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            {signName} · 今日运势
          </h2>
          {userName && <p className="text-[10px] text-slate-500">测算对象: {userName}</p>}
        </div>
        <button onClick={handleShare} className="text-slate-400 hover:text-purple-500 transition-colors">
          <i className="fas fa-share-nodes"></i>
        </button>
      </div>

      <div className="glass-card p-6 rounded-3xl space-y-6 border-purple-500/30">
        <p className={`text-lg leading-relaxed italic ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
          "{fortune.summary}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>爱情运势</span>
              <span>{fortune.love}%</span>
            </div>
            <StarRating value={fortune.love} color="from-pink-500 to-rose-400" />
          </div>
          <div className="space-y-2">
            <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>工作运势</span>
              <span>{fortune.work}%</span>
            </div>
            <StarRating value={fortune.work} color="from-blue-500 to-cyan-400" />
          </div>
          <div className="space-y-2">
            <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>健康运势</span>
              <span>{fortune.health}%</span>
            </div>
            <StarRating value={fortune.health} color="from-green-500 to-emerald-400" />
          </div>
          <div className="space-y-2">
            <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>财运运势</span>
              <span>{fortune.money}%</span>
            </div>
            <StarRating value={fortune.money} color="from-yellow-500 to-orange-400" />
          </div>
        </div>

        <div className={`grid grid-cols-3 gap-3 pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">幸运颜色</div>
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{fortune.luckyColor}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">幸运数字</div>
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{fortune.luckyNumber}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">速配星座</div>
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{fortune.bestMatch}</div>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-purple-900/20 border-purple-500/20' : 'bg-purple-50 border-purple-200'} p-4 rounded-2xl border`}>
          <div className="flex items-start gap-3">
            <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
            <div>
              <div className="text-sm font-bold text-purple-600 dark:text-purple-300 mb-1">星语建议</div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{fortune.suggestion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
