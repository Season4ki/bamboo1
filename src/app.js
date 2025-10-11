import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import homeright from '../src/components/homeseting.vue';
import typewriter from './components/typewriter.vue'
import tab2 from './components/tabs/tab2.vue';
import tab3 from './components/tabs/tab3.vue';
import radarChart from './components/radarChart.vue';
import LyricsBox from './components/LyricsBox.vue';
import PageLoading from './components/PageLoading.vue';
import WeatherChart from './components/WeatherChart.vue';
import AlarmClock from './components/AlarmClock.vue';
import WordLearning from './components/WordLearning.vue';
import config from './config.js';
import { getCookie } from './utils/cookieUtils.js';
import { setMeta, getFormattedTime, getFormattedDate, } from './utils/common.js';
import { useDisplay } from 'vuetify'

export default {
  components: {
    tab2, tab3, homeright, typewriter, radarChart, LyricsBox, PageLoading, WeatherChart, AlarmClock, WordLearning
  },
  setup() {
    const { xs, sm, md } = useDisplay();

    // 响应式数据
    const isloading = ref(false);
    const isAppBootLoading = ref(true);
    const isClearScreen = ref(false);
    const formattedTime = ref("");
    const formattedDate = ref("");
    const configdata = ref(config);
    const dialog1 = ref(false);
    const videosrc = ref('');
    const ismusicplayer = ref(false);
    const isPlaying = ref(false);
    const playlistIndex = ref(0);
    const audioLoading = ref(false);
    const musicinfo = ref(null);
    const musicinfoLoading = ref(false);
    const lyrics = ref({});
    const socialPlatformIcons = ref(null);
    const isExpanded = ref(false);

    // 闹钟相关状态
    const showAlarmDialog = ref(false);

    // APlayer 实例引用
    const aplayerInstance = ref(null);
    const useAPlayer = ref(false);

    // 歌词显示控制
    const showLyricsBox = ref(false);
    const currentLyrics = ref('');
    const lyricsTimer = ref(null);
    const syncTimer = ref(null);
    const currentPlayTime = ref(0);

    // 功能模块轮播
    const currentModeIndex = ref(0);
    const modes = ref([
      {
        name: 'ホーム',
        icon: 'mdi-home',
        type: 'home'
      },
      {
        name: '単語',
        icon: 'mdi-book-alphabet',
        type: 'words'
      },
      {
        name: 'ニュース',
        icon: 'mdi-newspaper',
        type: 'news'
      }
    ]);

    const projectcards = ref(null);
    const tab = ref(null);
    const tabs = ref([
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
    ]);

    // Refs
    const VdPlayer = ref(null);
    const audioPlayer = ref(null);
    const audiotitle = ref(null);
    const audioauthor = ref(null);
    const audioTimeUpdateHandler = ref(null);

    // 计算属性
    const currentSong = computed(() => {
      return musicinfo.value?.[playlistIndex.value] || {};
    });

    const currentTime = computed(() => {
      return currentPlayTime.value;
    });

    const currentMode = computed(() => {
      return modes.value[currentModeIndex.value] || modes.value[0];
    });

    // 方法
    const onBootMaskRemoved = () => {
      const boot = document.getElementById('boot-loading');
      if (boot && boot.parentElement) {
        try { boot.parentElement.removeChild(boot); } catch (_) { }
      }
    };

    const setMainProperty = (imageurl) => {
      const root = document.documentElement;
      let bamboo1databackground = getCookie("bamboo1databackground");

      if (bamboo1databackground) {
        if (xs.value) {
          if (bamboo1databackground.mobile.type == "pic") {
            root.style.setProperty('--bamboo1-background-image-url', `url('${bamboo1databackground.mobile.datainfo.url}')`);
            imageurl = bamboo1databackground.mobile.datainfo.url;
            return imageurl;
          } else {
            videosrc.value = bamboo1databackground.mobile.datainfo.url;
          }
        } else {
          if (bamboo1databackground.pc.type == "pic") {
            root.style.setProperty('--bamboo1-background-image-url', `url('${bamboo1databackground.pc.datainfo.url}')`);
            imageurl = bamboo1databackground.pc.datainfo.url;
            return imageurl;
          } else {
            videosrc.value = bamboo1databackground.pc.datainfo.url;
          }
        }
      } else {
        if (xs.value) {
          if (configdata.value.background.mobile.type == "pic") {
            root.style.setProperty('--bamboo1-background-image-url', `url('${configdata.value.background.mobile.datainfo.url}')`);
            imageurl = configdata.value.background.mobile.datainfo.url;
            return imageurl;
          } else {
            videosrc.value = configdata.value.background.mobile.datainfo.url;
          }
        } else {
          if (configdata.value.background.pc.type == "pic") {
            root.style.setProperty('--bamboo1-background-image-url', `url('${configdata.value.background.pc.datainfo.url}')`);
            imageurl = configdata.value.background.pc.datainfo.url;
            return imageurl;
          } else {
            videosrc.value = configdata.value.background.pc.datainfo.url;
          }
        }
      }
    };

    const projectcardsShow = (key) => {
      projectcards.value.forEach((item, index) => {
        if (index != key) {
          item.show = false;
        }
      })
    };

    const handleCancel = () => {
      dialog1.value = false;
    };

    const jump = (url) => {
      window.open(url, '_blank').focus();
    };

    const getMusicInfo = async () => {
      musicinfoLoading.value = true;
      try {
        const response = await fetch(`https://api.i-meto.com/meting/api?server=${configdata.value.musicPlayer.server}&type=${configdata.value.musicPlayer.type}&id=${configdata.value.musicPlayer.id}`);
        if (!response.ok) {
          throw new Error('ネットワーク接続に失敗しました');
        }
        musicinfo.value = await response.json();
        musicinfoLoading.value = false;
      } catch (error) {
        console.error('ネットワークエラー:', error);
      }
    };

    const musicplayershow = (val) => {
      ismusicplayer.value = val;
    };

    const toggleMusicPlayer = () => {
      ismusicplayer.value = !ismusicplayer.value;
    };

    const setupAudioListener = () => {
      if (audioPlayer.value) {
        audioPlayer.value.addEventListener('ended', nextTrack);
        audioTimeUpdateHandler.value = () => {
          if (!useAPlayer.value && isPlaying.value) {
            currentPlayTime.value = audioPlayer.value.currentTime || 0;
          }
        };
        audioPlayer.value.addEventListener('timeupdate', audioTimeUpdateHandler.value);
      }
    };

    const updateAvatarPlayerInfo = (index) => {
      if (musicinfo.value && musicinfo.value[index]) {
        nextTick(() => {
          if (audiotitle.value && audiotitle.value.innerText !== musicinfo.value[index].title) {
            audiotitle.value.innerText = musicinfo.value[index].title;
          }
          if (audioauthor.value && audioauthor.value.innerText !== musicinfo.value[index].author) {
            audioauthor.value.innerText = musicinfo.value[index].author;
          }
        });
      }
    };

    const togglePlay = () => {
      console.log('togglePlay 被调用，当前状态:', {
        useAPlayer: useAPlayer.value,
        isPlaying: isPlaying.value,
        aplayerPaused: aplayerInstance.value ? aplayerInstance.value.audio.paused : 'N/A'
      });

      if (useAPlayer.value && aplayerInstance.value) {
        if (audioPlayer.value && !audioPlayer.value.paused) {
          console.log('暂停原生播放器');
          audioPlayer.value.pause();
        }

        const wasPlaying = !aplayerInstance.value.audio.paused;
        console.log('调用 APlayer toggle，操作前状态:', wasPlaying ? '播放' : '暂停');

        aplayerInstance.value.toggle();

        nextTick(() => {
          const currentlyPlaying = !aplayerInstance.value.audio.paused;
          console.log('APlayer toggle 完成，当前状态:', currentlyPlaying ? '播放' : '暂停');

          if (isPlaying.value !== currentlyPlaying) {
            console.log('检测到状态不同步，强制同步:', currentlyPlaying);
            isPlaying.value = currentlyPlaying;
          }
        });
      } else {
        if (aplayerInstance.value && !aplayerInstance.value.audio.paused) {
          aplayerInstance.value.pause();
        }
        if (!isPlaying.value) {
          audioPlayer.value.play();
        } else {
          audioPlayer.value.pause();
        }
        isPlaying.value = !musicinfoLoading.value && !isPlaying.value;
      }
    };

    const previousTrack = () => {
      if (useAPlayer.value && aplayerInstance.value) {
        aplayerInstance.value.skipBack();
        setTimeout(() => {
          if (aplayerInstance.value && aplayerInstance.value.list) {
            const currentIndex = aplayerInstance.value.list.index;
            playlistIndex.value = currentIndex;
            updateAvatarPlayerInfo(currentIndex);
          }
        }, 50);

        setTimeout(() => {
          if (aplayerInstance.value && aplayerInstance.value.list) {
            const currentIndex = aplayerInstance.value.list.index;
            if (currentIndex !== playlistIndex.value) {
              playlistIndex.value = currentIndex;
              updateAvatarPlayerInfo(currentIndex);
            }
          }
        }, 200);
      } else {
        playlistIndex.value = playlistIndex.value > 0 ? playlistIndex.value - 1 : musicinfo.value.length - 1;
        updateAudio();
      }
    };

    const nextTrack = () => {
      if (useAPlayer.value && aplayerInstance.value) {
        aplayerInstance.value.skipForward();
        setTimeout(() => {
          if (aplayerInstance.value && aplayerInstance.value.list) {
            const currentIndex = aplayerInstance.value.list.index;
            playlistIndex.value = currentIndex;
            updateAvatarPlayerInfo(currentIndex);
          }
        }, 50);

        setTimeout(() => {
          if (aplayerInstance.value && aplayerInstance.value.list) {
            const currentIndex = aplayerInstance.value.list.index;
            if (currentIndex !== playlistIndex.value) {
              playlistIndex.value = currentIndex;
              updateAvatarPlayerInfo(currentIndex);
            }
          }
        }, 200);
      } else {
        playlistIndex.value = playlistIndex.value < musicinfo.value.length - 1 ? playlistIndex.value + 1 : 0;
        updateAudio();
      }
    };

    const updateAudio = () => {
      if (!useAPlayer.value && audioPlayer.value && currentSong.value) {
        audioPlayer.value.src = currentSong.value.url;
        updateAvatarPlayerInfo(playlistIndex.value);
        isPlaying.value = true;
        audioPlayer.value.play();
      }
    };

    const updateCurrentIndex = (index) => {
      playlistIndex.value = index;
      updateAvatarPlayerInfo(index);
    };

    const updateIsPlaying = (playing) => {
      console.log('updateIsPlaying 被调用:', {
        旧状态: isPlaying.value,
        新状态: playing,
        useAPlayer: useAPlayer.value,
        时间戳: Date.now()
      });

      isPlaying.value = playing;
      console.log('updateIsPlaying 完成，当前 isPlaying:', isPlaying.value);
    };

    const updateCurrentTime = (time) => {
      currentPlayTime.value = time;
    };

    const updateLyrics = (lyricsData) => {
      lyrics.value = lyricsData;
    };

    const onAPlayerReady = (aplayer) => {
      aplayerInstance.value = aplayer;
      useAPlayer.value = true;

      if (audioPlayer.value && !audioPlayer.value.paused) {
        console.log('APlayer准备就绪，暂停原生播放器避免冲突');
        audioPlayer.value.pause();
      }

      updateAvatarPlayerInfo(playlistIndex.value);
      startSyncTimer();

      if (showLyricsBox.value) {
        startLyricsMonitoring();
      }

      console.log('APlayer is ready and synced with avatar player');
    };

    const onAPlayerDestroy = () => {
      stopLyricsMonitoring();
      stopSyncTimer();
      aplayerInstance.value = null;
      useAPlayer.value = false;
      console.log('Switched back to native audio player');
    };

    const onWaiting = () => {
      if (!useAPlayer.value) {
        audioLoading.value = true;
      }
    };

    const onCanPlay = () => {
      if (!useAPlayer.value) {
        audioLoading.value = false;
      }
    };

    const expandSwitch = () => {
      isExpanded.value = true;
    };

    const collapseSwitch = () => {
      isExpanded.value = false;
    };

    const onAPlayerPlay = () => {
      console.log('APlayer 开始播放，暂停原生播放器');
      if (audioPlayer.value && !audioPlayer.value.paused) {
        audioPlayer.value.pause();
      }
      if (!isPlaying.value) {
        console.log('onAPlayerPlay 设置 isPlaying = true');
        isPlaying.value = true;
      }
    };

    const onAPlayerPause = () => {
      console.log('APlayer 暂停，确保状态同步');
      if (isPlaying.value) {
        console.log('onAPlayerPause 设置 isPlaying = false');
        isPlaying.value = false;
      }
    };

    const toggleLyricsBox = (visible) => {
      console.log('接收到歌词盒子切换事件:', visible);
      if (typeof visible === 'boolean') {
        showLyricsBox.value = visible;
      } else {
        showLyricsBox.value = !showLyricsBox.value;
      }
      console.log('歌词盒子显示状态:', showLyricsBox.value);

      if (showLyricsBox.value) {
        startLyricsMonitoring();
        updateLyricsFromAPlayer();
      } else {
        stopLyricsMonitoring();
      }
    };

    const updateCurrentLyrics = (lyricsText) => {
      console.log('从子组件接收到歌词更新:', lyricsText);
      if (lyricsText && !lyricsTimer.value) {
        currentLyrics.value = lyricsText;
      }
    };

    const startLyricsMonitoring = () => {
      if (aplayerInstance.value && showLyricsBox.value) {
        stopLyricsMonitoring();

        lyricsTimer.value = setInterval(() => {
          updateLyricsFromAPlayer();
        }, 500);

        console.log('开始歌词监听');
      }
    };

    const stopLyricsMonitoring = () => {
      if (lyricsTimer.value) {
        clearInterval(lyricsTimer.value);
        lyricsTimer.value = null;
        console.log('停止歌词监听');
      }
    };

    const updateLyricsFromAPlayer = () => {
      if (!aplayerInstance.value || !showLyricsBox.value) {
        return;
      }

      try {
        if (aplayerInstance.value.lrc && aplayerInstance.value.lrc.current) {
          const currentLyric = aplayerInstance.value.lrc.current;
          if (currentLyric && currentLyric.text) {
            currentLyrics.value = currentLyric.text;
            return;
          }
        }

        const lrcElement = aplayerInstance.value.template.lrc;
        if (lrcElement) {
          const currentLrcP = lrcElement.querySelector('.aplayer-lrc-current');
          if (currentLrcP && currentLrcP.textContent) {
            currentLyrics.value = currentLrcP.textContent.trim();
            return;
          }
        }

        const currentSongData = aplayerInstance.value.list.audios[aplayerInstance.value.list.index];
        if (currentSongData) {
          currentLyrics.value = `正在播放: ${currentSongData.name} - ${currentSongData.artist}`;
        }
      } catch (error) {
        console.error('获取歌词错误:', error);
        currentLyrics.value = '歌词加载中...';
      }
    };

    const closeLyricsBox = () => {
      showLyricsBox.value = false;
      stopLyricsMonitoring();
    };

    const startSyncTimer = () => {
      if (aplayerInstance.value && useAPlayer.value) {
        stopSyncTimer();

        syncTimer.value = setInterval(() => {
          if (aplayerInstance.value && aplayerInstance.value.list) {
            const currentIndex = aplayerInstance.value.list.index;
            if (currentIndex !== playlistIndex.value) {
              console.log('同步定时器检测到索引变化:', playlistIndex.value, '->', currentIndex);
              playlistIndex.value = currentIndex;
              updateAvatarPlayerInfo(currentIndex);
            }
          }
        }, 1000);

        console.log('开始APlayer状态同步监听');
      }
    };

    const stopSyncTimer = () => {
      if (syncTimer.value) {
        clearInterval(syncTimer.value);
        syncTimer.value = null;
        console.log('停止APlayer状态同步监听');
      }
    };

    const openAlarmDialog = () => {
      showAlarmDialog.value = true;
    };

    const closeAlarmDialog = () => {
      showAlarmDialog.value = false;
    };

    const onAlarmSet = (alarm) => {
      console.log('闹钟已设置:', alarm);
    };

    const previousMode = () => {
      currentModeIndex.value = currentModeIndex.value > 0
        ? currentModeIndex.value - 1
        : modes.value.length - 1;
    };

    const nextMode = () => {
      currentModeIndex.value = currentModeIndex.value < modes.value.length - 1
        ? currentModeIndex.value + 1
        : 0;
    };

    const loadImage = (imageurl) => {
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
            const video = VdPlayer.value;
            if (video) {
              video.onloadedmetadata = () => {
                setTimeout(() => {
                }, "200");
                resolve();
              };
              video.onerror = (err) => { resolve(); };
            } else {
              resolve();
            }
          }
        })
      });
    };

    // 监听器
    watch(isClearScreen, (val) => {
      if (!videosrc.value) {
        return
      }
      if (val) {
        VdPlayer.value.style.zIndex = 0;
        VdPlayer.value.controls = true;
      } else {
        VdPlayer.value.style.zIndex = -100;
        VdPlayer.value.controls = false;
      }
    });

    watch(audioLoading, (val) => {
      if (!useAPlayer.value) {
        isPlaying.value = !val;
        console.log('audioLoading 改变了 isPlaying 状态为:', !val);
      }
    });

    watch(playlistIndex, (newIndex) => {
      updateAvatarPlayerInfo(newIndex);
    });

    watch(isPlaying, (newVal, oldVal) => {
      console.log('isPlaying 状态变化:', {
        从: oldVal,
        到: newVal,
        时间戳: Date.now()
      });
    });

    // 生命周期
    onMounted(async () => {
      if (import.meta.env.VITE_CONFIG) {
        configdata.value = JSON.parse(import.meta.env.VITE_CONFIG);
      }
      projectcards.value = configdata.value.projectcards;
      socialPlatformIcons.value = configdata.value.socialPlatformIcons;
      isloading.value = true;
      let imageurl = "";

      setMeta(configdata.value.metaData.title, configdata.value.metaData.description, configdata.value.metaData.keywords, configdata.value.metaData.icon);

      imageurl = setMainProperty(imageurl);

      loadImage(imageurl).then(() => {
        formattedTime.value = getFormattedTime(new Date());
        formattedDate.value = getFormattedDate(new Date());
        setTimeout(() => {
          isloading.value = false;
          isAppBootLoading.value = false;
        }, "500");
      }).catch((err) => {
        console.error('背景の読み込みに失敗しました:', err);
        setTimeout(() => {
          isloading.value = false;
          isAppBootLoading.value = false;
        }, "100");
      });

      setInterval(() => {
        formattedTime.value = getFormattedTime(new Date());
      }, 1000);

      await getMusicInfo();
      setupAudioListener();
    });

    onBeforeUnmount(() => {
      if (audioPlayer.value) {
        audioPlayer.value.removeEventListener('ended', nextTrack);
        if (audioTimeUpdateHandler.value) {
          audioPlayer.value.removeEventListener('timeupdate', audioTimeUpdateHandler.value);
        }
      }
      stopLyricsMonitoring();
      stopSyncTimer();
    });

    // 返回所有需要在模板中使用的数据和方法
    return {
      // 响应式引用
      xs, sm, md,
      isloading,
      isAppBootLoading,
      isClearScreen,
      formattedTime,
      formattedDate,
      configdata,
      dialog1,
      videosrc,
      ismusicplayer,
      isPlaying,
      playlistIndex,
      audioLoading,
      musicinfo,
      musicinfoLoading,
      lyrics,
      socialPlatformIcons,
      isExpanded,
      showAlarmDialog,
      aplayerInstance,
      useAPlayer,
      showLyricsBox,
      currentLyrics,
      lyricsTimer,
      syncTimer,
      currentPlayTime,
      currentModeIndex,
      modes,
      projectcards,
      tab,
      tabs,

      // Template refs
      VdPlayer,
      audioPlayer,
      audiotitle,
      audioauthor,

      // 计算属性
      currentSong,
      currentTime,
      currentMode,

      // 方法
      getCookie,
      setMeta,
      getFormattedTime,
      getFormattedDate,
      onBootMaskRemoved,
      setMainProperty,
      projectcardsShow,
      handleCancel,
      jump,
      getMusicInfo,
      musicplayershow,
      toggleMusicPlayer,
      setupAudioListener,
      updateAvatarPlayerInfo,
      togglePlay,
      previousTrack,
      nextTrack,
      updateAudio,
      updateCurrentIndex,
      updateIsPlaying,
      updateCurrentTime,
      updateLyrics,
      onAPlayerReady,
      onAPlayerDestroy,
      onWaiting,
      onCanPlay,
      expandSwitch,
      collapseSwitch,
      onAPlayerPlay,
      onAPlayerPause,
      toggleLyricsBox,
      updateCurrentLyrics,
      startLyricsMonitoring,
      stopLyricsMonitoring,
      updateLyricsFromAPlayer,
      closeLyricsBox,
      startSyncTimer,
      stopSyncTimer,
      openAlarmDialog,
      closeAlarmDialog,
      onAlarmSet,
      previousMode,
      nextMode,
    };
  }
};