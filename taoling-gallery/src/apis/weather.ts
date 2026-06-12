import { requestData } from '@/utils/request'
import type {
  LiveWeather,
  ForecastWeather,
  HourlyTrend,
  WeatherWarning,
  WarningCity,
  LifeTips,
} from '@/types/weather'

export interface WeatherRequestOptions {
  refresh?: boolean
}

function withRefreshParam(city: string, options: WeatherRequestOptions = {}) {
  return options.refresh ? { city, refresh: 'true' } : { city }
}

export function getLiveWeatherApi(city: string, options: WeatherRequestOptions = {}) {
  return requestData<LiveWeather>({
    url: '/weather/live',
    method: 'GET',
    params: withRefreshParam(city, options),
  })
}

export function getBatchLiveWeatherApi(cities: string[], options: WeatherRequestOptions = {}) {
  return requestData<LiveWeather[]>({
    url: '/weather/live/batch',
    method: 'GET',
    params: options.refresh ? { cities: cities.join(','), refresh: 'true' } : { cities: cities.join(',') },
  })
}

export function getForecastWeatherApi(city: string, options: WeatherRequestOptions = {}) {
  return requestData<ForecastWeather>({
    url: '/weather/forecast',
    method: 'GET',
    params: withRefreshParam(city, options),
  })
}

export function getHourlyTrendApi(city: string, options: WeatherRequestOptions = {}) {
  return requestData<HourlyTrend[]>({
    url: '/weather/24h',
    method: 'GET',
    params: withRefreshParam(city, options),
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
