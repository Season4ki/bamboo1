<template>
    <div class="bamboo1-typewriter">
        <span class="qm">❝</span>
        <span ref="text" class="msg"></span>
        <span class="qm">❞</span>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Typed from 'typed.js';
import config from '../config.js';

const text = ref(null);
let typed = null;

onMounted(() => {
    let configdata = import.meta.env.VITE_CONFIG
        ? JSON.parse(import.meta.env.VITE_CONFIG)
        : config;

    typed = new Typed(text.value, {
        strings: configdata.typeWriterStrings,
        typeSpeed: 120,
        backSpeed: 60,
        backDelay: 2000,
        startDelay: 500,
        loop: true,
        showCursor: true,
        cursorChar: '▌',
        autoInsertCss: false,
    });
});

onBeforeUnmount(() => {
    if (typed) {
        typed.destroy();
    }
});
</script>

<style scoped>
.bamboo1-typewriter {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.4em;
    font-family: 'Courier New', monospace;
    transform: rotate(-1deg);
}

.msg,
.qm {
    color: #fffa;
    /* 半透明白 */
    font-size: 28px;
    font-weight: 900;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.7), 0 0 15px rgba(255, 200, 50, 0.5);
    /* 光晕效果 */
    letter-spacing: 3px;
}

.msg ::v-deep(.typed-cursor) {
    color: #ffdd55;
    animation: blink 1s infinite;
    margin-left: 3px;
    font-size: 30px;
    font-weight: 100;
}

@keyframes blink {

    0%,
    50%,
    100% {
        opacity: 1;
    }

    25%,
    75% {
        opacity: 0;
    }
}

@media (max-width: 1200px) {

    .msg,
    .qm {
        font-size: 22px;
    }
}

@media (max-width: 960px) {
    .bamboo1-typewriter {
        flex-direction: column;
        gap: 0.2em;
        padding: 1rem 0;
        /* 增加上下内边距，防止被其他元素遮挡 */
        margin: 1rem 0;
        /* 增加上下外边距 */
    }

    .msg,
    .qm {
        font-size: 18px;
    }
}
</style>