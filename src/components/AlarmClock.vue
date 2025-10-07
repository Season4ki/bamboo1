<template>
  <v-dialog v-model="visible" width="400">
    <v-card class="alarm-card">
      <v-card-title class="alarm-title">
        <v-icon class="mr-2">mdi-alarm</v-icon>
        アラーム設定
      </v-card-title>

      <v-card-text class="alarm-content">
        <!-- 时间设置 -->
        <div class="time-section">
          <h3 class="section-title">時間設定</h3>
          <v-row align="center" justify="center" class="time-picker-row">
            <v-col cols="5">
              <v-select v-model="selectedHour" :items="hours" label="時" variant="outlined" dense
                class="time-select"></v-select>
            </v-col>
            <v-col cols="1" class="time-separator">:</v-col>
            <v-col cols="5">
              <v-select v-model="selectedMinute" :items="minutes" label="分" variant="outlined" dense
                class="time-select"></v-select>
            </v-col>
          </v-row>
        </div>

        <!-- 铃声选择 -->
        <div class="ringtone-section">
          <h3 class="section-title">着信音選択</h3>

          <!-- 本地音乐文件选择 -->
          <v-select v-model="selectedRingtone" :items="allAvailableRingtones" item-title="name" item-value="path"
            label="着信音を選択" prepend-icon="mdi-music" variant="outlined" class="ringtone-select"
            :loading="loadingMusicFiles"></v-select>

          <!-- 试听按钮 -->
          <v-btn v-if="selectedRingtone" color="primary" variant="outlined" class="preview-btn"
            @click="previewRingtone">
            <v-icon class="mr-1">{{ isPlaying ? 'mdi-stop' : 'mdi-play' }}</v-icon>
            {{ isPlaying ? 'ストップ' : 'プレビュー' }}
          </v-btn>
        </div>

        <!-- 闹钟标签 -->
        <div class="label-section">
          <v-text-field v-model="alarmLabel" label="ラベル（任意）" variant="outlined" class="label-input"
            maxlength="20"></v-text-field>
        </div>

        <!-- 重复设置 -->
        <div class="repeat-section">
          <h3 class="section-title">繰り返し</h3>
          <v-chip-group v-model="selectedDays" multiple class="day-chips">
            <v-chip v-for="(day, index) in weekDays" :key="index" :value="index" filter variant="outlined"
              class="day-chip">
              {{ day }}
            </v-chip>
          </v-chip-group>
        </div>

        <!-- 当前设置的闹钟列表 -->
        <div v-if="alarms.length > 0" class="current-alarms">
          <h3 class="section-title">現在のアラーム</h3>
          <v-list class="alarm-list">
            <v-list-item v-for="(alarm, index) in alarms" :key="index" class="alarm-item">
              <template v-slot:prepend>
                <v-switch v-model="alarm.enabled" @update:model-value="toggleAlarm(index)" color="primary"
                  hide-details></v-switch>
              </template>

              <v-list-item-content>
                <v-list-item-title class="alarm-time">
                  {{ formatTime(alarm.hour, alarm.minute) }}
                </v-list-item-title>
                <v-list-item-subtitle class="alarm-details">
                  {{ alarm.label || 'ラベルなし' }} | {{ formatDays(alarm.days) }}
                </v-list-item-subtitle>
              </v-list-item-content>

              <template v-slot:append>
                <v-btn icon size="small" color="error" variant="text" @click="deleteAlarm(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>

      <v-card-actions class="alarm-actions">
        <v-btn color="primary" variant="elevated" @click="setAlarm" :disabled="!canSetAlarm">
          アラーム設定
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="closeDialog">
          キャンセル
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 隐藏的音频元素用于试听 -->
    <audio ref="previewAudio" @ended="stopPreview"></audio>
    <!-- 隐藏的音频元素用于闹钟响铃 -->
    <audio ref="alarmAudio" loop @ended="onAlarmEnded"></audio>
  </v-dialog>

  <!-- 闹钟响铃弹窗 -->
  <v-dialog v-model="showAlarmDialog" width="350" persistent>
    <v-card class="alarm-ring-card">
      <v-card-title class="alarm-ring-title">
        <v-icon class="mr-2 alarm-icon">mdi-alarm</v-icon>
        アラーム
      </v-card-title>

      <v-card-text class="alarm-ring-content">
        <div class="alarm-ring-time">{{ currentAlarmTime }}</div>
        <div class="alarm-ring-label">{{ currentAlarmLabel || 'アラームの時間です！' }}</div>
      </v-card-text>

      <v-card-actions class="alarm-ring-actions">
        <v-btn color="primary" variant="elevated" block @click="stopAlarm">
          アラームを停止
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AlarmClock',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      visible: false,
      selectedHour: '07',
      selectedMinute: '00',
      selectedRingtone: '',
      alarmLabel: '',
      selectedDays: [],
      isPlaying: false,
      alarms: [],
      showAlarmDialog: false,
      currentAlarmTime: '',
      currentAlarmLabel: '',
      alarmInterval: null,
      loadingMusicFiles: false,
      localMusicFiles: [],

      weekDays: ['月', '火', '水', '木', '金', '土', '日'],

      hours: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
      minutes: Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
    }
  },
  computed: {
    canSetAlarm() {
      return this.selectedHour && this.selectedMinute && this.selectedRingtone;
    },
    allAvailableRingtones() {
      return [...this.localMusicFiles];
    }
  },
  watch: {
    modelValue(newVal) {
      this.visible = newVal;
    },
    visible(newVal) {
      this.$emit('update:modelValue', newVal);
      if (newVal) {
        this.loadAlarms();
      }
    }
  },
  mounted() {
    this.loadAlarms();
    this.startAlarmChecker();
    this.loadLocalMusicFiles();
  },
  beforeUnmount() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
    }
  },
  methods: {
    async loadLocalMusicFiles() {
      this.loadingMusicFiles = true;
      try {
        // パブリック音声フォルダ内の音楽ファイルを読み込む
        const musicFiles = await this.fetchMusicFiles();
        this.localMusicFiles = musicFiles;
      } catch (error) {
        console.warn('ローカル音楽ファイルを読み込めません:', error);
        // 読み込めない場合は空の配列を使用
        this.localMusicFiles = [];
      } finally {
        this.loadingMusicFiles = false;
      }
    },

    async fetchMusicFiles() {
      let availableMusicFiles = [];

      // 設定ファイルからユーザーカスタム音楽ファイルを取得
      if (this.config.alarm && this.config.alarm.userMusicFiles) {
        availableMusicFiles = [...this.config.alarm.userMusicFiles];
      }

      // 設定ファイルにユーザー音楽ファイルがない場合、デフォルトリストを使用
      if (availableMusicFiles.length === 0) {
        availableMusicFiles = [
          { name: '🎵 漂泊的终点(守岸人主题钢琴曲)', path: '/audio/漂泊的终点(守岸人主题钢琴曲)-1.3鸣潮OST★★.mp3' },
          // ここでさらにデフォルトオプションを追加できます
        ];
      }

      // ファイルが実際に存在するか検証
      const validFiles = [];
      for (const file of availableMusicFiles) {
        try {
          // fetch HEAD リクエストでファイルの存在を検証
          const response = await fetch(file.path, { method: 'HEAD' });
          if (response.ok) {
            validFiles.push(file);
            console.log(`✅ 音声ファイルが見つかりました: ${file.name}`);
          } else {
            console.warn(`❌ 音声ファイルが存在しません: ${file.path} (ステータスコード: ${response.status})`);
          }
        } catch (error) {
          console.warn(`❌ 音声ファイルにアクセスできません: ${file.path}`, error);
        }
      }

      console.log(`📁 合計 ${validFiles.length} 個の利用可能な音声ファイルが検出されました`);
      return validFiles;
    },

    previewRingtone() {
      if (this.isPlaying) {
        this.stopPreview();
        return;
      }

      if (this.selectedRingtone) {
        this.$refs.previewAudio.src = this.selectedRingtone;
        this.$refs.previewAudio.play().catch(error => {
          console.error('プレビュー再生に失敗しました:', error);
          alert('この音声ファイルを再生できません。ファイルが存在するか、対応する形式かをご確認ください。');
        });
        this.isPlaying = true;
      }
    },

    stopPreview() {
      this.$refs.previewAudio.pause();
      this.$refs.previewAudio.currentTime = 0;
      this.isPlaying = false;
    },

    setAlarm() {
      const newAlarm = {
        id: Date.now(),
        hour: parseInt(this.selectedHour),
        minute: parseInt(this.selectedMinute),
        label: this.alarmLabel,
        ringtone: this.selectedRingtone,
        days: [...this.selectedDays],
        enabled: true,
        created: new Date(),
        lastTriggeredTime: null // 重複トリガー防止マーク
      };

      this.alarms.push(newAlarm);
      this.saveAlarms();
      this.resetForm();

      this.$emit('alarm-set', newAlarm);
    },

    toggleAlarm(index) {
      // v-modelが自動的にalarm.enabledの値を更新しているので、保存してログを記録するだけです
      this.saveAlarms();
      console.log(`アラーム ${index} のステータスが変更されました:`, this.alarms[index].enabled);
    },

    deleteAlarm(index) {
      this.alarms.splice(index, 1);
      this.saveAlarms();
    },

    resetForm() {
      this.selectedHour = '07';
      this.selectedMinute = '00';
      this.selectedRingtone = '';
      this.alarmLabel = '';
      this.selectedDays = [];
    },

    formatTime(hour, minute) {
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    },

    formatDays(days) {
      if (days.length === 0) return '一回のみ';
      if (days.length === 7) return '毎日';
      return days.map(d => this.weekDays[d]).join(', ');
    },

    saveAlarms() {
      localStorage.setItem('bamboo-alarms', JSON.stringify(this.alarms));
    },

    loadAlarms() {
      const saved = localStorage.getItem('bamboo-alarms');
      if (saved) {
        this.alarms = JSON.parse(saved);
        // 既存のアラームにlastTriggeredTimeプロパティがあることを確認
        this.alarms.forEach(alarm => {
          if (!alarm.hasOwnProperty('lastTriggeredTime')) {
            alarm.lastTriggeredTime = null;
          }
        });
      }
    },

    startAlarmChecker() {
      this.alarmInterval = setInterval(() => {
        this.checkAlarms();
      }, 1000);
    },

    checkAlarms() {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = (now.getDay() + 6) % 7; // 月曜日=0の形式に変換
      const currentTimeKey = `${currentHour}:${currentMinute}`;

      this.alarms.forEach((alarm, index) => {
        if (!alarm.enabled) return;

        if (alarm.hour === currentHour && alarm.minute === currentMinute) {
          // 今日アラームが鳴るべきかチェック
          if (alarm.days.length === 0 || alarm.days.includes(currentDay)) {
            // 同じ分内の重複トリガーを防止
            const alarmTimeKey = `${alarm.hour}:${alarm.minute}`;
            if (alarm.lastTriggeredTime !== alarmTimeKey) {
              alarm.lastTriggeredTime = alarmTimeKey;
              this.triggerAlarm(alarm, index);
            }
          }
        }
      });
    },

    triggerAlarm(alarm, index) {
      this.currentAlarmTime = this.formatTime(alarm.hour, alarm.minute);
      this.currentAlarmLabel = alarm.label;
      this.showAlarmDialog = true;

      // 着信音を再生
      if (alarm.ringtone) {
        this.$refs.alarmAudio.src = alarm.ringtone;
        this.$refs.alarmAudio.play();
      }

      // ワンタイムアラームの場合、自動的に無効化
      if (alarm.days.length === 0) {
        alarm.enabled = false;
        this.saveAlarms();
      }
    },

    stopAlarm() {
      this.showAlarmDialog = false;
      this.$refs.alarmAudio.pause();
      this.$refs.alarmAudio.currentTime = 0;
    },

    onAlarmEnded() {
      // アラーム音声再生終了後の処理
    },

    closeDialog() {
      this.stopPreview();
      this.visible = false;
    }
  }
}
</script>

<style scoped>
.alarm-card {
  background: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(10px);
  color: white !important;
  border-radius: 16px;
}

.alarm-title {
  color: white !important;
  font-weight: bold;
  padding: 20px 24px 16px;
}

.alarm-content {
  color: white !important;
  padding: 0 24px 20px;
}

.section-title {
  color: white !important;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  margin-top: 20px;
}

.section-title:first-child {
  margin-top: 0;
}

.time-picker-row {
  margin-bottom: 10px;
}

.time-separator {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: white !important;
}

.time-select {
  color: white !important;
}

.time-select :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white !important;
}

.time-select :deep(.v-field__input) {
  color: white !important;
}

.time-select :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.ringtone-select {
  margin-bottom: 16px;
}

.ringtone-select :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white !important;
}

.ringtone-select :deep(.v-field__input) {
  color: white !important;
}

.ringtone-select :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.preview-btn {
  margin-bottom: 16px;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.label-input :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white !important;
}

.label-input :deep(.v-field__input) {
  color: white !important;
}

.label-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.day-chips {
  justify-content: center;
}

.day-chip {
  color: white !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  margin: 4px;
}

.day-chip.v-chip--selected {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.current-alarms {
  margin-top: 20px;
}

.alarm-list {
  background: transparent !important;
}

.alarm-item {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
  color: white !important;
}

.alarm-time {
  color: white !important;
  font-weight: bold;
  font-size: 18px;
}

.alarm-details {
  color: rgba(255, 255, 255, 0.7) !important;
}

.alarm-actions {
  padding: 16px 24px 20px;
}

/* アラーム着信ダイアログスタイル */
.alarm-ring-card {
  background: rgba(0, 0, 0, 0.9) !important;
  backdrop-filter: blur(15px);
  color: white !important;
  border-radius: 16px;
  border: 2px solid #ff5722;
}

.alarm-ring-title {
  color: white !important;
  font-weight: bold;
  text-align: center;
  padding: 20px 24px 16px;
}

.alarm-icon {
  animation: ring 1s infinite;
  color: #ff5722 !important;
}

@keyframes ring {

  0%,
  50%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(-10deg);
  }

  75% {
    transform: rotate(10deg);
  }
}

.alarm-ring-content {
  text-align: center;
  padding: 0 24px 20px;
}

.alarm-ring-time {
  font-size: 32px;
  font-weight: bold;
  color: #ff5722 !important;
  margin-bottom: 8px;
}

.alarm-ring-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9) !important;
}

.alarm-ring-actions {
  padding: 16px 24px 20px;
}

/* ダークテーマ対応 */
:deep(.v-selection-control__wrapper) {
  color: white !important;
}

:deep(.v-switch__thumb) {
  color: white !important;
}

:deep(.v-switch__track) {
  background-color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.v-switch--inset .v-selection-control__input) {
  color: white !important;
}

:deep(.v-switch .v-selection-control__input) {
  color: white !important;
}

/* スイッチがオン状態のときの正しい色を確保 */
:deep(.v-switch .v-selection-control--dirty .v-switch__track) {
  background-color: rgb(var(--v-theme-primary)) !important;
  opacity: 0.8;
}

:deep(.v-switch .v-selection-control--dirty .v-switch__thumb) {
  color: white !important;
}

/* スイッチホバー効果 */
:deep(.v-switch:hover .v-switch__track) {
  background-color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.v-switch .v-selection-control--dirty:hover .v-switch__track) {
  background-color: rgb(var(--v-theme-primary)) !important;
  opacity: 1;
}

/* スイッチがクリック可能であることを確保 */
:deep(.v-switch .v-selection-control__wrapper) {
  cursor: pointer;
}

:deep(.v-list-item-title) {
  color: white !important;
}

:deep(.v-list-item-subtitle) {
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>
