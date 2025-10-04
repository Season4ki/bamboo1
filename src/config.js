const config = {
  //网页元数据
  metaData: {
    title: 'bamboo1.1 homepage',
    description: 'ようこそ、私のソウルソサエティへ',
    keywords: 'bamboo1,no.1,个人主页,个人网站',
    icon: '/favicon.ico'   //网页图标，支持外链
  },

  // 新增: 天气相关配置
  weather: {
    apiKey: 'ff252793e358bd233013c2a09149b34d', // 输入你的 OpenWeatherMap API Key
    defaultCity: 'Tokyo'
  },

  avatar: "/img/avatar.jpg", // 头像
  welcometitle: "Hi,I'm bamboo.1. Welcome to my Soul Society.", // 标题

  // 颜色配置
  color: {
    themecolor: "#FFFFFF", // 主题颜色，推荐趋于亮白可带有轻微色调，例： #D1FFEC
    welcometitlecolor: "#FFFFFF", // 标题颜色 例： #7BFFC9
  },

  brightness: 85, // 背景亮度 --%
  blur: 5, // 毛玻璃模糊效果



  // 默认背景壁纸
  background: {
    "pc": {   //pc端
      "type": "video",   //"pic":静态壁纸;"video":动态壁纸
      "datainfo": {
        "title": "流光萤火",
        "preview": "/img/wallpaper/dynamic/流光萤火/firefly-pre.mp4",
        "url": "/img/wallpaper/dynamic/流光萤火/firefly.mp4"    //当然，也可填写网络地址或壁纸api，如随机PC壁纸api："url":"https://t.mwm.moe/pc"
      },
    },
    "mobile": {   //移动端
      "type": "pic",
      "datainfo": {
        "title": "0001",
        "preview": "/img/wallpaper/static-mobile/0001/image-pre.webp",
        "url": "/img/wallpaper/static-mobile/0001/image.png"  //同理，随机移动端壁纸："url":"https://t.mwm.moe/mp"
      }
    }

  },

  //极坐标图数据
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
      { "title": "蕾赛01", "preview": "/img/wallpaper/static/蕾赛01/Reze-01-pre.webp", "url": "/img/wallpaper/static/蕾赛01/Reze-01.jpg" },
      { "title": "守岸人01", "preview": "/img/wallpaper/static/守岸人01/shorekeeper-01-pre.webp", "url": "/img/wallpaper/static/守岸人01/shorekeeper-01.webp" },
      { "title": "今汐01", "preview": "/img/wallpaper/static/今汐01/jinxi-01-pre.webp", "url": "/img/wallpaper/static/今汐01/jinxi-01.webp" },

      // { "title": "jswcMaMj", "preview": "https://file.uhsea.com/2503/76a4f03e8654d6e66bbbc7e8149c2fe33M.png", "url": "https://file.uhsea.com/2503/5b8a20a5f2b269659911c9485d0d0c3f0F.png" },



    ],
    picMobile: [
      { "title": "0001", "preview": "/img/wallpaper/static-mobile/0001/image-pre.webp", "url": "/img/wallpaper/static-mobile/0001/image.png" },
      // { "title": "0002", "preview": "/img/wallpaper/static-mobile/0002/image-pre.webp", "url": "/img/wallpaper/static-mobile/0002/image.png" },
      // { "title": "0003", "preview": "/img/wallpaper/static-mobile/0003/image-pre.webp", "url": "/img/wallpaper/static-mobile/0003/image.png" },
      // { "title": "0004", "preview": "/img/wallpaper/static-mobile/0004/image-pre.webp", "url": "/img/wallpaper/static-mobile/0004/image.png" },
      // { "title": "DfNHPPcc", "preview": "https://file.uhsea.com/2503/e3510f4d0286e37b828f74494230f0efM2.png", "url": "https://file.uhsea.com/2503/97b50adb3d4cd6f1a4132f6d3e8c98483T.png" },
      // { "title": "WIOlrGSy", "preview": "https://file.uhsea.com/2503/99162abfe07e18cfe6182ca3458561ef3A.png", "url": "https://file.uhsea.com/2503/609532b992163117db9b341dde87b78f3C.png" },
      // { "title": "cZZwzhis", "preview": "https://file.uhsea.com/2503/cf558fa1989c07726778c60be47b9928K8.png", "url": "https://file.uhsea.com/2503/e27b91f1604f73d0444c807024ef7c9fI3.png" },
      // { "title": "aANKZHPX", "preview": "https://file.uhsea.com/2503/0aa1cb875c8c7c20afd1aa72530294350K.png", "url": "https://file.uhsea.com/2503/b09b65e20e176cb0d22dbc319981b5b45L.png" },
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
      // {
      //   "title": "幻觉镇-gaako_illust",
      //   "preview": "/img/wallpaper/dynamic-mobile/幻觉镇-gaako_illust/Hallucination_town-pre.mp4",
      //   "url": "/img/wallpaper/dynamic-mobile/幻觉镇-gaako_illust/Hallucination_town.mp4"
      // },
      // {
      //   "title": "chuva",
      //   "preview": "/img/wallpaper/dynamic-mobile/chuva/chuva-pre.mp4",
      //   "url": "/img/wallpaper/dynamic-mobile/chuva/chuva.mp4"
      // },
      // {
      //   "title": "Doodle-小猫女仆降临",
      //   "preview": "/img/wallpaper/dynamic-mobile/Doodle-小猫女仆降临/d12-pre.mp4",
      //   "url": "/img/wallpaper/dynamic-mobile/Doodle-小猫女仆降临/d12.mp4"
      // },
    ],
  },

  //项目卡片 其中 字段"show"控制初始卡片的text是否展开
  projectcards: [
    { go: "\u3000ジャンプ!", img: "/img/nightcity.jpg", title: "Project 1", subtitle: "1,000 miles of quiet longing", text: "If you see this line, I've managed to get your attention.", url: "https://www.ccmc.ac.jp/", show: false },
    { go: "\u3000ジャンプ!", img: "/img/nightcity.jpg", title: "Project 2", subtitle: "2,000 miles of drifting shadows", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false },
    { go: "\u3000ジャンプ!", img: "/img/nightcity.jpg", title: "Project 3", subtitle: "3,000 miles of forgotten dreams", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false },
    { go: "\u3000ジャンプ!", img: "/img/nightcity.jpg", title: "Project 4", subtitle: "4,000 miles of fading light", text: "If you see this line, I've managed to get your attention.", url: "https://www.baidu.com", show: false }
  ],

  statement: ["备案号：XXICP备123456789号", "Copyright © 2025 bamboo1.1"],
}

export default config
