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
        "title": "流光萤火",
        "preview": "/img/wallpaper/dynamic/流光萤火/firefly-pre.mp4",
        "url": "https://t.mwm.moe/pc"
        //"url": "/img/wallpaper/dynamic/流光萤火/firefly.mp4"

        //当然，也可填写网络地址或壁纸api，如随机PC壁纸api："url":"https://t.mwm.moe/pc"  
      },
    },
    "mobile": {   //移动端
      "type": "pic",
      "datainfo": {
        "title": "0001",
        "preview": "/img/wallpaper/static-mobile/0001/image-pre.webp",
        "url": "https://imgapi.lie.moe/random?sort=top"  //同理，随机移动端壁纸："url":"https://t.mwm.moe/mp" "https://imgapi.lie.moe/random?sort=top"
      }
    }

  },

  //雷达图数据
  radarChart: {
    skills: ['Vue.js', 'React', 'JavaScript', 'Node', 'Java', 'Python', 'linux', 'Html', 'MySQL', 'CSS', 'AWS'],
    skillPoints: [85, 78, 88, 90, 80, 78, 85, 65, 82, 78, 70],
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
    "生命有限，不必为遗憾停步；若非终点，请带着微笑，继续前行。",
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
      { "title": "明日香01", "preview": "/img/wallpaper/static/明日香01/asuka-01-pre.webp", "url": "/img/wallpaper/static/明日香01/asuka-01.jpg" },
      { "title": "露西01", "preview": "/img/wallpaper/static/露西01/Lucy-01-pre.webp", "url": "/img/wallpaper/static/露西01/Lucy-01.jpg" },
      { "title": "腐草为萤", "preview": "/img/wallpaper/static/腐草为萤/image-pre.webp", "url": "/img/wallpaper/static/腐草为萤/image.png" },
      { "title": "腐草为萤", "preview": "/img/wallpaper/static/腐草为萤/image2-pre.webp", "url": "/img/wallpaper/static/腐草为萤/image2.jpeg" },
      { "title": "むりなことはむり", "preview": "/img/wallpaper/static/むりなことはむり/107876734_p0-pre.webp", "url": "/img/wallpaper/static/むりなことはむり/107876734_p0.png" },
      { "title": "守岸人01", "preview": "/img/wallpaper/static/守岸人01/shorekeeper-01-pre.webp", "url": "/img/wallpaper/static/守岸人01/shorekeeper-01.webp" },
      { "title": "今汐01", "preview": "/img/wallpaper/static/今汐01/jinxi-01-pre.webp", "url": "/img/wallpaper/static/今汐01/jinxi-01.webp" },

      // { "title": "jswcMaMj", "preview": "https://file.uhsea.com/2503/76a4f03e8654d6e66bbbc7e8149c2fe33M.png", "url": "https://file.uhsea.com/2503/5b8a20a5f2b269659911c9485d0d0c3f0F.png" },



    ],
    picMobile: [
      { "title": "0001", "preview": "/img/wallpaper/static-mobile/0001/image-pre.webp", "url": "/img/wallpaper/static-mobile/0001/image.png" },

    ],
    video: [
      {
        "title": "星见雅01",
        "preview": "/img/wallpaper/dynamic/星见雅01/hoshimi-01-pre.mp4",
        "url": "/img/wallpaper/dynamic/星见雅01/hoshimi-01.mp4"
      },
      {
        "title": "卡提西娅01",
        "preview": "/img/wallpaper/dynamic/卡提西娅01/Cartethyia-01-pre.mp4",
        "url": "/img/wallpaper/dynamic/卡提西娅01/Cartethyia-01.mp4"
      },
      {
        "title": "碎光4K",
        "preview": "/img/wallpaper/dynamic/碎光4K/suiguang-pre.mp4",
        "url": "/img/wallpaper/dynamic/碎光4K/suiguang.mp4"
      },
      {
        "title": "流光萤火",
        "preview": "/img/wallpaper/dynamic/流光萤火/firefly-pre.mp4",
        "url": "/img/wallpaper/dynamic/流光萤火/firefly.mp4"
      },
      {
        "title": "女神异闻录3",
        "preview": "/img/wallpaper/dynamic/P3R/p3r-pre.mp4",
        "url": "/img/wallpaper/dynamic/P3R/p3r.mp4"
      },
      {
        "title": "赛琳娜：夏光",
        "preview": "/img/wallpaper/dynamic/赛琳娜：夏光/Selena-summer-pre.mp4",
        "url": "/img/wallpaper/dynamic/赛琳娜：夏光/Selena-summer.mp4"
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
    { go: "ジャンプ!", img: "/img/nightcity.jpg", title: "Project 1", subtitle: "1,000 miles of quiet longing", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false },
    { go: "ジャンプ!", img: "/img/nightcity.jpg", title: "Project 2", subtitle: "2,000 miles of drifting shadows", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false },
    { go: "ジャンプ!", img: "/img/nightcity.jpg", title: "Project 3", subtitle: "3,000 miles of forgotten dreams", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false },
    { go: "ジャンプ!", img: "/img/nightcity.jpg", title: "Project 4", subtitle: "4,000 miles of fading light", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false },

  ],

  statement: ["备案号：XXICP备123456789号", "Copyright © 2025 bamboo1.1"],
}

export default config
