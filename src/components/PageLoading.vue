<template>
  <transition name="pl-fade" @after-leave="$emit('after-leave')">
    <div v-if="visible" class="pl-overlay" role="status" aria-live="polite">
      <div class="pl-content">
        <img class="pl-icon" src="/img/loader.svg" alt="loading" />
        <div class="pl-text">正在加载，请稍候…</div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PageLoading',
  props: {
    visible: { type: Boolean, default: false },
  },
  emits: ['after-leave'],
};
</script>

<style scoped>
.pl-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}
.pl-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.pl-icon {
  width: 56px;
  height: 56px;
  animation: pl-rotate 1s linear infinite;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.25));
}
.pl-text {
  color: #eaeaea;
  font-size: 14px;
  letter-spacing: .5px;
}
@keyframes pl-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.pl-fade-enter-active, .pl-fade-leave-active { transition: opacity .25s ease; }
.pl-fade-enter-from, .pl-fade-leave-to { opacity: 0; }
</style>
