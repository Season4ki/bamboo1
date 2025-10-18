<template>
  <v-container class="word-learning-container pa-4">
    <!-- 単語カード -->
    <v-card v-if="currentWord" class="word-card mb-4" elevation="8"
      :style="{ 'backdrop-filter': 'blur(15px)', 'background': 'rgba(0,0,0,0.4)' }">
      <v-card-title class="text-center pa-6">
        <div class="word-title">
          {{ currentWord.word }}
        </div>

        <!-- 発音記号 -->
        <div v-if="currentWord.phonetics?.length" class="phonetic-text mt-2">
          {{currentWord.phonetics.find(p => p.text)?.text || currentWord.phonetics[0]?.text || ''}}
        </div>

        <!-- ソース情報 (Free Dictionary API) -->
        <div v-if="currentWord.sourceUrls?.length" class="source-info mt-2">
          <small>
            <a :href="currentWord.sourceUrls[0]" target="_blank" rel="noopener" class="source-link">
              <v-icon size="small" class="mr-1">mdi-open-in-new</v-icon>
              Wiktionary で詳細を見る
            </a>
          </small>
        </div>

        <!-- API情報 -->
        <div class="api-info mt-1">
          <small style="color: #999; font-size: 0.75rem;">
            Powered by FreeDictionaryAPI.com
          </small>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- 品詞と意味 -->
        <div v-for="(meaning, index) in currentWord.meanings" :key="index" class="meaning-section mb-4">
          <v-chip class="mb-3" color="primary" variant="tonal">
            {{ meaning.partOfSpeech }}
          </v-chip>

          <!-- 定義 -->
          <div v-for="(definition, defIndex) in meaning.definitions.slice(0, 3)" :key="defIndex"
            class="definition-item mb-3">
            <div class="definition-text">
              <strong>{{ defIndex + 1 }}.</strong> {{ definition.definition }}
            </div>

            <!-- 例文 -->
            <div v-if="definition.example" class="example-text mt-1">
              <em>"{{ definition.example }}"</em>
            </div>

            <!-- 類義語 -->
            <div v-if="definition.synonyms?.length" class="synonyms mt-2">
              <small>
                <strong>類義語:</strong>
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

    <!-- ローディング状態 -->
    <v-card v-else-if="loading" class="text-center pa-8" elevation="4"
      :style="{ 'backdrop-filter': 'blur(15px)', 'background': 'rgba(0,0,0,0.4)' }">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <div class="mt-4 loading-text">単語を読み込み中...</div>
    </v-card>

    <!-- エラー状態 -->
    <v-card v-else-if="error" class="text-center pa-8" elevation="4"
      :style="{ 'backdrop-filter': 'blur(15px)', 'background': 'rgba(139,0,0,0.4)' }">
      <v-icon size="64" class="mb-4" color="error">mdi-alert-circle</v-icon>
      <div class="text-h6 mb-2 error-text">{{ error }}</div>
      <v-btn @click="searchRandomWord" variant="outlined" color="error">再試行</v-btn>
    </v-card>

    <!-- コントロールボタン -->
    <div class="controls-section">
      <v-row align="center" justify="center" class="mb-4">
        <v-col cols="12" sm="8" md="6">
          <v-text-field v-model="searchWord" label="単語を検索" prepend-inner-icon="mdi-magnify" variant="outlined"
            @keyup.enter="searchSpecificWord" clearable class="search-input"></v-text-field>
        </v-col>
      </v-row>

      <v-row align="center" justify="center">
        <v-col cols="auto">
          <v-btn @click="searchSpecificWord" :disabled="!searchWord || loading" color="primary"
            prepend-icon="mdi-magnify" variant="elevated" class="ma-1">
            検索
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn @click="searchRandomWord" :disabled="loading" color="secondary" prepend-icon="mdi-shuffle"
            variant="elevated" class="ma-1">
            ランダム単語
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn @click="addToFavorites" :disabled="!currentWord || loading" :color="isFavorite ? 'red' : 'grey'"
            :prepend-icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'" variant="elevated" class="ma-1">
            {{ isFavorite ? 'お気に入り済み' : 'お気に入り' }}
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- お気に入りリスト -->
    <v-expansion-panels v-if="favorites.length" class="mt-4 favorites-panel">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon class="mr-2">mdi-heart</v-icon>
          お気に入り ({{ favorites.length }})
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
  </v-container>
</template>

<script>
import { buildApiUrl, transformApiResponse, DICTIONARY_API_CONFIG } from '../utils/dictionaryApi.js'

/**
 * WordLearning Component
 * 使用 Free Dictionary API (https://freedictionaryapi.com/)
 * API エンドポイント: https://freedictionaryapi.com/api/v1/entries/{language}/{word}
 * API 仕様: src/utils/dictionaryApi.js (OpenAPI 3.1.1 準拠)
 */
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
        // Free Dictionary API を使用 (freedictionaryapi.com)
        const apiUrl = buildApiUrl(
          DICTIONARY_API_CONFIG.defaultLanguage,
          this.searchWord.trim()
        )

        const response = await fetch(apiUrl)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('単語が見つかりません。スペルをご確認ください')
          }
          throw new Error('単語情報の取得に失敗しました')
        }

        const data = await response.json()

        // Free Dictionary API のレスポンスを変換
        this.currentWord = transformApiResponse(data)
        this.searchWord = ''

      } catch (err) {
        this.error = err.message || '単語情報の取得に失敗しました'
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
        console.error('お気に入りリストの読み込みに失敗しました:', err)
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
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.word-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.phonetic-text {
  font-size: 1.2rem;
  color: #f0f0f0;
  font-style: italic;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.source-info {
  margin-top: 8px;
}

.source-link {
  color: #90caf9;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: color 0.3s ease;
}

.source-link:hover {
  color: #64b5f6;
  text-decoration: underline;
}

.api-info {
  text-align: center;
  opacity: 0.7;
}

.meaning-section {
  border-left: 3px solid rgba(255, 255, 255, 0.4);
  padding-left: 16px;
  margin-left: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.definition-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #ffffff;
  margin-bottom: 8px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.example-text {
  font-size: 0.9rem;
  color: #d0d0d0;
  padding-left: 16px;
  border-left: 2px solid rgba(255, 255, 255, 0.3);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.synonyms {
  padding-left: 16px;
}

.controls-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.search-input {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

/* 新しいスタイルクラス */
.loading-text {
  color: #ffffff;
  font-size: 1.1rem;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.error-text {
  color: #ffcccb;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.favorites-panel {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 移動端対応 */
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
