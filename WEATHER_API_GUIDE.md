# 天气 / 天気 API キー設定ガイド

本项目的天气组件 `WeatherChart.vue` 支持通过【config.js】或【环境变量】灵活配置 OpenWeatherMap API Key。下述为最新优先级、配置方式与常见问题说明。

## 🔑 优先级 / 優先順位
1. `src/config.js` 内的 `weather.apiKey`（最高优先）
2. 环境变量：`VITE_WEATHER_API_KEY`
3. 运行时全局对象：`window.__APP_CONFIG__.weather.apiKey`（可选扩展）
4. 皆未设置 → 使用内置 Mock 数据并提示警告

## 🗂 配置入口
### 1) config.js（最高优先）
`src/config.js` 中：
```js
weather: {
  apiKey: '你的Key',
  defaultCity: 'Tokyo'
}
```
> 若与其它方式同时存在，将以此处 `apiKey` 为准。

### 2) 环境变量（推荐用于部署隔离不同环境）
在项目根目录创建 `.env.local`（不提交到版本库）：
```
VITE_WEATHER_API_KEY=你的真实APIKey
```
或在构建命令前导出：
```
# Linux / macOS
VITE_WEATHER_API_KEY=xxxx npm run build
# Windows PowerShell
$env:VITE_WEATHER_API_KEY="xxxx"; npm run dev
```
> 仍会被 `config.weather.apiKey` 覆盖。

### 3) 运行时注入（可选扩展）
如果希望在 HTML 动态注入（如后端模板）：
```html
<script>
  window.__APP_CONFIG__ = {
    weather: { apiKey: '注入的Key', defaultCity: 'Osaka' }
  }
</script>
```
> 被上述 1、2 覆盖。

## 📌 组件内部使用逻辑（当前实现）
`WeatherChart.vue` 片段：
```js
// 优先级: config.weather.apiKey -> import.meta.env.VITE_WEATHER_API_KEY -> window.__APP_CONFIG__
const API_KEY = (config?.weather?.apiKey || import.meta.env.VITE_WEATHER_API_KEY || (window?.__APP_CONFIG__?.weather?.apiKey) || '').trim()
const DEFAULT_CITY = (window?.__APP_CONFIG__?.weather?.defaultCity) || config?.weather?.defaultCity || 'Tokyo'

if (!API_KEY) {
  console.warn('[WeatherChart] APIキー未設定: モックデータにフォールバック')
}
```
请求前若未配置会：
- 显示提示：`⚠️ APIキーが未設定...`
- 自动调用 `loadMockData()`

## 🧪 验证方式
1. 正确填写 `config.weather.apiKey` → 浏览器控制台无警告，显示实时天气
2. 删除/清空 `config.weather.apiKey` 且设定环境变量 → 使用环境变量值
3. 两者都空，仅有 window 注入 → 使用注入值
4. 全为空 → 进入 mock 模式（温度 20~28°C 随机）

## ❓ 常见问题 / FAQ
| 问题 | 可能原因 | 解决 |
|------|----------|------|
| 一直显示 22°C / 随机温度 | 处于 Mock 模式 | 设置有效 Key 并刷新 |
| 返回 401 | Key 未激活或写错 | 控制台查看请求 URL，登录 OpenWeatherMap 检查状态 |
| 语言不是日文 | 未带 `lang=ja` | 组件已内置，如被改动需恢复 |
| 想隐藏 Key | 前端无法绝对隐藏 | 使用后端代理中转 |

## 🔐 Key 安全提示
- 前端打包代码中的 Key 可被查看；敏感场景需后端代理
- 避免将真实 Key 提交公共仓库
- 可使用不同环境不同 Key 进行速率隔离

## 🚀 生产建议
| 项 | 建议 |
|----|------|
| Key 管理 | 本地开发可写 config.js，生产走环境变量或部署平台 Secret |
| 失效处理 | 401 时 UI 给出重新配置指引（已内置日文提示） |
| 日志 | 可集成 Sentry 记录请求失败与 401 频次 |
| 限流保护 | 若遭滥用，切换代理通道 | 

## 🌏 多环境示例
| 环境 | 文件 | 示例 |
|------|------|------|
| 开发 | `src/config.js` | `apiKey: 'dev_xxx'` |
| 预发布 | `.env.staging` | `VITE_WEATHER_API_KEY=stg_xxx` |
| 生产 | 部署平台变量 | `VITE_WEATHER_API_KEY=prod_xxx` |

## 🧩 可拓展点
- 支持多城市下拉
- 单位切换（°C/°F）
- 缓存最近成功数据 + timestamp
- 指数退避重试 / 请求超时包装
- UI 内“测试连接”按钮

---
需要继续优化请继续提出 👍
