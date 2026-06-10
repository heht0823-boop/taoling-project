<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'

import TaolingMascot from '@/components/business/TaolingMascot.vue'
import { useWeatherStore } from '@/stores/weather'
import type { CityInfo, ForecastDay, LifeTip, LiveWeather, WarningCity } from '@/types/weather'

type WeatherIconName = 'sun' | 'cloud' | 'rain' | 'snow' | 'wind' | 'warning' | 'pin' | 'spark'

interface TipCard {
  key: string
  label: string
  tip?: LifeTip
  icon: WeatherIconName
}

interface HeatPoint {
  city: string
  adcode: string
  temperature: number
  weather: string
  x: number
  y: number
  active: boolean
}

const iconPaths: Record<WeatherIconName, string[]> = {
  sun: [
    'M12 5V2',
    'M12 22v-3',
    'M5 12H2',
    'M22 12h-3',
    'M5.64 5.64 3.52 3.52',
    'M20.48 20.48 18.36 18.36',
    'M18.36 5.64 20.48 3.52',
    'M3.52 20.48 5.64 18.36',
    'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  ],
  cloud: [
    'M7 18h10.5a4.5 4.5 0 0 0 .7-8.94A6.3 6.3 0 0 0 6.06 8.1 4.98 4.98 0 0 0 7 18Z',
  ],
  rain: [
    'M7 15h10.5a4.5 4.5 0 0 0 .7-8.94A6.3 6.3 0 0 0 6.06 5.1 4.98 4.98 0 0 0 7 15Z',
    'M8 19l-1 2',
    'M13 19l-1 2',
    'M18 19l-1 2',
  ],
  snow: [
    'M7 15h10.5a4.5 4.5 0 0 0 .7-8.94A6.3 6.3 0 0 0 6.06 5.1 4.98 4.98 0 0 0 7 15Z',
    'M9 20h.01',
    'M14 21h.01',
    'M18 19h.01',
  ],
  wind: ['M4 9h11a3 3 0 1 0-3-3', 'M4 15h14a3 3 0 1 1-3 3', 'M4 12h7'],
  warning: ['M12 3 22 20H2L12 3Z', 'M12 9v5', 'M12 17h.01'],
  pin: [
    'M12 22s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z',
    'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  ],
  spark: ['M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z'],
}

const SvgIcon = defineComponent({
  name: 'SvgIcon',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const paths = iconPaths[props.name as WeatherIconName] || iconPaths.cloud

      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.9',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        },
        paths.map((d) => h('path', { d })),
      )
    }
  },
})

const weatherStore = useWeatherStore()
const selectedAdcode = ref(weatherStore.currentCity.adcode)
const selectedRegion = ref('全部')
const sortMode = ref<'default' | 'hot' | 'cold'>('default')

const regions = ['全部', '华北', '华东', '华南', '华中', '西南', '东北', '西北']
const regionMap: Record<CityInfo['region'], string> = {
  north: '华北',
  east: '华东',
  south: '华南',
  central: '华中',
  west: '西南',
  northeast: '东北',
  northwest: '西北',
}
const chinaBounds = {
  minLng: 73,
  maxLng: 135,
  minLat: 18,
  maxLat: 54,
}

const isBusy = computed(() => weatherStore.loading || weatherStore.batchLoading)
const selectedCity = computed(
  () => weatherStore.cityList.find((city) => city.adcode === selectedAdcode.value) || weatherStore.cityList[0],
)
const visibleCityOptions = computed(() => {
  if (selectedRegion.value === '全部') return weatherStore.cityList
  return weatherStore.cityList.filter((city) => regionMap[city.region] === selectedRegion.value)
})
const selectedLiveWeather = computed(() => weatherStore.liveWeather)
const batchWeatherWithCity = computed(() =>
  weatherStore.batchWeather
    .map((weather) => {
      const city = weatherStore.cityList.find((item) => item.adcode === weather.adcode)
      return city ? { ...weather, cityInfo: city } : null
    })
    .filter((item): item is LiveWeather & { cityInfo: CityInfo } => Boolean(item)),
)
const filteredBatchWeather = computed(() => {
  const filtered =
    selectedRegion.value === '全部'
      ? batchWeatherWithCity.value
      : batchWeatherWithCity.value.filter((weather) => regionMap[weather.cityInfo.region] === selectedRegion.value)

  return [...filtered].sort((a, b) => {
    if (sortMode.value === 'hot') return toNumber(b.temperature) - toNumber(a.temperature)
    if (sortMode.value === 'cold') return toNumber(a.temperature) - toNumber(b.temperature)
    return weatherStore.cityList.findIndex((city) => city.adcode === a.adcode) -
      weatherStore.cityList.findIndex((city) => city.adcode === b.adcode)
  })
})
const forecastDays = computed(() => weatherStore.forecast?.casts.slice(0, 7) ?? [])
const warningCards = computed(() => {
  const warnings = weatherStore.warnings as WarningCity[]
  return warnings.flatMap((city) =>
    (city.warnings || []).map((warning) => ({
      ...warning,
      city: city.city,
      adcode: city.adcode,
    })),
  )
})
const tipCards = computed<TipCard[]>(() => [
  { key: 'uv', label: '紫外线', tip: weatherStore.lifeTips?.uv, icon: 'sun' },
  { key: 'dressing', label: '穿衣', tip: weatherStore.lifeTips?.dressing, icon: 'spark' },
  { key: 'carWash', label: '洗车', tip: weatherStore.lifeTips?.carWash, icon: 'cloud' },
  { key: 'sport', label: '运动', tip: weatherStore.lifeTips?.sport, icon: 'wind' },
  { key: 'travel', label: '旅行', tip: weatherStore.lifeTips?.travel, icon: 'pin' },
  { key: 'coldRisk', label: '感冒风险', tip: weatherStore.lifeTips?.coldRisk, icon: 'warning' },
])
const hourlyPoints = computed(() => weatherStore.hourlyTrend.slice(0, 8))
const hourlyTemps = computed(() => hourlyPoints.value.map((item) => item.temperature))
const maxHourlyTemp = computed(() => Math.max(...hourlyTemps.value, 30))
const minHourlyTemp = computed(() => Math.min(...hourlyTemps.value, 15))
const temperatureRange = computed(() => Math.max(maxHourlyTemp.value - minHourlyTemp.value, 1))
const hourlyPath = computed(() => {
  if (hourlyPoints.value.length < 2) return ''
  const stepX = 260 / (hourlyPoints.value.length - 1)
  return hourlyPoints.value
    .map((item, index) => {
      const x = 20 + index * stepX
      const y = 110 - ((item.temperature - minHourlyTemp.value) / temperatureRange.value) * 78
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
})
const hourlyAreaPath = computed(() => {
  if (!hourlyPath.value) return ''
  return `${hourlyPath.value} L 280 124 L 20 124 Z`
})
const heatPoints = computed<HeatPoint[]>(() =>
  batchWeatherWithCity.value.map((weather) => {
    const x =
      ((weather.cityInfo.lng - chinaBounds.minLng) / (chinaBounds.maxLng - chinaBounds.minLng)) * 100
    const y =
      (1 - (weather.cityInfo.lat - chinaBounds.minLat) / (chinaBounds.maxLat - chinaBounds.minLat)) * 100

    return {
      city: weather.city || weather.cityInfo.name,
      adcode: weather.adcode,
      temperature: toNumber(weather.temperature),
      weather: weather.weather,
      x: clamp(x, 5, 95),
      y: clamp(y, 7, 92),
      active: weather.adcode === selectedAdcode.value,
    }
  }),
)
const warmestCity = computed(() =>
  [...batchWeatherWithCity.value].sort((a, b) => toNumber(b.temperature) - toNumber(a.temperature))[0],
)
const coolestCity = computed(() =>
  [...batchWeatherWithCity.value].sort((a, b) => toNumber(a.temperature) - toNumber(b.temperature))[0],
)

function toNumber(value: string | number | undefined | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function weatherIcon(weather?: string | null): WeatherIconName {
  if (!weather) return 'cloud'
  if (weather.includes('雨')) return 'rain'
  if (weather.includes('雪')) return 'snow'
  if (weather.includes('风')) return 'wind'
  if (weather.includes('晴')) return 'sun'
  return 'cloud'
}

function weekLabel(day: ForecastDay, index: number) {
  if (index === 0) return '今天'
  const labels: Record<string, string> = {
    '1': '周一',
    '2': '周二',
    '3': '周三',
    '4': '周四',
    '5': '周五',
    '6': '周六',
    '7': '周日',
  }
  return labels[day.week] || day.date
}

function warningColor(level: string) {
  if (level.includes('红')) return '#df3f4f'
  if (level.includes('橙')) return '#f08a43'
  if (level.includes('黄')) return '#d8a818'
  if (level.includes('蓝')) return '#1685bd'
  return '#a14878'
}

function selectCity(adcode: string) {
  selectedAdcode.value = adcode
}

function refreshWeather() {
  weatherStore.fetchCityWeatherPanel(selectedAdcode.value)
  weatherStore.fetchBatchWeather(weatherStore.cityList.map((city) => city.adcode))
}

watch(selectedAdcode, (adcode) => {
  weatherStore.fetchCityWeatherPanel(adcode)
})

watch(selectedRegion, () => {
  if (!visibleCityOptions.value.some((city) => city.adcode === selectedAdcode.value)) {
    selectedAdcode.value = visibleCityOptions.value[0]?.adcode || weatherStore.cityList[0]?.adcode || '110000'
  }
})

onMounted(() => {
  refreshWeather()
})
</script>

<template>
  <section class="weather-view">
    <div class="weather-shell">
      <section class="weather-hero" aria-labelledby="weather-title">
        <div class="hero-copy">
          <span class="soft-label">
            <SvgIcon name="cloud" />
            Weather Station
          </span>
          <h1 id="weather-title">桃灵气象站</h1>
          <p>
            以真实接口返回的实况、预报、趋势、预警和生活贴士为基础，陪你看见全国城市的晴雨温度。
          </p>
          <div class="hero-actions">
            <button class="primary-action" type="button" @click="refreshWeather">
              <SvgIcon name="spark" />
              刷新天气
            </button>
            <a class="ghost-action" href="#weather-trend">查看趋势</a>
          </div>
        </div>

        <div class="hero-panel">
          <TaolingMascot :state="isBusy ? 'loading' : 'guide'" autoplay size="md" priority />
          <div class="hero-weather" v-if="selectedLiveWeather">
            <span>{{ selectedLiveWeather.city }}</span>
            <strong>{{ selectedLiveWeather.temperature }}°</strong>
            <small>{{ selectedLiveWeather.weather }}</small>
          </div>
        </div>
      </section>

      <div class="weather-toolbar">
        <div class="select-field">
          <span>城市</span>
          <ElSelect v-model="selectedAdcode" filterable>
            <ElOption
              v-for="city in visibleCityOptions"
              :key="city.adcode"
              :label="`${city.name} · ${city.province}`"
              :value="city.adcode"
            />
          </ElSelect>
        </div>
        <div class="region-tabs" aria-label="区域筛选">
          <button
            v-for="region in regions"
            :key="region"
            type="button"
            :class="{ active: selectedRegion === region }"
            @click="selectedRegion = region"
          >
            {{ region }}
          </button>
        </div>
      </div>

      <div v-if="weatherStore.error" class="error-banner">
        <SvgIcon name="warning" />
        {{ weatherStore.error }}
      </div>

      <section class="dashboard-grid">
        <article class="live-card panel-card" v-loading="weatherStore.loading">
          <div class="card-heading">
            <span>当前实况</span>
            <small>{{ selectedCity?.province }} · {{ selectedCity?.name }}</small>
          </div>
          <div v-if="selectedLiveWeather" class="live-main">
            <div class="weather-badge">
              <SvgIcon :name="weatherIcon(selectedLiveWeather.weather)" />
            </div>
            <div>
              <strong>{{ selectedLiveWeather.temperature }}°</strong>
              <span>{{ selectedLiveWeather.weather }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <TaolingMascot state="empty" size="sm" />
            <span>暂时没有实况天气</span>
          </div>
          <dl v-if="selectedLiveWeather" class="live-meta">
            <div>
              <dt>湿度</dt>
              <dd>{{ selectedLiveWeather.humidity }}%</dd>
            </div>
            <div>
              <dt>风向</dt>
              <dd>{{ selectedLiveWeather.winddirection }}风</dd>
            </div>
            <div>
              <dt>风力</dt>
              <dd>{{ selectedLiveWeather.windpower }}级</dd>
            </div>
            <div>
              <dt>发布时间</dt>
              <dd>{{ selectedLiveWeather.reportTime }}</dd>
            </div>
          </dl>
        </article>

        <article class="tips-card panel-card">
          <div class="card-heading">
            <span>桃灵小贴士</span>
            <small>来自生活指数接口</small>
          </div>
          <div class="tips-list">
            <div v-for="tip in tipCards" :key="tip.key" class="tip-row">
              <span class="tip-icon">
                <SvgIcon :name="tip.icon" />
              </span>
              <div>
                <strong>{{ tip.label }} · {{ tip.tip?.level || '待更新' }}</strong>
                <p>{{ tip.tip?.advice || '桃灵正在等后端返回更多建议。' }}</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="warning-section">
        <div class="section-title">
          <SvgIcon name="warning" />
          <h2>气象预警中心</h2>
        </div>
        <div v-if="warningCards.length" class="warning-grid">
          <article
            v-for="warning in warningCards.slice(0, 4)"
            :key="`${warning.city}-${warning.title}`"
            class="warning-card"
            :style="{ '--warning-color': warningColor(warning.level) }"
          >
            <span>{{ warning.city }}</span>
            <strong>{{ warning.type }}{{ warning.level }}预警</strong>
            <p>{{ warning.content }}</p>
          </article>
        </div>
        <div v-else class="soft-empty">当前暂无静态预警数据，桃灵会继续守着天气变化。</div>
      </section>

      <section class="map-trend-grid" id="weather-trend">
        <article class="map-card panel-card">
          <div class="card-heading">
            <span>实时气象分布</span>
            <small>批量实况温度热力</small>
          </div>
          <div class="map-stage">
            <svg class="china-map" viewBox="0 0 600 420" role="img" aria-label="中国城市温度分布示意图">
              <path
                class="map-shape"
                d="M98 126 C150 76 230 70 286 104 C326 61 414 73 455 124 C508 139 533 190 507 236 C543 286 478 331 414 316 C361 360 277 347 242 309 C179 326 113 289 129 235 C76 213 58 163 98 126 Z"
              />
              <path
                class="map-island"
                d="M416 336 C436 326 457 334 461 350 C450 368 421 363 416 336 Z"
              />
            </svg>
            <button
              v-for="point in heatPoints"
              :key="point.adcode"
              class="heat-point"
              :class="{ active: point.active }"
              type="button"
              :style="{ left: `${point.x}%`, top: `${point.y}%` }"
              @click="selectCity(point.adcode)"
            >
              <span>{{ point.temperature }}°</span>
              <small>{{ point.city }}</small>
            </button>
          </div>
          <div class="map-summary">
            <span v-if="warmestCity">最高 {{ warmestCity.city }} {{ warmestCity.temperature }}°</span>
            <span v-if="coolestCity">最低 {{ coolestCity.city }} {{ coolestCity.temperature }}°</span>
          </div>
        </article>

        <article class="trend-card panel-card">
          <div class="card-heading">
            <span>24 小时温度趋势</span>
            <small>{{ weatherStore.forecast?.city || selectedCity?.name }}</small>
          </div>
          <svg class="trend-chart" viewBox="0 0 300 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hourlyArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#f48bb5" stop-opacity="0.28" />
                <stop offset="100%" stop-color="#f48bb5" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="hourlyAreaPath" fill="url(#hourlyArea)" />
            <path :d="hourlyPath" fill="none" stroke="#a14878" stroke-width="4" stroke-linecap="round" />
            <circle
              v-for="(hour, index) in hourlyPoints"
              :key="hour.time"
              :cx="20 + index * (260 / Math.max(hourlyPoints.length - 1, 1))"
              :cy="110 - ((hour.temperature - minHourlyTemp) / temperatureRange) * 78"
              r="4"
              fill="#fff"
              stroke="#a14878"
              stroke-width="3"
            />
          </svg>
          <div class="hourly-labels">
            <span v-for="hour in hourlyPoints" :key="hour.time">
              <strong>{{ hour.temperature }}°</strong>
              {{ hour.time }}
            </span>
          </div>
        </article>
      </section>

      <section class="cities-section">
        <div class="section-title section-title--between">
          <div>
            <SvgIcon name="pin" />
            <h2>全国主要城市天气</h2>
          </div>
          <div class="sort-actions">
            <button type="button" :class="{ active: sortMode === 'default' }" @click="sortMode = 'default'">
              默认
            </button>
            <button type="button" :class="{ active: sortMode === 'hot' }" @click="sortMode = 'hot'">
              高温
            </button>
            <button type="button" :class="{ active: sortMode === 'cold' }" @click="sortMode = 'cold'">
              低温
            </button>
          </div>
        </div>
        <div class="city-grid">
          <button
            v-for="weather in filteredBatchWeather"
            :key="weather.adcode"
            class="city-weather-card"
            :class="{ active: weather.adcode === selectedAdcode }"
            type="button"
            @click="selectCity(weather.adcode)"
          >
            <span>{{ weather.city }}</span>
            <SvgIcon :name="weatherIcon(weather.weather)" />
            <strong>{{ weather.temperature }}°</strong>
            <small>{{ weather.weather }} · {{ weather.cityInfo.province }}</small>
          </button>
        </div>
      </section>

      <section class="forecast-section">
        <div class="section-title">
          <SvgIcon name="cloud" />
          <h2>未来 7 天预报（{{ weatherStore.forecast?.city || selectedCity?.name }}）</h2>
        </div>
        <div class="forecast-grid">
          <article
            v-for="(day, index) in forecastDays"
            :key="day.date"
            class="forecast-card"
            :class="{ today: index === 0 }"
          >
            <span>{{ weekLabel(day, index) }}</span>
            <small>{{ day.date.slice(5) }}</small>
            <SvgIcon :name="weatherIcon(day.dayweather)" />
            <strong>{{ day.daytemp }}° / {{ day.nighttemp }}°</strong>
            <p>{{ day.dayweather }}转{{ day.nightweather }}</p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped lang="scss">
.weather-view {
  min-height: 100vh;
  padding: 132px clamp(18px, 5vw, 86px) 70px;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 8%, rgba(244, 139, 181, 0.2), transparent 30%),
    radial-gradient(circle at 88% 16%, rgba(197, 182, 255, 0.22), transparent 26%),
    linear-gradient(180deg, #fff9fb 0%, #fff3f7 58%, #fff8fb 100%);
}

.weather-shell {
  width: min(1240px, 100%);
  margin: 0 auto;
}

.weather-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 390px);
  gap: clamp(24px, 5vw, 72px);
  align-items: center;
  min-height: 420px;
  padding: clamp(28px, 6vw, 68px);
  background:
    radial-gradient(circle at 82% 34%, rgba(255, 255, 255, 0.9), transparent 28%),
    linear-gradient(135deg, rgba(255, 239, 246, 0.94), rgba(250, 232, 255, 0.82));
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 34px;
  box-shadow: $shadow-card;
}

.soft-label,
.primary-action,
.ghost-action,
.section-title,
.card-heading,
.weather-toolbar,
.sort-actions,
.map-summary,
.live-meta,
.hourly-labels {
  display: flex;
  align-items: center;
}

.soft-label {
  width: fit-content;
  gap: 8px;
  min-height: 30px;
  padding: 0 14px;
  color: $color-primary;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(255, 210, 226, 0.52);
  border-radius: $radius-pill;

  svg {
    width: 15px;
    height: 15px;
  }
}

.hero-copy h1 {
  margin: 22px 0 18px;
  color: $color-text-main;
  font-size: clamp(38px, 5vw, 64px);
  font-weight: 600;
  line-height: 1.08;
}

.hero-copy p {
  max-width: 580px;
  margin: 0;
  color: $color-text-secondary;
  font-size: 17px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 34px;
}

.primary-action,
.ghost-action {
  gap: 8px;
  min-height: 46px;
  padding: 0 24px;
  font-size: 15px;
  border-radius: $radius-pill;
}

.primary-action {
  color: #fff;
  cursor: pointer;
  background: $gradient-primary;
  border: 0;
  box-shadow: $shadow-button;

  svg {
    width: 17px;
    height: 17px;
  }
}

.ghost-action {
  color: $color-primary;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(244, 139, 181, 0.32);
}

.hero-panel {
  position: relative;
  display: grid;
  min-height: 300px;
  place-items: center;
  background: rgba(255, 255, 255, 0.54);
  border-radius: 30px;
}

.hero-weather {
  position: absolute;
  right: 18px;
  bottom: 18px;
  display: grid;
  gap: 2px;
  min-width: 112px;
  padding: 14px 16px;
  color: $color-text-secondary;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 22px;
  box-shadow: 0 16px 34px rgba(161, 72, 120, 0.1);

  strong {
    color: $color-primary;
    font-size: 32px;
    line-height: 1;
  }
}

.weather-toolbar {
  gap: 18px;
  justify-content: space-between;
  margin: 26px 0;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 24px;
  box-shadow: 0 14px 34px rgba(161, 72, 120, 0.06);
}

.select-field {
  display: grid;
  grid-template-columns: auto 220px;
  gap: 12px;
  align-items: center;
  color: $color-text-secondary;
  font-size: 14px;
}

.region-tabs,
.sort-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    min-height: 32px;
    padding: 0 14px;
    color: $color-text-secondary;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.68);
    border: 1px solid rgba(161, 72, 120, 0.14);
    border-radius: $radius-pill;

    &.active {
      color: $color-primary;
      background: rgba(255, 214, 229, 0.72);
      border-color: rgba(244, 139, 181, 0.42);
    }
  }
}

.error-banner {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  padding: 14px 18px;
  color: #a33b52;
  background: rgba(255, 232, 239, 0.82);
  border: 1px solid rgba(223, 63, 79, 0.16);
  border-radius: 18px;

  svg {
    width: 18px;
    height: 18px;
  }
}

.dashboard-grid,
.map-trend-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 24px;
  margin-bottom: 34px;
}

.panel-card,
.warning-card,
.city-weather-card,
.forecast-card {
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow: $shadow-soft;
}

.panel-card {
  padding: 26px;
  border-radius: 28px;
}

.card-heading {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;

  span {
    color: $color-text-main;
    font-size: 22px;
    font-weight: 600;
  }

  small {
    color: $color-text-light;
  }
}

.live-main {
  display: flex;
  gap: 24px;
  align-items: center;

  strong {
    display: block;
    color: $color-primary;
    font-size: clamp(58px, 8vw, 92px);
    font-weight: 600;
    line-height: 0.94;
  }

  span {
    color: $color-text-secondary;
    font-size: 19px;
  }
}

.weather-badge {
  display: grid;
  width: 108px;
  aspect-ratio: 1;
  place-items: center;
  color: $color-primary;
  background: linear-gradient(135deg, rgba(255, 214, 229, 0.78), rgba(234, 223, 255, 0.82));
  border-radius: 30px;

  svg {
    width: 58px;
    height: 58px;
  }
}

.live-meta {
  flex-wrap: wrap;
  gap: 12px;
  margin: 26px 0 0;

  div {
    flex: 1 1 150px;
    padding: 14px 16px;
    background: rgba(255, 244, 248, 0.72);
    border-radius: 18px;
  }

  dt {
    color: $color-text-light;
    font-size: 12px;
  }

  dd {
    margin: 5px 0 0;
    color: $color-text-main;
    font-weight: 600;
  }
}

.empty-state {
  display: grid;
  gap: 8px;
  min-height: 210px;
  place-items: center;
  color: $color-text-secondary;
}

.tips-list {
  display: grid;
  gap: 12px;
}

.tip-row {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
  align-items: start;
  padding: 13px;
  background: rgba(255, 242, 247, 0.58);
  border-radius: 18px;

  strong {
    color: $color-text-main;
    font-size: 14px;
  }

  p {
    margin: 5px 0 0;
    color: $color-text-secondary;
    font-size: 13px;
    line-height: 1.55;
  }
}

.tip-icon {
  display: grid;
  width: 42px;
  aspect-ratio: 1;
  place-items: center;
  color: $color-primary;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 14px;

  svg {
    width: 21px;
    height: 21px;
  }
}

.warning-section,
.cities-section,
.forecast-section {
  margin-bottom: 34px;
}

.section-title {
  gap: 10px;
  margin-bottom: 20px;

  > div {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  h2 {
    margin: 0;
    color: $color-text-main;
    font-size: clamp(24px, 3vw, 34px);
    font-weight: 600;
  }

  svg {
    width: 24px;
    height: 24px;
    color: $color-primary;
  }
}

.section-title--between {
  justify-content: space-between;
}

.warning-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.warning-card {
  padding: 20px;
  border-left: 4px solid var(--warning-color);
  border-radius: 22px;

  span {
    color: var(--warning-color);
    font-size: 13px;
    font-weight: 700;
  }

  strong {
    display: block;
    margin-top: 8px;
    color: $color-text-main;
    font-size: 17px;
  }

  p {
    margin: 10px 0 0;
    color: $color-text-secondary;
    font-size: 13px;
    line-height: 1.65;
  }
}

.soft-empty {
  padding: 22px;
  color: $color-text-secondary;
  background: rgba(255, 255, 255, 0.68);
  border-radius: 20px;
}

.map-card {
  min-height: 430px;
}

.map-stage {
  position: relative;
  min-height: 320px;
  overflow: hidden;
  background:
    radial-gradient(circle at 68% 24%, rgba(191, 233, 255, 0.42), transparent 28%),
    linear-gradient(135deg, rgba(255, 242, 247, 0.86), rgba(244, 248, 255, 0.92));
  border-radius: 24px;
}

.china-map {
  position: absolute;
  inset: 18px 22px;
  width: calc(100% - 44px);
  height: calc(100% - 36px);
}

.map-shape,
.map-island {
  fill: rgba(255, 255, 255, 0.74);
  stroke: rgba(161, 72, 120, 0.16);
  stroke-width: 3;
}

.heat-point {
  position: absolute;
  display: grid;
  min-width: 68px;
  padding: 7px 10px;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #b45581, #0782a8);
  border: 2px solid rgba(255, 255, 255, 0.72);
  border-radius: 18px;
  box-shadow: 0 12px 24px rgba(68, 95, 130, 0.2);
  transform: translate(-50%, -50%);

  span {
    font-size: 15px;
    font-weight: 700;
  }

  small {
    font-size: 11px;
    opacity: 0.92;
  }

  &.active {
    background: $gradient-primary;
    box-shadow: 0 14px 28px rgba(161, 72, 120, 0.24);
    transform: translate(-50%, -50%) scale(1.08);
  }
}

.map-summary {
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;

  span {
    padding: 7px 12px;
    color: $color-primary;
    background: rgba(255, 214, 229, 0.56);
    border-radius: $radius-pill;
  }
}

.trend-chart {
  width: 100%;
  height: 210px;
}

.hourly-labels {
  justify-content: space-between;
  gap: 10px;

  span {
    display: grid;
    gap: 4px;
    color: $color-text-light;
    font-size: 12px;
    text-align: center;
  }

  strong {
    color: $color-primary;
    font-size: 14px;
  }
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
}

.city-weather-card {
  display: grid;
  gap: 9px;
  min-height: 154px;
  padding: 20px;
  color: $color-text-secondary;
  text-align: left;
  cursor: pointer;
  border-radius: 26px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  span {
    color: $color-text-main;
    font-size: 17px;
    font-weight: 600;
  }

  svg {
    justify-self: end;
    width: 28px;
    height: 28px;
    color: #087da4;
  }

  strong {
    color: $color-primary;
    font-size: 32px;
    line-height: 1;
  }

  small {
    color: $color-text-light;
  }

  &:hover,
  &.active {
    border-color: rgba(244, 139, 181, 0.5);
    box-shadow: 0 22px 42px rgba(161, 72, 120, 0.12);
    transform: translateY(-4px);
  }
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 18px;
}

.forecast-card {
  display: grid;
  gap: 10px;
  min-height: 178px;
  padding: 22px 16px;
  place-items: center;
  color: $color-text-secondary;
  text-align: center;
  border-radius: 28px;

  span {
    color: $color-primary;
    font-weight: 700;
  }

  svg {
    width: 30px;
    height: 30px;
    color: #0782a8;
  }

  strong {
    color: $color-text-main;
  }

  p {
    margin: 0;
    font-size: 13px;
  }

  &.today {
    background: rgba(255, 246, 250, 0.92);
    border-color: rgba(244, 139, 181, 0.58);
    box-shadow: 0 18px 36px rgba(244, 139, 181, 0.12);
  }
}

@media (max-width: 1080px) {
  .dashboard-grid,
  .map-trend-grid,
  .weather-hero {
    grid-template-columns: 1fr;
  }

  .warning-grid,
  .city-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .forecast-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .weather-view {
    padding: 28px 14px 48px;
  }

  .weather-hero {
    min-height: auto;
    padding: 24px;
    border-radius: 26px;
  }

  .weather-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .select-field {
    grid-template-columns: 1fr;
  }

  .dashboard-grid,
  .map-trend-grid {
    gap: 18px;
  }

  .live-main {
    align-items: flex-start;
    flex-direction: column;
  }

  .warning-grid,
  .city-grid,
  .forecast-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-title--between {
    align-items: flex-start;
    flex-direction: column;
  }

  .map-stage {
    min-height: 280px;
  }
}

@media (max-width: 500px) {
  .warning-grid,
  .city-grid,
  .forecast-grid {
    grid-template-columns: 1fr;
  }

  .hourly-labels {
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 6px;

    span {
      min-width: 52px;
    }
  }
}
</style>
