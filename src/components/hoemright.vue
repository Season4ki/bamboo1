<template>
  <div>
    <div>
      <div :style="xs || sm ? { 'display': 'none' } : { 'font-size': '4rem' }" class="mjc-left-welcome">{{
        configdata.welcometitle }}</div>
    </div>
    <div>
      <v-row align="center">
        <v-col cols="12" md="8">
          <typewriter class="ma-3 d-flex align-center justify-center" style="min-height: 200px;"></typewriter>
        </v-col>
        <v-col cols="12" md="3" align="center" style="margin-top: -200px;">
          <v-card class="ma-3" hover>
            <template v-slot:title>
              <span class="mjc-card-title clock-font">{{ formattedTime }}</span>
            </template>
            <template v-slot:subtitle>
              <span style="font-weight: bold;">{{ formattedDate }}</span>
            </template>
          </v-card>
        </v-col>
      </v-row>

      <v-chip class="mt-3 ml-3" prepend-icon="mdi-alpha-w-box" size="large"
        style="color: var(--mjc-vcard-color); border-radius: 9999px; padding-left: 16px; padding-right: 16px;"
        @click="showProjectCards = !showProjectCards">
        項目
      </v-chip>
      <v-container v-show="showProjectCards">
        <v-row>
          <v-col v-for="(item, key) in projectcards" cols="6" md="8" lg="3" :style="[
            xs ? { padding: '6px' } : {},
            {
              borderRadius: '50%',
              overflow: 'hidden',
              aspectRatio: '1 / 1'   // 保持正方形，然后通过圆角变椭圆
            }
          ]">
            <v-card class="">
              <v-img aspect-ratio="1.7778" :src="item.img" cover :style="{ opacity: 0.8 }"></v-img>
              <v-card-title
                :style="xs ? { fontSize: '0.9rem', padding: '0.15rem 0.5rem' } : { fontSize: '1.1rem', padding: '0.2rem 0.8rem' }">
                {{ item.title }}
              </v-card-title>
              <v-card-subtitle
                :style="xs ? { fontSize: '0.6rem', padding: '0.1rem 0.5rem' } : { fontSize: '0.8rem', padding: '0.15rem 0.6rem' }">
                {{ item.subtitle }}
              </v-card-subtitle>
              <v-card-actions
                :style="xs || sm || md ? { padding: '0', minHeight: '0', height: '2.5rem' } : { minHeight: '0', height: '2.8rem' }">
                <v-btn :href="item.url" target="_blank" :text="item.go"></v-btn>
                <v-spacer></v-spacer>

              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

    </div>
  </div>
</template>

<script>
import typewriter from '../components/typewriter.vue';
import { useDisplay } from 'vuetify'
import { ref } from 'vue';

export default {
  components: {
    typewriter,
  },
  props: ['configdata', 'formattedTime', 'formattedDate', 'projectcards'],
  setup() {

    const { xs, sm, md } = useDisplay();
    const showProjectCards = ref(true);

    return { xs, sm, md, showProjectCards };
  },
  methods: {
    projectcardsShow(key) {
      for (let i = 0; i < this.projectcards.length; i++) {
        if (i != key) {
          this.projectcards[i].show = false;
        }
      }
    }
  }
};
</script>

<style scoped>
@import url(/css/app.less);
@import url(/css/mobile.less);
</style>
