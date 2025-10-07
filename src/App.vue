<template>
  <v-app class="vapp-fullscreen-background">

    <PageLoading :visible="isAppBootLoading" @after-leave="onBootMaskRemoved" />

    <video autoplay loop muted class="video-bg" id="bg-video" ref="VdPlayer">
      <source :src=videosrc type="video/mp4">
    </video>

    <div class="floating-switch-container">
      <v-switch v-model="isClearScreen" inset class="floating-switch"></v-switch>
    </div>

    <div v-show="!isloading && !isClearScreen"
      :style="xs || sm ? { 'overflow-y': 'auto', 'overflow-x': 'hidden' } : {}">

      <!-- 移动端专用布局 -->
      <div v-if="xs || sm" class="mobile-layout">
        <!-- 1. 欢迎标题 -->
        <div class="mobile-welcome-title">{{ configdata.welcometitle }}</div>

        <!-- 2. 头像播放器 -->
        <v-avatar class="mobile-avatar-player" :size="120" @click="toggleMusicPlayer()" @mouseenter="musicplayershow(1)"
          @mouseleave="musicplayershow(0)">
          <v-img :class="{ 'bamboo1-spin': isPlaying }" alt="bamboo1" :src="configdata.avatar"></v-img>

          <!-- 头像播放器控制面板 -->
          <transition name="fade">
            <v-card v-show="ismusicplayer" class="mobile-musicplayer" variant="tonal">
              <div v-if="audioLoading && !useAPlayer" class="loading-spinner">
                <v-progress-circular indeterminate></v-progress-circular>
              </div>
              <span ref="audiotitle" class="musicplayer-text" style="top: 1.6rem;font-weight: bolder;">{{
                currentSong?.title || musicinfo?.[0]?.title }}</span>
              <span ref="audioauthor" class="musicplayer-text" style="bottom: 1.4rem;">{{ currentSong?.author ||
                musicinfo?.[0]?.author }}</span>

              <!-- 原生音频元素 -->
              <audio v-show="false" ref="audioPlayer" :src="currentSong?.url || musicinfo?.[0]?.url"
                @waiting="onWaiting" @canplay="onCanPlay"></audio>

              <!-- 控制按钮 -->
              <v-btn :size="22" color="#999999" icon @click="previousTrack()" class="prev-btn">
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>
              <v-btn :size="35" color="#999999" icon @click="togglePlay()" class="play-btn">
                <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
              </v-btn>
              <v-btn :size="22" color="#999999" icon @click="nextTrack()" class="next-btn">
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
            </v-card>
          </transition>
        </v-avatar>

        <!-- 3. 雷达图 -->
        <div class="mobile-radar-chart">
          <radarChart :style="{ 'height': '230px', 'max-width': '320px', 'width': '100%' }" />
        </div>

        <!-- 4. 天气组件 -->
        <div class="mobile-weather">
          <WeatherChart :style="{ 'max-width': '320px', 'width': '100%' }" />
        </div>

        <!-- 5. 社交图标 -->
        <v-container class="mobile-social-icons">
          <v-row align="center" justify="center">
            <v-col class="pa-1" cols="auto" v-for="item in socialPlatformIcons" :key="item.link">
              <v-btn :size="25" variant="tonal" color="#FFFFFF" class="ma-1 bamboo1-social-bticon" icon
                :href="item.link" target="_blank">
                <v-icon :icon="item.icon" :size="20" class="social-bticon-icon"></v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <!-- 设置按钮 -->
          <v-row align="center" justify="center" class="mt-2">
            <v-col cols="auto">
              <v-speed-dial location="top center" transition="slide-y-transition">
                <template v-slot:activator="{ props: activatorProps }">
                  <v-fab style="width: 2.5rem;height: 2.5rem;" color="#FFFFFF" variant="tonal" v-bind="activatorProps"
                    rounded="0" icon="mdi-wrench-cog"></v-fab>
                </template>
                <v-btn variant="tonal" class="setbtn" key="1" icon="mdi-content-save-all" @click="dialog1 = true"
                  size="31" color="#FFFFFF"></v-btn>
                <v-btn variant="tonal" class="setbtn" key="3" icon="$error" size="31" color="#FFFFFF"></v-btn>
              </v-speed-dial>
            </v-col>
          </v-row>
        </v-container>

        <!-- 6. 打字机 -->
        <div class="mobile-typewriter">
          <typewriter class="d-flex align-center justify-center" :style="{ 'min-height': '150px' }"></typewriter>
        </div>

        <!-- 7. 时间卡片 - 移动端（无闹钟功能） -->
        <div class="mobile-time-card">
          <div class="time-card mobile-time-only">
            <div class="time-display">{{ formattedTime }}</div>
            <div class="date-display">{{ formattedDate }}</div>
          </div>
        </div>

        <!-- 8. 项目卡片 -->
        <div class="mobile-projects">
          <v-chip class="mode-toggle-chip" :prepend-icon="showNewsMode ? 'mdi-newspaper' : 'mdi-alpha-w-box'"
            size="large" style="color: #FFFFFF; border-radius: 9999px; padding-left: 16px; padding-right: 16px;"
            @click="toggleMode">
            <transition name="fade" mode="out-in">
              <span :key="showNewsMode">{{ showNewsMode ? 'ニュース' : '項目' }}</span>
            </transition>
            <v-tooltip activator="parent" location="bottom">
              {{ showNewsMode ? 'プロジェクトに切り替え' : 'ニュースに切り替え' }}
            </v-tooltip>
          </v-chip>

          <!-- 项目卡片内容将通过子组件处理 -->
          <homeright :configdata="configdata" :formattedTime="formattedTime" :formattedDate="formattedDate"
            :projectcards="projectcards" :mobileMode="true" :showNewsMode="showNewsMode"></homeright>
        </div>
      </div>

      <!-- 桌面端布局（保持现有） -->
      <v-row v-else style="display: flex;">
        <v-col cols="12" md="8" lg="9" style="height: 100vh;" :style="{ 'overflow': 'auto' }">
          <homeright :configdata="configdata" :formattedTime="formattedTime" :formattedDate="formattedDate"
            :projectcards="projectcards" :showNewsMode="showNewsMode" @toggleMode="toggleMode"
            @openAlarm="openAlarmDialog">
          </homeright>
        </v-col>

        <v-col cols="12" md="4" lg="3" class="bamboo1-right" align="center">
          <div :style="{ 'display': 'none' }" class="welcome-title">{{ configdata.welcometitle }}</div>

          <!-- 头像播放器 - 桌面版 -->
          <v-avatar class="Animated-Avatar-Player" :size="140" :style="{ 'margin-top': '2rem' }"
            @mouseenter="musicplayershow(1)" @mouseleave="musicplayershow(0)">
            <v-img :class="{ 'bamboo1-spin': isPlaying }" alt="bamboo1" :src="configdata.avatar"></v-img>

            <!-- 头像播放器控制面板 -->
            <transition name="fade">
              <v-card v-show="ismusicplayer" class="musicplayer" :class="{ 'fade-in': ismusicplayer }" variant="tonal">
                <div v-if="audioLoading && !useAPlayer" class="loading-spinner">
                  <v-progress-circular indeterminate></v-progress-circular>
                </div>
                <span ref="audiotitle" class="musicplayer-text" style="top: 1.6rem;font-weight: bolder;">{{
                  currentSong?.title || musicinfo?.[0]?.title }}</span>
                <span ref="audioauthor" class="musicplayer-text" style="bottom: 1.4rem;">{{ currentSong?.author ||
                  musicinfo?.[0]?.author }}</span>

                <!-- 原生音频元素 -->
                <audio v-show="false" ref="audioPlayer" :src="currentSong?.url || musicinfo?.[0]?.url"
                  @waiting="onWaiting" @canplay="onCanPlay"></audio>

                <!-- 控制按钮 -->
                <v-btn :size="30" color="#999999" icon @click="previousTrack()">
                  <v-icon>mdi-skip-previous</v-icon>
                </v-btn>
                <v-btn :size="48" color="#999999" icon @click="togglePlay()">
                  <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                </v-btn>
                <v-btn :size="30" color="#999999" icon @click="nextTrack()">
                  <v-icon>mdi-skip-next</v-icon>
                </v-btn>
              </v-card>
            </transition>
          </v-avatar>

          <div class="radarchart-css">
            <radarChart :style="{ 'height': '270px' }" />
          </div>

          <!-- 天气组件 -->
          <div class="weather-css" :style="{ 'margin': '1.5rem 1rem' }">
            <WeatherChart :style="{ 'max-width': '320px' }" />
          </div>

          <v-container class="socialIconsContainer">
            <v-row align="center" justify="center">
              <v-col class="pa-1" cols="auto" v-for="item in socialPlatformIcons" :key="item.link">
                <v-btn :size="33" variant="tonal" color="#FFFFFF" class="ma-1 bamboo1-social-bticon" icon
                  :href="item.link" target="_blank">
                  <v-icon :icon="item.icon" :size="25" class="social-bticon-icon"></v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row align="center" justify="center" class="setting">
              <v-col class="ma-1" cols="auto">
                <v-speed-dial location="right center" transition="slide-y-transition">
                  <template v-slot:activator="{ props: activatorProps }">
                    <v-fab style="width: 2.5rem;height: 2.5rem;" color="#FFFFFF" variant="tonal" v-bind="activatorProps"
                      rounded="0" icon="mdi-wrench-cog"></v-fab>
                  </template>
                  <v-btn variant="tonal" class="setbtn" key="1" icon="mdi-content-save-all" @click="dialog1 = true"
                    size="31" color="#FFFFFF"></v-btn>
                  <v-btn variant="tonal" class="setbtn" key="3" icon="$error" size="31" color="#FFFFFF"></v-btn>
                </v-speed-dial>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </div>

    <v-dialog v-model="dialog1" width="1000" heihght="700">
      <v-card elevation="3" style="backdrop-filter: blur(10px);">
        <v-tabs v-model="tab" :items="tabs" align-tabs="center" height="60" slider-color="#FFFFFF">
          <template v-slot:tab="{ item }">
            <v-tab :prepend-icon="item.icon" :text="item.text" :value="item.value" class="text-none"></v-tab>
          </template>

          <template v-slot:item="{ item }">
            <v-tabs-window-item :value="item.value" class="pa-4">
              <div v-if="item.value == 'tab-3' && musicinfoLoading" class="loading-spinner" align="center">
                <v-progress-circular indeterminate></v-progress-circular>
              </div>

              <!-- 组件绑定 - 添加 APlayer 相关事件 -->
              <component v-if="item.value != 'tab-3' || (item.value == 'tab-3' && !musicinfoLoading)" :is=item.component
                @cancel="handleCancel" :musicinfo="item.value == 'tab-3' ? musicinfo : []"
                :currentIndex="item.value == 'tab-3' ? playlistIndex : null"
                :isPlaying="item.value == 'tab-3' ? isPlaying : null"
                :currentTime="item.value == 'tab-3' ? currentTime : null"
                :audioPlayer="item.value == 'tab-3' ? audioPlayer : null"
                :fromLyrics="item.value == 'tab-3' ? lyrics : null" @update:current-index="updateCurrentIndex"
                @update:is-playing="updateIsPlaying" @update:current-time="updateCurrentTime"
                @update:current-lyrics="updateLyrics" @aplayer-ready="onAPlayerReady"
                @aplayer-destroy="onAPlayerDestroy" @aplayer-play="onAPlayerPlay" @aplayer-pause="onAPlayerPause"
                @toggle-lyrics-box="toggleLyricsBox" @update-lyrics="updateCurrentLyrics">
              </component>
            </v-tabs-window-item>
          </template>
        </v-tabs>
      </v-card>
    </v-dialog>

    <!-- 可拖拽的歌词盒子 -->
    <LyricsBox :visible="showLyricsBox" :lyrics="currentLyrics" :is-mobile="xs || sm" @close="closeLyricsBox" />

    <!-- 闹钟组件 - 仅桌面端 -->
    <AlarmClock v-if="!(xs || sm)" v-model="showAlarmDialog" :config="configdata" @alarm-set="onAlarmSet" />

  </v-app>
</template>

<script src="./app.js"></script>
<style scoped>
@import url(/css/app.css);
@import url(/css/mobile.css);
</style>