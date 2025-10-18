/**
 * Dictionary API Configuration
 * 
 * FreeDictionaryAPI.com OpenAPI Specification
 * @see https://freedictionaryapi.com
 * 
 * OpenAPI Version: 3.1.1
 * License: CC BY-SA 4.0
 * Data Source: Wiktionary
 * 
 * API Endpoint: GET /entries/{language}/{word}
 * 
 * @example
 * // 获取单词 "hello" 的英文定义
 * GET https://freedictionaryapi.com/api/v1/entries/en/hello
 * 
 * @example
 * // 带查询参数
 * GET https://freedictionaryapi.com/api/v1/entries/en/hello?translations=true&pretty=true
 * 
 * Response Structure:
 * {
 *   word: string,              // The word being looked up
 *   entries: Entry[],          // Array of dictionary entries
 *   source: {
 *     url: string,             // Link to original Wiktionary page
 *     license: {
 *       name: string,          // "CC BY-SA 4.0"
 *       url: string            // License URL
 *     }
 *   }
 * }
 * 
 * Entry Structure:
 * {
 *   language: { code: string, name: string },
 *   partOfSpeech: string,      // noun, verb, adjective, etc.
 *   pronunciations: [{
 *     type: string,            // "ipa" or "enpr"
 *     text: string,            // Phonetic notation
 *     tags: string[]           // Dialect tags
 *   }],
 *   forms: [{
 *     word: string,            // Different form (plural, past tense, etc.)
 *     tags: string[]           // Form tags
 *   }],
 *   senses: [{
 *     definition: string,      // The definition
 *     tags: string[],          // Usage tags (formal, old-fashioned, etc.)
 *     examples: string[],      // Example sentences
 *     quotes: [{
 *       text: string,          // Quote text
 *       reference: string      // Source reference
 *     }],
 *     synonyms: string[],      // Synonyms for this sense
 *     antonyms: string[],      // Antonyms for this sense
 *     translations: [{
 *       language: { code: string, name: string },
 *       word: string
 *     }],
 *     subsenses: Sense[]       // Recursive subsenses
 *   }],
 *   synonyms: string[],        // Synonyms for the whole entry
 *   antonyms: string[]         // Antonyms for the whole entry
 * }
 */

export const DICTIONARY_API_CONFIG = {
  // API 基础 URL
  baseUrl: 'https://freedictionaryapi.com/api/v1',

  // 默认语言
  defaultLanguage: 'en',

  // API 端点
  endpoints: {
    entries: (language, word) => `/entries/${language}/${word}`,
  },

  // 查询参数选项
  queryOptions: {
    translations: false, // 是否包含翻译
    pretty: false        // 是否格式化 JSON
  },

  // 来源信息
  source: {
    name: 'Free Dictionary API',
    url: 'https://freedictionaryapi.com',
    license: {
      name: 'CC BY-SA 4.0',
      url: 'https://creativecommons.org/licenses/by-sa/4.0/'
    }
  }
}

/**
 * 构建完整的 API URL
 * @param {string} language - 语言代码 (ISO 639-1/639-3)
 * @param {string} word - 要查询的单词
 * @param {object} options - 查询参数
 * @returns {string} 完整的 API URL
 */
export function buildApiUrl(language, word, options = {}) {
  const { baseUrl, endpoints, queryOptions } = DICTIONARY_API_CONFIG
  const endpoint = endpoints.entries(language, word)
  const url = new URL(baseUrl + endpoint)

  // 添加查询参数
  const params = { ...queryOptions, ...options }
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value)
    }
  })

  return url.toString()
}

/**
 * 转换 API 响应为组件内部格式
 * @param {object} apiResponse - Free Dictionary API 的响应
 * @returns {object} 转换后的数据结构
 */
export function transformApiResponse(apiResponse) {
  if (!apiResponse || !apiResponse.word || !apiResponse.entries) {
    throw new Error('Invalid API response structure')
  }

  const { word, entries, source = {} } = apiResponse

  // 按品词分组
  const meaningsByPOS = {}

  entries.forEach(entry => {
    const pos = entry.partOfSpeech || 'unknown'

    if (!meaningsByPOS[pos]) {
      meaningsByPOS[pos] = {
        partOfSpeech: pos,
        definitions: [],
        pronunciations: entry.pronunciations || []
      }
    }

    // 处理词义 (senses)
    entry.senses?.forEach(sense => {
      const definition = {
        definition: sense.definition || '',
        example: sense.examples?.[0] || null,
        synonyms: sense.synonyms || [],
        antonyms: sense.antonyms || []
      }

      // 添加子词义
      if (sense.subsenses && sense.subsenses.length > 0) {
        sense.subsenses.forEach(subsense => {
          meaningsByPOS[pos].definitions.push({
            definition: subsense.definition || '',
            example: subsense.examples?.[0] || null,
            synonyms: subsense.synonyms || [],
            antonyms: subsense.antonyms || []
          })
        })
      }

      meaningsByPOS[pos].definitions.push(definition)
    })
  })

  // 收集发音信息
  const phonetics = []
  const phoneticTexts = new Set()

  entries.forEach(entry => {
    entry.pronunciations?.forEach(pron => {
      if (pron.text && !phoneticTexts.has(pron.text)) {
        phoneticTexts.add(pron.text)
        phonetics.push({
          text: pron.text,
          audio: '', // FreeDictionaryAPI 不提供音频文件
          type: pron.type || 'ipa'
        })
      }
    })
  })

  return {
    word: word,
    phonetics: phonetics,
    meanings: Object.values(meaningsByPOS),
    sourceUrls: source.url ? [source.url] : [],
    license: source.license
  }
}
