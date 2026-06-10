export interface LiveWeather {
  temperature: string
  weather: string
  winddirection: string
  windpower: string
  humidity: string
  adcode: string
  province: string
  city: string
  reportTime: string
}

export interface ForecastDay {
  date: string
  week: string
  dayweather: string
  nightweather: string
  daytemp: string
  nighttemp: string
  daywind: string
  nightwind: string
  daypower: string
  nightpower: string
}

export interface ForecastWeather {
  city: string
  adcode: string
  province: string
  reportTime: string
  casts: ForecastDay[]
}

export interface HourlyTrend {
  time: string
  temperature: number
  weather: string
}

export interface WeatherWarning {
  level: string
  type: string
  title: string
  content: string
  time: string
}

export interface WarningCity {
  city: string
  adcode: string
  warnings: WeatherWarning[]
}

export interface LifeTip {
  level: string
  advice: string
}

export interface LifeTips {
  uv: LifeTip
  dressing: LifeTip
  carWash: LifeTip
  sport: LifeTip
  travel: LifeTip
  coldRisk: LifeTip
}

export interface CityInfo {
  name: string
  adcode: string
  lat: number
  lng: number
  province: string
  region: 'north' | 'east' | 'south' | 'west' | 'central' | 'northeast' | 'northwest'
}

export const cityList: CityInfo[] = [
  { name: '北京', adcode: '110000', province: '北京', lat: 39.9042, lng: 116.4074, region: 'north' },
  { name: '上海', adcode: '310000', province: '上海', lat: 31.2304, lng: 121.4737, region: 'east' },
  { name: '天津', adcode: '120000', province: '天津', lat: 39.0842, lng: 117.2009, region: 'north' },
  { name: '重庆', adcode: '500000', province: '重庆', lat: 29.4316, lng: 106.9123, region: 'west' },
  { name: '广州', adcode: '440100', province: '广东', lat: 23.1291, lng: 113.2644, region: 'south' },
  { name: '深圳', adcode: '440300', province: '广东', lat: 22.5431, lng: 114.0579, region: 'south' },
  { name: '成都', adcode: '510100', province: '四川', lat: 30.5728, lng: 104.0668, region: 'west' },
  { name: '杭州', adcode: '330100', province: '浙江', lat: 30.2741, lng: 120.1552, region: 'east' },
  { name: '南京', adcode: '320100', province: '江苏', lat: 32.0603, lng: 118.7969, region: 'east' },
  { name: '苏州', adcode: '320500', province: '江苏', lat: 31.2989, lng: 120.5853, region: 'east' },
  { name: '武汉', adcode: '420100', province: '湖北', lat: 30.5928, lng: 114.3055, region: 'central' },
  { name: '长沙', adcode: '430100', province: '湖南', lat: 28.2282, lng: 112.9388, region: 'central' },
  { name: '郑州', adcode: '410100', province: '河南', lat: 34.7466, lng: 113.6254, region: 'central' },
  { name: '西安', adcode: '610100', province: '陕西', lat: 34.3416, lng: 108.9398, region: 'northwest' },
  { name: '济南', adcode: '370100', province: '山东', lat: 36.6512, lng: 117.1201, region: 'east' },
  { name: '青岛', adcode: '370200', province: '山东', lat: 36.0671, lng: 120.3826, region: 'east' },
  { name: '合肥', adcode: '340100', province: '安徽', lat: 31.8206, lng: 117.2272, region: 'east' },
  { name: '福州', adcode: '350100', province: '福建', lat: 26.0745, lng: 119.2965, region: 'east' },
  { name: '厦门', adcode: '350200', province: '福建', lat: 24.4798, lng: 118.0894, region: 'east' },
  { name: '南昌', adcode: '360100', province: '江西', lat: 28.682, lng: 115.8579, region: 'central' },
  { name: '昆明', adcode: '530100', province: '云南', lat: 25.0389, lng: 102.7183, region: 'west' },
  { name: '贵阳', adcode: '520100', province: '贵州', lat: 26.647, lng: 106.6302, region: 'west' },
  { name: '南宁', adcode: '450100', province: '广西', lat: 22.817, lng: 108.3669, region: 'south' },
  { name: '海口', adcode: '460100', province: '海南', lat: 20.044, lng: 110.1999, region: 'south' },
  { name: '哈尔滨', adcode: '230100', province: '黑龙江', lat: 45.8038, lng: 126.535, region: 'northeast' },
  { name: '长春', adcode: '220100', province: '吉林', lat: 43.8171, lng: 125.3235, region: 'northeast' },
  { name: '沈阳', adcode: '210100', province: '辽宁', lat: 41.8057, lng: 123.4315, region: 'northeast' },
  { name: '呼和浩特', adcode: '150100', province: '内蒙古', lat: 40.8426, lng: 111.7492, region: 'north' },
  { name: '太原', adcode: '140100', province: '山西', lat: 37.8706, lng: 112.5489, region: 'north' },
  { name: '石家庄', adcode: '130100', province: '河北', lat: 38.0428, lng: 114.5149, region: 'north' },
  { name: '兰州', adcode: '620100', province: '甘肃', lat: 36.0611, lng: 103.8343, region: 'northwest' },
  { name: '银川', adcode: '640100', province: '宁夏', lat: 38.4872, lng: 106.2309, region: 'northwest' },
  { name: '西宁', adcode: '630100', province: '青海', lat: 36.6171, lng: 101.7785, region: 'northwest' },
  { name: '乌鲁木齐', adcode: '650100', province: '新疆', lat: 43.8256, lng: 87.6168, region: 'northwest' },
  { name: '拉萨', adcode: '540100', province: '西藏', lat: 29.652, lng: 91.1721, region: 'west' },
  { name: '香港', adcode: '810000', province: '香港', lat: 22.3193, lng: 114.1694, region: 'south' },
  { name: '澳门', adcode: '820000', province: '澳门', lat: 22.1987, lng: 113.5439, region: 'south' },
]
