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
        <v-col cols="12" md="3" align="center"
          :style="xs || sm ? { 'margin-top': '1rem' } : { 'margin-top': '-200px' }">
          <v-card class="ma-3" hover>
            <template v-slot:title>
              <span class="bamboo1-card-title clock-font">{{ formattedTime }}</span>
            </template>
            <template v-slot:subtitle>
              <span style="font-weight: bold;">{{ formattedDate }}</span>
            </template>
          </v-card>
        </v-col>
      </v-row>

      <v-chip class="mt-3 ml-3 mode-toggle-chip" :prepend-icon="showNewsMode ? 'mdi-newspaper' : 'mdi-alpha-w-box'"
        size="large"
        style="color: var(--bamboo1-vcard-color); border-radius: 9999px; padding-left: 16px; padding-right: 16px;"
        @click="toggleMode">
        <transition name="fade" mode="out-in">
          <span :key="showNewsMode">{{ showNewsMode ? 'ニュース' : '項目' }}</span>
        </transition>
      </v-chip>
      <!-- 项目卡片区域 -->
      <transition name="slide-fade" mode="out-in">
        <v-container v-show="!showNewsMode" key="projects">
          <v-row>
            <v-col v-for="(item, key) in projectcards" cols="6" md="8" lg="3" :style="[
              xs ? { padding: '6px' } : {},
              {
                borderRadius: '50%',
                overflow: 'hidden',
                aspectRatio: '1 / 1'   // 保持正方形，然后通过圆角变椭圆
              }
            ]">
              <v-card class="">
                <v-img aspect-ratio="1.7778" :src="item.img" cover :style="{ opacity: 0.8 }"></v-img>
                <v-card-title
                  :style="xs ? { fontSize: '0.9rem', padding: '0.15rem 0.5rem' } : { fontSize: '1.1rem', padding: '0.2rem 0.8rem' }">
                  {{ item.title }}
                </v-card-title>
                <v-card-subtitle
                  :style="xs ? { fontSize: '0.6rem', padding: '0.1rem 0.5rem' } : { fontSize: '0.8rem', padding: '0.15rem 0.6rem' }">
                  {{ item.subtitle }}
                </v-card-subtitle>
                <v-card-actions
                  :style="xs || sm || md ? { padding: '0', minHeight: '0', height: '2.5rem' } : { minHeight: '0', height: '2.8rem' }">
                  <v-btn :href="item.url" target="_blank" :text="item.go"></v-btn>
                  <v-spacer></v-spacer>

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

/* 响应式优化 */
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
}
</style>
