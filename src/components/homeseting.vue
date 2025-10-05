<template>
  <div>
    <div>
      <div :style="xs || sm ? { 'display': 'none' } : { 'font-size': '4rem' }" class="bamboo1-left-welcome">{{
        configdata.welcometitle }}</div>
    </div>
    <div>
      <v-row align="center">
        <v-col cols="12" md="8">
          <typewriter class="ma-3 d-flex align-center justify-center"
            :style="xs || sm ? { 'min-height': '150px' } : { 'min-height': '200px' }"></typewriter>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-center">
          <div class="time-card">
            <div class="time-display">{{ formattedTime }}</div>
            <div class="date-display">{{ formattedDate }}</div>
          </div>
        </v-col>
      </v-row>

      <v-chip class="mt-3 ml-3 mode-toggle-chip" :prepend-icon="showNewsMode ? 'mdi-newspaper' : 'mdi-alpha-w-box'"
        size="large" style="color: #FFFFFF; border-radius: 9999px; padding-left: 16px; padding-right: 16px;"
        @click="toggleMode">
        <transition name="fade" mode="out-in">
          <span :key="showNewsMode">{{ showNewsMode ? 'ニュース' : '項目' }}</span>
        </transition>
      </v-chip>
      <!-- 项目卡片区域 - 重新设计 -->
      <transition name="slide-fade" mode="out-in">
        <v-container v-show="!showNewsMode" key="projects" fluid class="pa-4">
          <v-row justify="center" class="g-4">
            <v-col v-for="(item, key) in projectcards" :key="key" cols="12" sm="6" md="4" lg="3" class="d-flex">
              <v-card class="project-card-new flex-grow-1" elevation="12" rounded="xl" hover>
                <!-- 卡片头部图片区域 -->
                <div class="card-header" @click="handleCardClick(item)">
                  <v-img :src="item.img" height="150" cover class="card-image">

                    <!-- 悬浮时显示的跳转提示 -->
                    <div class="card-overlay">
                      <v-btn icon size="large" color="white" variant="elevated" class="jump-btn"
                        @click.stop="handleCardClick(item)">
                        <v-icon size="24">mdi-arrow-top-right</v-icon>
                      </v-btn>
                      <p class="overlay-text mt-2">点击访问项目</p>
                    </div>
                  </v-img>
                </div>

                <!-- 卡片内容区域 -->
                <v-card-item class="card-content">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div class="flex-grow-1">
                      <v-card-title class="project-title pa-0 mb-1">
                        {{ item.title }}
                      </v-card-title>
                      <v-card-subtitle class="project-subtitle pa-0 text-medium-emphasis">
                        {{ item.subtitle }}
                      </v-card-subtitle>
                    </div>

                    <!-- 详情切换按钮 -->
                    <v-btn icon variant="text" size="small" @click="item.show = !item.show" class="info-toggle-btn">
                      <v-icon>{{ item.show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    </v-btn>
                  </div>

                  <!-- 展开的详细内容 -->
                  <v-expand-transition>
                    <div v-show="item.show" class="project-details">
                      <v-divider class="my-3"></v-divider>
                      <p class="project-description text-body-2 mb-3">{{ item.text }}</p>


                    </div>
                  </v-expand-transition>
                </v-card-item>

                <!-- 卡片底部操作区 -->
                <v-card-actions class="card-actions px-3 pb-3">
                  <v-btn :href="item.url" target="_blank" variant="outlined" rounded="pill" size="small"
                    class="action-btn-transparent flex-grow-1" prepend-icon="mdi-rocket-launch">
                    {{ item.go }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </transition>

      <!-- 新闻组件区域 -->
      <transition name="slide-fade" mode="out-in">
        <v-container v-show="showNewsMode" class="mt-4 news-container-wrapper" key="news" fluid>
          <NewsComponent />
        </v-container>
      </transition>

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
  props: ['configdata', 'formattedTime', 'formattedDate', 'projectcards'],
  setup() {

    const { xs, sm, md } = useDisplay();
    const showNewsMode = ref(false); // false: 显示项目卡片, true: 显示新闻组件

    // 切换模式的函数
    const toggleMode = () => {
      showNewsMode.value = !showNewsMode.value;
    };

    return { xs, sm, md, showNewsMode, toggleMode };
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
    },
    projectcardsShow(key) {
      for (let i = 0; i < this.projectcards.length; i++) {
        if (i != key) {
          this.projectcards[i].show = false;
        }
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
  background: rgba(255, 255, 255, 0.1);
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
  background: rgba(255, 255, 255, 0.15);
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

/* ======= 重新设计的项目卡片样式 ======= */

/* 主卡片样式 */
.project-card-new {
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.project-card-new:hover {
  transform: translateY(-8px);
  border-color: rgba(139, 69, 255, 0.4);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 40px rgba(139, 69, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 卡片头部图片区域 */
.card-header {
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.card-image {
  transition: transform 0.4s ease;
}

.card-header:hover .card-image {
  transform: scale(1.05);
}

/* 项目类型标签 */
.card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(139, 69, 255, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 2;
}

/* 悬浮覆盖层 */
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
}

.card-header:hover .card-overlay {
  opacity: 1;
}

.jump-btn {
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.card-header:hover .jump-btn {
  transform: scale(1);
}

.overlay-text {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

/* 卡片内容区域 */
.card-content {
  padding: 16px !important;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.project-title {
  font-size: 1.1rem !important;
  font-weight: 700 !important;
  color: #FFFFFF !important;
  line-height: 1.3;
}

.project-subtitle {
  font-size: 0.8rem !important;
  color: rgba(255, 255, 255, 0.7) !important;
  line-height: 1.4;
}

/* 详情切换按钮 */
.info-toggle-btn {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.info-toggle-btn:hover {
  opacity: 1;
}

/* 项目详情区域 */
.project-details {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.project-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

/* 技术栈标签 */
.tech-stack .v-chip {
  margin: 2px;
  backdrop-filter: blur(10px);
}

/* 卡片操作区域 */
.card-actions {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn-transparent {
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.action-btn-transparent:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.6) !important;
  color: #FFFFFF !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}

/* 分隔线样式 */
.project-card-new .v-divider {
  border-color: rgba(255, 255, 255, 0.15);
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 960px) {
  .mode-toggle-chip {
    font-size: 0.875rem;
  }

  .slide-fade-enter-from {
    transform: translateY(15px);
  }

  .slide-fade-leave-to {
    transform: translateY(-15px);
  }

  .news-container-wrapper {
    padding: 0 8px !important;
  }

  .card-header {
    height: 130px;
  }

  .card-image {
    height: 130px !important;
  }

  .project-title {
    font-size: 1rem !important;
  }

  .project-subtitle {
    font-size: 0.75rem !important;
  }

  .card-content {
    padding: 12px !important;
  }

  .card-actions {
    padding: 8px 12px !important;
  }

  .g-4>.v-col {
    padding: 8px;
  }
}

@media (max-width: 600px) {
  .project-card-new {
    margin-bottom: 16px;
  }

  .card-badge {
    padding: 4px 8px;
    font-size: 0.7rem;
  }

  .project-title {
    font-size: 1rem !important;
  }

  .overlay-text {
    font-size: 0.8rem;
  }

  .g-4>.v-col {
    padding: 6px;
  }
}

/* 网格间距 */
.g-4>.v-col {
  padding: 12px;
}

/* 卡片进入动画 */
.project-card-new {
  animation: cardSlideIn 0.6s ease-out;
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 玻璃边框效果 */
.project-card-new::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(139, 69, 255, 0.2) 25%,
      rgba(59, 130, 246, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 100%);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.project-card-new:hover::before {
  opacity: 1;
}

/* 工具提示样式 */
.v-tooltip .v-overlay__content {
  background: rgba(0, 0, 0, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 0.8rem;
  padding: 8px 12px;
}
</style>
