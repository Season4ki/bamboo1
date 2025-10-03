import homeright from '../src/components/homeseting.vue';
import typewriter from './components/typewriter.vue'
import tab2 from './components/tabs/tab2.vue';
import tab3 from './components/tabs/tab3.vue';
import radarChart from './components/radarChart.vue';
import LyricsBox from './components/LyricsBox.vue';
import PageLoading from './components/PageLoading.vue';
import WeatherChart from './components/WeatherChart.vue';
import config from './config.js';
import { getCookie } from './utils/cookieUtils.js';
import { setMeta, getFormattedTime, getFormattedDate, dataConsole } from './utils/common.js';
import { useDisplay } from 'vuetify'

export default {
  components: {
    tab2, tab3, homeright, typewriter, radarChart, LyricsBox, PageLoading, WeatherChart
  },
  setup() {
    const { xs, sm, md } = useDisplay();
    return { xs, sm, md };
  },
  data() {
    return {
      isloading: false,
      isAppBootLoading: true,
      isClearScreen: false,
      formattedTime: "",
      formattedDate: "",
      configdata: config,
      dialog1: false,
      videosrc: '',
      ismusicplayer: false,
      isPlaying: false,
      playlistIndex: 0,
      audioLoading: false,
      musicinfo: null,
      musicinfoLoading: false,
      lyrics: {},
      socialPlatformIcons: null,
      isExpanded: false,

      // APlayer 实例引用
      aplayerInstance: null,
      useAPlayer: false,

      // 歌词显示控制
      showLyricsBox: false,
      currentLyrics: '',
      lyricsTimer: null, // 歌词更新定时器
      syncTimer: null, // APlayer状态同步定时器
      currentPlayTime: 0, // 当前播放时间

      projectcards: null,
      tab: null,
      tabs: [
        {
          icon: 'mdi-postage-stamp',
          text: '背景プレビュー',
          value: 'tab-2',
          component: "tab2",
        },
        {
          icon: 'mdi-music',
          text: '音楽再生',
          value: 'tab-3',
          component: "tab3",
        },
      ],

    };
  },
  async mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.projectcards = this.configdata.projectcards;
    this.socialPlatformIcons = this.configdata.socialPlatformIcons;
    this.isloading = true;
    let imageurl = "";
    this.dataConsole();
    this.setMeta(this.configdata.metaData.title, this.configdata.metaData.description, this.configdata.metaData.keywords, this.configdata.metaData.icon);

    imageurl = this.setMainProperty(imageurl);

    const loadImage = () => {
      const imageUrls = [
        config.avatar,
        ...config.projectcards.map(item => item.img)
      ];
      return new Promise((resolve, reject) => {
        const imagePromises = imageUrls.map((url) => {
          return new Promise((resolve, reject) => {
            const imgs = new Image();
            imgs.src = url;
            imgs.onload = () => resolve();
            imgs.onerror = (err) => reject(err);
          });
        })

        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 2500);
        });

        Promise.race([Promise.all(imagePromises), timeoutPromise]).then(() => {
          if (imageurl) {
            const img = new Image();
            img.src = imageurl;
            img.onload = () => { resolve(); };
            img.onerror = (err) => { reject(err); };
          } else {
            const video = this.$refs.VdPlayer;
            video.onloadedmetadata = () => {
              setTimeout(() => {
              }, "200");
              resolve();
            };
            video.onerror = (err) => { resolve(); };
          }
        })
      });
    };

    loadImage().then(() => {
      this.formattedTime = this.getFormattedTime(new Date());
      this.formattedDate = this.getFormattedDate(new Date());
      setTimeout(() => {
        this.isloading = false;
        this.isAppBootLoading = false;
      }, "500");
    }).catch((err) => {
      console.error('背景の読み込みに失敗しました:', err);
      setTimeout(() => {
        this.isloading = false;
        this.isAppBootLoading = false;
      }, "100");
    });

    setInterval(() => {
      this.formattedTime = this.getFormattedTime(new Date());
    }, 1000);

    await this.getMusicInfo();
    this.setupAudioListener();
  },

  beforeDestroy() {
    if (this.$refs.audioPlayer) {
      this.$refs.audioPlayer.removeEventListener('ended', this.nextTrack);
      if (this.audioTimeUpdateHandler) {
        this.$refs.audioPlayer.removeEventListener('timeupdate', this.audioTimeUpdateHandler);
      }
    }
    // 清理歌词监听定时器
    this.stopLyricsMonitoring();
    // 清理状态同步定时器
    this.stopSyncTimer();
  },

  watch: {
    isClearScreen(val) {
      if (!this.videosrc) {
        return
      }
      if (val) {
        this.$refs.VdPlayer.style.zIndex = 0;
        this.$refs.VdPlayer.controls = true;
      } else {
        this.$refs.VdPlayer.style.zIndex = -100;
        this.$refs.VdPlayer.controls = false;
      }
    },
    audioLoading(val) {
      if (!this.useAPlayer) {
        this.isPlaying = !val;
        console.log('audioLoading 改变了 isPlaying 状态为:', !val);
      }
    },
    // 监听 playlistIndex 变化，更新头像播放器显示
    playlistIndex(newIndex) {
      this.updateAvatarPlayerInfo(newIndex);
    },
    // 添加 isPlaying 监控
    isPlaying(newVal, oldVal) {
      console.log('isPlaying 状态变化:', {
        从: oldVal,
        到: newVal,
        时间戳: Date.now()
      });
    }
  },

  computed: {
    currentSong() {
      return this.musicinfo?.[this.playlistIndex] || {};
    },
    audioPlayer() {
      return this.$refs.audioPlayer;
    },
    currentTime() {
      return this.currentPlayTime;
    }
  },

  methods: {
    getCookie, setMeta, getFormattedTime, getFormattedDate, dataConsole,

    onBootMaskRemoved() {
      // 保险清理：若 index.html 注入的占位层仍在，移除之
      const boot = document.getElementById('boot-loading');
      if (boot && boot.parentElement) {
        try { boot.parentElement.removeChild(boot); } catch (_) { }
      }
    },

    setMainProperty(imageurl) {
      const root = document.documentElement;
      let bamboo1data = this.getCookie("bamboo1data");
      if (bamboo1data) {
        root.style.setProperty('--bamboo1-welcomtitle-color', `${bamboo1data.color.welcometitlecolor}`);
        root.style.setProperty('--bamboo1-vcard-color', `${bamboo1data.color.themecolor}`);
        root.style.setProperty('--bamboo1-brightness', `${bamboo1data.brightness}%`);
        root.style.setProperty('--bamboo1-blur', `${bamboo1data.blur}px`);
      } else {
        root.style.setProperty('--bamboo1-welcomtitle-color', `${this.configdata.color.welcometitlecolor}`);
        root.style.setProperty('--bamboo1-vcard-color', `${this.configdata.color.themecolor}`);
        root.style.setProperty('--bamboo1-brightness', `${this.configdata.brightness}%`);
        root.style.setProperty('--bamboo1-blur', `${this.configdata.blur}px`);
      }

      let bamboo1databackground = this.getCookie("bamboo1databackground");
      const { xs } = useDisplay();
      if (bamboo1databackground) {
        if (xs.value) {
          if (bamboo1databackground.mobile.type == "pic") {
            root.style.setProperty('--bamboo1-background-image-url', `url('${bamboo1databackground.mobile.datainfo.url}')`);
            imageurl = bamboo1databackground.mobile.datainfo.url;
            return imageurl;
          } else {
            this.videosrc = bamboo1databackground.mobile.datainfo.url;
          }
        } else {
          if (bamboo1databackground.pc.type == "pic") {
            root.style.setProperty('--bamboo1-background-image-url', `url('${bamboo1databackground.pc.datainfo.url}')`);
            imageurl = bamboo1databackground.pc.datainfo.url;
            return imageurl;
          } else {
            this.videosrc = bamboo1databackground.pc.datainfo.url;
          }
        }

      } else {
        if (xs.value) {
          if (this.configdata.background.mobile.type == "pic") {
            root.style.setProperty('--bamboo1-background-image-url', `url('${this.configdata.background.mobile.datainfo.url}')`);
            imageurl = this.configdata.background.mobile.datainfo.url;
            return imageurl;
          } else {
            this.videosrc = this.configdata.background.mobile.datainfo.url;
          }
        } else {
          if (this.configdata.background.pc.type == "pic") {
            root.style.setProperty('--bamboo1-background-image-url', `url('${this.configdata.background.pc.datainfo.url}')`);
            imageurl = this.configdata.background.pc.datainfo.url;
            return imageurl;
          } else {
            this.videosrc = this.configdata.background.pc.datainfo.url;
          }

        }
      }
    },

    projectcardsShow(key) {
      this.projectcards.forEach((item, index) => {
        if (index != key) {
          item.show = false;
        }
      })
    },
    handleCancel() {
      this.dialog1 = false;
    },
    jump(url) {
      window.open(url, '_blank').focus();
    },

    async getMusicInfo() {
      this.musicinfoLoading = true;
      try {
        const response = await fetch(`https://api.i-meto.com/meting/api?server=${this.configdata.musicPlayer.server}&type=${this.configdata.musicPlayer.type}&id=${this.configdata.musicPlayer.id}`
        );
        if (!response.ok) {
          throw new Error('ネットワーク接続に失敗しました');
        }
        this.musicinfo = await response.json();
        this.musicinfoLoading = false;
      } catch (error) {
        console.error('ネットワークエラー:', error);
      }
    },

    musicplayershow(val) {
      this.ismusicplayer = val;
    },

    setupAudioListener() {
      if (this.$refs.audioPlayer) {
        this.$refs.audioPlayer.addEventListener('ended', this.nextTrack);
        // 添加时间更新监听器
        this.audioTimeUpdateHandler = () => {
          if (!this.useAPlayer && this.isPlaying) {
            this.currentPlayTime = this.$refs.audioPlayer.currentTime || 0;
          }
        };
        this.$refs.audioPlayer.addEventListener('timeupdate', this.audioTimeUpdateHandler);
      }
    },

    // 新增：更新头像播放器的歌曲信息显示
    updateAvatarPlayerInfo(index) {
      if (this.musicinfo && this.musicinfo[index]) {
        // 现在主要依赖Vue的响应式绑定，但保留DOM操作作为备用
        this.$nextTick(() => {
          // 主要更新逻辑已经通过Vue绑定处理，这里只是确保同步
          if (this.$refs.audiotitle && this.$refs.audiotitle.innerText !== this.musicinfo[index].title) {
            this.$refs.audiotitle.innerText = this.musicinfo[index].title;
          }
          if (this.$refs.audioauthor && this.$refs.audioauthor.innerText !== this.musicinfo[index].author) {
            this.$refs.audioauthor.innerText = this.musicinfo[index].author;
          }
        });
      }
    },

    // 播放控制方法 - 同时支持原生播放器和 APlayer
    togglePlay() {
      console.log('togglePlay 被调用，当前状态:', {
        useAPlayer: this.useAPlayer,
        isPlaying: this.isPlaying,
        aplayerPaused: this.aplayerInstance ? this.aplayerInstance.audio.paused : 'N/A'
      });

      if (this.useAPlayer && this.aplayerInstance) {
        // 使用 APlayer 时，先暂停原生播放器（如果在播放）
        if (this.$refs.audioPlayer && !this.$refs.audioPlayer.paused) {
          console.log('暂停原生播放器');
          this.$refs.audioPlayer.pause();
        }

        // 记录操作前的状态
        const wasPlaying = !this.aplayerInstance.audio.paused;
        console.log('调用 APlayer toggle，操作前状态:', wasPlaying ? '播放' : '暂停');

        // 直接切换 APlayer 的播放状态
        this.aplayerInstance.toggle();

        // 短暂延迟后检查状态同步
        this.$nextTick(() => {
          const currentlyPlaying = !this.aplayerInstance.audio.paused;
          console.log('APlayer toggle 完成，当前状态:', currentlyPlaying ? '播放' : '暂停');

          // 如果状态没有正确同步，强制同步
          if (this.isPlaying !== currentlyPlaying) {
            console.log('检测到状态不同步，强制同步:', currentlyPlaying);
            this.isPlaying = currentlyPlaying;
            this.$forceUpdate();
          }
        });
      } else {
        // 使用原生播放器时，先暂停 APlayer（如果存在且正在播放）
        if (this.aplayerInstance && !this.aplayerInstance.audio.paused) {
          this.aplayerInstance.pause();
        }
        if (!this.isPlaying) {
          this.audioPlayer.play();
        } else {
          this.audioPlayer.pause();
        }
        this.isPlaying = !this.musicinfoLoading && !this.isPlaying;
      }
    },

    previousTrack() {
      if (this.useAPlayer && this.aplayerInstance) {
        // 使用 APlayer - 直接调用 skipBack
        this.aplayerInstance.skipBack();
        // 立即同步状态，确保头像播放器信息更新
        // 使用多个时间点检查状态，确保同步成功
        setTimeout(() => {
          if (this.aplayerInstance && this.aplayerInstance.list) {
            const currentIndex = this.aplayerInstance.list.index;
            this.playlistIndex = currentIndex;
            this.updateAvatarPlayerInfo(currentIndex);
          }
        }, 50);

        // 备用检查，防止第一次同步失败
        setTimeout(() => {
          if (this.aplayerInstance && this.aplayerInstance.list) {
            const currentIndex = this.aplayerInstance.list.index;
            if (currentIndex !== this.playlistIndex) {
              this.playlistIndex = currentIndex;
              this.updateAvatarPlayerInfo(currentIndex);
            }
          }
        }, 200);
      } else {
        // 使用原生播放器
        this.playlistIndex = this.playlistIndex > 0 ? this.playlistIndex - 1 : this.musicinfo.length - 1;
        this.updateAudio();
      }
    },

    nextTrack() {
      if (this.useAPlayer && this.aplayerInstance) {
        // 使用 APlayer - 直接调用 skipForward
        this.aplayerInstance.skipForward();
        // 立即同步状态，确保头像播放器信息更新
        // 使用多个时间点检查状态，确保同步成功
        setTimeout(() => {
          if (this.aplayerInstance && this.aplayerInstance.list) {
            const currentIndex = this.aplayerInstance.list.index;
            this.playlistIndex = currentIndex;
            this.updateAvatarPlayerInfo(currentIndex);
          }
        }, 50);

        // 备用检查，防止第一次同步失败
        setTimeout(() => {
          if (this.aplayerInstance && this.aplayerInstance.list) {
            const currentIndex = this.aplayerInstance.list.index;
            if (currentIndex !== this.playlistIndex) {
              this.playlistIndex = currentIndex;
              this.updateAvatarPlayerInfo(currentIndex);
            }
          }
        }, 200);
      } else {
        // 使用原生播放器
        this.playlistIndex = this.playlistIndex < this.musicinfo.length - 1 ? this.playlistIndex + 1 : 0;
        this.updateAudio();
      }
    },

    updateAudio() {
      if (!this.useAPlayer && this.audioPlayer && this.currentSong) {
        this.audioPlayer.src = this.currentSong.url;
        this.updateAvatarPlayerInfo(this.playlistIndex);
        this.isPlaying = true;
        this.audioPlayer.play();
      }
    },

    updateCurrentIndex(index) {
      this.playlistIndex = index;
      // 立即更新头像播放器信息，确保同步
      this.updateAvatarPlayerInfo(index);
    },

    updateIsPlaying(isPlaying) {
      console.log('updateIsPlaying 被调用:', {
        旧状态: this.isPlaying,
        新状态: isPlaying,
        useAPlayer: this.useAPlayer,
        时间戳: Date.now()
      });

      // 直接更新状态，确保头像播放器 UI 同步
      this.isPlaying = isPlaying;

      // 强制更新，确保 Vue 检测到状态变化
      this.$forceUpdate();

      console.log('updateIsPlaying 完成，当前 isPlaying:', this.isPlaying);
    },

    updateCurrentTime(time) {
      this.currentPlayTime = time;
    },

    updateLyrics(lyrics) {
      this.lyrics = lyrics;
    },

    // 接收 APlayer 实例
    onAPlayerReady(aplayer) {
      this.aplayerInstance = aplayer;
      this.useAPlayer = true;

      // 如果原生播放器正在播放，需要暂停它，避免两个播放器同时播放
      if (this.$refs.audioPlayer && !this.$refs.audioPlayer.paused) {
        console.log('APlayer准备就绪，暂停原生播放器避免冲突');
        this.$refs.audioPlayer.pause();
      }

      // 更新头像播放器显示为当前播放的歌曲
      this.updateAvatarPlayerInfo(this.playlistIndex);

      // 启动状态同步定时器，确保头像播放器信息与APlayer保持同步
      this.startSyncTimer();

      // 如果歌词盒子已经显示，启动歌词监听
      if (this.showLyricsBox) {
        this.startLyricsMonitoring();
      }

      console.log('APlayer is ready and synced with avatar player');
    },

    // APlayer 销毁时切换回原生播放器
    onAPlayerDestroy() {
      // 停止歌词监听
      this.stopLyricsMonitoring();
      // 停止状态同步定时器
      this.stopSyncTimer();

      this.aplayerInstance = null;
      this.useAPlayer = false;
      console.log('Switched back to native audio player');
    },

    onWaiting() {
      if (!this.useAPlayer) {
        this.audioLoading = true;
      }
    },

    onCanPlay() {
      if (!this.useAPlayer) {
        this.audioLoading = false;
      }
    },

    expandSwitch() {
      this.isExpanded = true;
    },

    collapseSwitch() {
      this.isExpanded = false;
    },

    // APlayer 开始播放时暂停原生播放器
    onAPlayerPlay() {
      console.log('APlayer 开始播放，暂停原生播放器');
      if (this.$refs.audioPlayer && !this.$refs.audioPlayer.paused) {
        this.$refs.audioPlayer.pause();
      }
      // 确保播放状态正确
      if (!this.isPlaying) {
        console.log('onAPlayerPlay 设置 isPlaying = true');
        this.isPlaying = true;
      }
    },

    // APlayer 暂停时确保状态同步
    onAPlayerPause() {
      console.log('APlayer 暂停，确保状态同步');
      // 确保暂停状态正确
      if (this.isPlaying) {
        console.log('onAPlayerPause 设置 isPlaying = false');
        this.isPlaying = false;
      }
    },

    // 切换歌词盒子显示
    toggleLyricsBox(visible) {
      console.log('接收到歌词盒子切换事件:', visible);
      if (typeof visible === 'boolean') {
        this.showLyricsBox = visible;
      } else {
        this.showLyricsBox = !this.showLyricsBox;
      }
      console.log('歌词盒子显示状态:', this.showLyricsBox);

      // 根据显示状态启动或停止歌词监听
      if (this.showLyricsBox) {
        this.startLyricsMonitoring();
        // 立即更新一次歌词
        this.updateLyricsFromAPlayer();
      } else {
        this.stopLyricsMonitoring();
      }
    },

    // 更新当前歌词内容（从子组件接收，作为备用）
    updateCurrentLyrics(lyrics) {
      console.log('从子组件接收到歌词更新:', lyrics);
      if (lyrics && !this.lyricsTimer) {
        // 如果主监听器没有运行，使用子组件传来的歌词
        this.currentLyrics = lyrics;
      }
    },

    // 启动歌词监听器
    startLyricsMonitoring() {
      if (this.aplayerInstance && this.showLyricsBox) {
        // 清除之前的监听器
        this.stopLyricsMonitoring();

        // 创建歌词更新定时器
        this.lyricsTimer = setInterval(() => {
          this.updateLyricsFromAPlayer();
        }, 500);

        console.log('开始歌词监听');
      }
    },

    // 停止歌词监听器
    stopLyricsMonitoring() {
      if (this.lyricsTimer) {
        clearInterval(this.lyricsTimer);
        this.lyricsTimer = null;
        console.log('停止歌词监听');
      }
    },

    // 直接从 APlayer 获取歌词
    updateLyricsFromAPlayer() {
      if (!this.aplayerInstance || !this.showLyricsBox) {
        return;
      }

      try {
        // 方法1: 尝试从 APlayer 的 lrc 对象获取当前歌词
        if (this.aplayerInstance.lrc && this.aplayerInstance.lrc.current) {
          const currentLyric = this.aplayerInstance.lrc.current;
          if (currentLyric && currentLyric.text) {
            this.currentLyrics = currentLyric.text;
            return;
          }
        }

        // 方法2: 尝试从 DOM 获取当前显示的歌词
        const lrcElement = this.aplayerInstance.template.lrc;
        if (lrcElement) {
          const currentLrcP = lrcElement.querySelector('.aplayer-lrc-current');
          if (currentLrcP && currentLrcP.textContent) {
            this.currentLyrics = currentLrcP.textContent.trim();
            return;
          }
        }

        // 方法3: 如果都没有，显示歌曲信息
        const currentSong = this.aplayerInstance.list.audios[this.aplayerInstance.list.index];
        if (currentSong) {
          this.currentLyrics = `正在播放: ${currentSong.name} - ${currentSong.artist}`;
        }
      } catch (error) {
        console.error('获取歌词错误:', error);
        this.currentLyrics = '歌词加载中...';
      }
    },

    // 关闭歌词盒子
    closeLyricsBox() {
      this.showLyricsBox = false;
      this.stopLyricsMonitoring();
    },

    // 启动APlayer状态同步定时器
    startSyncTimer() {
      if (this.aplayerInstance && this.useAPlayer) {
        // 清除之前的定时器
        this.stopSyncTimer();

        // 创建状态同步定时器，每秒检查一次状态
        this.syncTimer = setInterval(() => {
          if (this.aplayerInstance && this.aplayerInstance.list) {
            const currentIndex = this.aplayerInstance.list.index;
            // 只有当索引真的发生变化时才更新
            if (currentIndex !== this.playlistIndex) {
              console.log('同步定时器检测到索引变化:', this.playlistIndex, '->', currentIndex);
              this.playlistIndex = currentIndex;
              this.updateAvatarPlayerInfo(currentIndex);
            }
          }
        }, 1000);

        console.log('开始APlayer状态同步监听');
      }
    },

    // 停止APlayer状态同步定时器
    stopSyncTimer() {
      if (this.syncTimer) {
        clearInterval(this.syncTimer);
        this.syncTimer = null;
        console.log('停止APlayer状态同步监听');
      }
    },
  }
};