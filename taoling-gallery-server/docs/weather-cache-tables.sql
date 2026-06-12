-- 桃灵图库天气缓存表
-- 用途：缓存高德天气实况和天气预报接口数据，后端默认优先读取有效缓存。

CREATE TABLE weather_live_cache (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '缓存ID',

  adcode VARCHAR(20) NOT NULL COMMENT '城市编码 adcode',
  province VARCHAR(50) DEFAULT NULL COMMENT '省份名称',
  city VARCHAR(50) NOT NULL COMMENT '城市名称',

  weather VARCHAR(50) NOT NULL COMMENT '天气现象，如 晴、多云、小雨',
  temperature VARCHAR(20) NOT NULL COMMENT '实时温度，保留高德原始字符串',
  winddirection VARCHAR(50) DEFAULT NULL COMMENT '风向',
  windpower VARCHAR(50) DEFAULT NULL COMMENT '风力',
  humidity VARCHAR(20) DEFAULT NULL COMMENT '湿度，保留高德原始字符串',

  report_time DATETIME DEFAULT NULL COMMENT '高德数据发布时间',
  source ENUM('amap', 'fallback') NOT NULL DEFAULT 'amap' COMMENT '数据来源：amap高德接口，fallback本地兜底',
  raw_payload JSON DEFAULT NULL COMMENT '高德原始响应快照',
  fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '本次缓存拉取时间',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY uk_adcode (adcode),
  INDEX idx_city (city),
  INDEX idx_source (source),
  INDEX idx_report_time (report_time),
  INDEX idx_fetched_at (fetched_at)
) COMMENT='天气实况缓存表';

CREATE TABLE weather_forecast_cache (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '缓存ID',

  adcode VARCHAR(20) NOT NULL COMMENT '城市编码 adcode',
  province VARCHAR(50) DEFAULT NULL COMMENT '省份名称',
  city VARCHAR(50) NOT NULL COMMENT '城市名称',

  report_time DATETIME DEFAULT NULL COMMENT '高德数据发布时间',
  casts JSON NOT NULL COMMENT '天气预报日列表，保存未来多天预报',
  source ENUM('amap', 'fallback') NOT NULL DEFAULT 'amap' COMMENT '数据来源：amap高德接口，fallback本地兜底',
  raw_payload JSON DEFAULT NULL COMMENT '高德原始响应快照',
  fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '本次缓存拉取时间',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY uk_adcode (adcode),
  INDEX idx_city (city),
  INDEX idx_source (source),
  INDEX idx_report_time (report_time),
  INDEX idx_fetched_at (fetched_at)
) COMMENT='天气预报缓存表';
