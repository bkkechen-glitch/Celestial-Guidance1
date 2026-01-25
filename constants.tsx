
import { ZodiacSignInfo } from './types';

/**
 * 这里的图像数据已通过 SVG 直接嵌入。
 * 这种方式将图片“保存”在代码中，无需网络请求，加载速度极快。
 */
export const ZODIAC_SIGNS: ZodiacSignInfo[] = [
  { 
    id: 'Aries', 
    name: '白羊座', 
    date: '3.21-4.19', 
    icon: '♈', 
    color: 'from-red-500 to-orange-500', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23ff6b6b'/><stop offset='100%' style='stop-color:%23f06292'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g1)'/><circle cx='50' cy='45' r='30' fill='white' opacity='0.9'/><path d='M30 35 Q20 20 40 25 M70 35 Q80 20 60 25' fill='none' stroke='%23ff9a9e' stroke-width='6' stroke-linecap='round'/><circle cx='40' cy='45' r='3' fill='%23333'/><circle cx='60' cy='45' r='3' fill='%23333'/><path d='M45 55 Q50 60 55 55' fill='none' stroke='%23ff6b6b' stroke-width='2'/></svg>`
  },
  { 
    id: 'Taurus', 
    name: '金牛座', 
    date: '4.20-5.20', 
    icon: '♉', 
    color: 'from-orange-600 to-yellow-700', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23fb8c00'/><stop offset='100%' style='stop-color:%23f4511e'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g2)'/><path d='M30 30 L40 45 L60 45 L70 30' fill='white' opacity='0.8'/><circle cx='50' cy='55' r='35' fill='%235d4037'/><circle cx='40' cy='55' r='4' fill='white'/><circle cx='60' cy='55' r='4' fill='white'/><path d='M40 70 Q50 75 60 70' fill='none' stroke='white' stroke-width='3'/></svg>`
  },
  { 
    id: 'Gemini', 
    name: '双子座', 
    date: '5.21-6.21', 
    icon: '♊', 
    color: 'from-blue-400 to-cyan-400', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%234fc3f7'/><stop offset='100%' style='stop-color:%234db6ac'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g3)'/><circle cx='35' cy='50' r='15' fill='white' opacity='0.9'/><circle cx='65' cy='50' r='15' fill='white' opacity='0.9'/><circle cx='32' cy='48' r='2' fill='%23333'/><circle cx='38' cy='48' r='2' fill='%23333'/><circle cx='62' cy='48' r='2' fill='%23333'/><circle cx='68' cy='48' r='2' fill='%23333'/></svg>`
  },
  { 
    id: 'Cancer', 
    name: '巨蟹座', 
    date: '6.22-7.22', 
    icon: '♋', 
    color: 'from-rose-400 to-red-500', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g4' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23ff5252'/><stop offset='100%' style='stop-color:%23d32f2f'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g4)'/><circle cx='50' cy='55' r='30' fill='white' opacity='0.9'/><path d='M20 40 Q15 20 35 30 M80 40 Q85 20 65 30' fill='%23ff8a80' stroke='white' stroke-width='2'/><circle cx='40' cy='50' r='3' fill='%23333'/><circle cx='60' cy='50' r='3' fill='%23333'/></svg>`
  },
  { 
    id: 'Leo', 
    name: '狮子座', 
    date: '7.23-8.22', 
    icon: '♌', 
    color: 'from-yellow-400 to-orange-500', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g5' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23ffd54f'/><stop offset='100%' style='stop-color:%23ff8f00'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g5)'/><path d='M20 50 Q20 10 50 10 Q80 10 80 50 Q80 80 50 80 Q20 80 20 50' fill='%23bf360c' opacity='0.3'/><circle cx='50' cy='50' r='30' fill='%23ffeb3b'/><circle cx='42' cy='45' r='3' fill='%233e2723'/><circle cx='58' cy='45' r='3' fill='%233e2723'/><path d='M45 60 Q50 65 55 60' fill='none' stroke='%233e2723' stroke-width='2'/></svg>`
  },
  { 
    id: 'Virgo', 
    name: '处女座', 
    date: '8.23-9.22', 
    icon: '♍', 
    color: 'from-purple-300 to-indigo-400', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g6' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23e1bee7'/><stop offset='100%' style='stop-color:%239575cd'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g6)'/><path d='M30 40 Q50 20 70 40 L70 70 Q50 80 30 70 Z' fill='white' opacity='0.9'/><circle cx='50' cy='45' r='10' fill='%239575cd' opacity='0.2'/><path d='M45 45 Q50 48 55 45' fill='none' stroke='%239575cd' stroke-width='2'/></svg>`
  },
  { 
    id: 'Libra', 
    name: '天秤座', 
    date: '9.23-10.23', 
    icon: '♎', 
    color: 'from-cyan-300 to-blue-400', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g7' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23b3e5fc'/><stop offset='100%' style='stop-color:%230288d1'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g7)'/><rect x='25' y='45' width='50' height='5' rx='2' fill='white'/><circle cx='30' cy='60' r='10' fill='white' opacity='0.6'/><circle cx='70' cy='60' r='10' fill='white' opacity='0.6'/></svg>`
  },
  { 
    id: 'Scorpio', 
    name: '天蝎座', 
    date: '10.24-11.22', 
    icon: '♏', 
    color: 'from-indigo-600 to-purple-800', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g8' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23303f9f'/><stop offset='100%' style='stop-color:%23512da8'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g8)'/><path d='M40 70 Q30 50 40 30 Q50 20 60 30 Q70 50 60 70' fill='white' opacity='0.3'/><path d='M70 30 Q80 20 70 10' fill='none' stroke='%23ff4081' stroke-width='4' stroke-linecap='round'/></svg>`
  },
  { 
    id: 'Sagittarius', 
    name: '射手座', 
    date: '11.23-12.21', 
    icon: '♐', 
    color: 'from-blue-500 to-indigo-600', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g9' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%2342a5f5'/><stop offset='100%' style='stop-color:%233f51b5'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g9)'/><path d='M30 70 L70 30 M70 30 L60 30 M70 30 L70 40' fill='none' stroke='white' stroke-width='6' stroke-linecap='round'/><circle cx='40' cy='60' r='15' fill='white' opacity='0.2'/></svg>`
  },
  { 
    id: 'Capricorn', 
    name: '摩羯座', 
    date: '12.22-1.19', 
    icon: '♑', 
    color: 'from-stone-600 to-neutral-800', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g10' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%2378909c'/><stop offset='100%' style='stop-color:%23455a64'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g10)'/><path d='M30 40 Q20 30 35 25 M70 40 Q80 30 65 25' fill='none' stroke='white' stroke-width='4'/><circle cx='50' cy='55' r='30' fill='%23eceff1' opacity='0.9'/><circle cx='42' cy='50' r='3' fill='%23333'/><circle cx='58' cy='50' r='3' fill='%23333'/></svg>`
  },
  { 
    id: 'Aquarius', 
    name: '水瓶座', 
    date: '1.20-2.18', 
    icon: '♒', 
    color: 'from-cyan-500 to-blue-500', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g11' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%2300bcd4'/><stop offset='100%' style='stop-color:%231976d2'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g11)'/><path d='M30 40 Q50 30 70 40 L65 70 Q50 80 35 70 Z' fill='white' opacity='0.8'/><path d='M40 50 Q50 55 60 50 M40 60 Q50 65 60 60' fill='none' stroke='%230288d1' stroke-width='3'/></svg>`
  },
  { 
    id: 'Pisces', 
    name: '双鱼座', 
    date: '2.19-3.20', 
    icon: '♓', 
    color: 'from-indigo-400 to-purple-400', 
    image: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g12' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%237986cb'/><stop offset='100%' style='stop-color:%239575cd'/></linearGradient></defs><circle cx='50' cy='50' r='50' fill='url(%23g12)'/><path d='M30 40 Q50 40 30 60 M70 40 Q50 40 70 60' fill='none' stroke='white' stroke-width='8' stroke-linecap='round'/><circle cx='40' cy='45' r='2' fill='white'/><circle cx='60' cy='45' r='2' fill='white'/></svg>`
  },
];
