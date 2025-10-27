<template>
    <v-container fluid class="pa-0 tab2">
        <v-tabs v-model="tab" :items="tabs" align-tabs="center" height="25" slider-color="#FFFFFF">
            <template v-slot:tab="{ item }">
                <v-tab :prepend-icon="item.icon" :text="item.text" :value="item.value" class="text-none"></v-tab>
            </template>

            <template v-slot:item="{ item }">
                <v-tabs-window-item :value="item.value" class="pa-4">
                    <div v-if="item.value === 'tab-1'">
                        <v-radio-group v-model="radios" inline>
                            <template v-slot:label>
                                <div class="mb-2 d-flex justify-space-between" style="width: 100%;align-items: center;">
                                    <div class="itemText"><strong :style="smAndDown ? { 'font-size': '13px' } : {}">{{
                                        radios.title }}</strong></div>
                                    <v-menu location="bottom" :offset="[0, 15]">
                                        <template v-slot:activator="{ props }">
                                            <v-btn variant="tonal" v-bind="props"
                                                :density="smAndDown ? 'compact' : 'default'">
                                                <v-icon>mdi-arrow-down-bold-outline</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-card class="d-flex flex-column">
                                            <v-btn variant="tonal" v-for="(item, index) in staticType" :key="index"
                                                @click="switchType(item.type, 'static')">
                                                {{ item.name }}
                                            </v-btn>
                                        </v-card>
                                    </v-menu>
                                </div>

                            </template>
                            <v-row class="scroll-container">
                                <v-col :cols="type == 'mobile' ? 6 : 12" :sm="type == 'mobile' ? 4 : 6"
                                    :md="type == 'mobile' ? 3 : 4" v-for="item in paginatedPICItems" :key="item.preview"
                                    class="d-flex justify-center">
                                    <v-img rounded="lg" @click="radios = item" style="cursor: pointer"
                                        :class="{ 'selected-item': radios === item }"
                                        :max-width="smAndDown ? (type == 'mobile' ? 100 : 200) : (type == 'mobile' ? 160 : 250)"
                                        :max-height="smAndDown ? (type == 'mobile' ? 170 : 120) : (type == 'mobile' ? 272 : 150)"
                                        cover :src=item.preview>
                                        <template v-slot:placeholder>
                                            <v-row align="center" class="fill-height ma-0" justify="center">
                                                <v-progress-circular color="grey-lighten-5"
                                                    indeterminate></v-progress-circular>
                                            </v-row>
                                        </template>
                                    </v-img>
                                </v-col>
                            </v-row>
                        </v-radio-group>
                        <v-pagination v-model="currentPICPage" :length="totalPICPages" @input="updatePICPage"
                            :density="smAndDown ? 'compact' : 'default'"></v-pagination>
                    </div>
                    <div v-if="item.value === 'tab-2'">
                        <v-radio-group v-model="radios" inline>
                            <template v-slot:label>
                                <div class="mb-2 d-flex justify-space-between" style="width: 100%;align-items: center;">
                                    <div class="itemText"><strong :style="smAndDown ? { 'font-size': '13px' } : {}">{{
                                        radios.title }}</strong></div>
                                    <v-menu location="bottom" :offset="[0, 15]">
                                        <template v-slot:activator="{ props }">
                                            <v-btn variant="tonal" :density="smAndDown ? 'compact' : 'default'"
                                                v-bind="props">
                                                <v-icon>mdi-arrow-down</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-card class="d-flex flex-column">
                                            <v-btn variant="tonal" v-for="(item, index) in staticType" :key="index"
                                                @click="switchType(item.type, 'dynamic')">
                                                {{ item.name }}
                                            </v-btn>
                                        </v-card>
                                    </v-menu>
                                </div>
                            </template>
                            <v-row class="scroll-container">
                                <v-col :cols="type == 'mobile' ? 6 : 12" :sm="type == 'mobile' ? 4 : 6"
                                    :md="type == 'mobile' ? 3 : 4" v-for="item in paginatedVDItems" :key="item.preview"
                                    class="d-flex justify-center">
                                    <div class="video-container" @click="radios = item" style="cursor: pointer">
                                        <!-- 加载提示 -->
                                        <div v-if="!item.loaded" class="loading-spinner">
                                            <v-progress-circular indeterminate></v-progress-circular>
                                        </div>
                                        <video autoplay loop muted @click="item = radios"
                                            :class="{ 'selected-item': radios === item }"
                                            :style="type == 'mobile' ? (smAndDown ? { width: '100px', height: '170px' } : { width: '160px', height: '272px' }) : (smAndDown ? { width: '200px' } : { width: '250px' })"
                                            style="object-fit: cover;" rounded="lg" @loadeddata="item.loaded = true">
                                            <source :src=item.preview type="video/mp4">
                                        </video>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-radio-group>

                        <v-pagination v-model="currentVDPage" :length="totalVDPages" @input="updateVDPage"
                            :density="smAndDown ? 'compact' : 'default'"></v-pagination>
                    </div>
                </v-tabs-window-item>
            </template>
        </v-tabs>
        <div style="text-align: center;font-size: 12px;"><span>異なる壁紙がそれぞれのデバイスに応じて反応する</span></div>
    </v-container>
    <div class="d-flex justify-center mt-3">
        <v-btn :loading="loading1" variant="tonal" class="ma-2" @click="redefault()">戻り</v-btn>
        <v-btn :loading="loading3" variant="tonal" class="ma-2" @click="cancel()">キャンセル</v-btn>
        <v-btn :loading="loading2" variant="tonal" class="ma-2" @click="submitdata()">確定</v-btn>
    </div>

    <v-snackbar :timeout="2000" color="info" rounded="pill" location="top" v-model="snackbar">
        壁紙を選んでください
    </v-snackbar>
</template>

<script>
import { useDisplay } from 'vuetify';
import { setCookie, getCookie, eraseCookie } from '../../utils/cookieUtils.js';
import config from '../../config.js';
export default {
    emits: ['cancel'],
    setup() {
        const { smAndDown } = useDisplay();
        return { smAndDown };
    },
    data() {
        return {
            loading1: false,
            loading2: false,
            loading3: false,
            snackbar: false,
            configdata: config,
            background: { 'pc': {}, 'mobile': {} },
            wallpaperPIC: null,
            wallpaperVD: null,
            radios: {},
            currentVDPage: 1,
            currentPICPage: 1,
            itemsPerPage: 6, // 每页显示的item数量
            tab: null,
            tabs: [
                {
                    icon: 'mdi-panorama-outline',
                    text: '静止画',
                    value: 'tab-1',
                },
                {
                    icon: 'mdi-video-high-definition',
                    text: '動く壁紙',
                    value: 'tab-2',
                },
            ],
            staticType: [
                { type: 'pc', name: 'パソコン壁紙' },
                { type: 'mobile', name: 'スマホ壁紙' },
            ],
            type: this.smAndDown ? 'mobile' : 'pc'
        }
    },
    mounted() {
        if (import.meta.env.VITE_CONFIG) {
            this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
        }
        // 根据屏幕大小初始化壁纸和分页
        if (this.smAndDown && this.type === 'mobile') {
            this.wallpaperPIC = this.configdata.wallpaper.picMobile;
            this.wallpaperVD = this.configdata.wallpaper.videoMobile;
            this.itemsPerPage = 8;
        } else {
            this.wallpaperPIC = this.configdata.wallpaper.pic;
            this.wallpaperVD = this.configdata.wallpaper.video;
            this.itemsPerPage = 6;
        }
        this.radios.title = "壁紙を選んでください";
    },
    watch: {
        tab(val) {
            // 在移动端时默认选择 mobile，桌面端选择 pc
            this.type = this.smAndDown ? 'mobile' : 'pc';
            if (this.smAndDown && this.type === 'mobile') {
                this.itemsPerPage = 8;
            } else {
                this.itemsPerPage = 6;
            }
            if (val == 'tab-1') {
                if (this.smAndDown && this.type === 'mobile') {
                    this.wallpaperPIC = this.configdata.wallpaper.picMobile;
                } else {
                    this.wallpaperPIC = this.configdata.wallpaper.pic;
                }
            } else {
                if (this.smAndDown && this.type === 'mobile') {
                    this.wallpaperVD = this.configdata.wallpaper.videoMobile;
                } else {
                    this.wallpaperVD = this.configdata.wallpaper.video;
                }
            }
        }
    },
    computed: {
        // 计算总页数
        totalVDPages() {
            return Math.ceil(this.wallpaperVD.length / this.itemsPerPage);
        },
        totalPICPages() {
            return Math.ceil(this.wallpaperPIC.length / this.itemsPerPage);
        },
        // 计算当前页显示的item
        paginatedPICItems() {
            const start = (this.currentPICPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.wallpaperPIC.slice(start, end);
        },
        paginatedVDItems() {
            const start = (this.currentVDPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.wallpaperVD.slice(start, end);
        },
    },
    methods: {
        setCookie,
        getCookie,
        eraseCookie,
        submitdata() {
            if (!this.radios.url) {
                this.snackbar = true;
                return;
            }
            let bamboo1databackground = this.getCookie("bamboo1databackground");
            delete this.radios.loaded;
            if (this.type == 'mobile') {
                this.background.mobile.type = this.tab === 'tab-1' ? 'pic' : 'video';
                this.background.mobile.datainfo = this.radios;
                if (bamboo1databackground) {
                    this.background.pc = bamboo1databackground.pc;
                } else {
                    this.background.pc = this.configdata.background.pc;
                }
            } else {
                this.background.pc.type = this.tab === 'tab-1' ? 'pic' : 'video';
                this.background.pc.datainfo = this.radios;
                if (bamboo1databackground) {
                    this.background.mobile = bamboo1databackground.mobile;
                } else {
                    this.background.mobile = this.configdata.background.mobile;
                }
            }

            this.loading2 = true
            setTimeout(() => {
                this.loading = false;
                this.setCookie('bamboo1databackground', this.background, 0.005);
                location.reload();
            }, 800)
        },
        redefault() {
            this.loading1 = true
            setTimeout(() => {
                this.loading = false;
                this.eraseCookie('bamboo1databackground');
                location.reload();
            }, 800)
        },
        cancel() {
            this.$emit('cancel');
        },
        // 更新当前页
        updateVDPage(page) {
            this.currentVDPage = page;
        },
        updatePICPage(page) {
            this.currentPICPage = page;
        },
        switchType(type, tabtype) {
            if (tabtype == 'static') {
                if (type == 'mobile') {
                    this.type = 'mobile';
                    this.itemsPerPage = 8;
                    this.wallpaperPIC = this.configdata.wallpaper.picMobile;
                } else if (type == 'pc') {
                    this.type = 'pc';
                    this.itemsPerPage = 6;
                    this.wallpaperPIC = this.configdata.wallpaper.pic;
                }
                this.currentPICPage = 1;;
            } else {
                if (type == 'mobile') {
                    this.type = 'mobile';
                    this.itemsPerPage = 8;
                    this.wallpaperVD = this.configdata.wallpaper.videoMobile;
                } else if (type == 'pc') {
                    this.type = 'pc';
                    this.itemsPerPage = 6;
                    this.wallpaperVD = this.configdata.wallpaper.video;
                }
                this.currentVDPage = 1;
            }
        },
    },

}
</script>
<style scoped>
@import url(/css/mobile.css);
</style>
<style scoped>
/* ======= 基础组件样式 ======= */

video {
    pointer-events: none;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.itemText {
    width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    letter-spacing: 0.5px;
}

.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    padding: 16px;
    backdrop-filter: blur(10px);
}

.video-container {
    position: relative;
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    overflow: hidden;
}

.scroll-container {
    max-height: 320px;
    overflow-y: auto;
    padding: 8px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

/* ======= Vuetify风格的现代化样式 ======= */

/* 主容器样式 */
.tab2 {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 选项卡样式 */
.tab2 .v-tabs {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(15px);
    border-radius: 12px;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.tab2 .v-tab {
    color: rgba(255, 255, 255, 0.8) !important;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab2 .v-tab:hover {
    color: rgba(255, 255, 255, 0.95) !important;
    background: rgba(255, 255, 255, 0.1);
}

.tab2 .v-tab--selected {
    color: #FFFFFF !important;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

/* 标题区域样式 */
.itemText {
    width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    letter-spacing: 0.5px;
}

/* 下拉菜单按钮样式 */
.tab2 .v-btn[variant="tonal"] {
    background: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.tab2 .v-btn[variant="tonal"]:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
}

/* 卡片菜单样式 */
.tab2 .v-card {
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.tab2 .v-card .v-btn {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.9) !important;
    border-radius: 8px;
    margin: 4px;
    transition: all 0.3s ease;
}

.tab2 .v-card .v-btn:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    color: #FFFFFF !important;
    transform: translateX(4px);
}

/* 滚动容器样式 */
.scroll-container {
    max-height: 320px;
    overflow-y: auto;
    padding: 8px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 现代化滚动条样式 */
.scroll-container::-webkit-scrollbar {
    width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    transition: background 0.3s ease;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

/* 图片和视频容器样式 */
.tab2 .v-img,
.video-container {
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
}

.tab2 .v-img:hover,
.video-container:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
}

/* 选中状态样式 */
.selected-item {
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
    box-shadow:
        0 0 20px rgba(255, 255, 255, 0.4),
        0 8px 25px rgba(0, 0, 0, 0.3) !important;
    transform: translateY(-2px) scale(1.05);
    background: rgba(255, 255, 255, 0.1);
}

/* 视频样式 */
video {
    pointer-events: none;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.video-container {
    position: relative;
    display: flex;
    background: rgba(255, 255, 255, 0.05);
}

/* 加载动画样式 */
.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    padding: 16px;
    backdrop-filter: blur(10px);
}

.loading-spinner .v-progress-circular {
    color: rgba(255, 255, 255, 0.9) !important;
}

/* 分页器样式 */
.tab2 .v-pagination {
    margin-top: 16px;
}

.tab2 .v-pagination .v-btn {
    background: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin: 0 2px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.tab2 .v-pagination .v-btn:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    color: #FFFFFF !important;
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
}

.tab2 .v-pagination .v-btn--active {
    background: rgba(255, 255, 255, 0.3) !important;
    color: #FFFFFF !important;
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

/* 底部提示文字样式 */
.tab2+div span {
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.05);
    padding: 8px 16px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: 500;
    letter-spacing: 0.5px;
}

/* 底部按钮区域样式 */
.tab2~.d-flex .v-btn {
    background: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(15px);
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 80px;
}

.tab2~.d-flex .v-btn:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.1);
}

.tab2~.d-flex .v-btn:active {
    transform: translateY(0);
}

/* Snackbar 样式 */
.v-snackbar {
    backdrop-filter: blur(20px) !important;
}

.v-snackbar .v-snackbar__content {
    background: rgba(33, 150, 243, 0.9) !important;
    color: #FFFFFF !important;
    font-weight: 500;
    letter-spacing: 0.5px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 25px;
    box-shadow: 0 8px 32px rgba(33, 150, 243, 0.3);
}

/* 响应式设计 */
@media (max-width: 600px) {
    .tab2 {
        margin: 8px;
        padding: 12px;
    }

    .scroll-container {
        max-height: 280px;
        padding: 6px;
    }

    .tab2 .v-img,
    .video-container {
        border-radius: 8px;
    }

    .selected-item {
        transform: translateY(-1px) scale(1.03);
    }
}
/* 小屏幕高度优化 - 防止按钮被遮挡 */
@media (max-height: 660px) {
    .scroll-container {
        max-height: 180px !important;
    }
    
    .tab2 {
        padding: 8px !important;
    }
    
    .tab2 .v-tabs {
        margin-bottom: 12px !important;
    }
    
    .tab2 .v-pagination {
        margin-top: 8px !important;
    }
    
    /* 让底部按钮更紧凑 */
    .tab2 ~ .d-flex {
        margin-top: 8px !important;
    }
    
    .tab2 ~ .d-flex .v-btn {
        min-width: 60px !important;
        padding: 6px 12px !important;
    }
}

/* 极小屏幕优化 */
@media (max-height: 600px) {
    .scroll-container {
        max-height: 140px !important;
    }
    
    .tab2+div {
        display: none; /* 隐藏提示文字节省空间 */
    }
}
/* 进入动画 */
.tab2 .v-tabs-window-item {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
