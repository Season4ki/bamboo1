<template>
    <div class="mjc-typewriter">
        <span class="qm">❝</span>
        <span ref="text" class="msg"></span>
        <span class="qm">❞</span>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TypeIt from 'typeit';
import config from '../config.js';

const text = ref(null);

onMounted(() => {
    let configdata = import.meta.env.VITE_CONFIG
        ? JSON.parse(import.meta.env.VITE_CONFIG)
        : config;

    new TypeIt(text.value, {
        strings: configdata.typeWriterStrings,
        cursorChar: "<span class='cursorChar'>▌</span>",
        speed: 120,
        lifeLike: true,
        cursor: true,
        breakLines: false,
        loop: true,
    }).go();
});
</script>

<style scoped>
.mjc-typewriter {
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

.msg ::v-deep(.cursorChar) {
    color: #ffdd55;
    animation: blink 1s infinite;
    margin-left: 3px;
    font-size: 30px;
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
    .mjc-typewriter {
        flex-direction: column;
        gap: 0.2em;
    }

    .msg,
    .qm {
        font-size: 18px;
    }
}
</style>