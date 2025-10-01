<template>
  <div v-if="!playerReady" class="loading-spinner">
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <v-container class="pa-0">
    <div id="aplayer-container" ref="aplayerContainer"></div>

    <!-- 歌词控制按钮 -->
    <v-row class="mt-3" justify="center">
      <v-col cols="auto">
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-script-text-outline" @click="toggleLyricsDisplay"
          :disabled="!playerReady">
          {{ lyricsVisible ? '歌詞を非表示' : '歌詞を表示' }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useDisplay } from 'vuetify';

export default {
  setup() {
    const { xs, sm } = useDisplay();
    return { xs, sm };
  },
  props: {
    musicinfo: {
      type: Array,
      required: true
    },
    currentIndex: {
      type: Number,
      required: true
    },
    isPlaying: {
      type: Boolean,
      required: true
    },
    audioPlayer: {
      type: HTMLAudioElement,
      required: true
    },
  },

  data() {
    return {
      playerReady: false,
      aplayer: null,
      isInternalUpdate: false, // 防止循环更新
      lyricsVisible: false, // 控制歌词盒子显示
      lastLyricsUpdate: 0, // 防止歌词更新过于频繁
    };
  },

  computed: {
    aplayerList() {
      return this.musicinfo.map(song => ({
        name: song.title,
        artist: song.artist || song.author,
        url: song.url,
        cover: song.pic,
        lrc: song.lrc
      }));
    }
  },

  watch: {
    // 监听父组件传来的索引变化（从头像播放器触发）
    currentIndex(newIndex, oldIndex) {
      if (this.aplayer && this.aplayer.list && !this.isInternalUpdate && newIndex !== oldIndex) {
        this.isInternalUpdate = true;
        this.aplayer.list.switch(newIndex);
        this.$nextTick(() => {
          this.isInternalUpdate = false;
        });
      }
    },

    // 监听父组件传来的播放状态变化（从头像播放器触发）
    isPlaying(playing) {
      if (this.aplayer && !this.isInternalUpdate) {
        this.isInternalUpdate = true;
        if (playing && this.aplayer.audio.paused) {
          this.aplayer.play();
        } else if (!playing && !this.aplayer.audio.paused) {
          this.aplayer.pause();
        }
        this.$nextTick(() => {
          this.isInternalUpdate = false;
        });
      }
    }
  },

  methods: {
    // 切换歌词显示
    toggleLyricsDisplay() {
      this.lyricsVisible = !this.lyricsVisible;
      console.log('歌词显示状态:', this.lyricsVisible);
      this.$emit('toggle-lyrics-box', this.lyricsVisible);

      // 如果打开歌词，立即尝试获取当前歌词
      if (this.lyricsVisible) {
        this.$nextTick(() => {
          this.updateCurrentLyrics();
        });
      }
    },

    // 更新当前歌词显示
    updateCurrentLyrics() {
      if (!this.aplayer || !this.lyricsVisible) {
        return;
      }

      try {
        // 方法1: 尝试从 APlayer 的 lrc 对象获取当前歌词
        if (this.aplayer.lrc && this.aplayer.lrc.current) {
          const currentLyric = this.aplayer.lrc.current;
          if (currentLyric && currentLyric.text) {
            this.$emit('update-lyrics', currentLyric.text);
            return;
          }
        }

        // 方法2: 尝试从 DOM 获取当前显示的歌词
        const lrcElement = this.aplayer.template.lrc;
        if (lrcElement) {
          const currentLrcP = lrcElement.querySelector('.aplayer-lrc-current');
          if (currentLrcP && currentLrcP.textContent) {
            this.$emit('update-lyrics', currentLrcP.textContent.trim());
            return;
          }
        }

        // 方法3: 如果都没有，显示歌曲信息
        const currentSong = this.aplayer.list.audios[this.aplayer.list.index];
        if (currentSong) {
          this.$emit('update-lyrics', `正在播放: ${currentSong.name} - ${currentSong.artist}`);
        }
      } catch (error) {
        console.error('获取歌词错误:', error);
        this.$emit('update-lyrics', '歌词加载中...');
      }
    },

    // 根据当前时间获取对应的歌词
    getCurrentLyric(currentTime) {
      if (!this.aplayer || !this.aplayer.lrc || !this.aplayer.lrc.lrc) {
        return '';
      }

      // 这里需要根据 APlayer 的 lrc 对象结构来获取当前歌词
      // 通常 APlayer 会有一个 lrc.current 属性
      try {
        if (this.aplayer.lrc.current && this.aplayer.lrc.current.text) {
          return this.aplayer.lrc.current.text;
        }
        return '';
      } catch (error) {
        console.error('获取歌词错误:', error);
        return '';
      }
    },

    initAPlayer() {
      if (typeof APlayer === 'undefined') {
        console.error('APlayer is not loaded');
        return;
      }

      // 创建 APlayer 实例
      this.aplayer = new APlayer({
        container: this.$refs.aplayerContainer,
        audio: this.aplayerList,
        autoplay: false,
        theme: getComputedStyle(document.documentElement).getPropertyValue('--mjc-vcard-color').trim() || '#b7daff',
        loop: 'all',
        order: 'list',
        preload: 'auto',
        volume: 0.7,
        mutex: true,
        listFolded: false,
        listMaxHeight: '300px',
        lrcType: 3,
      });

      // 同步初始状态
      if (this.currentIndex > 0) {
        this.aplayer.list.switch(this.currentIndex);
      }

      // 移除自动播放逻辑，让用户手动控制播放
      // 只同步播放状态，不自动播放
      // if (this.isPlaying) {
      //   this.aplayer.play();
      // }

      // 将 APlayer 的 audio 元素暴露给父组件，实现真正的共享
      this.$emit('aplayer-ready', this.aplayer);

      // 监听 APlayer 的播放事件
      this.aplayer.on('play', () => {
        if (!this.isInternalUpdate) {
          this.$emit('update:is-playing', true);
          this.$emit('aplayer-play'); // 通知父组件 APlayer 开始播放

          // 播放开始时更新歌词
          if (this.lyricsVisible) {
            this.$nextTick(() => {
              this.updateCurrentLyrics();
            });
          }
        }
      });

      // 监听 APlayer 的暂停事件
      this.aplayer.on('pause', () => {
        if (!this.isInternalUpdate) {
          this.$emit('update:is-playing', false);
        }
      });

      // 监听 APlayer 的切歌事件
      this.aplayer.on('listswitch', (index) => {
        if (!this.isInternalUpdate) {
          this.$emit('update:current-index', index.index);
        }
        // 切歌时更新歌词
        if (this.lyricsVisible) {
          this.$nextTick(() => {
            this.updateCurrentLyrics();
          });
        }
      });

      // 监听歌曲结束事件（自动播放下一首）
      this.aplayer.on('ended', () => {
        // APlayer 会自动切换到下一首，我们只需要同步状态
      });

      // 监听歌词变化事件 - 使用正确的 APlayer 歌词事件
      this.aplayer.on('lrcshow', (info) => {
        console.log('lrcshow事件:', info);
        if (this.lyricsVisible) {
          // APlayer 的 lrcshow 事件通常返回 {time, text} 格式
          const text = info.text || info.lrc || info || '';
          this.$emit('update-lyrics', text);
        }
      });

      // 监听时间更新，手动获取当前歌词
      this.aplayer.on('timeupdate', () => {
        if (this.lyricsVisible) {
          // 限制更新频率，每500ms更新一次
          const now = Date.now();
          if (now - this.lastLyricsUpdate > 500) {
            this.lastLyricsUpdate = now;
            this.updateCurrentLyrics();
          }
        }
      });

      // 监听歌曲加载完成
      this.aplayer.on('loadeddata', () => {
        if (this.lyricsVisible) {
          this.updateCurrentLyrics();
        }
      });

      this.playerReady = true;
    }
  },

  mounted() {
    const loadAPlayerResources = () => {
      return new Promise((resolve, reject) => {
        if (typeof APlayer !== 'undefined') {
          resolve();
          return;
        }

        // 加载 CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css';
        document.head.appendChild(cssLink);

        // 加载 JS
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load APlayer'));
        document.head.appendChild(script);
      });
    };

    loadAPlayerResources()
      .then(() => {
        this.$nextTick(() => {
          this.initAPlayer();
        });
      })
      .catch(error => {
        console.error('Error loading APlayer:', error);
        this.playerReady = true;
      });
  },

  beforeDestroy() {
    if (this.aplayer) {
      // 通知父组件 APlayer 即将销毁
      this.$emit('aplayer-destroy');
      this.aplayer.destroy();
    }
  }
};
</script>

<style scoped>
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

#aplayer-container {
  width: 100%;
}

:deep(.aplayer) {
  background: transparent;
  box-shadow: none;
}

:deep(.aplayer-list) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  max-height: 300px;
}

:deep(.aplayer-list-item) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.aplayer-list-item:hover) {
  background: rgba(0, 0, 0, 0.1);
}

:deep(.aplayer-list-item-active) {
  background: rgba(0, 0, 0, 0.2);
}

:deep(.aplayer-body) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.aplayer-info) {
  padding: 14px 7px;
}
</style>