import React from 'react';
// Fix: Cast Taro components to any to resolve VueComponentType JSX mismatch
import { View as _View, Text as _Text, Button as _Button } from '@tarojs/components';
import { useShareAppMessage } from '@tarojs/taro';
import { FortuneResult } from '../types';
import { useTheme } from '../components/Layout';

const View = _View as any;
const Text = _Text as any;
const Button = _Button as any;

interface FortuneCardProps {
  fortune: FortuneResult;
  onBack: () => void;
  signId: string;
  signName: string;
  userName?: string;
  userBirthday?: string;
  userGender?: string;
  seed?: number; // 新增 seed 参数
}

const StarDisplay: React.FC<{ score: number }> = ({ score }) => {
  const stars = Math.round(score / 20);
  return (
    <View className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Text 
          key={s} 
          className={`text-xl ${s <= stars ? 'text-yellow-400' : 'text-slate-300'}`}
        >★</Text>
      ))}
    </View>
  );
};

const FortuneDimension: React.FC<{ 
  label: string; 
  score: number; 
  detail: string; 
  color: string; 
  theme: 'dark' | 'light';
}> = ({ label, score, detail, color, theme }) => {
  return (
    <View className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
      <View className="flex items-center justify-between mb-3">
        <View className="flex items-center gap-2">
          <View className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${color}`}>
            <Text className="text-xs">⚡</Text>
          </View>
          <Text className="text-sm font-black">{label}</Text>
        </View>
        <Text className="text-xs font-bold font-mono">{score}%</Text>
      </View>
      {/* 进度条模拟 */}
      <View className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
        <View 
          className={`h-full bg-gradient-to-r ${color}`} 
          style={{ width: `${score}%` }}
        />
      </View>
      <Text className={`text-[11px] leading-relaxed block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        {detail}
      </Text>
    </View>
  );
};

export const FortuneCard: React.FC<FortuneCardProps> = ({ fortune, onBack, signId, signName, userName, userBirthday, userGender, seed }) => {
  const { theme } = useTheme();
  
  /**
   * 🌟 注意：FortuneCard 必须作为页面或在页面组件中渲染
   * useShareAppMessage 必须在页面组件中生效。
   */
  useShareAppMessage(() => {
    return {
      title: `${userName}的${signName}今日运势：${fortune.overallScore}分`,
      // 包含 seed 参数以确保分享内容的一致性
      path: `/pages/result/index?signId=${signId}&signName=${signName}&name=${userName}&bday=${userBirthday}&gen=${userGender}&seed=${seed}&share=true`,
      imageUrl: '' // 可选
    };
  });

  return (
    <View className="animate-fade-in pb-20">
      <View className="flex items-center justify-between mb-6">
        <View onClick={onBack} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400">
          <Text>↩</Text>
        </View>
        <View className="text-center">
          <Text className="text-xl font-black block">{signName} · 今日运势</Text>
          <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 block">Celestial Report</Text>
        </View>
        {/* 原生分享按钮 */}
        <Button 
            openType="share"
            className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-slate-400 border-none p-0 leading-none"
            style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <Text>🔗</Text>
        </Button>
      </View>

      <View className="glass-card p-8 rounded-[3rem] border-purple-500/30 shadow-2xl space-y-8 relative overflow-hidden">
        {/* 综合运势头部 */}
        <View className="text-center relative z-10">
          <View className="flex flex-col items-center">
             <Text className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-2 block">综合运势等级</Text>
             <StarDisplay score={fortune.overallScore} />
          </View>
          <View className="pt-4">
            <Text className={`text-lg leading-relaxed italic font-medium block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
              "{fortune.summary}"
            </Text>
          </View>
        </View>

        {/* 维度详情 */}
        <View className="flex flex-col gap-4">
          <FortuneDimension label="爱情桃花" score={fortune.love} detail={fortune.loveDetail} color="from-pink-500 to-rose-400" theme={theme} />
          <FortuneDimension label="事业学业" score={fortune.work} detail={fortune.workDetail} color="from-blue-500 to-cyan-400" theme={theme} />
          <FortuneDimension label="身心能量" score={fortune.health} detail={fortune.healthDetail} color="from-emerald-500 to-teal-400" theme={theme} />
          <FortuneDimension label="财富运筹" score={fortune.money} detail={fortune.moneyDetail} color="from-amber-500 to-orange-400" theme={theme} />
        </View>

        {/* 幸运指数 */}
        <View className={`grid grid-cols-3 gap-3 p-6 rounded-3xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
          <View className="text-center">
            <Text className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tighter block">幸运颜色</Text>
            <Text className="text-xs font-black block">{fortune.luckyColor}</Text>
          </View>
          <View className="text-center">
            <Text className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tighter block">幸运数字</Text>
            <Text className="text-xs font-black block">{fortune.luckyNumber}</Text>
          </View>
          <View className="text-center">
            <Text className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-tighter block">速配星座</Text>
            <Text className="text-xs font-black block">{fortune.bestMatch}</Text>
          </View>
        </View>

        {/* 核心建议 */}
        <View className="p-6 rounded-3xl bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-500/20">
          <View className="flex gap-4">
            <View className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
              <Text>💡</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-black text-purple-400 mb-1 block">星语锦囊</Text>
              <Text className={`text-xs leading-relaxed block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{fortune.suggestion}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};