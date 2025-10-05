# 新闻组件语言设置更改为日语优先

## 🎯 更改概述
将NewsComponent的默认新闻语言从英语优先改为日语优先，以符合项目的日语主题风格。

## 🔧 主要更改

### 1. API请求语言参数调整
```javascript
// 原设置
language=en,ja  // 英语优先，日语备选

// 新设置  
language=ja,en  // 日语优先，英语备选
```

### 2. 配置文件优化
在 `src/config.js` 中：
```javascript
news: {
  apiKey: 'pub_afe616564d5843a5af76c5e4af882a2c',
  language: 'ja,en', // 日语优先，英语备选
  category: 'technology,science',
  size: 10
}
```

### 3. 动态配置支持
NewsComponent现在会读取config.js中的语言设置：
```javascript
const language = configdata.news?.language || 'ja,en'
const category = configdata.news?.category || 'technology,science'
const size = configdata.news?.size || 10

const response = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&language=${language}&category=${category}&size=${size}`)
```

## 📊 语言优先级说明

### NewsData.io API语言处理机制
当指定多个语言时（如`ja,en`），API会按以下顺序返回新闻：
1. **优先返回**：日语新闻
2. **备选返回**：如果日语新闻不足，补充英语新闻
3. **混合结果**：根据可用性返回混合语言的新闻列表

### 实际效果
- ✅ **日语新闻优先**：大部分新闻将是日语
- ✅ **内容丰富**：确保有足够的新闻内容
- ✅ **智能回退**：日语新闻不足时自动补充英语新闻

## 🌐 支持的语言代码

### 主要语言
- `ja` - 日语 (Japanese)
- `en` - 英语 (English)
- `zh` - 中文 (Chinese)
- `ko` - 韩语 (Korean)

### 配置示例
```javascript
// 仅日语
language: 'ja'

// 日语优先，英语备选
language: 'ja,en'

// 多语言支持
language: 'ja,en,zh'
```

## 🎨 用户界面保持
- 界面标题仍为双语显示：`Latest News` / `最新科技資訊`
- 时间格式保持日语：`今`, `2時間前`, `3日前`
- 按钮文字保持日语：`ニュースを更新`, `再試行`

## 📱 模拟数据也更新
模拟数据(getMockNews)已经是日语内容：
- "AI技術の最新進展について"
- "量子コンピューターの商用化が進む"
- "宇宙探査の新たな発見"
- "持続可能エネルギーの技術革新"
- "バイオテクノロジーの医療応用"

## 🔧 进一步自定义

### 环境变量覆盖
可以通过环境变量覆盖默认设置：
```bash
# .env 文件
VITE_NEWS_LANGUAGE=ja
VITE_NEWS_CATEGORY=technology,science,health
VITE_NEWS_SIZE=15
```

### 动态语言切换
未来可以添加语言切换功能：
```javascript
// 可能的扩展
const switchLanguage = (lang) => {
  configdata.news.language = lang
  fetchNews()
}
```

## 📈 效果预期

### 新闻内容分布
- **日语新闻**: 约70-80%
- **英语新闻**: 约20-30%（作为补充）

### 用户体验
- 更符合日语主题的项目风格
- 为日语用户提供更好的阅读体验
- 保持内容的多样性和丰富性

这个更改确保了新闻组件默认显示日语新闻，同时保持了内容的丰富性和系统的灵活性。
