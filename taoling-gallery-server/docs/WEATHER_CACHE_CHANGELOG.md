# 天气缓存改造说明

## 背景

当前天气模块直接请求高德天气 API。为了减少重复外部请求、提升页面响应速度，并在高德异常时保留最近可用数据，本次增加数据库缓存层。

## 需要在阿里云执行的表

完整建表 SQL 已放在：

`taoling-gallery-server/docs/weather-cache-tables.sql`

需要创建两张表：

1. `weather_live_cache`：缓存高德实况天气接口 `extensions=base` 返回的数据。
2. `weather_forecast_cache`：缓存高德天气预报接口 `extensions=all` 返回的数据。

这两张表都以 `adcode` 做唯一键，同一个城市只保留一份最新缓存。`raw_payload` 保存高德原始响应快照，便于后续排查接口数据。

## 后端改动

### 新增模型

- `src/models/WeatherLiveCache.js`
- `src/models/WeatherForecastCache.js`

并已在 `src/models/index.js` 中统一导出。

### 新增环境配置

在 `src/config/env.js` 的 `amap` 配置中新增：

- `AMAP_LIVE_CACHE_MINUTES`：实况天气有效缓存分钟数，默认 `30`。
- `AMAP_FORECAST_CACHE_MINUTES`：天气预报有效缓存分钟数，默认 `360`。

如果不配置环境变量，后端会使用默认值。

### 天气服务缓存策略

修改文件：

- `src/services/weatherService.js`

策略如下：

1. 普通请求先查数据库缓存。
2. 缓存未过期时直接返回缓存，不请求高德。
3. 缓存不存在或已过期时请求高德。
4. 高德请求成功后回写数据库，再返回最新数据。
5. 高德请求失败但数据库里有旧缓存时，返回旧缓存，并附带 `fallbackReason`。
6. 高德请求失败且数据库没有缓存时，保留原来的本地兜底数据。
7. 缓存读写异常不会中断天气接口，只会在后端控制台输出 `[weather-cache]` 警告，并继续返回高德最新数据或兜底数据。

返回数据新增的辅助字段：

- `source`：`amap` 或 `fallback`。
- `cacheStatus`：`cache`、`refreshed`、`stale`、`fallback`。
- `cachedAt`：缓存写入时间。
- `cacheExpiresAt`：缓存过期时间。
- `fallbackReason`：高德失败时的原因说明。

### 接口刷新参数

修改文件：

- `src/controllers/weatherController.js`

以下接口支持 `refresh=true` 或 `refresh=1`：

- `GET /api/weather/live?city=110000&refresh=true`
- `GET /api/weather/live/batch?cities=110000,310000&refresh=true`
- `GET /api/weather/forecast?city=110000&refresh=true`
- `GET /api/weather/24h?city=110000&refresh=true`

带 `refresh` 时会绕过有效缓存，主动请求高德并回写数据库。

## 前端改动

### API 层

修改文件：

- `taoling-gallery/src/apis/weather.ts`

天气实况、批量实况、天气预报、24 小时趋势接口新增 `refresh` 可选参数。

### Store 层

修改文件：

- `taoling-gallery/src/stores/weather.ts`

天气 store 新增 `WeatherFetchOptions`，支持普通缓存读取和强制刷新两种调用方式。

强制刷新城市面板时，会先刷新实况和预报缓存，再基于最新缓存生成 24 小时趋势，避免同一次点击重复请求高德。

批量实况天气请求已按小批次处理，单个城市失败不会导致整批接口返回 500。

### 页面层

修改文件：

- `taoling-gallery/src/views/Weather.vue`

页面行为调整：

1. 页面首次进入时默认读取缓存，缓存过期时后端才请求高德。
2. “刷新天气”按钮会传 `refresh=true`，强制请求高德最新数据。
3. 刷新中按钮禁用并显示“刷新中”。
4. 当前实况卡片新增“数据状态”和“缓存时间”。
5. 高德异常且使用旧缓存时，页面显示后端返回的 `fallbackReason`。
6. 页面天气请求使用 `Promise.allSettled` 处理，避免偶发接口异常造成浏览器 `Uncaught (in promise)`。

### 类型定义

修改文件：

- `taoling-gallery/src/types/weather.ts`

`LiveWeather` 和 `ForecastWeather` 新增缓存相关可选字段，匹配后端返回。

## 部署顺序建议

1. 在阿里云 MySQL 执行 `weather-cache-tables.sql`。
2. 部署后端代码。
3. 确认后端环境变量存在 `AMAP_KEY`。
4. 可选配置缓存时间：
   - `AMAP_LIVE_CACHE_MINUTES=30`
   - `AMAP_FORECAST_CACHE_MINUTES=360`
5. 部署前端代码。
6. 打开天气页面，第一次访问会写入缓存；再次访问会优先读缓存；点击“刷新天气”会强制更新。
