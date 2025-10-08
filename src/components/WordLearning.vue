<template>
  <v-container class="word-learning-container pa-4">
    <!-- 单词卡片 -->
    <v-card v-if="currentWord" class="word-card mb-4" elevation="8"
      :style="{ 'backdrop-filter': 'blur(10px)', 'background': 'rgba(255,255,255,0.1)' }">
      <v-card-title class="text-center pa-6">
        <div class="word-title">
          {{ currentWord.word }}
          <v-btn icon size="small" variant="text" @click="playPronunciation"
            :disabled="!currentWord.phonetics?.find(p => p.audio)" class="ml-2">
            <v-icon>mdi-volume-high</v-icon>
          </v-btn>
        </div>

        <!-- 音标 -->
        <div v-if="currentWord.phonetics?.length" class="phonetic-text mt-2">
          {{currentWord.phonetics.find(p => p.text)?.text || currentWord.phonetics[0]?.text}}
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- 词性和释义 -->
        <div v-for="(meaning, index) in currentWord.meanings" :key="index" class="meaning-section mb-4">
          <v-chip class="mb-3" color="primary" variant="tonal">
            {{ meaning.partOfSpeech }}
          </v-chip>

          <!-- 定义 -->
          <div v-for="(definition, defIndex) in meaning.definitions.slice(0, 3)" :key="defIndex"
            class="definition-item mb-3">
            <div class="definition-text">
              <strong>{{ defIndex + 1 }}.</strong> {{ definition.definition }}
            </div>

            <!-- 例句 -->
            <div v-if="definition.example" class="example-text mt-1">
              <em>"{{ definition.example }}"</em>
            </div>

            <!-- 同义词 -->
            <div v-if="definition.synonyms?.length" class="synonyms mt-2">
              <small>
                <strong>同义词:</strong>
                <v-chip v-for="synonym in definition.synonyms.slice(0, 3)" :key="synonym" size="x-small"
                  variant="outlined" class="ma-1">
                  {{ synonym }}
                </v-chip>
              </small>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 加载状态 -->
    <v-card v-else-if="loading" class="text-center pa-8" elevation="4">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
      <div class="mt-4">加载单词中...</div>
    </v-card>

    <!-- 错误状态 -->
    <v-card v-else-if="error" class="text-center pa-8" elevation="4" color="error">
      <v-icon size="64" class="mb-4">mdi-alert-circle</v-icon>
      <div class="text-h6 mb-2">{{ error }}</div>
      <v-btn @click="searchRandomWord" variant="outlined">重试</v-btn>
    </v-card>

    <!-- 控制按钮 -->
    <div class="controls-section">
      <v-row align="center" justify="center" class="mb-4">
        <v-col cols="12" sm="8" md="6">
          <v-text-field v-model="searchWord" label="搜索单词" prepend-inner-icon="mdi-magnify" variant="outlined"
            @keyup.enter="searchSpecificWord" clearable class="search-input"></v-text-field>
        </v-col>
      </v-row>

      <v-row align="center" justify="center">
        <v-col cols="auto">
          <v-btn @click="searchSpecificWord" :disabled="!searchWord || loading" color="primary"
            prepend-icon="mdi-magnify" variant="elevated" class="ma-1">
            搜索
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn @click="searchRandomWord" :disabled="loading" color="secondary" prepend-icon="mdi-shuffle"
            variant="elevated" class="ma-1">
            随机单词
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn @click="addToFavorites" :disabled="!currentWord || loading" :color="isFavorite ? 'red' : 'grey'"
            :prepend-icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'" variant="elevated" class="ma-1">
            {{ isFavorite ? '已收藏' : '收藏' }}
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- 收藏列表 -->
    <v-expansion-panels v-if="favorites.length" class="mt-4">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon class="mr-2">mdi-heart</v-icon>
          我的收藏 ({{ favorites.length }})
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-chip-group column>
            <v-chip v-for="word in favorites" :key="word" @click="searchWord = word; searchSpecificWord()"
              variant="outlined" clickable class="ma-1">
              {{ word }}
              <v-icon @click.stop="removeFromFavorites(word)" size="small" class="ml-1">
                mdi-close
              </v-icon>
            </v-chip>
          </v-chip-group>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- 隐藏的音频元素 -->
    <audio ref="audioPlayer" style="display: none;"></audio>
  </v-container>
</template>

<script>
export default {
  name: 'WordLearning',
  data() {
    return {
      currentWord: null,
      searchWord: '',
      loading: false,
      error: null,
      favorites: [],

      // 随机单词列表
      randomWords: [
        'serendipity', 'eloquent', 'fascinating', 'magnificent', 'brilliant',
        'adventure', 'beautiful', 'creative', 'delicious', 'extraordinary',
        'fantastic', 'gorgeous', 'harmonious', 'incredible', 'joyful',
        'knowledge', 'luminous', 'marvelous', 'nostalgic', 'optimistic',
        'peaceful', 'quaint', 'radiant', 'spectacular', 'triumphant',
        'unique', 'vivacious', 'wonderful', 'xenial', 'zealous'
      ]
    }
  },

  computed: {
    isFavorite() {
      return this.currentWord && this.favorites.includes(this.currentWord.word.toLowerCase())
    }
  },

  mounted() {
    this.loadFavorites()
    this.searchRandomWord()
  },

  methods: {
    async searchSpecificWord() {
      if (!this.searchWord.trim()) return

      this.loading = true
      this.error = null

      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${this.searchWord.trim()}`)

        if (!response.ok) {
          throw new Error('单词未找到，请检查拼写')
        }

        const data = await response.json()
        this.currentWord = data[0]
        this.searchWord = ''

      } catch (err) {
        this.error = err.message || '获取单词信息失败'
        this.currentWord = null
      } finally {
        this.loading = false
      }
    },

    async searchRandomWord() {
      const randomWord = this.randomWords[Math.floor(Math.random() * this.randomWords.length)]
      this.searchWord = randomWord
      await this.searchSpecificWord()
    },

    playPronunciation() {
      if (!this.currentWord?.phonetics) return

      const audioPhonetic = this.currentWord.phonetics.find(p => p.audio)
      if (audioPhonetic?.audio) {
        const audio = this.$refs.audioPlayer
        audio.src = audioPhonetic.audio
        audio.play().catch(err => {
          console.error('播放发音失败:', err)
        })
      }
    },

    addToFavorites() {
      if (!this.currentWord) return

      const word = this.currentWord.word.toLowerCase()

      if (this.isFavorite) {
        this.removeFromFavorites(word)
      } else {
        this.favorites.unshift(word)
        this.saveFavorites()
      }
    },

    removeFromFavorites(word) {
      this.favorites = this.favorites.filter(fav => fav !== word)
      this.saveFavorites()
    },

    saveFavorites() {
      localStorage.setItem('word-learning-favorites', JSON.stringify(this.favorites))
    },

    loadFavorites() {
      try {
        const saved = localStorage.getItem('word-learning-favorites')
        if (saved) {
          this.favorites = JSON.parse(saved)
        }
      } catch (err) {
        console.error('加载收藏列表失败:', err)
        this.favorites = []
      }
    }
  }
}
</script>

<style scoped>
.word-learning-container {
  max-width: 800px;
  margin: 0 auto;
}

.word-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.word-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.phonetic-text {
  font-size: 1.2rem;
  color: #e0e0e0;
  font-style: italic;
}

.meaning-section {
  border-left: 3px solid rgba(255, 255, 255, 0.3);
  padding-left: 16px;
  margin-left: 8px;
}

.definition-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #ffffff;
  margin-bottom: 8px;
}

.example-text {
  font-size: 0.9rem;
  color: #b0b0b0;
  padding-left: 16px;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
}

.synonyms {
  padding-left: 16px;
}

.controls-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-input {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

/* 移动端适配 */
@media (max-width: 600px) {
  .word-title {
    font-size: 2rem;
  }

  .phonetic-text {
    font-size: 1rem;
  }

  .definition-text {
    font-size: 0.9rem;
  }

  .controls-section {
    padding: 16px;
  }
}
</style>
