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

  async function fetchLiveWeather(city: string) {
    loading.value = true
    error.value = ''
    try {
      const result = await getLiveWeatherApi(city)
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

  async function fetchBatchWeather(cities: string[]) {
    batchLoading.value = true
    error.value = ''
    try {
      const result = await getBatchLiveWeatherApi(cities)
      batchWeather.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '批量获取天气失败'
      throw e
    } finally {
      batchLoading.value = false
    }
  }

  async function fetchForecast(city: string) {
    loading.value = true
    error.value = ''
    try {
      const result = await getForecastWeatherApi(city)
      forecast.value = result
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取天气预报失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchHourlyTrend(city: string) {
    loading.value = true
    error.value = ''
    try {
      const result = await getHourlyTrendApi(city)
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

  async function fetchCityWeatherPanel(city: string) {
    const foundCity = cityList.find((item) => item.adcode === city)
    if (foundCity) {
      setCurrentCity(foundCity)
    }

    loading.value = true
    error.value = ''

    const [liveResult] = await Promise.allSettled([
      fetchLiveWeather(city),
      fetchForecast(city),
      fetchHourlyTrend(city),
      fetchWarnings(city),
      fetchLifeTips(city),
    ])

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
