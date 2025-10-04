# bamboo1（中文说明）

一个个性化的交互式主页仪表盘，整合：动态背景 / 天气数据可视化 / 音乐播放（含歌词同步）/ 可配置主题与视觉参数。

## 🧩 核心组件结构
| 功能 | 组件 / 文件 | 说明 |
|------|-------------|------|
| 应用外壳 / 状态编排 | `App.vue` + `app.js` | 全局时间 / 背景 / 音乐 / 天气聚合调度中心 |
| 设置侧栏 | `homeseting.vue` | 主题色 / 模糊 / 背景切换（推测） |
| 打字机效果 | `typewriter.vue` | 欢迎文案动态呈现 |
| 选项卡 | `tabs/tab2.vue` `tabs/tab3.vue` | 背景预览与音乐播放切换 |
| 雷达图 | `radarChart.vue` | 技能 / 属性可视化（推测） |
| 歌词展示 | `LyricsBox.vue` | 当前播放歌曲的实时歌词 |
| 初始加载层 | `PageLoading.vue` | 首屏遮罩与资源预加载 |
| 天气组件 | `WeatherChart.vue` | OpenWeatherMap + Chart.js + Vuetify 卡片式展示 |
| 配置 | `config.js` | 背景 / 播放器 / Meta 元信息 |
| 公共工具 | `utils/common.js` | 时间格式化 / Meta 标签注入 / 调试输出 |
| Cookie 工具 | `utils/cookieUtils.js` | 用户 UI 偏好持久化 |

## 🔑 主运行流程（`app.js`）
1. 从环境变量（可选）加载动态配置 `VITE_CONFIG`
2. 头像与项目图片预加载（并行 + 2.5 秒超时降级）
3. 注入文档 Meta（标题 / 描述 / favicon）
4. 依据设备断点（`useDisplay().xs`）决定使用移动或桌面背景（图片或视频）
5. 从 Cookie 回填主题相关 CSS 自定义属性
6. 通过 Meting API 拉取音乐 JSON 列表
7. 初始化“原生 `<audio>` + APlayer”双播放通道（互斥逻辑）
8. 启动秒级时间刷新定时器
9. 若启用 APlayer，开启歌词与播放索引同步循环

## 🎧 音乐子系统
| 维度 | 说明 |
|------|------|
| 数据源 | `https://api.i-meto.com/meting/api` （由 config/server/type/id 组合） |
| 播放模式 | 原生 `<audio>` / APlayer 切换（`useAPlayer` 标记） |
| 进度控制 | `previousTrack` / `nextTrack` / APlayer `skipForward` / `skipBack` |
| 索引同步 | 定时器 `syncTimer` 检测 APlayer 列表索引变化 |
| 歌词同步 | 500ms 轮询 APlayer `lrc.current` + DOM `.aplayer-lrc-current` |
| 冲突避免 | 某一端播放时自动暂停另一端 |

## ☁️ 天气组件（`WeatherChart.vue`）
- 默认城市：东京；支持浏览器地理定位覆盖
- API 使用 `lang=ja` 返回日文描述（界面完全日文化）
- 30 分钟自动刷新 + 手动刷新按钮
- 未来 24 小时（3 小时步长）温度/湿度双轴折线图
- 5 日聚合（今日 / 日文星期）
- API Key 失效 → 自动落入模拟数据模式
- 卡片双态：紧凑 / 展开（双击或按钮切换）

## 🎨 主题与背景体系
| 数据来源 | 机制 |
|----------|------|
| Cookie `bamboo1data` | 保存主题色、模糊值、亮度 |
| Cookie `bamboo1databackground` | 保存移动 / 桌面端背景指向 |
| CSS Variables | 动态注入根节点以便全局样式响应 |
| 视频回退策略 | 当选择视频源失败可回退静态图（可扩展） |

## 🧠 状态分类
| 分类 | 示例 |
|------|------|
| 生命周期 | `isloading` `isAppBootLoading` `isClearScreen` |
| 媒体播放 | `isPlaying` `playlistIndex` `videosrc` |
| 音乐数据 | `musicinfo` `lyrics` `currentPlayTime` |
| 交互 UI | `tabs` `projectcards` `showLyricsBox` |
| 天气数据 | 独立维护在 `WeatherChart.vue` 内部 refs |

## 🔐 持久化策略
仅 UI 视觉偏好放入 Cookie；天气与音乐数据保持实时请求避免陈旧。

| 数据 | 持久化 | 说明 |
|------|--------|------|
| 主题/亮度/模糊 | Cookie | 页面初始渲染即回填 |
| 背景配置 | Cookie | 区分移动/桌面 |
| 音乐列表 / 天气 | 内存 | 每次加载重新获取 |

## 🛡 错误与降级
| 场景 | 现状 | 建议优化 |
|------|------|---------|
| 天气 401 | 模拟数据替代 | 增加 UI Key 设置入口 |
| 定位拒绝 | 日文提示 | 提供“重新授权”指引按钮 |
| 音乐请求失败 | 控制台输出 | Toast / Banner 提示 |
| 背景加载超时 | 静默跳过 | 兜底图或纯色背景 |
| 歌词同步漂移 | 轮询 | MutationObserver + 差量策略 |

## 🔄 定时器概览
| 名称 | 周期 | 用途 |
|------|------|------|
| 时钟 | 1s | 刷新当前时间字符串 |
| 天气刷新 | 30m | 保持数据新鲜 |
| 歌词轮询 | 500ms | 抓取当前歌词行 |
| APlayer 索引同步 | 1000ms | 外部 UI 与内部列表对齐 |

## 🧪 可拓展方向
- API Key / 服务端点迁移至环境变量管理
- TypeScript 引入（更安全的播放/天气数据类型）
- SWR / Cache 层：减少频繁外部请求
- 歌词同步改为事件驱动或 MutationObserver
- Weather 支持单位切换（°C/°F）与多语言
- 离线模式（缓存最后一次成功天气结果）

## 🧾 本地化
当前以日文为主（天气组件 & 部分 UI 标签），可通过抽离字典资源实现中/日/英切换。

## 🚀 构建与运行（推测）
```bash
npm install
npm run dev
npm run build
```

## ✅ 总结
项目以 `app.js` 为核心调度器，将“背景 + 视觉主题 + 音乐 + 歌词 + 时间 + 天气”统一编排。模块拆分明确、UI 响应式良好，具备可迭代的扩展空间（缓存、国际化、稳定性强化、离线支持等）。

英文版：`README.md`  
日文版：`README_JP.md`
