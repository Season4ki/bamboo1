<template>
  <v-app class="vapp-fullscreen-background">

    <video autoplay loop muted class="video-bg" id="bg-video" ref="VdPlayer">
      <source :src=videosrc type="video/mp4">
    </video>

    <div class="floating-switch-container">
      <v-switch v-model="isClearScreen" inset :style="xs ? { 'transform': 'scale(0.6) translateX(15%)' } : {}"
        class="floating-switch" @mouseover="expandSwitch" @mouseleave="collapseSwitch"></v-switch>
    </div>

    <div v-show="!isloading && !isClearScreen"
      :style="xs || sm ? { 'overflow-y': 'auto', 'overflow-x': 'hidden' } : {}">
      <v-row style="display: flex; flex-direction: row-reverse;">
        <v-col cols="12" md="4" lg="3" class="mjc-left" align="center">
          <div :style="xs || sm ? { 'font-size': '3.1rem' } : { 'display': 'none' }" class="mjc-left-welcome">{{
            configdata.welcometitle }}</div>

          <!-- 头像播放器 - 保持原有功能，现在与 APlayer 同步 -->
          <v-avatar class="mjc-left-avatar" :size="xs || sm ? 120 : 140"
            :style="xs || sm ? { 'margin-top': '0' } : { 'margin-top': '2rem' }" @mouseenter="musicplayershow(1)"
            @mouseleave="musicplayershow(0)">
            <v-img :class="{ 'mjc-spin': isPlaying }" alt="mjc" :src=configdata.avatar></v-img>

            <!-- 头像播放器控制面板 -->
            <transition name="fade">
              <v-card v-show="ismusicplayer" class="musicplayer" :class="{ 'fade-in': ismusicplayer }" variant="tonal">
                <div v-if="audioLoading && !useAPlayer" class="loading-spinner">
                  <v-progress-circular indeterminate></v-progress-circular>
                </div>
                <span ref="audiotitle" class="musicplayer-text" style="top: 1.6rem;font-weight: bolder;">{{
                  musicinfo?.[0]?.title }}</span>
                <span ref="audioauthor" class="musicplayer-text" style="bottom: 1.4rem;">{{ musicinfo?.[0]?.author
                }}</span>

                <!-- 原生音频元素 - 当没有使用 APlayer 时播放 -->
                <audio v-show="false" ref="audioPlayer" :src="musicinfo?.[0]?.url" @waiting="onWaiting"
                  @canplay="onCanPlay">
                </audio>

                <!-- 控制按钮 - 现在会同步控制 APlayer -->
                <v-btn :size="xs || sm ? 22 : 30" color="#999999" icon @click="previousTrack()">
                  <v-icon>mdi-skip-previous</v-icon>
                </v-btn>
                <v-btn :size="xs || sm ? 35 : 48" color="#999999" icon @click="togglePlay()">
                  <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                </v-btn>
                <v-btn :size="xs || sm ? 22 : 30" color="#999999" icon @click="nextTrack()">
                  <v-icon>mdi-skip-next</v-icon>
                </v-btn>
              </v-card>
            </transition>
          </v-avatar>

          <v-card class="ma-5 pa-2 mjc-left-card" variant="tonal" :max-width="xs ? 270 : 300"
            style="text-align: center;">
          </v-card>

          <div class="mjc-left-chart">
            <polarchart :style="xs || sm ? { 'height': '210px' } : { 'height': '270px' }" />
          </div>

          <v-container class="mjc-left-socialIconsContainer">
            <v-row align="center" justify="center">
              <v-col class="pa-1" cols="auto" v-for="item in socialPlatformIcons">
                <v-btn :size="xs ? 25 : 33" variant="tonal" color="var(--mjc-vcard-color)"
                  class="ma-1 mjc-social-bticon" icon :href="item.link" target="_blank">
                  <v-icon :icon=item.icon :size="xs ? 20 : 25" class="social-bticon-icon"></v-icon></v-btn>
              </v-col>
            </v-row>

            <v-row align="center" justify="center" class="setting">
              <v-col class="ma-1" cols="auto">
                <v-speed-dial :location="xs || sm ? 'top center' : 'right center'" transition="slide-y-transition">
                  <template v-slot:activator="{ props: activatorProps }">
                    <v-fab style="width: 2.5rem;height: 2.5rem;" color="var(--mjc-vcard-color)" variant="tonal"
                      v-bind="activatorProps" rounded="0" icon="mdi-wrench-cog"></v-fab>
                  </template>
                  <v-btn variant="tonal" class="setbtn" key="1" icon="mdi-key-chain" @click="dialog1 = true" size="31"
                    color="var(--mjc-vcard-color)"></v-btn>

                  <v-btn variant="tonal" class="setbtn" key="3" icon="$error" size="31"
                    color="var(--mjc-vcard-color)"></v-btn>
                </v-speed-dial>
              </v-col>
            </v-row>
          </v-container>
        </v-col>

        <v-col cols="12" md="8" lg="9" style="height: 100vh;" :style="xs || sm ? {} : { 'overflow': 'auto' }">
          <homeright :configdata=configdata :formattedTime=formattedTime :formattedDate=formattedDate
            :projectcards=projectcards></homeright>
        </v-col>
      </v-row>
    </div>

    <v-dialog v-model="dialog1" width="1000" heihght="700">
      <v-card elevation="3" style="backdrop-filter: blur(10px);">
        <v-tabs v-model="tab" :items="tabs" align-tabs="center" height="60" slider-color=var(--mjc-vcard-color)>
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
                :audioPlayer="item.value == 'tab-3' ? audioPlayer : null"
                :fromLyrics="item.value == 'tab-3' ? lyrics : null" @update:current-index="updateCurrentIndex"
                @update:is-playing="updateIsPlaying" @update:current-lyrics="updateLyrics"
                @aplayer-ready="onAPlayerReady" @aplayer-destroy="onAPlayerDestroy" @aplayer-play="onAPlayerPlay"
                @toggle-lyrics-box="toggleLyricsBox" @update-lyrics="updateCurrentLyrics">
              </component>
            </v-tabs-window-item>
          </template>
        </v-tabs>
      </v-card>
    </v-dialog>

    <!-- 可拖拽的歌词盒子 -->
    <LyricsBox :visible="showLyricsBox" :lyrics="currentLyrics" :is-mobile="xs || sm" @close="closeLyricsBox" />

  </v-app>
</template>

<script src="./app.js"></script>
<style scoped>
@import url(/css/app.less);
@import url(/css/mobile.less);
</style>