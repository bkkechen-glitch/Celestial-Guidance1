import React, { useState, useEffect, useCallback } from 'react';
// Fix: Cast Taro components to any to resolve VueComponentType JSX mismatch
import { View as _View, Text as _Text, Image as _Image, Button as _Button, Input as _Input, Picker as _Picker } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Layout, useTheme } from '../../components/Layout';
import { ZODIAC_SIGNS } from '../../constants';
import { ZodiacSignInfo } from '../../types';
import { getDailyFortune } from '../../services/api'; // 使用新的 API 服务

const View = _View as any;
const Text = _Text as any;
const Image = _Image as any;
const Button = _Button as any;
const Input = _Input as any;
const Picker = _Picker as any;

const generateSeed = (name: string, birthday: string): number => {
  // ... (保留原有的 Seed 逻辑)
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
  
  // 状态管理
  const [userInfo, setUserInfo] = useState({ name: '', birthday: '', gender: '女' });
  const [showInput, setShowInput] = useState(false);
  const [selectedSign, setSelectedSign] = useState<ZodiacSignInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // 页面显示时读取缓存
  useDidShow(() => {
    const name = Taro.getStorageSync('zodiac_user_name');
    const birthday = Taro.getStorageSync('zodiac_user_birthday');
    const gender = Taro.getStorageSync('zodiac_user_gender') || '女';
    setUserInfo({ name, birthday, gender });
    
    // 如果没有信息，打开输入框
    if (!name || !birthday) {
        // 初始不强制弹窗，点击星座时再弹
    }
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
    // 保存信息
    Taro.setStorageSync('zodiac_user_name', name);
    Taro.setStorageSync('zodiac_user_birthday', bday);
    Taro.setStorageSync('zodiac_user_gender', gen);

    const seed = generateSeed(name, bday);
    
    try {
      const result = await getDailyFortune(sign.name, name, bday, gen, seed);
      
      // 保存历史
      const history = Taro.getStorageSync('zodiac_history') || [];
      const newItem = { id: Date.now(), type: '今日运势', timestamp: new Date().toLocaleString(), data: { sign: sign.name, score: result.overallScore } };
      Taro.setStorageSync('zodiac_history', [newItem, ...history].slice(0, 50));

      // 跳转到结果页，传递所有必要参数以支持分享
      Taro.setStorageSync('current_fortune', result);
      Taro.navigateTo({
        url: `/pages/result/index?signId=${sign.id}&signName=${sign.name}&seed=${seed}&name=${name}&bday=${bday}&gen=${gen}`
      });

    } catch (err) {
      // 错误已在 api.ts 处理
    } finally {
      setLoading(false);
      setShowInput(false);
    }
  };

  return (
    <Layout>
      <View className="flex flex-col items-center">
         <Text className="text-3xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">星语占卜</Text>
         <Text className={`text-xs tracking-widest uppercase mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Celestial Guidance</Text>

         {/* 12星座网格 */}
         <View className="grid grid-cols-3 gap-3 w-full">
            {ZODIAC_SIGNS.map((sign) => (
               <View 
                  key={sign.id} 
                  className={`relative flex flex-col items-center p-3 rounded-3xl border-2 transition-all ${theme === 'dark' ? 'bg-white/5 border-transparent' : 'bg-white border-slate-100 shadow-sm'}`}
                  onClick={() => handleSignClick(sign)}
               >
                  <View className="w-16 h-16 rounded-full overflow-hidden mb-2">
                     <Image src={sign.image} className="w-full h-full" />
                  </View>
                  <Text className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>{sign.name}</Text>
                  <Text className="text-[10px] text-slate-500 mt-1">{sign.date}</Text>
               </View>
            ))}
         </View>
      </View>

      {/* 输入弹窗 (模拟 Modal) */}
      {showInput && selectedSign && (
        <View className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6">
           <View className={`w-full max-w-sm p-6 rounded-[2rem] relative overflow-hidden ${theme === 'dark' ? 'bg-[#1e1b4b]' : 'bg-white'}`}>
              <Text className={`text-center block text-lg font-black mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                完善 {selectedSign.name} 档案
              </Text>

              {/* 性别选择 */}
              <View className="flex mb-4 gap-2">
                 {['男', '女', '其他'].map(g => (
                    <View 
                      key={g} 
                      onClick={() => setUserInfo({...userInfo, gender: g})}
                      className={`flex-1 py-2 rounded-xl text-center text-xs font-bold ${userInfo.gender === g ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                    >
                       {g}
                    </View>
                 ))}
              </View>

              {/* 姓名 */}
              <Input 
                 className={`w-full h-12 px-4 rounded-xl mb-4 text-sm font-bold ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-100 text-black'}`}
                 placeholder="你的名字"
                 value={userInfo.name}
                 onInput={(e) => setUserInfo({...userInfo, name: e.detail.value})}
              />

              {/* 生日 (Picker) */}
              <Picker 
                 mode="date" 
                 value={userInfo.birthday} 
                 onChange={(e) => setUserInfo({...userInfo, birthday: e.detail.value})}
              >
                 <View className={`w-full h-12 px-4 rounded-xl mb-6 flex items-center text-sm font-bold ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-100 text-black'}`}>
                    {userInfo.birthday || '选择出生日期'}
                 </View>
              </Picker>

              <View className="flex gap-3">
                 <Button className="flex-1 bg-transparent text-slate-500" onClick={() => setShowInput(false)}>取消</Button>
                 <Button 
                    className="flex-[2] bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/30"
                    onClick={() => fetchFortune(selectedSign, userInfo.name, userInfo.birthday, userInfo.gender)}
                    disabled={loading}
                 >
                    {loading ? '连接星空中...' : '开始观测'}
                 </Button>
              </View>
           </View>
        </View>
      )}
    </Layout>
  );
}