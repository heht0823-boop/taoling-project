import { requestData } from '@/utils/request'
import type {
  LiveWeather,
  ForecastWeather,
  HourlyTrend,
  WeatherWarning,
  WarningCity,
  LifeTips,
} from '@/types/weather'

export function getLiveWeatherApi(city: string) {
  return requestData<LiveWeather>({
    url: '/weather/live',
    method: 'GET',
    params: { city },
  })
}

export function getBatchLiveWeatherApi(cities: string[]) {
  return requestData<LiveWeather[]>({
    url: '/weather/live/batch',
    method: 'GET',
    params: { cities: cities.join(',') },
  })
}

export function getForecastWeatherApi(city: string) {
  return requestData<ForecastWeather>({
    url: '/weather/forecast',
    method: 'GET',
    params: { city },
  })
}

export function getHourlyTrendApi(city: string) {
  return requestData<HourlyTrend[]>({
    url: '/weather/24h',
    method: 'GET',
    params: { city },
  })
}

export function getWarningsApi(city?: string) {
  return requestData<WeatherWarning[] | WarningCity[]>({
    url: '/weather/warnings',
    method: 'GET',
    params: city ? { city } : undefined,
  })
}

export function getLifeTipsApi(city: string) {
  return requestData<LifeTips>({
    url: '/weather/tips',
    method: 'GET',
    params: { city },
  })
}
