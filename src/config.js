const config = {
  //网页元数据
  metaData: {
    title: 'bamboo1.1 homepage',
    description: 'ようこそ、私のソウルソサエティへ',
    keywords: 'bamboo1,no.1,个人主页,个人网站',
    icon: '/favicon.ico'   //网页图标，支持外链
  },

  // 天气相关配置  输入你的 OpenWeatherMap API Key
  weather: {
    apiKey: 'ff252793e358bd233013c2a09149b34d',
    defaultCity: 'Tokyo'
  },

  // 新闻相关配置  输入你的 NewsData.io API Key
  news: {
    apiKey: 'pub_afe616564d5843a5af76c5e4af882a2c', // 请在 https://newsdata.io/ 注册并获取API Key，留空将使用模拟数据
    language: 'ja,en', // 新闻语言：日语优先，英语备选 (支持: 'ja', 'en', 'ja,en', 'en,ja' 等)
    category: 'top', // 新闻分类：推荐使用 'top' 获得更多日语内容，也可选择 'technology,science', 'business' 等
    size: 10, // 获取新闻数量
    // 智能降级策略：当首选语言无新闻时，是否自动尝试其他语言和分类
    enableSmartFallback: true,
    // 首选日语新闻源（如果可用）
    preferJapanese: true
  },

  avatar: "/img/avatar.jpg", // 头像
  welcometitle: "I'm bamboo.1. Welcome to my Soul Society.", // 标题

  // 默认背景壁纸
  background: {
    "pc": {   //pc端
      //"type": "video",   //"pic":静态壁纸;"video":动态壁纸
      "type": "pic",
      "datainfo": {
        "title": "むりなことはむり",
        "preview": "/img/wallpaper/static/むりなことはむり/107876734_p0-pre.webp",
        "url": "/img/wallpaper/static/むりなことはむり/107876734_p0.png"
      },
    },
    "mobile": {   //移动端
      "type": "pic",
      "datainfo": {
        "title": "散华01",
        "preview": "/img/wallpaper/static-mobile/散华01/Sanhua-01-pre.webp",
        "url": "/img/wallpaper/static-mobile/散华01/Sanhua-01.jpg"
      }
    }

  },

  //雷达图数据
  radarChart: {
    skills: ['Vue.js', 'React', 'JavaScript', 'Node', 'Java', 'Python', 'linux', 'Html', 'Vuetify', 'CSS', 'AWS'],
    skillPoints: [85, 78, 88, 90, 80, 78, 65, 65, 82, 78, 70],
  },

  //社交按钮
  socialPlatformIcons: [
    { icon: "mdi-email", link: "mailto:" },
    { icon: "mdi-github", link: "https://www.github.com/" },
    { icon: "mdi-qqchat", link: "https://im.qq.com/" },
    { icon: "mdi-wechat", link: "https://wx.qq.com/" },
    { icon: "mdi-youtube", link: "https://www.youtube.com" },
    { icon: "mdi-instagram", link: "https://www.instagram.com/" }
  ],

  //打字机
  typeWriterStrings: [

    "If you’re reading this, then I have successfully drawn you in.",
    "セネカ曰く「生は適切に活用すれば十分に長い」",
    "希望心中常怀宁静，去接受我无法改变的事；希望胸中燃着勇气，去改变我能改变的事；希望灵魂具备智慧，分辨这两者的不同。",
    "見る夢は叶わず、追う夢は叶う。",
  ],

  //音乐播放配置，采用MetingJS Api(https://github.com/metowolf/MetingJS)
  musicPlayer: {
    server: 'netease',  //服务提供商 --网易云音乐
    type: 'playlist',   //歌单类型
    id: '7311102748'  //歌单id ---> music.163.com/#/playlist?id=7311102748
  },

  wallpaper: {
    pic: [

      { "title": "むりなことはむり", "preview": "/img/wallpaper/static/むりなことはむり/107876734_p0-pre.webp", "url": "/img/wallpaper/static/むりなことはむり/107876734_p0.png" },
      { "title": "今汐01", "preview": "/img/wallpaper/static/今汐01/jinxi-01-pre.webp", "url": "/img/wallpaper/static/今汐01/jinxi-01.jpg" },
      { "title": "晓美焰01", "preview": "/img/wallpaper/static/晓美焰01/homura-01-pre.webp", "url": "/img/wallpaper/static/晓美焰01/homura-01.jpg" },
      { "title": "晓美焰02", "preview": "/img/wallpaper/static/晓美焰02/homura-02-pre.webp", "url": "/img/wallpaper/static/晓美焰02/homura-02.jpg" },
      { "title": "艾莲01", "preview": "/img/wallpaper/static/艾莲01/Ellen-01-pre.webp", "url": "/img/wallpaper/static/艾莲01/Ellen-01.jpg" },
      { "title": "凌波丽01", "preview": "/img/wallpaper/static/凌波丽01/Aya-01-pre.webp", "url": "/img/wallpaper/static/凌波丽01/Aya-01.png" },
      { "title": "东京夜景", "preview": "/img/wallpaper/static/东京夜景/tokyo-night-pre.webp", "url": "/img/wallpaper/static/东京夜景/tokyo-night.jpg" },
      { "title": "助手01", "preview": "/img/wallpaper/static/助手01/kurisu-01-pre.webp", "url": "/img/wallpaper/static/助手01/kurisu-01.jpg" },
      { "title": "尼尔01", "preview": "/img/wallpaper/static/尼尔01/NieR-01-pre.webp", "url": "/img/wallpaper/static/尼尔01/NieR-01.jpg" },





    ],
    picMobile: [
      { "title": "散华01", "preview": "/img/wallpaper/static-mobile/散华01/Sanhua-01-pre.webp", "url": "/img/wallpaper/static-mobile/散华01/Sanhua-01.jpg" },
      { "title": "菲比01", "preview": "/img/wallpaper/static-mobile/菲比01/Feibi-01-pre.webp", "url": "/img/wallpaper/static-mobile/菲比01/Feibi-01.jpg" },
      { "title": "鸣潮01", "preview": "/img/wallpaper/static-mobile/鸣潮01/WA-01-pre.webp", "url": "/img/wallpaper/static-mobile/鸣潮01/WA-01.jpg" },
      { "title": "星见雅01", "preview": "/img/wallpaper/static-mobile/星见雅01/miyabi-01-pre.webp", "url": "/img/wallpaper/static-mobile/星见雅01/miyabi-01.jpg" },
      { "title": "秋叶原01", "preview": "/img/wallpaper/static-mobile/秋叶原/Akiba-01-pre.webp", "url": "/img/wallpaper/static-mobile/秋叶原/Akiba-01.jpg" },

    ],
    video: [
      {
        "title": "星见雅01",
        "preview": "/img/wallpaper/dynamic/星见雅01/hoshimi-01-pre.mp4",
        "url": "/img/wallpaper/dynamic/星见雅01/hoshimi-01.mp4"
      },
      {
        "title": "流光萤火",
        "preview": "/img/wallpaper/dynamic/流光萤火/firefly-pre.mp4",
        "url": "/img/wallpaper/dynamic/流光萤火/firefly.mp4"
      },
      {
        "title": "芙宁娜01",
        "preview": "/img/wallpaper/dynamic/芙宁娜01/Furina-01-pre.mp4",
        "url": "/img/wallpaper/dynamic/芙宁娜01/Furina-01.mp4"
      },
    ],
    videoMobile: [

    ],
  },

  // 闹钟配置
  alarm: {
    // 音乐文件夹路径 - 放在public/audio/文件夹中
    musicFolderPath: 'public/audio/',
    // 用户自定义音乐文件 - 请根据实际放置的文件添加
    userMusicFiles: [
      { name: '🎵 漂泊的终点(守岸人主题钢琴曲)', path: '/audio/漂泊的终点(守岸人主题钢琴曲)-1.3鸣潮OST★★.mp3' },
      // 继续添加您的音乐文件，例如：
      // { name: '🎵 您的音乐文件名', path: '/audio/您的音乐文件.mp3' },
    ],
    // 说明：请将您的音频文件（mp3, wav, ogg格式）放入public/audio/文件夹中
    // 然后在上面的 userMusicFiles 数组中添加对应的配置
  },

  //项目卡片 其中 字段"show"控制初始卡片的text是否展开
  projectcards: [
    { go: "ジャンプ!", img: "/img/astro.png", title: "My blog", subtitle: "私のブログ", text: "If you see this line, I've managed to get your attention.", url: "https://www.bamboo2.click/", show: false },
    { go: "ジャンプ!", img: "/img/nightcity.jpg", title: "Project 2", subtitle: "2,000 miles of drifting shadows", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false },
    { go: "ジャンプ!", img: "/img/nightcity.jpg", title: "Project 3", subtitle: "3,000 miles of forgotten dreams", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false },
    { go: "ジャンプ!", img: "/img/nightcity.jpg", title: "Project 4", subtitle: "4,000 miles of fading light", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false },

  ],

  statement: ["备案号：XXICP备123456789号", "Copyright © 2025 bamboo1.1"],
}

export default config
