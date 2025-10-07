<template>
  <div>
    <!-- 如果是移动端模式，只显示项目卡片内容，其他内容已在App.vue中处理 -->
    <div v-if="mobileMode">
      <!-- 项目卡片或新闻组件 - 移动端版本 -->
      <div v-if="!showNewsMode" key="projects">
        <v-container fluid class="pa-2">
          <v-row justify="center" class="g-3">
            <v-col v-for="(item, key) in projectcards" :key="key" cols="6" class="d-flex align-stretch">
              <!-- 简化项目卡片 - 移动端 -->
              <div class="simple-project-card mobile-card" @click="handleCardClick(item)">
                <!-- 上方图片 -->
                <div class="card-image-container mobile-image">
                  <v-img :src="item.img" height="100" width="100" cover class="card-image rounded"></v-img>
                </div>

                <!-- 下方内容 -->
                <div class="card-content-container mobile-content">
                  <!-- 中间标题 -->
                  <div class="card-title">{{ item.title }}</div>
                  <!-- 下方副标题 -->
                  <div class="card-subtitle">{{ item.subtitle }}</div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- 新闻组件 - 移动端版本 -->
      <div v-if="showNewsMode" key="news" class="pa-2">
        <NewsComponent />
      </div>
    </div>

    <!-- 桌面端布局保持原样 -->
    <div v-else>
      <div>
        <div :style="xs || sm ? { 'display': 'none' } : { 'font-size': '4rem' }" class="welcome-title">{{
          configdata.welcometitle }}</div>
      </div>
      <div>
        <v-row align="center">
          <v-col cols="12" md="8">
            <typewriter class="ma-3 d-flex align-center justify-center"
              :style="xs || sm ? { 'min-height': '150px' } : { 'min-height': '200px' }"></typewriter>
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-center">
            <div class="time-card" @click="$emit('openAlarm')">
              <div class="time-display">{{ formattedTime }}</div>
              <div class="date-display">{{ formattedDate }}</div>
              <div class="alarm-hint">クリックしてアラーム設定</div>
            </div>
          </v-col>
        </v-row>

        <v-chip class="mt-12 ml-3 mode-toggle-chip" :prepend-icon="showNewsMode ? 'mdi-newspaper' : 'mdi-alpha-w-box'"
          size="large" style="color: #FFFFFF; border-radius: 9999px; padding-left: 16px; padding-right: 16px;"
          @click="$emit('toggleMode')">
          <transition name="fade" mode="out-in">
            <span :key="showNewsMode">{{ showNewsMode ? 'ニュース' : '項目' }}</span>
          </transition>
          <v-tooltip activator="parent" location="bottom">
            {{ showNewsMode ? 'プロジェクトに切り替え' : 'ニュースに切り替え' }}
          </v-tooltip>
        </v-chip>
        <!-- 项目卡片区域 - 简化版设计 -->
        <transition name="slide-fade" mode="out-in">
          <v-container v-if="!showNewsMode" key="projects" fluid class="pa-4 mt-12">
            <v-row justify="center" class="g-4">
              <v-col v-for="(item, key) in projectcards" :key="key" cols="12" sm="6" md="4" lg="3"
                class="d-flex align-stretch">
                <!-- 简化项目卡片 -->
                <div class="simple-project-card" @click="handleCardClick(item)">
                  <!-- 左侧图片 -->
                  <div class="card-image-container">
                    <v-img :src="item.img" height="100" width="100" cover class="card-image rounded"></v-img>
                  </div>

                  <!-- 右侧内容 -->
                  <div class="card-content-container">
                    <!-- 右上标题 -->
                    <div class="card-title">{{ item.title }}</div>
                    <!-- 右下副标题 -->
                    <div class="card-subtitle">{{ item.subtitle }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </transition>

        <!-- 新闻组件区域 -->
        <transition name="slide-fade" mode="out-in">
          <v-container v-if="showNewsMode" class="mt-12 news-container-wrapper" key="news" fluid>
            <NewsComponent />
          </v-container>
        </transition>

      </div>
    </div>
  </div>
</template>

<script>
import typewriter from '../components/typewriter.vue';
import NewsComponent from '../components/NewsComponent.vue';
import { useDisplay } from 'vuetify'
import { ref } from 'vue';

export default {
  components: {
    typewriter,
    NewsComponent,
  },
  props: ['configdata', 'formattedTime', 'formattedDate', 'projectcards', 'mobileMode', 'showNewsMode'],
  setup() {
    const { xs, sm, md } = useDisplay();
    return { xs, sm, md };
  },
  methods: {
    handleCardClick(item) {
      console.log('点击了项目卡片:', item);
      console.log('URL:', item.url);
      console.log('Title:', item.title);

      if (item.url) {
        window.open(item.url, '_blank');
      } else {
        console.error('URL 为空或未定义');
      }
    }
  }
};
</script>

<style scoped>
@import url(/css/app.css);
@import url(/css/mobile.css);

/* 按钮切换动画 */
.mode-toggle-chip {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-origin: center;
}

.mode-toggle-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mode-toggle-chip:active {
  transform: scale(0.95);
}

/* 文字淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 内容滑动淡入动画 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.slide-fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* 新闻容器样式 */
.news-container-wrapper {
  padding: 0 !important;
  max-width: 100% !important;
}

/* ======= 简洁透明时间卡片样式 ======= */

.time-card {
  background: transparent;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  min-width: 200px;
  max-width: 240px;
}

.time-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.time-display {
  font-size: 1.8rem;
  font-weight: 700;
  color: #FFFFFF;
  font-family: 'digitalfont', 'Courier New', monospace;
  margin-bottom: 12px;
  letter-spacing: 2px;
  white-space: nowrap;
  min-width: 140px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.date-display {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.5px;
  white-space: nowrap;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-family: 'digitalfont', 'Courier New', monospace;
}

/* 响应式时间卡片 */
@media (max-width: 960px) {
  .time-card {
    padding: 16px;
    max-width: 200px;
    min-width: 160px;
    margin: 0 auto;
  }

  .time-display {
    font-size: 1.5rem;
    letter-spacing: 0.5px;
    min-width: 120px;
  }

  .date-display {
    font-size: 0.8rem;
    white-space: nowrap;
  }
}

@media (max-width: 600px) {
  .time-card {
    padding: 12px;
    max-width: 180px;
    min-width: 140px;
  }

  .time-display {
    font-size: 1.3rem;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
    min-width: 100px;
  }

  .date-display {
    font-size: 0.75rem;
    white-space: nowrap;
  }
}

/* ======= 简化项目卡片样式 ======= */

.simple-project-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  min-height: 100px;
}

.simple-project-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-image-container {
  flex-shrink: 0;
}

.card-content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 80px;
  padding: 4px 0;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1.3;
  margin-bottom: auto;
}

.card-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin-top: auto;
}

/* 移动端样式调整 */
.mobile-card {
  min-height: 140px;
  gap: 12px;
  padding: 16px;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mobile-card .mobile-image {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.mobile-card .mobile-content {
  width: 100%;
  height: auto;
  padding: 0;
  align-items: center;
  text-align: center;
}

.mobile-card .card-content-container {
  height: auto;
  padding: 0;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.mobile-card .card-title {
  font-size: 1.0rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 6px;
  text-align: center;
}

.mobile-card .card-subtitle {
  font-size: 0.8rem;
  line-height: 1.3;
  margin-top: 6px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .simple-project-card {
    padding: 16px;
    gap: 12px;
  }

  .mobile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .mobile-card .card-title {
    font-size: 1.0rem;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
  }

  .mobile-card .card-subtitle {
    font-size: 0.8rem;
    line-height: 1.3;
    text-align: center;
  }
}
</style>
