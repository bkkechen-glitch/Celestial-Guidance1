
export default {
  pages: [
    'pages/index/index',       // 首页 (FortuneView)
    'pages/match/index',       // 配对 (MatchView)
    'pages/mystery/index',     // 盲盒 (MysteryBoxView)
    'pages/profile/index',     // 我的 (ProfileView)
    'pages/detail/index',      // 星座详情 (ZodiacDetailView)
    'pages/result/index'       // 运势结果 (FortuneCard)
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTitleText: '星语占卜',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom' // 使用自定义导航栏以实现沉浸式背景
  },
  animation: {
    duration: 300,
    delay: 50
  }
}
