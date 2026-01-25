
import React, { createContext, useContext, useState, useEffect } from 'react';
// Fix: Cast Taro components to any to resolve VueComponentType JSX mismatch
import { View as _View, Image as _Image, Text as _Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';

const View = _View as any;
const Image = _Image as any;
const Text = _Text as any;

/**
 * Theme Context
 */
type Theme = 'dark' | 'light';
const ThemeContext = createContext<{ 
  theme: Theme; 
  toggleTheme: () => void;
}>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/**
 * Loading Component
 */
export const CelestialLoading: React.FC<{ message: string }> = ({ message }) => {
  const { theme } = useTheme();
  return (
    <View className="flex flex-col items-center justify-center min-h-[50vh] py-20 animate-fade-in space-y-8">
      <View className="relative w-32 h-32 flex items-center justify-center">
        <View className={`absolute inset-0 border-4 border-dashed ${theme === 'dark' ? 'border-purple-500/20' : 'border-indigo-500/10'} rounded-full`} style={{ animation: 'spin 10s linear infinite' }}></View>
        <View className="relative z-10 text-5xl opacity-80 animate-pulse">
          <Text>🔮</Text>
        </View>
      </View>
      <Text className={`text-sm font-bold tracking-widest ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{message}</Text>
    </View>
  );
};

/**
 * 底部导航栏组件
 */
const CustomTabBar: React.FC<{ theme: Theme }> = ({ theme }) => {
  const router = useRouter();
  const path = router.path; // 获取当前页面路径

  // 简单的路由跳转辅助
  const go = (url: string) => {
    // 避免重复跳转
    if (!path.includes(url)) {
      Taro.redirectTo({ url: `/pages/${url}/index` });
    }
  };

  const isActive = (p: string) => path.includes(p) || (path.includes('index') && p === 'index' && !path.includes('match') && !path.includes('mystery') && !path.includes('profile'));

  return (
    <View className={`fixed bottom-6 left-4 right-4 h-20 rounded-[2.5rem] flex items-center justify-around px-4 shadow-2xl z-50 transition-all ${theme === 'dark' ? 'bg-slate-900/95 border border-white/10 backdrop-blur-xl' : 'bg-white/95 border border-slate-200 backdrop-blur-xl'}`}>
      
      {/* 运势 (Home) - Indigo Theme */}
      <View className={`flex flex-col items-center transition-all duration-300 ${isActive('index') ? '-translate-y-1' : 'opacity-40'}`} onClick={() => go('index')}>
        <View className={`text-xl mb-0.5 transition-all duration-500 ${isActive('index') ? 'text-indigo-500 scale-125' : 'text-slate-400'}`}>
          <Text>✨</Text>
        </View>
        <View className={`text-[10px] font-black tracking-tight transition-colors duration-300 ${isActive('index') ? 'text-indigo-600' : 'text-slate-400'}`}>运势</View>
        {isActive('index') && <View className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 animate-pulse"></View>}
      </View>

      {/* 配对 - Rose Theme */}
      <View className={`flex flex-col items-center transition-all duration-300 ${isActive('match') ? '-translate-y-1' : 'opacity-40'}`} onClick={() => go('match')}>
        <View className={`text-xl mb-0.5 transition-all duration-500 ${isActive('match') ? 'text-rose-500 scale-125' : 'text-slate-400'}`}>
           <Text>❤️</Text>
        </View>
        <View className={`text-[10px] font-black tracking-tight transition-colors duration-300 ${isActive('match') ? 'text-rose-600' : 'text-slate-400'}`}>配对</View>
        {isActive('match') && <View className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 animate-pulse"></View>}
      </View>

      {/* 盲盒 - Fuchsia Theme */}
      <View className={`flex flex-col items-center transition-all duration-300 ${isActive('mystery') ? '-translate-y-1' : 'opacity-40'}`} onClick={() => go('mystery')}>
        <View className={`text-xl mb-0.5 transition-all duration-500 ${isActive('mystery') ? 'text-fuchsia-500 scale-125' : 'text-slate-400'}`}>
           <Text>🎁</Text>
        </View>
        <View className={`text-[10px] font-black tracking-tight transition-colors duration-300 ${isActive('mystery') ? 'text-fuchsia-600' : 'text-slate-400'}`}>盲盒</View>
        {isActive('mystery') && <View className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1 animate-pulse"></View>}
      </View>

      {/* 我的 - Amber Theme */}
      <View className={`flex flex-col items-center transition-all duration-300 ${isActive('profile') ? '-translate-y-1' : 'opacity-40'}`} onClick={() => go('profile')}>
        <View className={`text-xl mb-0.5 transition-all duration-500 ${isActive('profile') ? 'text-amber-500 scale-125' : 'text-slate-400'}`}>
           <Text>👤</Text>
        </View>
        <View className={`text-[10px] font-black tracking-tight transition-colors duration-300 ${isActive('profile') ? 'text-amber-600' : 'text-slate-400'}`}>我的</View>
        {isActive('profile') && <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 animate-pulse"></View>}
      </View>

    </View>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; showNav?: boolean }> = ({ children, showNav = true }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  // 初始化读取缓存
  useEffect(() => {
    const saved = Taro.getStorageSync('zodiac_theme');
    if (saved) setTheme(saved as Theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    Taro.setStorageSync('zodiac_theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <View className={`min-h-screen w-full transition-colors duration-500 relative overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        
        {/* 顶部开关 */}
        <View className="fixed top-12 right-4 z-50" onClick={toggleTheme}>
           <View className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${theme === 'dark' ? 'bg-white/10 text-yellow-400' : 'bg-indigo-600 text-white'}`}>
              <Text className="text-sm">{theme === 'dark' ? '☀️' : '🌙'}</Text>
           </View>
        </View>

        {/* 主内容区 */}
        <View className="flex-1 px-4 pt-24 pb-32 relative z-10 box-border">
           {children}
        </View>

        {/* 底部导航 */}
        {showNav && <CustomTabBar theme={theme} />}
      </View>
    </ThemeContext.Provider>
  );
};
