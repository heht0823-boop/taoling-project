import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getLiveWeatherApi,
  getBatchLiveWeatherApi,
  getForecastWeatherApi,
  getHourlyTrendApi,
  getWarningsApi,
  getLifeTipsApi,
} from '@/apis/weather'
import type {
  LiveWeather,
  ForecastWeather,
  HourlyTrend,
  WeatherWarning,
  WarningCity,
  LifeTips,
  CityInfo,
} from '@/types/weather'
import { cityList } from '@/types/weather'

interface WeatherFetchOptions {
  refresh?: boolean
}

export const useWeatherStore = defineStore('weather', () => {
  const currentCity = ref<CityInfo>(cityList[0] as CityInfo)
  const liveWeather = ref<LiveWeather | null>(null)
  const batchWeather = ref<LiveWeather[]>([])
  const forecast = ref<ForecastWeather | null>(null)
  const hourlyTrend = ref<HourlyTrend[]>([])
  const warnings = ref<WeatherWarning[] | WarningCity[]>([])
  const lifeTips = ref<LifeTips | null>(null)
  const loading = ref(false)
  const batchLoading = ref(false)
  const error = ref('')
  const lastUpdatedAt = ref('')

  async function fetchLiveWeather(city: string, options: WeatherFetchOptions = {}) {
    loading.value = true
    error.value = ''
    try {
      const result = await getLiveWeatherApi(city, options)
      liveWeather.value = result
      lastUpdatedAt.value = result.reportTime || new Date().toLocaleString()
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取实况天气失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchBatchWeather(cities: string[], options: WeatherFetchOptions = {}) {
    batchLoading.value = true
    error.value = ''
    try {
      const result = await getBatchLiveWeatherApi(cities, options)
      batchWeather.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '批量获取天气失败'
      throw e
    } finally {
      batchLoading.value = false
    }
  }

  async function fetchForecast(city: string, options: WeatherFetchOptions = {}) {
    loading.value = true
    error.value = ''
    try {
      const result = await getForecastWeatherApi(city, options)
      forecast.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取天气预报失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchHourlyTrend(city: string, options: WeatherFetchOptions = {}) {
    loading.value = true
    error.value = ''
    try {
      const result = await getHourlyTrendApi(city, options)
      hourlyTrend.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取24小时趋势失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchWarnings(city?: string) {
    try {
      const result = await getWarningsApi(city)
      warnings.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取气象预警失败'
      return []
    }
  }

  async function fetchLifeTips(city: string) {
    try {
      const result = await getLifeTipsApi(city)
      lifeTips.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取生活指数失败'
      return null
    }
  }

  function setCurrentCity(city: CityInfo) {
    currentCity.value = city
  }

  async function fetchCityWeatherPanel(city: string, options: WeatherFetchOptions = {}) {
    const foundCity = cityList.find((item) => item.adcode === city)
    if (foundCity) {
      setCurrentCity(foundCity)
    }

    loading.value = true
    error.value = ''

    let liveResult: PromiseSettledResult<LiveWeather>

    if (options.refresh) {
      const [refreshedLiveResult] = await Promise.allSettled([
        fetchLiveWeather(city, options),
        fetchForecast(city, options),
      ])
      liveResult = refreshedLiveResult

      await Promise.allSettled([
        fetchHourlyTrend(city),
        fetchWarnings(city),
        fetchLifeTips(city),
      ])
    } else {
      const [cachedLiveResult] = await Promise.allSettled([
        fetchLiveWeather(city),
        fetchForecast(city),
        fetchHourlyTrend(city),
        fetchWarnings(city),
        fetchLifeTips(city),
      ])
      liveResult = cachedLiveResult
    }

    loading.value = false

    if (liveResult.status === 'rejected') {
      error.value = liveResult.reason instanceof Error ? liveResult.reason.message : '天气数据加载失败'
    }
  }

  return {
    currentCity,
    liveWeather,
    batchWeather,
    forecast,
    hourlyTrend,
    warnings,
    lifeTips,
    loading,
    batchLoading,
    error,
    lastUpdatedAt,
    cityList,
    fetchLiveWeather,
    fetchBatchWeather,
    fetchForecast,
    fetchHourlyTrend,
    fetchWarnings,
    fetchLifeTips,
    setCurrentCity,
    fetchCityWeatherPanel,
  }
})
