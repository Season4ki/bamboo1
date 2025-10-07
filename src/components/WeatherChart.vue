<template>
  <v-card class="weather-card" variant="tonal" elevation="3" @dblclick="toggleExpanded">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-weather-partly-cloudy</v-icon>
      <span>{{ locationName || '天気' }}</span>
      <v-spacer></v-spacer>
      <v-btn v-if="weatherData.current" size="x-small" icon @click.stop="getLocationWeather" :loading="locationLoading"
        title="現在位置の天気を取得">
        <v-icon size="small">mdi-crosshairs-gps</v-icon>
      </v-btn>
      <v-btn v-if="weatherData.current" size="x-small" icon @click.stop="refreshWeather" :loading="loading"
        title="天気を更新">
        <v-icon size="small">mdi-refresh</v-icon>
      </v-btn>
      <v-btn size="x-small" icon @click.stop="toggleExpanded" :color="isExpanded ? 'primary' : 'default'"
        title="展開/折りたたみ">
        <v-icon size="small">{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-title>

    <!-- 現在の天気 - 簡易版 -->
    <v-card-text v-if="weatherData.current && !isExpanded" class="pb-2">
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <v-img :src="`https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png`"
            :alt="weatherData.current.weather[0].description" width="48" height="48"></v-img>
        </v-col>
        <v-col class="ml-3">
          <div class="temperature-compact">{{ Math.round(weatherData.current.main.temp) }}°C</div>
          <div class="weather-description-compact">{{ weatherData.current.weather[0].description }}</div>
        </v-col>
        <v-col cols="auto" class="text-right">
          <div class="compact-details">
            <div class="compact-item">{{ weatherData.current.main.humidity }}%</div>
            <div class="compact-item">{{ weatherData.current.wind.speed }}m/s</div>
          </div>
        </v-col>
      </v-row>
      <div class="expand-hint mt-2">
        <v-chip size="x-small" variant="outlined" color="primary">
          <v-icon size="x-small" class="mr-1">mdi-gesture-double-tap</v-icon>
          ダブルクリックで詳細表示
        </v-chip>
        <v-chip v-if="!currentCoords" size="x-small" variant="outlined" color="secondary" class="ml-1">
          <v-icon size="x-small" class="mr-1">mdi-crosshairs-gps</v-icon>
          GPSで現在地の天気を取得
        </v-chip>
      </div>
    </v-card-text>

    <!-- 現在の天気 - 詳細版 - 展開時はスクロール可能 -->
    <div v-if="weatherData.current && isExpanded" class="expanded-weather-container">
      <v-card-text class="pb-2">
        <v-row align="center" class="mb-3">
          <v-col cols="auto">
            <div class="weather-icon">
              <v-img :src="`https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png`"
                :alt="weatherData.current.weather[0].description" width="64" height="64"></v-img>
            </div>
          </v-col>
          <v-col>
            <div class="temperature">{{ Math.round(weatherData.current.main.temp) }}°C</div>
            <div class="weather-description">{{ weatherData.current.weather[0].description }}</div>
            <div class="feels-like">体感温度 {{ Math.round(weatherData.current.main.feels_like) }}°C</div>
          </v-col>
          <v-col cols="auto">
            <div class="weather-details">
              <div class="detail-item">
                <v-icon size="small" class="mr-1">mdi-water-percent</v-icon>
                {{ weatherData.current.main.humidity }}%
              </div>
              <div class="detail-item">
                <v-icon size="small" class="mr-1">mdi-weather-windy</v-icon>
                {{ weatherData.current.wind.speed }} m/s
              </div>
              <div class="detail-item">
                <v-icon size="small" class="mr-1">mdi-gauge</v-icon>
                {{ weatherData.current.main.pressure }} hPa
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- チャートコンテナ - 展開時のみ表示 -->
      <v-card-text v-if="chartData">
        <div class="chart-container">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </v-card-text>

      <!-- 5日間予報カード - 展開時のみ表示 -->
      <v-card-text v-if="forecastData.length > 0">
        <v-divider class="mb-3"></v-divider>
        <div class="forecast-title mb-2">5日間予報</div>
        <v-row class="forecast-cards">
          <v-col v-for="forecast in forecastData" :key="forecast.dt" cols="auto">
            <v-card class="forecast-card" variant="outlined" width="120">
              <v-card-text class="text-center pa-2">
                <div class="forecast-day">{{ forecast.day }}</div>
                <v-img :src="`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`"
                  :alt="forecast.weather[0].description" width="40" height="40" class="mx-auto mb-1"></v-img>
                <div class="forecast-temp">{{ Math.round(forecast.main.temp_max) }}°/{{
                  Math.round(forecast.main.temp_min)
                  }}°</div>
                <div class="forecast-desc">{{ forecast.weather[0].main }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </div>

    <!-- 読み込み状態 -->
    <v-card-text v-if="loading" class="text-center loading-text">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="mt-2">天気データを取得中...</div>
    </v-card-text>

    <!-- エラー状態 -->
    <v-card-text v-if="error" class="text-center error-text">
      <v-icon color="error" size="48" class="mb-2">mdi-alert-circle</v-icon>
      <div class="error-message">{{ error }}</div>
      <v-btn @click="fetchWeatherData" color="primary" class="mt-2">再試行</v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import config from '../config.js'

Chart.register(...registerables)

export default {
  name: 'WeatherChart',
  setup() {
    const chartCanvas = ref(null)
    const chartInstance = ref(null)
    const weatherData = ref({
      current: null,
      forecast: []
    })
    const chartData = ref(null)
    const forecastData = ref([])
    const loading = ref(true)
    const error = ref(null)
    const refreshTimer = ref(null)
    const isExpanded = ref(false) // 展開状態を制御、デフォルトは折りたたみ
    const locationLoading = ref(false) // 位置取得読み込み状態を制御
    const locationName = ref('東京の天気') // 現在位置名称
    const currentCoords = ref(null) // 現在座標

    // 取得来源优先级: config.weather.apiKey -> 環境変数(VITE_WEATHER_API_KEY) -> window.__APP_CONFIG__ -> (未设置时使用 mock)
    const API_KEY = (config?.weather?.apiKey || import.meta.env.VITE_WEATHER_API_KEY || (window?.__APP_CONFIG__?.weather?.apiKey) || '').trim()
    const DEFAULT_CITY = (window?.__APP_CONFIG__?.weather?.defaultCity) || config?.weather?.defaultCity || 'Tokyo' // デフォルト都市

    if (!API_KEY) {
      console.warn('[WeatherChart] APIキーが未設定です。config.weather.apiKey または VITE_WEATHER_API_KEY を設定してください。未設定の場合はモックデータにフォールバックします。')
    }

    // 天気データを取得
    const fetchWeatherData = async (coords = null, city = null) => {
      try {
        loading.value = true
        error.value = null

        console.log('天気データの取得を開始...', { coords, city })

        // API URLを構築
        let currentWeatherUrl, forecastUrl

        if (coords) {
          // 座標を使用して天気を取得
          currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&lang=ja`
          forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&lang=ja`
        } else {
          // 都市名を使用して天気を取得
          const targetCity = city || DEFAULT_CITY
          currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${targetCity}&appid=${API_KEY}&units=metric&lang=ja`
          forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${targetCity}&appid=${API_KEY}&units=metric&lang=ja`
        }

        // 現在の天気を取得
        const testResponse = await fetch(currentWeatherUrl)

        if (testResponse.status === 401) {
          console.error('APIキーが無効')
          loadMockData()
          return
        }

        if (!testResponse.ok) {
          throw new Error(`APIリクエストが失敗: ${testResponse.status} - ${testResponse.statusText}`)
        }

        const currentData = await testResponse.json()
        console.log('現在の天気取得成功:', currentData)
        weatherData.value.current = currentData

        // 位置名称を更新
        if (coords) {
          locationName.value = `${currentData.name}の天気`
          currentCoords.value = coords
        } else {
          locationName.value = `${currentData.name}の天気`
        }

        // 5日間予報を取得
        const forecastResponse = await fetch(forecastUrl)

        if (!forecastResponse.ok) {
          throw new Error(`天気予報の取得に失敗: ${forecastResponse.status}`)
        }

        const forecastDataResponse = await forecastResponse.json()
        console.log('予報データ取得成功')
        weatherData.value.forecast = forecastDataResponse.list

        // チャートデータを処理
        processChartData(weatherData.value.forecast)

        // 5日間予報データを処理
        processForecastData(weatherData.value.forecast)

        console.log('天気データ処理完了')

      } catch (err) {
        console.error('天気データの取得に失敗:', err)
        if (err.message.includes('APIキー') || err.message.includes('401')) {
          error.value = '❌ APIキーが無効です\n\n📝 解決方法:\n1. https://openweathermap.org/api_keys にアクセス\n2. キーのステータスを確認\n3. 新しいAPIキーを生成（必要に応じて）\n4. 新しいキーが有効になるまで数時間待つ\n\n🔄 現在はサンプルデータを表示中'
          loadMockData()
        } else {
          error.value = err.message || '天気データの取得に失敗しました。ネットワーク接続を確認してください'
        }
      } finally {
        loading.value = false
      }
    }

    // バックアップ方案として模擬データを読み込み
    const loadMockData = () => {
      console.log('東京のサンプル天気データを読み込み中...')

      // 現在の天気データを模擬
      weatherData.value.current = {
        name: 'Tokyo',
        main: {
          temp: 22,
          feels_like: 24,
          humidity: 65,
          pressure: 1013
        },
        weather: [{
          icon: '02d',
          description: '曇り',
          main: 'Clouds'
        }],
        wind: {
          speed: 3.5
        }
      }

      // 予報データを模擬（24時間、3時間おきに1ポイント）
      const mockForecast = []
      const now = new Date()

      for (let i = 0; i < 8; i++) {
        const time = new Date(now.getTime() + i * 3 * 60 * 60 * 1000)
        mockForecast.push({
          dt: time.getTime() / 1000,
          main: {
            temp: 20 + Math.random() * 8, // 20-28度ランダム温度
            humidity: 60 + Math.random() * 20 // 60-80%湿度
          },
          weather: [{
            icon: ['01d', '02d', '03d', '04d'][Math.floor(Math.random() * 4)],
            description: '晴れ',
            main: 'Clear'
          }]
        })
      }

      // 5日間予報データを模擬（3時間おきのデータを生成、OpenWeatherMap APIの形式に合わせる）
      const mockDaily = []
      for (let i = 0; i < 5; i++) {
        // 各日について、3時間おきのデータを8回生成（24時間分）
        for (let j = 0; j < 8; j++) {
          const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000 + j * 3 * 60 * 60 * 1000)
          mockDaily.push({
            dt: date.getTime() / 1000,
            main: {
              temp: 22 + Math.random() * 6,
              temp_max: 25 + Math.random() * 5,
              temp_min: 18 + Math.random() * 4
            },
            weather: [{
              icon: ['01d', '02d', '03d', '04d', '09d'][Math.floor(Math.random() * 5)],
              description: ['晴れ', '曇り', '雲', '曇り', '雨'][Math.floor(Math.random() * 5)],
              main: ['Clear', 'Clouds', 'Clouds', 'Clouds', 'Rain'][Math.floor(Math.random() * 5)]
            }]
          })
        }
      }

      weatherData.value.forecast = [...mockForecast, ...mockDaily]

      // チャートデータを処理
      processChartData(mockForecast)

      // 5日間予報データを処理（mockDaily を使用）
      processForecastData(mockDaily)

      console.log('サンプルデータの読み込み完了')
    }

    // 手動で天気データを更新
    const refreshWeather = () => {
      if (currentCoords.value) {
        fetchWeatherData(currentCoords.value)
      } else {
        fetchWeatherData()
      }
    }

    // 現在位置の天気を取得
    const getLocationWeather = async () => {
      if (!navigator.geolocation) {
        error.value = 'お使いのブラウザは位置情報サービスに対応していません'
        return
      }

      locationLoading.value = true
      error.value = null

      try {
        const position = await getCurrentPosition()
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }

        console.log('位置座標を取得:', coords)
        await fetchWeatherData(coords)

      } catch (err) {
        console.error('位置の取得に失敗:', err)
        let errorMessage = '位置の取得に失敗しました'

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'ユーザーが位置情報の要求を拒否しました\nブラウザの設定で位置情報へのアクセスを許可してください'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません\nGPSまたはネットワーク接続を確認してください'
            break
          case err.TIMEOUT:
            errorMessage = '位置の取得がタイムアウトしました\nしばらく経ってから再試行してください'
            break
          default:
            errorMessage = err.message || '不明な位置エラー'
            break
        }

        error.value = errorMessage
      } finally {
        locationLoading.value = false
      }
    }

    // 現在位置のPromise封装
    const getCurrentPosition = () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5分間キャッシュ
          }
        )
      })
    }

    // 展開状態を切り替え
    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value

      // 展開かつチャートデータがある場合、チャートを再作成する必要がある
      if (isExpanded.value && chartData.value) {
        nextTick(() => {
          createChart()
        })
      }
    }

    // チャートデータを処理
    const processChartData = (forecastList) => {
      // 今後24時間のデータを取得（3時間おきに1ポイント、計8ポイント）
      const next24Hours = forecastList.slice(0, 8)

      const labels = next24Hours.map(item => {
        const date = new Date(item.dt * 1000)
        return date.getHours() + ':00'
      })

      const temperatures = next24Hours.map(item => Math.round(item.main.temp))
      const humidity = next24Hours.map(item => item.main.humidity)

      chartData.value = {
        labels: labels,
        datasets: [
          {
            label: '温度 (°C)',
            data: temperatures,
            borderColor: '#1976D2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: '湿度 (%)',
            data: humidity,
            borderColor: '#43A047',
            backgroundColor: 'rgba(67, 160, 71, 0.1)',
            tension: 0.4,
            fill: false,
            yAxisID: 'y1'
          }
        ]
      }

      nextTick(() => {
        createChart()
      })
    }

    // 5日間予報データを処理
    const processForecastData = (forecastList) => {
      console.log('5日間予報データ処理開始:', forecastList.length, '件のデータ')
      const dailyData = {}

      // 日別にデータをグループ化
      forecastList.forEach(item => {
        const date = new Date(item.dt * 1000)
        const dateKey = date.toDateString()

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            temps: [],
            weather: item.weather[0],
            dt: item.dt
          }
        }

        dailyData[dateKey].temps.push(item.main.temp)
      })

      console.log('日別グループ化結果:', Object.keys(dailyData).length, '日分のデータ')

      // 前5日間のデータを取得
      const days = Object.keys(dailyData).slice(0, 5)
      console.log('選択された日付:', days)

      forecastData.value = days.map(dateKey => {
        const data = dailyData[dateKey]
        const date = new Date(data.dt * 1000)
        const dayNames = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜']

        return {
          dt: data.dt,
          day: date.getDate() === new Date().getDate() ? '今日' : dayNames[date.getDay()],
          weather: [data.weather],
          main: {
            temp_max: Math.max(...data.temps),
            temp_min: Math.min(...data.temps)
          }
        }
      })

      console.log('最終的な予報データ:', forecastData.value.length, '日分')
    }

    // チャートを作成
    const createChart = () => {
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }

      if (!chartCanvas.value || !chartData.value) return

      const ctx = chartCanvas.value.getContext('2d')

      chartInstance.value = new Chart(ctx, {
        type: 'line',
        data: chartData.value,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                font: {
                  size: 10
                },
                padding: 10
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#ddd',
              borderWidth: 1,
              titleFont: {
                size: 12
              },
              bodyFont: {
                size: 11
              }
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: '時間',
                font: {
                  size: 10
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                font: {
                  size: 9
                }
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: '°C',
                font: {
                  size: 10
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                font: {
                  size: 9
                }
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: '%',
                font: {
                  size: 10
                }
              },
              grid: {
                drawOnChartArea: false
              },
              ticks: {
                font: {
                  size: 9
                }
              }
            }
          },
          elements: {
            point: {
              radius: 3,
              hoverRadius: 5
            },
            line: {
              borderWidth: 2
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }
      })
    }

    onMounted(() => {
      fetchWeatherData()
      // 30分毎に自動更新
      refreshTimer.value = setInterval(() => {
        fetchWeatherData()
      }, 30 * 60 * 1000)
    })

    onUnmounted(() => {
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
      if (refreshTimer.value) {
        clearInterval(refreshTimer.value)
      }
    })

    return {
      chartCanvas,
      weatherData,
      chartData,
      forecastData,
      loading,
      error,
      isExpanded,
      locationLoading,
      locationName,
      currentCoords,
      fetchWeatherData,
      refreshWeather,
      toggleExpanded,
      getLocationWeather
    }
  }
}
</script>

<style scoped>
.weather-card {
  margin: 1rem 0;
  backdrop-filter: blur(10px);
  cursor: pointer;
  /* ダブルクリック可能を示す */
  transition: all 0.3s ease;
}

.weather-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.temperature {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
  color: white;
}

.temperature-compact {
  font-size: 1.8rem;
  font-weight: bold;
  line-height: 1.2;
  color: white;
}

.weather-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: capitalize;
}

.weather-description-compact {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: capitalize;
}

.feels-like {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.weather-details {
  text-align: right;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: white;
}

.compact-details {
  text-align: right;
}

.compact-item {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.2rem;
}

.expand-hint {
  text-align: center;
}

.loading-text {
  color: white;
}

.error-text {
  color: white;
}

.error-message {
  color: rgb(var(--v-theme-error));
  margin-bottom: 1rem;
  white-space: pre-line;
}

.chart-container {
  height: 200px;
  position: relative;
}

/* 展開時のスクロール可能なコンテナ */
.expanded-weather-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* カスタムスクロールバー */
.expanded-weather-container::-webkit-scrollbar {
  width: 6px;
}

.expanded-weather-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.expanded-weather-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.expanded-weather-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.forecast-title {
  font-weight: bold;
  color: white;
}

.forecast-cards {
  overflow-x: auto;
  flex-wrap: nowrap;
}

.forecast-card {
  min-width: 120px;
  margin-right: 0.5rem;
}

.forecast-day {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: white;
}

.forecast-temp {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: white;
}

.forecast-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

/* モバイル適応 */
@media (max-width: 768px) {
  .temperature {
    font-size: 2rem;
  }

  .chart-container {
    height: 160px;
  }

  .expanded-weather-container {
    max-height: 350px;
  }

  .forecast-cards {
    padding: 0 0.5rem;
  }

  .forecast-card {
    min-width: 100px;
  }
}
</style>
