# Incident: repeated weather API requests and weak fallback

## Situation

天气页面最初会直接调用第三方天气 API。页面包含实况、批量城市、预报和趋势等多个数据区，刷新或重新进入页面会产生重复外部请求；第三方异常时，前端只能得到失败或缺少来源说明的兜底数据。

## Task

在不伪造天气数据的前提下减少重复调用，并让调用方明确区分最新外部数据、有效缓存、旧缓存和本地兜底。

## Action

- 新增 `weather_live_cache` 和 `weather_forecast_cache` 表，以 `adcode` 为唯一键保存原始响应和过期时间。
- 实况和预报分别配置 TTL，默认 30 分钟和 360 分钟。
- 普通请求先读有效缓存；过期后请求高德并回写。
- 支持 `refresh=true` 主动绕过有效缓存。
- 高德失败且存在旧缓存时返回旧值；无缓存时使用本地兜底。
- 响应增加 `source`、`cacheStatus`、`cachedAt`、`cacheExpiresAt` 和 `fallbackReason`。
- 前端 store 与页面显示缓存状态，并以 `Promise.allSettled` 隔离局部接口失败。

## Result

相同城市在 TTL 内不再重复请求第三方接口；外部服务失败时页面仍能展示最近数据或明确的本地兜底，并说明失败原因。关键改造可回溯到提交 [`f361d1d`](https://github.com/heht0823-boop/taoling-project/commit/f361d1d)。

没有在本复盘中填写节省比例或响应时间数字，因为当前仓库没有固定流量模型和可复现基准测试。

## What I learned

缓存不是“有值就返回”，而是一套状态机。有效缓存、主动刷新、旧缓存兜底和完全降级应在契约中显式表达，否则前端无法判断数据新鲜度，问题也难以复盘。

## Prevention

- 为 cache hit / refreshed / stale / fallback 增加结构化日志和指标。
- 对同一 key 的并发过期请求增加 single-flight，避免缓存击穿。
- 在契约测试中覆盖第三方超时、旧缓存存在和无缓存三条路径。
