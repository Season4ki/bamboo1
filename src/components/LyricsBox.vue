<template>
  <div v-show="visible" ref="lyricsBox" class="subtitle-lyrics-box" :style="boxStyle" @mousedown="startDrag"
    @touchstart="startDrag">

    <!-- 歌词文字 -->
    <div class="lyrics-subtitle-text" :style="textStyle" @dblclick="toggleSettings">
      {{ lyrics || '暂无歌词' }}
    </div>

    <!-- 设置面板 -->
    <div v-show="showSettings" class="lyrics-settings-panel" @mousedown.stop @touchstart.stop>

      <!-- 字体大小调节 -->
      <div class="setting-item">
        <label>字体大小</label>
        <input type="range" v-model="fontSize" min="12" max="48" step="2" class="size-slider">
        <span>{{ fontSize }}px</span>
      </div>

      <!-- 透明度调节 -->
      <div class="setting-item">
        <label>透明度</label>
        <input type="range" v-model="opacity" min="0.3" max="1" step="0.1" class="opacity-slider">
        <span>{{ Math.round(opacity * 100) }}%</span>
      </div>

      <!-- 背景开关 -->
      <div class="setting-item">
        <label>背景</label>
        <button @click="showBackground = !showBackground" :class="['toggle-btn', { active: showBackground }]">
          {{ showBackground ? '开启' : '关闭' }}
        </button>
      </div>

      <!-- 关闭按钮 -->
      <div class="setting-item">
        <button @click="$emit('close')" class="close-btn">
          关闭歌词
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LyricsBox',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    lyrics: {
      type: String,
      default: ''
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  data() {
    return {
      // 位置
      position: {
        x: 50,  // 百分比
        y: 80   // 百分比
      },

      // 样式设置
      fontSize: 30,
      opacity: 0.9,
      showBackground: false,
      showSettings: false,

      // 拖拽状态
      isDragging: false,
      dragStart: {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
      }
    };
  },
  computed: {
    boxStyle() {
      return {
        position: 'fixed',
        left: `${this.position.x}%`,
        top: `${this.position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        userSelect: 'none',
        cursor: this.isDragging ? 'grabbing' : 'grab',
        transition: this.isDragging ? 'none' : 'all 0.3s ease'
      };
    },
    textStyle() {
      return {
        fontSize: `${this.fontSize}px`,
        opacity: this.opacity,
        background: this.showBackground ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
        textShadow: this.showBackground ? 'none' : '2px 2px 4px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8)'
      };
    }
  },
  mounted() {
    // 设置初始位置
    this.setInitialPosition();

    // 添加全局事件监听
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('touchmove', this.onTouchMove, { passive: false });
    document.addEventListener('touchend', this.onTouchEnd);
  },
  beforeUnmount() {
    // 清理事件监听
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  },
  methods: {
    setInitialPosition() {
      if (this.isMobile) {
        this.position = { x: 50, y: 85 };
        this.fontSize = 16;
      } else {
        this.position = { x: 50, y: 80 };
      }
    },

    // 开始拖拽
    startDrag(event) {
      // 阻止双击时的拖拽
      if (event.detail === 2) return;

      this.isDragging = true;
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      this.dragStart = {
        x: clientX,
        y: clientY,
        startX: this.position.x,
        startY: this.position.y
      };

      event.preventDefault();
    },

    onMouseMove(event) {
      if (!this.isDragging) return;

      const deltaX = event.clientX - this.dragStart.x;
      const deltaY = event.clientY - this.dragStart.y;

      // 转换为百分比
      const deltaXPercent = (deltaX / window.innerWidth) * 100;
      const deltaYPercent = (deltaY / window.innerHeight) * 100;

      let newX = this.dragStart.startX + deltaXPercent;
      let newY = this.dragStart.startY + deltaYPercent;

      // 边界检查
      newX = Math.max(5, Math.min(95, newX));
      newY = Math.max(5, Math.min(95, newY));

      this.position.x = newX;
      this.position.y = newY;
    },

    onTouchMove(event) {
      if (!this.isDragging) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragStart.x;
      const deltaY = touch.clientY - this.dragStart.y;

      // 转换为百分比
      const deltaXPercent = (deltaX / window.innerWidth) * 100;
      const deltaYPercent = (deltaY / window.innerHeight) * 100;

      let newX = this.dragStart.startX + deltaXPercent;
      let newY = this.dragStart.startY + deltaYPercent;

      // 边界检查
      newX = Math.max(5, Math.min(95, newX));
      newY = Math.max(5, Math.min(95, newY));

      this.position.x = newX;
      this.position.y = newY;

      event.preventDefault();
    },

    onMouseUp() {
      this.isDragging = false;
    },

    onTouchEnd() {
      this.isDragging = false;
    },

    // 切换设置面板
    toggleSettings() {
      this.showSettings = !this.showSettings;
    }
  }
};
</script>

<style scoped>
.subtitle-lyrics-box {
  max-width: 80vw;
  pointer-events: auto;
}

.lyrics-subtitle-text {
  color: #ffffff;
  font-weight: 600;
  text-align: center;
  line-height: 1.4;
  padding: 8px 16px;
  border-radius: 6px;
  backdrop-filter: blur(10px);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  min-width: 100px;
  max-width: 80vw;
}

.lyrics-subtitle-text:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.lyrics-subtitle-text:active {
  cursor: grabbing;
  transform: scale(0.98);
}

/* 设置面板 */
.lyrics-settings-panel {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 16px;
  min-width: 250px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1001;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #ffffff;
  font-size: 14px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  font-weight: 500;
  min-width: 60px;
}

.size-slider,
.opacity-slider {
  flex: 1;
  margin: 0 12px;
  height: 4px;
  border-radius: 2px;
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  -webkit-appearance: none;
  appearance: none;
}

.size-slider::-webkit-slider-thumb,
.opacity-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.size-slider::-moz-range-thumb,
.opacity-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.toggle-btn {
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toggle-btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.close-btn {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid rgba(255, 99, 99, 0.5);
  background: rgba(255, 99, 99, 0.1);
  color: #ff6363;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 99, 99, 0.2);
  border-color: rgba(255, 99, 99, 0.7);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .lyrics-subtitle-text {
    font-size: 16px !important;
    padding: 6px 12px;
    max-width: 90vw;
  }

  .lyrics-settings-panel {
    top: -180px;
    min-width: 200px;
    padding: 12px;
  }

  .setting-item {
    font-size: 13px;
    margin-bottom: 10px;
  }
}

/* 无障碍和触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .lyrics-subtitle-text:hover {
    transform: none;
  }

  .lyrics-subtitle-text:active {
    transform: scale(0.95);
  }
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.lyrics-settings-panel {
  animation: fadeInUp 0.3s ease;
}
</style>
