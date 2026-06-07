/**
 * AI Provider Service - 阿里云百炼 OpenAI 兼容接口封装
 * 提供与 DashScope API 的交互能力，包括聊天、工具调用、图片识别等功能
 */

const env = require("../../config/env");
const { HttpError } = require("../../utils/httpError");

/**
 * 安全解析 JSON，支持从文本中提取 JSON 对象
 * @param {string} content - 可能包含 JSON 的字符串
 * @returns {Object|null} 解析后的 JSON 对象或 null
 */
const safeJsonParse = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    const matched = String(content || "").match(/\{[\s\S]*\}/);
    if (!matched) return null;
    try {
      return JSON.parse(matched[0]);
    } catch (innerError) {
      return null;
    }
  }
};

/**
 * 规范化字符串数组，去重、过滤空值并限制长度
 * @param {Array} value - 待处理的数组
 * @param {number} limit - 最大长度限制（默认8）
 * @returns {string[]} 规范化后的字符串数组
 */
const normalizeStringArray = (value, limit = 8) => {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(value.map((item) => String(item || "").trim()).filter(Boolean)),
  ].slice(0, limit);
};

/**
 * 规范化数字数组，去重、过滤非正数并限制长度
 * @param {Array} value - 待处理的数组
 * @param {number} limit - 最大长度限制（默认12）
 * @returns {number[]} 规范化后的数字数组
 */
const normalizeNumberArray = (value, limit = 12) => {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(value.map((item) => Number(item)).filter((item) => item > 0)),
  ].slice(0, limit);
};

/**
 * 备用回复内容，当 AI 解析失败时使用
 * @returns {string} 默认回复文本
 */
const fallbackReply = () =>
  "我先按你的描述在图库里找找相关灵感。如果你有更明确的风格、主题、颜色或用途，也可以继续补充。";

/**
 * 构建助手系统提示词（用于流式回复）
 * @param {Object} options - 配置选项
 * @param {string[]} options.availableTags - 可用标签列表
 * @param {string} options.memory - 用户记忆信息
 * @returns {string} 系统提示词
 */
const buildAssistantSystemPrompt = ({ availableTags = [], memory = "" }) => {
  const tagsText = availableTags.length ? availableTags.join("、") : "暂无标签";
  return [
    "你是“桃灵助手”，服务于 AI 图片图库网站“桃灵图库”。",
    "你的定位是理解用户想找的图库图片，并给出自然、简洁、可执行的中文回复。",
    "你不能生成图片、绘图、修图或承诺产出新图片。用户要求生成图片时，要说明当前不提供图片生成；如果需要某类图片，你可以帮他在图库中查找，或建议去留言板留言让管理员制作。",
    "当后端提供图库工具结果时，要基于这些结果回复用户，不要编造不存在的图片。",
    "如果用户上传或引用了图片，你可以基于图片识别结果理解需求，但仍然只能推荐图库内容。",
    "回复适合逐字流式展示，不要返回 JSON，不要返回 Markdown 代码块。",
    `当前图库可用标签参考：${tagsText}`,
    memory ? `用户记忆参考：\n${memory}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

/**
 * 构建 JSON 格式系统提示词（用于结构化输出）
 * @param {Object} options - 配置选项
 * @param {string[]} options.availableTags - 可用标签列表
 * @param {string} options.memory - 用户记忆信息
 * @returns {string} 系统提示词
 */
const buildJsonSystemPrompt = ({ availableTags = [], memory = "" }) => {
  const tagsText = availableTags.length ? availableTags.join("、") : "暂无标签";
  return [
    "你是“桃灵助手”的结构化分析器。",
    "你必须只返回 JSON，不要返回 Markdown，不要返回代码块。",
    "JSON 字段必须包含：reply、recommended_tags、search_keywords、title。",
    "reply 是给用户看的中文回复。",
    "recommended_tags 是推荐给前端展示的标签名数组，优先从图库已有标签里选。",
    "search_keywords 是用于后端检索 images.title、images.description、tags.name 的关键词数组。",
    "title 是基于用户首条输入和助手回复生成的新会话短标题，18 个中文以内。",
    "遇到图片生成、绘图、修图需求时，reply 必须明确当前不提供图片生成，并引导用户改为图库搜索或留言给管理员。",
    `当前图库可用标签参考：${tagsText}`,
    memory ? `用户记忆参考：\n${memory}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

/**
 * 构建记忆整理系统提示词
 * @returns {string} 系统提示词
 */
const buildMemorySystemPrompt = () =>
  [
    "你是桃灵助手的记忆整理器。",
    "你必须只返回 JSON，不要返回 Markdown，不要返回代码块。",
    "JSON 字段：short_memory、long_memory。",
    "short_memory 用 120 字以内总结当前会话上下文、待办和最近图片偏好。",
    "long_memory 用 160 字以内总结用户稳定偏好，例如喜欢的风格、题材、颜色、比例、收藏倾向。没有明显偏好则返回空字符串。",
  ].join("\n");

/**
 * 可用工具列表（用于工具调用）
 * @type {Array}
 */
const tools = [
  {
    type: "function",
    function: {
      name: "search_images",
      description: "按关键词、分类或标签搜索图库中的公开图片。",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "搜索关键词" },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "标签名列表",
          },
          category: { type: "string", description: "分类名" },
          sort: {
            type: "string",
            enum: ["weight", "latest", "hot", "favorites", "downloads"],
          },
          limit: { type: "integer", minimum: 1, maximum: 12 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_hot_images",
      description: "获取热门图片。",
      parameters: {
        type: "object",
        properties: { limit: { type: "integer", minimum: 1, maximum: 12 } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_latest_images",
      description: "获取最新发布图片。",
      parameters: {
        type: "object",
        properties: { limit: { type: "integer", minimum: 1, maximum: 12 } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_favorites",
      description: "当用户确认想收藏 AI 推荐的图片时，把图片加入当前用户收藏。",
      parameters: {
        type: "object",
        properties: {
          image_ids: {
            type: "array",
            items: { type: "integer" },
            description: "要收藏的图片 ID 列表",
          },
        },
        required: ["image_ids"],
      },
    },
  },
];

/**
 * 调用 DashScope API 进行聊天请求
 * @param {Object} options - 请求配置
 * @param {Array} options.messages - 消息列表
 * @param {number} [options.temperature=0.6] - 温度参数
 * @param {boolean} [options.stream=false] - 是否流式响应
 * @param {Object} [options.responseFormat] - 响应格式
 * @param {string} [options.model] - 模型名称
 * @param {Object} [options.extra={}] - 额外参数
 * @returns {Promise<Object|Response>} 响应结果或流式响应对象
 */
const requestChat = async ({
  messages,
  temperature = 0.6,
  stream = false,
  responseFormat,
  model,
  extra = {},
}) => {
  if (!env.ai.apiKey) {
    throw new HttpError(
      503,
      "AI 服务未配置 API Key，请检查 DASHSCOPE_API_KEY 环境变量",
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.ai.timeoutMs);
  try {
    const response = await fetch(
      `${env.ai.baseUrl.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || env.ai.model,
          messages,
          temperature,
          stream,
          ...(responseFormat ? { response_format: responseFormat } : {}),
          ...extra,
        }),
        signal: controller.signal,
      },
    );

    if (stream) return response;

    const raw = await response.text();
    let body = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch (error) {
      body = null;
    }

    if (!response.ok) {
      const message =
        body?.error?.message || body?.message || raw || "AI 服务调用失败";
      throw new HttpError(
        response.status >= 500 ? 502 : 400,
        `AI 服务返回错误：${message}`,
      );
    }
    return body;
  } catch (error) {
    if (error.name === "AbortError")
      throw new HttpError(504, "AI 服务响应超时，请稍后重试");
    if (error instanceof HttpError) throw error;
    throw new HttpError(502, `AI 服务调用失败：${error.message}`);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * 解析 AI 响应结果
 * @param {string} content - AI 返回的内容
 * @returns {Object} 解析后的结果对象
 */
const parseResult = (content) => {
  const parsed = safeJsonParse(content);
  if (!parsed) {
    return {
      reply: String(content || "").trim() || fallbackReply(),
      recommended_tags: [],
      search_keywords: [],
      title: "",
    };
  }
  return {
    reply: String(parsed.reply || "").trim() || fallbackReply(),
    recommended_tags: normalizeStringArray(parsed.recommended_tags),
    search_keywords: normalizeStringArray(parsed.search_keywords),
    title: String(parsed.title || "")
      .trim()
      .slice(0, 30),
  };
};

/**
 * 调用 DashScope 获取结构化响应
 * @param {Object} options - 请求配置
 * @param {Array} options.messages - 消息列表
 * @param {string[]} options.availableTags - 可用标签列表
 * @param {string} options.memory - 用户记忆信息
 * @returns {Promise<Object>} 解析后的响应结果
 */
const callDashScope = async ({ messages, availableTags, memory }) => {
  const body = await requestChat({
    messages: [
      {
        role: "system",
        content: buildJsonSystemPrompt({ availableTags, memory }),
      },
      ...messages,
    ],
    responseFormat: { type: "json_object" },
  });
  return parseResult(body?.choices?.[0]?.message?.content);
};

/**
 * 调用工具规划器，判断是否需要调用图库工具
 * @param {Object} options - 请求配置
 * @param {Array} options.messages - 消息列表
 * @param {string[]} options.availableTags - 可用标签列表
 * @param {string} options.memory - 用户记忆信息
 * @returns {Promise<Array>} 工具调用列表
 */
const callToolPlanner = async ({ messages, availableTags, memory }) => {
  const body = await requestChat({
    messages: [
      {
        role: "system",
        content: buildAssistantSystemPrompt({ availableTags, memory }),
      },
      {
        role: "system",
        content:
          "判断用户是否需要调用图库工具。只有明确需要搜索图片、查看热门/最新、或确认收藏推荐图片时才调用工具；普通闲聊无需调用。",
      },
      ...messages,
    ],
    temperature: 0.2,
    extra: { tools, tool_choice: "auto" },
  });
  const calls = body?.choices?.[0]?.message?.tool_calls || [];
  return calls
    .map((call) => ({
      id: call.id,
      name: call.function?.name,
      arguments: safeJsonParse(call.function?.arguments || "{}") || {},
    }))
    .filter((call) => call.name);
};

/**
 * 调用 DashScope 进行流式回复
 * @param {Object} options - 请求配置
 * @param {Array} options.messages - 消息列表
 * @param {string[]} options.availableTags - 可用标签列表
 * @param {string} options.memory - 用户记忆信息
 * @param {Function} options.onDelta - 增量回调函数
 * @returns {Promise<string>} 完整回复文本
 */
const streamDashScopeReply = async ({
  messages,
  availableTags,
  memory,
  onDelta,
}) => {
  const response = await requestChat({
    messages: [
      {
        role: "system",
        content: buildAssistantSystemPrompt({ availableTags, memory }),
      },
      ...messages,
    ],
    temperature: 0.7,
    stream: true,
  });

  if (!response.ok) {
    const raw = await response.text();
    let body = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch (error) {
      body = null;
    }
    const message =
      body?.error?.message || body?.message || raw || "AI 流式服务调用失败";
    throw new HttpError(
      response.status >= 500 ? 502 : 400,
      `AI 服务返回错误：${message}`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullText = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return fullText;
      const parsed = JSON.parse(data);
      const delta = parsed?.choices?.[0]?.delta?.content || "";
      if (!delta) continue;
      fullText += delta;
      await onDelta(delta);
    }
  }
  return fullText;
};

/**
 * 生成会话标题
 * @param {Object} options - 请求配置
 * @param {string} options.userMessage - 用户消息
 * @param {string} options.assistantReply - 助手回复
 * @returns {Promise<string>} 会话标题
 */
const generateTitle = async ({ userMessage, assistantReply }) => {
  try {
    const body = await requestChat({
      messages: [
        {
          role: "system",
          content:
            '你只返回 JSON：{"title":"18个中文以内的会话标题"}。标题必须基于用户第一条输入和助手第一条回复总结，不要照抄长句。',
        },
        {
          role: "user",
          content: `用户第一条输入：${userMessage}\n助手回复：${assistantReply}`,
        },
      ],
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });
    const parsed = safeJsonParse(body?.choices?.[0]?.message?.content || "");
    return String(parsed?.title || "")
      .trim()
      .slice(0, 30);
  } catch (error) {
    return "";
  }
};

/**
 * 总结记忆内容
 * @param {Object} options - 请求配置
 * @param {string} options.existingShort - 已有短期记忆
 * @param {string} options.existingLong - 已有长期记忆
 * @param {Array} options.messages - 消息列表
 * @returns {Promise<Object>} 包含短期和长期记忆的对象
 */
const summarizeMemories = async ({ existingShort, existingLong, messages }) => {
  try {
    const body = await requestChat({
      messages: [
        { role: "system", content: buildMemorySystemPrompt() },
        {
          role: "user",
          content: [
            `已有短期记忆：${existingShort || "无"}`,
            `已有长期记忆：${existingLong || "无"}`,
            "最近消息：",
            ...messages.map((item) => `${item.role}: ${item.content}`),
          ].join("\n"),
        },
      ],
      temperature: 0.2,
      responseFormat: { type: "json_object" },
    });
    const parsed = safeJsonParse(body?.choices?.[0]?.message?.content || "");
    return {
      short_memory: String(parsed?.short_memory || "")
        .trim()
        .slice(0, 500),
      long_memory: String(parsed?.long_memory || "")
        .trim()
        .slice(0, 800),
    };
  } catch (error) {
    return {
      short_memory: messages
        .slice(-4)
        .map(
          (item) =>
            `${item.role === "user" ? "用户" : "助手"}：${item.content}`,
        )
        .join("\n")
        .slice(0, 500),
      long_memory: existingLong || "",
    };
  }
};

module.exports = {
  callDashScope,
  callToolPlanner,
  streamDashScopeReply,
  generateTitle,
  summarizeMemories,
  normalizeStringArray,
  normalizeNumberArray,
  fallbackReply,
};
