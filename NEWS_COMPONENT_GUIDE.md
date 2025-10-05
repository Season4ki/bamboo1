# NewsData.io API 新闻组件指南

## 概要
本项目集成了基于 NewsData.io API 的新闻组件，用于显示最新的科技和科学新闻。

## 功能特点
- 🌐 支持多语言新闻（英语、日语）
- 📱 响应式设计，适配各种屏幕尺寸
- 🔄 支持手动刷新新闻
- 🎨 美观的卡片式布局
- 📰 虚拟滚动优化性能
- 🚀 API 失败时自动回退到模拟数据

## API 配置

### 1. 获取 API Key
1. 访问 [NewsData.io](https://newsdata.io/)
2. 注册账户
3. 获取免费的 API Key（每天200次请求）

### 2. 配置方式

#### 方法一：在 config.js 中配置
```javascript
// 新闻相关配置
news: {
  apiKey: 'YOUR_API_KEY_HERE', // 替换为你的API Key
  language: 'en,ja', // 新闻语言
  category: 'technology,science', // 新闻分类
  size: 10 // 获取新闻数量
}
```

#### 方法二：使用环境变量
在项目根目录创建 `.env` 文件：
```bash
VITE_NEWS_API_KEY=your_api_key_here
```

## 组件使用

### 在 homeseting.vue 中的集成
```vue
<template>
  <!-- 新闻按钮 -->
  <v-chip 
    class="mt-3 ml-3" 
    prepend-icon="mdi-newspaper" 
    size="large"
    @click="showNewsCards = !showNewsCards">
    ニュース
  </v-chip>
  
  <!-- 新闻组件容器 -->
  <v-container v-show="showNewsCards" class="mt-4">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <NewsComponent />
      </v-col>
    </v-row>
  </v-container>
</template>
```

## 自定义配置

### 新闻分类
可用的新闻分类：
- `business` - 商业
- `entertainment` - 娱乐
- `environment` - 环境
- `food` - 食品
- `health` - 健康
- `politics` - 政治
- `science` - 科学
- `sports` - 体育
- `technology` - 科技
- `top` - 头条
- `world` - 世界

### 支持的语言
- `en` - 英语
- `ja` - 日语
- `zh` - 中文
- `fr` - 法语
- `de` - 德语
- 等更多语言...

### 配置示例
```javascript
news: {
  apiKey: 'your_api_key',
  language: 'ja,en', // 优先日语，备选英语
  category: 'technology,science,health', // 多个分类
  size: 15 // 每次获取15条新闻
}
```

## 模拟数据
当 API Key 未配置或 API 请求失败时，组件会自动使用模拟数据，包含：
- AI技術の最新進展について
- 量子コンピューターの商用化が進む
- 宇宙探査の新たな発見
- 持続可能エネルギーの技術革新
- バイオテクノロジーの医療応用

## 样式自定义

### 主要CSS类
- `.news-container` - 新闻容器
- `.news-card` - 新闻卡片
- `.news-header` - 新闻头部
- `.news-item` - 单个新闻项
- `.news-title` - 新闻标题
- `.news-description` - 新闻描述

### 响应式设计
- 桌面端：显示图片和完整内容
- 移动端：优化字体大小和间距
- 虚拟滚动：处理大量新闻项时的性能优化

## 故障排除

### 常见问题

1. **新闻不显示或显示模拟数据**
   - 检查 API Key 是否正确配置
   - 确认网络连接正常
   - 检查浏览器控制台是否有错误信息

2. **API 请求限制**
   - 免费版本每天限制200次请求
   - 可考虑升级到付费版本获得更多请求次数

3. **CORS 错误**
   - NewsData.io 支持跨域请求
   - 如果仍有问题，可能需要通过代理服务器请求

### 调试信息
组件会在浏览器控制台输出调试信息：
- API Key 未配置警告
- API 请求错误详情
- 回退到模拟数据的提示

## 安全建议
- 不要在前端代码中硬编码 API Key
- 优先使用环境变量配置
- 定期轮换 API Key
- 监控 API 使用量，避免超出限制

## 扩展建议
- 可以添加新闻搜索功能
- 集成用户偏好设置
- 添加新闻收藏功能
- 实现新闻分享功能
