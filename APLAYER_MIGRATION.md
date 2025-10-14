# APlayer 单一实例迁移说明

## 更新概述
已将头像播放器从原生 HTML5 audio 元素迁移到 APlayer，实现了整个应用使用单一 APlayer 实例，确保两个播放器完全同步。

## 主要改动

### 1. App.vue 模板更新
- **移除**：头像播放器控制面板中的原生 `<audio>` 元素
- **移除**：加载状态指示器（`audioLoading` 相关代码）
- **简化**：头像播放器现在只保留控制按钮和歌曲信息显示
- **同步**：移动端和桌面端头像播放器统一使用 APlayer 控制

### 2. app.js 核心逻辑更新

#### 移除的变量和功能
- `audioLoading` - 原生音频加载状态
- `audioPlayer` - 原生 audio 元素引用
- `audioTimeUpdateHandler` - 原生音频时间更新处理器
- `setupAudioListener()` - 原生音频监听器设置
- `updateAudio()` - 原生音频更新方法
- `onWaiting()` - 原生音频等待回调
- `onCanPlay()` - 原生音频可播放回调

#### 更新的方法

**`togglePlay()`**
```javascript
// 旧版本：同时支持原生和 APlayer
// 新版本：仅使用 APlayer
if (useAPlayer.value && aplayerInstance.value) {
  aplayerInstance.value.toggle();
} else {
  // 如果 APlayer 未初始化，引导用户打开音乐播放器
  dialog1.value = true;
  tab.value = 'tab-3';
}
```

**`previousTrack()` 和 `nextTrack()`**
```javascript
// 旧版本：根据 useAPlayer 切换不同逻辑
// 新版本：仅使用 APlayer 的 skipBack() 和 skipForward()
// 如果未初始化，显示提示信息
```

**`onAPlayerReady()`**
```javascript
// 移除了暂停原生播放器的逻辑
// 因为不再有原生播放器
```

**`onAPlayerPlay()` 和 `onAPlayerPause()`**
```javascript
// 简化逻辑，移除原生播放器暂停代码
// 仅同步 isPlaying 状态
```

**`onAPlayerDestroy()`**
```javascript
// 添加：isPlaying.value = false
// 确保销毁时重置播放状态
```

#### 监听器更新
- **移除**：`watch(audioLoading, ...)` - 不再需要监听原生音频加载
- **保留**：其他监听器保持不变

#### 生命周期更新
**onMounted**
```javascript
// 移除：setupAudioListener()
// 保留：await getMusicInfo()
```

**onBeforeUnmount**
```javascript
// 移除：原生音频事件监听器清理
// 保留：APlayer 相关清理
```

### 3. tab3.vue 组件更新
- **移除 prop**：`audioPlayer` - 不再需要接收原生音频元素
- **保持**：所有其他 props 和逻辑保持不变

### 4. 工作流程

#### 初始化流程
1. 应用启动，加载音乐信息
2. 用户打开设置对话框并切换到"音乐再生"标签
3. tab3.vue 组件挂载，创建 APlayer 实例
4. APlayer 实例通过 `@aplayer-ready` 事件传递给 App.vue
5. App.vue 存储实例引用并设置 `useAPlayer = true`
6. 启动同步定时器，监控播放状态

#### 播放控制流程
1. 用户在头像播放器点击播放/暂停/上一首/下一首
2. 头像播放器调用 App.vue 的控制方法
3. 控制方法检查 `useAPlayer` 和 `aplayerInstance`
4. 如果已初始化，直接操作 APlayer 实例
5. 如果未初始化，打开设置对话框并切换到音乐播放标签
6. APlayer 的事件监听器捕获状态变化
7. 通过 emit 同步状态到 App.vue
8. App.vue 更新头像播放器显示（歌曲信息、播放图标、旋转动画）

#### 状态同步机制
- **单向数据流**：APlayer → App.vue → 头像播放器
- **防止循环更新**：tab3.vue 使用 `isInternalUpdate` 标志
- **多重同步**：
  - 播放/暂停状态：通过 `isPlaying` 响应式变量
  - 当前歌曲索引：通过 `playlistIndex` 响应式变量
  - 播放进度：通过 `currentPlayTime` 响应式变量
  - 歌曲信息：通过 `updateAvatarPlayerInfo()` 方法

### 5. 优势

#### 统一管理
- 整个应用只有一个音频播放器实例
- 避免了两个播放器同时播放的冲突
- 简化了代码逻辑和状态管理

#### 完美同步
- 头像播放器和音乐播放器显示完全一致
- 任一处控制都会同步到另一处
- 播放进度、播放状态、歌曲信息实时同步

#### 用户体验
- 首次使用时引导用户打开音乐播放器
- 之后可通过头像播放器快速控制
- 旋转动画、歌曲信息即时响应

#### 代码质量
- 移除了冗余的原生音频代码
- 减少了条件判断和兼容性代码
- 提高了可维护性

## 使用说明

### 初次使用
1. 打开应用
2. 点击设置按钮（扳手图标）
3. 切换到"音楽再生"标签
4. APlayer 自动初始化并加载歌曲列表
5. 现在可以使用头像播放器控制音乐

### 日常使用
- **播放/暂停**：点击头像或头像上的播放按钮
- **切换歌曲**：使用头像上的上一首/下一首按钮
- **查看列表**：打开设置对话框查看完整播放列表
- **查看歌词**：点击"歌詞を表示"按钮

## 技术细节

### 事件流
```
用户操作 → 头像播放器控制方法 → APlayer API 调用
                                      ↓
         头像显示更新 ← App.vue 状态 ← APlayer 事件
```

### 关键状态变量
- `aplayerInstance`：APlayer 实例引用
- `useAPlayer`：标记 APlayer 是否已初始化
- `isPlaying`：全局播放状态
- `playlistIndex`：当前播放歌曲索引
- `currentPlayTime`：当前播放时间

### 同步机制
- **定时器同步**：每秒检查一次索引是否变化
- **事件监听**：监听 APlayer 的播放、暂停、切歌事件
- **计算属性**：使用 computed 确保 UI 始终反映最新状态

## 兼容性
- 移动端和桌面端完全兼容
- 支持所有现代浏览器
- APlayer 通过 CDN 加载，无需本地依赖

## 注意事项
1. 首次使用必须先打开音乐播放器标签以初始化 APlayer
2. 关闭设置对话框不会销毁 APlayer 实例
3. 刷新页面会重置播放状态
4. 歌词功能需要歌曲提供 lrc 字段

## 未来改进方向
- [ ] 添加播放历史记录
- [ ] 支持自定义播放列表
- [ ] 添加音量控制到头像播放器
- [ ] 支持拖拽调整播放进度
- [ ] 添加播放模式切换（随机、单曲循环等）
