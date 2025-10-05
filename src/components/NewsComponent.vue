<template>
  <v-container fluid class="news-container pa-0">
    <v-card class="news-main-card" elevation="0" color="transparent">
      <!-- 新闻头部 -->
      <v-card-title class="news-header d-flex align-center pa-6">
        <v-avatar color="rgba(255, 255, 255, 0.15)" class="mr-4 news-avatar">
          <v-icon color="white" size="28">mdi-newspaper</v-icon>
        </v-avatar>

        <div class="flex-grow-1">
          <h2 class="text-h5 font-weight-bold text-white mb-1 news-main-title">
            Latest News
          </h2>
          <p class="text-subtitle-1 text-grey-lighten-2 mb-0 news-subtitle">
            最新科技資訊 • Latest Technology News
          </p>
        </div>

        <v-btn icon variant="text" color="white" size="large" @click="fetchNews" :loading="loading"
          class="news-refresh-btn">
          <v-icon>mdi-refresh</v-icon>
          <v-tooltip activator="parent" location="bottom">
            ニュースを更新
          </v-tooltip>
        </v-btn>
      </v-card-title>

      <!-- 新闻内容区域 -->
      <v-card-text class="pa-6">
        <!-- 加载状态 -->
        <v-row v-if="loading" justify="center" class="my-12">
          <v-col cols="auto">
            <div class="text-center">
              <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
              <p class="text-h6 mt-4 text-white">ニュースを読み込み中...</p>
              <p class="text-body-2 text-grey-lighten-1">Loading latest news...</p>
            </div>
          </v-col>
        </v-row>

        <!-- 错误状态 -->
        <v-row v-else-if="error" justify="center" class="my-12">
          <v-col cols="12" md="6">
            <v-alert type="error" variant="tonal" class="mb-4 transparent-alert">
              <v-icon slot="prepend" size="48">mdi-alert-circle</v-icon>
              <div>
                <p class="text-h6 mb-2">{{ error }}</p>
                <v-btn color="error" variant="elevated" @click="fetchNews" prepend-icon="mdi-refresh">
                  再試行
                </v-btn>
              </div>
            </v-alert>
          </v-col>
        </v-row>

        <!-- 新闻列表 -->
        <div v-else>
          <v-row>
            <v-col v-for="(item, index) in newsItems" :key="index" cols="12" md="6" lg="4" class="mb-4">
              <v-card class="news-item-card h-100" elevation="0" hover @click="openNews(item.link)">
                <!-- 新闻图片 -->
                <v-img v-if="item.image_url" :src="item.image_url" height="200" cover class="news-item-image">
                  <div class="news-overlay d-flex align-end">
                    <v-chip color="primary" variant="elevated" size="small" class="ma-3">
                      <v-icon start>mdi-clock-outline</v-icon>
                      {{ formatDate(item.pubDate) }}
                    </v-chip>
                  </div>
                </v-img>

                <!-- 无图片时的占位 -->
                <v-sheet v-else height="200" color="grey-lighten-4"
                  class="d-flex align-center justify-center news-placeholder">
                  <v-icon size="64" color="grey-lighten-1">mdi-newspaper-variant</v-icon>
                </v-sheet>

                <!-- 新闻内容 -->
                <v-card-text class="pa-4">
                  <v-chip :color="getSourceColor(item.source_id)" variant="tonal" size="small" class="mb-3">
                    <v-icon start size="16">mdi-web</v-icon>
                    {{ item.source_id }}
                  </v-chip>

                  <h3 class="text-h6 font-weight-bold news-title mb-3">
                    {{ item.title }}
                  </h3>

                  <p class="text-body-2 news-description text-grey-darken-1">
                    {{ truncateText(item.description, 120) }}
                  </p>
                </v-card-text>

                <!-- 新闻操作 -->
                <v-card-actions class="px-4 pb-4">
                  <v-spacer></v-spacer>
                  <v-btn color="primary" variant="tonal" size="small" append-icon="mdi-open-in-new">
                    Read More
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import config from '../config.js'

const newsItems = ref([])
const loading = ref(false)
const error = ref(null)

let configdata = config
if (import.meta.env.VITE_CONFIG) {
  configdata = JSON.parse(import.meta.env.VITE_CONFIG)
}

const fetchNews = async () => {
  loading.value = true
  error.value = null

  try {
    // 检查是否有配置的API Key
    const apiKey = configdata.news?.apiKey || import.meta.env.VITE_NEWS_API_KEY
    const baseLanguage = configdata.news?.language || 'ja,en'
    const category = configdata.news?.category || 'technology,science'
    const size = configdata.news?.size || 10

    console.log('🔍 NewsComponent 智能语言获取启动:')
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'Not provided')
    console.log('期望语言:', baseLanguage)
    console.log('分类:', category)
    console.log('数量:', size)

    if (!apiKey) {
      console.warn('[NewsComponent] NewsData.io APIキーが未設定です。モックデータを使用します。')
      newsItems.value = getMockNews()
      return
    }

    // 智能语言降级策略
    const languageStrategies = [
      { language: 'ja', description: '纯日语', priority: 1 },
      { language: 'ja,en', description: '日语+英语混合', priority: 2 },
      { language: 'en', description: '英语备选', priority: 3 }
    ]

    // 如果用户配置了特定语言，优先使用
    if (baseLanguage !== 'ja,en') {
      languageStrategies.unshift({
        language: baseLanguage,
        description: '用户配置语言',
        priority: 0
      })
    }

    let finalResult = null
    let usedStrategy = null

    // 尝试不同的语言策略
    for (const strategy of languageStrategies) {
      console.log(`\n🌐 尝试策略: ${strategy.description} (${strategy.language})`)

      try {
        const testUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=${strategy.language}&category=${category}&size=${size}`
        console.log(`📡 请求URL: ${testUrl}`)

        const startTime = Date.now()
        const response = await fetch(testUrl)
        const endTime = Date.now()

        console.log(`📊 响应状态: ${response.status} ${response.statusText}`)
        console.log(`⏱️ 响应时间: ${endTime - startTime}ms`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ ${strategy.description} API错误:`, errorText)
          continue // 尝试下一个策略
        }

        const data = await response.json()
        console.log(`📈 API状态: ${data.status}`)
        console.log(`📰 新闻数量: ${data.results ? data.results.length : 0}`)

        if (data.status === 'success' && data.results && data.results.length > 0) {
          // 分析语言分布
          const languageCount = {}
          data.results.forEach(item => {
            const lang = item.language || 'unknown'
            languageCount[lang] = (languageCount[lang] || 0) + 1
          })
          console.log(`🌐 语言分布: ${JSON.stringify(languageCount)}`)

          // 如果是日语优先策略，检查是否真的获取到了日语新闻
          if (strategy.language.includes('ja')) {
            const japaneseCount = languageCount.ja || 0
            const englishCount = languageCount.en || 0

            console.log(`🇯🇵 日语新闻: ${japaneseCount} 条`)
            console.log(`🇺🇸 英语新闻: ${englishCount} 条`)

            // 如果期望日语但只获取到英语，可能需要尝试其他分类
            if (strategy.language.startsWith('ja') && japaneseCount === 0 && englishCount > 0) {
              console.log(`⚠️ ${strategy.description}获取到英语新闻但无日语新闻`)

              // 尝试更通用的分类
              if (category !== 'top') {
                console.log(`🔄 尝试使用"top"分类获取日语新闻...`)
                const fallbackUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=ja&category=top&size=${size}`

                try {
                  const fallbackResponse = await fetch(fallbackUrl)
                  if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json()
                    if (fallbackData.status === 'success' && fallbackData.results && fallbackData.results.length > 0) {
                      const jaCount = fallbackData.results.filter(item => item.language === 'ja').length
                      if (jaCount > 0) {
                        console.log(`✅ "top"分类找到 ${jaCount} 条日语新闻！`)
                        finalResult = fallbackData
                        usedStrategy = { ...strategy, description: `${strategy.description} (top分类)` }
                        break
                      }
                    }
                  }
                } catch (fallbackError) {
                  console.log(`❌ top分类尝试失败:`, fallbackError.message)
                }
              }
            }
          }

          // 如果没有找到更好的结果，使用当前结果
          if (!finalResult) {
            finalResult = data
            usedStrategy = strategy

            // 显示样例新闻标题
            console.log('📄 样例新闻:')
            data.results.slice(0, 3).forEach((item, index) => {
              console.log(`  ${index + 1}. ${item.title} (${item.language || 'unknown'})`)
            })

            break // 成功获取，退出循环
          }
        } else {
          console.log(`⚠️ ${strategy.description} 未获取到新闻数据`)
        }

      } catch (requestError) {
        console.error(`❌ ${strategy.description} 请求异常:`, requestError.message)
        continue // 尝试下一个策略
      }
    }

    // 处理最终结果
    if (finalResult && finalResult.results) {
      newsItems.value = finalResult.results
      console.log(`✅ 新闻获取成功！使用策略: ${usedStrategy.description}`)
      console.log(`📊 最终获取 ${finalResult.results.length} 条新闻`)

      // 成功获取后分析语言分布
      const finalLanguageCount = {}
      finalResult.results.forEach(item => {
        const lang = item.language || 'unknown'
        finalLanguageCount[lang] = (finalLanguageCount[lang] || 0) + 1
      })
      console.log(`🏆 最终语言分布: ${JSON.stringify(finalLanguageCount)}`)

    } else {
      throw new Error('所有语言策略都失败了')
    }

  } catch (err) {
    console.error('❌ 新闻获取完全失败:', err)
    error.value = `ニュースの取得に失敗しました: ${err.message}`
    console.log('🔄 使用模拟数据作为备选...')
    newsItems.value = getMockNews()
  } finally {
    loading.value = false
  }
}

const getMockNews = () => {
  return [
    {
      title: "AI技術の最新進展について",
      description: "人工知能技術の最新動向と今後の展望について専門家が語る。機械学習の進歩により、様々な分野での応用が期待されている。",
      source_id: "Tech News JP",
      pubDate: new Date().toISOString(),
      link: "#",
      image_url: "https://via.placeholder.com/300x200/1976d2/ffffff?text=AI+News"
    },
    {
      title: "量子コンピューターの商用化が進む",
      description: "量子コンピューター技術の実用化が着実に進んでおり、企業での導入事例が増加している。",
      source_id: "Science Today",
      pubDate: new Date(Date.now() - 3600000).toISOString(),
      link: "#",
      image_url: "https://via.placeholder.com/300x200/388e3c/ffffff?text=Quantum"
    },
    {
      title: "宇宙探査の新たな発見",
      description: "最新の宇宙望遠鏡による観測で、新しい系外惑星が発見された。地球に似た環境を持つ可能性がある。",
      source_id: "Space Explorer",
      pubDate: new Date(Date.now() - 7200000).toISOString(),
      link: "#",
      image_url: "https://via.placeholder.com/300x200/7b1fa2/ffffff?text=Space"
    },
    {
      title: "持続可能エネルギーの技術革新",
      description: "太陽光発電と風力発電の効率が大幅に向上し、再生可能エネルギーの普及が加速している。",
      source_id: "Green Tech",
      pubDate: new Date(Date.now() - 10800000).toISOString(),
      link: "#",
      image_url: "https://via.placeholder.com/300x200/2e7d32/ffffff?text=Green+Energy"
    },
    {
      title: "バイオテクノロジーの医療応用",
      description: "遺伝子治療技術の進歩により、これまで治療困難だった疾患への新しいアプローチが可能になった。",
      source_id: "Medical Science",
      pubDate: new Date(Date.now() - 14400000).toISOString(),
      link: "#",
      image_url: "https://via.placeholder.com/300x200/d32f2f/ffffff?text=BioTech"
    }
  ]
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    return '今'
  } else if (diffHours < 24) {
    return `${diffHours}時間前`
  } else if (diffDays < 7) {
    return `${diffDays}日前`
  } else {
    return date.toLocaleDateString('ja-JP')
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getSourceColor = (source) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  const hash = source.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

const openNews = (url) => {
  if (url && url !== '#') {
    window.open(url, '_blank')
  }
}

onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
.news-container {
  width: 100%;
  max-width: 1400px;
  /* 增大最大宽度 */
  margin: 0 auto;
  padding: 0;
}

.news-main-card {
  background: rgba(255, 255, 255, 0.05) !important;
  /* 整体透明背景 */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  min-height: 600px;
  /* 增大最小高度 */
}

.news-header {
  background: rgba(255, 255, 255, 0.02) !important;
  /* 几乎完全透明 */
  color: white;
  border-radius: 24px 24px 0 0;
  padding: 24px !important;
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.news-refresh-btn {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.news-refresh-btn:hover {
  transform: rotate(180deg);
  background: rgba(255, 255, 255, 0.15);
}

.news-avatar {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.news-main-title {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.news-subtitle {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  font-weight: 500;
}

.news-item-card {
  background: rgba(255, 255, 255, 0.08) !important;
  /* 新闻卡片透明 */
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
}

.news-item-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.2);
}

.news-item-image {
  border-radius: 16px 16px 0 0;
  transition: all 0.3s ease;
}

.news-item-card:hover .news-item-image {
  transform: scale(1.05);
}

.news-overlay {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  height: 100%;
}

.news-placeholder {
  border-radius: 16px 16px 0 0;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.news-title {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.news-item-card:hover .news-title {
  color: white;
}

.news-description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.transparent-alert {
  background: rgba(244, 67, 54, 0.1) !important;
  border: 1px solid rgba(244, 67, 54, 0.3);
  backdrop-filter: blur(10px);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 960px) {
  .news-container {
    max-width: 100%;
    padding: 0 8px;
  }

  .news-main-card {
    border-radius: 16px;
    min-height: 500px;
  }

  .news-header {
    padding: 16px !important;
    border-radius: 16px 16px 0 0;
  }

  .news-header h2 {
    font-size: 1.25rem;
  }

  .news-item-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
}

@media (max-width: 600px) {
  .news-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .news-header .v-avatar {
    margin-right: 0;
    margin-bottom: 8px;
  }
}

/* 动画效果 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.news-item-card {
  animation: slideInUp 0.6s ease-out;
}

.news-item-card:nth-child(2) {
  animation-delay: 0.1s;
}

.news-item-card:nth-child(3) {
  animation-delay: 0.2s;
}

.news-item-card:nth-child(4) {
  animation-delay: 0.3s;
}

.news-item-card:nth-child(5) {
  animation-delay: 0.4s;
}

.news-item-card:nth-child(6) {
  animation-delay: 0.5s;
}

/* Vuetify组件自定义 */
.v-chip {
  backdrop-filter: blur(10px);
}

.v-btn {
  backdrop-filter: blur(10px);
}

.v-progress-circular {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}
</style>
