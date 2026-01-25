
import React, { useState, useEffect, useCallback } from 'react';
// Fix: Cast Taro components to any to resolve VueComponentType JSX mismatch
import { View as _View, Text as _Text, Image as _Image, Button as _Button, Input as _Input, Picker as _Picker } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Layout, useTheme } from '../../components/Layout';
import { ZODIAC_SIGNS } from '../../constants';
import { ZodiacSignInfo } from '../../types';
import { getDailyFortune } from '../../services/api'; 

const View = _View as any;
const Text = _Text as any;
const Image = _Image as any;
const Button = _Button as any;
const Input = _Input as any;
const Picker = _Picker as any;

const generateSeed = (name: string, birthday: string): number => {
  const today = new Date().toISOString().split('T')[0];
  const str = `${name.trim().toLowerCase()}-${birthday}-${today}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; 
  }
  return Math.abs(hash);
};

export default function Index() {
  const { theme } = useTheme();
  
  const [userInfo, setUserInfo] = useState({ name: '', birthday: '', gender: '女' });
  const [showInput, setShowInput] = useState(false);
  const [selectedSign, setSelectedSign] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useDidShow(() => {
    const name = Taro.getStorageSync('zodiac_user_name');
    const birthday = Taro.getStorageSync('zodiac_user_birthday');
    const gender = Taro.getStorageSync('zodiac_user_gender') || '女';
    setUserInfo({ name, birthday, gender });
  });

  const handleSignClick = (sign: ZodiacSignInfo) => {
    setSelectedSign(sign);
    if (!userInfo.name || !userInfo.birthday) {
      setShowInput(true);
    } else {
      fetchFortune(sign, userInfo.name, userInfo.birthday, userInfo.gender);
    }
  };

  const fetchFortune = async (sign: ZodiacSignInfo, name: string, bday: string, gen: string) => {
    setLoading(true);
    Taro.setStorageSync('zodiac_user_name', name);
    Taro.setStorageSync('zodiac_user_birthday', bday);
    Taro.setStorageSync('zodiac_user_gender', gen);

    const seed = generateSeed(name, bday);
    
    try {
      const result = await getDailyFortune(sign.name, name, bday, gen, seed);
      
      const history = Taro.getStorageSync('zodiac_history') || [];
      const newItem = { id: Date.now(), type: '今日运势', timestamp: new Date().toLocaleString(), data: { sign: sign.name, score: result.overallScore } };
      Taro.setStorageSync('zodiac_history', [newItem, ...history].slice(0, 50));

      Taro.setStorageSync('current_fortune', result);
      Taro.navigateTo({
        url: `/pages/result/index?signId=${sign.id}&signName=${sign.name}&seed=${seed}&name=${name}&bday=${bday}&gen=${gen}`
      });

    } catch (err) {
    } finally {
      setLoading(false);
      setShowInput(false);
    }
  };

  return (
    <Layout>
      <View className="flex flex-col items-center">
         {/* 恢复并优化的运势 Logo 区 */}
         <View className="relative w-24 h-24 mb-4 flex items-center justify-center">
            <View className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse"></View>
            <View className="text-6xl animate-breathe relative z-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              🔮
            </View>
         </View>
         
         <Text className="text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">星语占卜</Text>
         <Text className={`text-[10px] tracking-[0.4em] uppercase mb-8 font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Celestial Guidance</Text>

         <View className="grid grid-cols-3 gap-3 w-full px-2">
            {ZODIAC_SIGNS.map((sign) => (
               <View 
                  key={sign.id} 
                  className={`relative flex flex-col items-center p-4 rounded-[2.5rem] border-2 transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/5 border-transparent shadow-xl' : 'bg-white border-slate-50 shadow-lg shadow-black/5'}`}
                  onClick={() => handleSignClick(sign)}
               >
                  <View className="w-16 h-16 rounded-full overflow-hidden mb-3 ring-2 ring-white/10 group-active:rotate-6 transition-transform">
                     <Image src={sign.image} className="w-full h-full" mode="aspectFill" />
                  </View>
                  <Text className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{sign.name}</Text>
                  <Text className="text-[9px] text-slate-500 mt-1 font-bold opacity-60 tracking-tighter">{sign.date}</Text>
               </View>
            ))}
         </View>
      </View>

      {showInput && selectedSign && (
        <View className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
           <View className={`w-full max-w-sm p-8 rounded-[3rem] relative overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-[#1e1b4b] border border-white/10' : 'bg-white'}`}>
              <Text className={`text-center block text-xl font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                完善档案 · {selectedSign.name}
              </Text>

              <View className="flex mb-6 gap-2">
                 {['男', '女', '其他'].map(g => (
                    <View 
                      key={g} 
                      onClick={() => setUserInfo({...userInfo, gender: g})}
                      className={`flex-1 py-3 rounded-2xl text-center text-xs font-black transition-all ${userInfo.gender === g ? 'bg-indigo-600 text-white shadow-lg' : theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}
                    >
                       {g}
                    </View>
                 ))}
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 block">观测者代号</Text>
                  <Input 
                    className={`w-full h-14 px-6 rounded-2xl text-sm font-black ${theme === 'dark' ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-black border border-slate-200'}`}
                    placeholder="旅者名称"
                    value={userInfo.name}
                    onInput={(e) => setUserInfo({...userInfo, name: e.detail.value})}
                  />
                </View>

                <View>
                  <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 block">星轨起始日期</Text>
                  <Picker 
                    mode="date" 
                    value={userInfo.birthday} 
                    onChange={(e) => setUserInfo({...userInfo, birthday: e.detail.value})}
                  >
                    <View className={`w-full h-14 px-6 rounded-2xl flex items-center text-sm font-black ${theme === 'dark' ? 'bg-white/5 text-white border border-white/10' : 'bg-slate-100 text-black border border-slate-200'}`}>
                        {userInfo.birthday || '请选择出生日期'}
                    </View>
                  </Picker>
                </View>
              </View>

              <View className="flex gap-4 mt-8">
                 <Button className="flex-1 bg-transparent text-slate-500 text-xs font-black border-none" onClick={() => setShowInput(false)}>取消</Button>
                 <Button 
                    className="flex-[2] h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl shadow-indigo-500/30 text-xs font-black border-none active:scale-95 leading-[56rpx]"
                    onClick={() => fetchFortune(selectedSign, userInfo.name, userInfo.birthday, userInfo.gender)}
                    disabled={loading}
                 >
                    {loading ? '同步星轨...' : '开始同步'}
                 </Button>
              </View>
           </View>
        </View>
      )}
    </Layout>
  );
}
