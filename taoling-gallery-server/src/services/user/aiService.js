/**
 * AI Service - 桃灵助手核心服务
 */

const { Op, Sequelize } = require("sequelize");
const {
  sequelize,
  AiConversation,
  AiMessage,
  AiMemory,
  Image,
  Category,
  Tag,
  Favorite,
  UserStat,
} = require("../../models");
const { badRequest, notFound } = require("../../utils/httpError");
const { imageThumbnailUrl, normalizeImageUrl } = require("../../utils/imageUrl");
const { writeLog } = require("../logService");
const {
  callDashScope,
  callToolPlanner,
  streamDashScopeReply,
  generateTitle,
  summarizeMemories,
  normalizeNumberArray,
  fallbackReply,
} = require("./aiProviderService");

const DEFAULT_TITLE = "新的对话";
const FAVORITE_HINT = "需要把这些图片加入收藏吗？";
const NO_IMAGE_REPLY =
  "当前图库里暂时没有找到匹配的图片。你可以换个关键词再试试，或者去留言板留言，让管理员后续补充这类图片。";

const sortMap = {
  latest: [["created_at", "DESC"]],
  hot: [["view_count", "DESC"]],
  downloads: [["download_count", "DESC"]],
  favorites: [["favorite_count", "DESC"]],
  weight: [
    ["display_weight", "DESC"],
    ["created_at", "DESC"],
  ],
};

const buildFallbackTitle = () => DEFAULT_TITLE;

const isImageGenerationRequest = (message) =>
  /(生成|画|绘制|做一张|出一张|制作|create|generate|draw).{0,12}(图片|图像|插画|壁纸|头像|海报|image|picture)/i.test(
    message,
  ) ||
  /(图片|图像|插画|壁纸|头像|海报).{0,12}(生成|绘制|制作|create|generate|draw)/i.test(
    message,
  );

const imageGenerationReply =
  "我目前不提供图片生成、绘图或修图能力。如果你需要某类图片，我可以帮你在桃灵图库里查找相近作品；也可以去留言板留言，让管理员后续制作或发布。";

const appendFavoriteHint = (reply, images) => {
  if (!images.length) return reply || fallbackReply();
  const text = reply || fallbackReply();
  return text.includes(FAVORITE_HINT) ? text : `${text}\n\n${FAVORITE_HINT}`;
};

const toolNamesWithImages = new Set([
  "search_images",
  "get_hot_images",
  "get_latest_images",
]);

const serializeAiImage = (image, favoriteIds = new Set()) => ({
  id: image.id,
  title: image.title,
  description: image.description,
  image_url: normalizeImageUrl(image.image_url),
  thumbnail_url: imageThumbnailUrl(image, 420),
  aspect_ratio: image.aspect_ratio,
  category: image.category
    ? { id: image.category.id, name: image.category.name }
    : null,
  tags: (image.tags || []).map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  })),
  view_count: image.view_count,
  download_count: image.download_count,
  favorite_count: image.favorite_count,
  is_favorited: favoriteIds.has(Number(image.id)),
  detail_url: `/images/${image.id}`,
  created_at: image.created_at,
});

const getFavoriteIds = async (userId, imageIds) => {
  if (!userId || !imageIds.length) return new Set();
  const rows = await Favorite.findAll({
    where: { user_id: userId, image_id: imageIds },
    attributes: ["image_id"],
  });
  return new Set(rows.map((row) => Number(row.image_id)));
};

const withFavoriteStatus = async (userId, images) => {
  const ids = images.map((image) => Number(image.id));
  const favoriteIds = await getFavoriteIds(userId, ids);
  return images.map((image) => serializeAiImage(image, favoriteIds));
};

const getAvailableTags = async () => {
  const tags = await Tag.findAll({
    where: { status: "normal", deleted_at: null },
    attributes: ["name"],
    order: [
      ["usage_count", "DESC"],
      ["created_at", "DESC"],
    ],
    limit: 80,
  });
  return tags.map((tag) => tag.name);
};

const getAvailableCategories = async () => {
  const categories = await Category.findAll({
    where: { status: "normal", deleted_at: null },
    attributes: ["id", "name"],
    order: [
      ["sort_order", "DESC"],
      ["created_at", "DESC"],
    ],
    limit: 100,
  });
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));
};

const getMemoryText = async (userId, conversationId) => {
  const [shortMemory, longMemory] = await Promise.all([
    AiMemory.findOne({
      where: {
        user_id: userId,
        conversation_id: conversationId,
        memory_type: "short",
      },
    }),
    AiMemory.findOne({
      where: { user_id: userId, conversation_id: null, memory_type: "long" },
      order: [["updated_at", "DESC"]],
    }),
  ]);
  return {
    shortMemory: shortMemory?.content || "",
    longMemory: longMemory?.content || "",
    text: [
      longMemory?.content ? `长期偏好：${longMemory.content}` : "",
      shortMemory?.content ? `当前会话摘要：${shortMemory.content}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

const upsertMemory = async ({ userId, conversationId, type, content }) => {
  if (!content) return;
  const where = {
    user_id: userId,
    conversation_id: type === "long" ? null : conversationId,
    memory_type: type,
  };
  const current = await AiMemory.findOne({ where });
  if (current) {
    await current.update({ content });
    return;
  }
  await AiMemory.create({ ...where, content });
};

const getConversationHistory = async (conversationId, userId) => {
  const rows = await AiMessage.findAll({
    where: {
      conversation_id: conversationId,
      user_id: userId,
      deleted_at: null,
    },
    attributes: ["role", "content", "recommended_image_ids"],
    order: [["created_at", "DESC"]],
    limit: 10,
  });
  return rows
    .reverse()
    .map((row) => ({ role: row.role, content: row.content }));
};

const getLastRecommendedImageIds = async (conversationId, userId) => {
  const row = await AiMessage.findOne({
    where: {
      conversation_id: conversationId,
      user_id: userId,
      role: "assistant",
      deleted_at: null,
      recommended_image_ids: { [Op.ne]: null },
    },
    attributes: ["recommended_image_ids"],
    order: [["created_at", "DESC"]],
  });
  return normalizeNumberArray(row?.recommended_image_ids || [], 12);
};

const extractSearchTokens = (keyword) => {
  const cleaned = String(keyword || "")
    .replace(
      /(帮我|给我|麻烦|请|想要|看看|看一下|找找|查找|搜索|推荐|图片|图像|图库|作品|有没有|有没有|一下|一些|什么|相关|最新|热门|发布|的|了|呢|吗|吧|呀|啊)/g,
      " ",
    )
    .replace(/[，。！？、,.!?;；:：()[\]{}"'“”‘’\s]+/g, " ")
    .trim();
  const parts = cleaned.split(/\s+/).filter((item) => item.length >= 2);
  return [...new Set(parts)].slice(0, 8);
};

const keywordWhere = (keywords) => {
  const cleanKeywords = [
    ...new Set(
      keywords.map((item) => String(item || "").trim()).filter(Boolean),
    ),
  ].slice(0, 10);
  if (!cleanKeywords.length) return {};
  return {
    [Op.or]: cleanKeywords.flatMap((keyword) => [
      { title: { [Op.like]: `%${keyword}%` } },
      { description: { [Op.like]: `%${keyword}%` } },
      Sequelize.literal(`EXISTS (
        SELECT 1 FROM image_tags it
        INNER JOIN tags t ON t.id = it.tag_id
        WHERE it.image_id = Image.id
        AND t.deleted_at IS NULL
        AND t.name LIKE ${sequelize.escape(`%${keyword}%`)}
      )`),
    ]),
  };
};

const findImages = async ({
  userId,
  keyword,
  tags = [],
  category,
  sort = "weight",
  limit = 6,
}) => {
  const include = [
    {
      model: Category,
      as: "category",
      attributes: ["id", "name"],
      required: false,
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"],
      through: { attributes: [] },
      required: false,
    },
  ];
  const where = { status: "public", deleted_at: null };
  const cleanTags = [
    ...new Set(
      (tags || []).map((item) => String(item || "").trim()).filter(Boolean),
    ),
  ];
  const keywords = [
    ...extractSearchTokens(keyword),
    ...cleanTags,
    ...(category ? [category] : []),
  ].filter(Boolean);
  Object.assign(where, keywordWhere(keywords));

  if (category) {
    const categoryRow = await Category.findOne({
      where: {
        name: { [Op.like]: `%${category}%` },
        status: "normal",
        deleted_at: null,
      },
      attributes: ["id"],
    });
    if (categoryRow) where.category_id = categoryRow.id;
  }

  if (cleanTags.length) {
    include[1] = {
      ...include[1],
      required: true,
      where: { name: { [Op.in]: cleanTags } },
    };
  }

  const rows = await Image.findAll({
    where,
    include,
    distinct: true,
    order: sortMap[sort] || sortMap.weight,
    limit: Math.min(Number(limit || 6), 12),
  });
  return withFavoriteStatus(userId, rows);
};

const resolveSearchArgs = ({ rawMessage, availableTags, categories }) => {
  const text = String(rawMessage || "");
  const matchedTags = availableTags
    .filter((tag) => text.includes(tag))
    .slice(0, 8);
  const matchedCategory = categories.find((category) =>
    text.includes(category.name),
  );
  const tokens = extractSearchTokens(text);
  return {
    keyword: tokens.join(" "),
    tags: matchedTags,
    category: matchedCategory?.name || "",
  };
};

const findRecommendedImages = async (userId, keywords, recommendedTags) => {
  const images = await findImages({
    userId,
    keyword: keywords.join(" "),
    tags: recommendedTags,
    sort: "weight",
    limit: 6,
  });
  if (images.length || (!keywords.length && !recommendedTags.length))
    return images;
  return findImages({
    userId,
    keyword: keywords.join(" "),
    sort: "weight",
    limit: 6,
  });
};

const addFavorites = async ({ user, imageIds, req }) => {
  const cleanIds = normalizeNumberArray(imageIds, 12);
  if (!cleanIds.length) return { added: [], existed: [] };

  const images = await Image.findAll({
    where: { id: cleanIds, status: "public", deleted_at: null },
    attributes: ["id", "title", "favorite_count"],
  });
  const added = [];
  const existed = [];

  for (const image of images) {
    const [favorite, created] = await Favorite.findOrCreate({
      where: { user_id: user.id, image_id: image.id },
      defaults: { user_id: user.id, image_id: image.id },
    });
    if (created) {
      added.push(Number(image.id));
      await image.increment("favorite_count", { by: 1 });
      await UserStat.increment("favorite_count", {
        by: 1,
        where: { user_id: user.id },
      });
      await writeLog({
        actor: user,
        action_type: "FAVORITE_CREATE",
        target_type: "favorite",
        target_id: image.id,
        title: "AI 收藏图片",
        content: `${user.username} 通过桃灵助手收藏了图片《${image.title}》`,
        ip: req.ip,
      });
    } else if (favorite) {
      existed.push(Number(image.id));
    }
  }

  return { added, existed };
};

const executeToolCalls = async ({ user, req, conversationId, calls }) => {
  const images = [];
  const toolResults = [];
  let favoriteResult = null;

  for (const call of calls) {
    if (call.name === "get_hot_images") {
      const result = await findImages({
        userId: user.id,
        sort: "hot",
        limit: call.arguments.limit || 6,
      });
      images.push(...result);
      toolResults.push({ tool: call.name, result });
    }
    if (call.name === "get_latest_images") {
      const result = await findImages({
        userId: user.id,
        sort: "latest",
        limit: call.arguments.limit || 6,
      });
      images.push(...result);
      toolResults.push({ tool: call.name, result });
    }
    if (call.name === "search_images") {
      const result = await findImages({
        userId: user.id,
        keyword: call.arguments.keyword || "",
        tags: call.arguments.tags || [],
        category: call.arguments.category || "",
        sort: call.arguments.sort || "weight",
        limit: call.arguments.limit || 6,
      });
      images.push(...result);
      toolResults.push({ tool: call.name, result });
    }
    if (call.name === "add_favorites") {
      const fallbackIds = await getLastRecommendedImageIds(
        conversationId,
        user.id,
      );
      favoriteResult = await addFavorites({
        user,
        imageIds: call.arguments.image_ids?.length
          ? call.arguments.image_ids
          : fallbackIds,
        req,
      });
      toolResults.push({ tool: call.name, result: favoriteResult });
    }
  }

  const uniqueImages = Array.from(
    new Map(images.map((image) => [Number(image.id), image])).values(),
  ).slice(0, 12);
  return { images: uniqueImages, toolResults, favoriteResult };
};

const hasImageToolResult = (toolResults) =>
  toolResults.some((item) => toolNamesWithImages.has(item.tool));

const buildDeterministicImageReply = ({
  rawMessage,
  images,
  toolResults,
  favoriteResult,
}) => {
  if (favoriteResult) {
    return `已为你收藏 ${favoriteResult.added.length} 张图片，${favoriteResult.existed.length} 张之前已收藏。`;
  }

  if (!hasImageToolResult(toolResults)) return "";
  if (!images.length) return NO_IMAGE_REPLY;

  const firstTool = toolResults.find((item) =>
    toolNamesWithImages.has(item.tool),
  )?.tool;
  const lead =
    firstTool === "get_hot_images"
      ? "我按图库真实浏览热度为你找到了这些热门图片："
      : firstTool === "get_latest_images"
        ? "我按发布时间为你找到了这些最新发布的图片："
        : `我按“${rawMessage}”在图库真实数据里找到了这些图片：`;

  const lines = images.slice(0, 6).map((image, index) => {
    const tags = (image.tags || [])
      .map((tag) => tag.name)
      .filter(Boolean)
      .slice(0, 4);
    const meta = [
      image.category?.name ? `分类：${image.category.name}` : "",
      tags.length ? `标签：${tags.join("、")}` : "",
      `浏览：${image.view_count || 0}`,
      `收藏：${image.favorite_count || 0}`,
    ]
      .filter(Boolean)
      .join("，");
    return `${index + 1}. 《${image.title}》（ID：${image.id}${meta ? `，${meta}` : ""}）`;
  });

  return appendFavoriteHint([lead, ...lines].join("\n"), images);
};

const buildToolMessages = (toolResults) => {
  if (!toolResults.length) return [];
  return [
    {
      role: "system",
      content: `后端图库工具结果如下，请基于真实结果回复用户：${JSON.stringify(toolResults)}`,
    },
  ];
};

const prepareConversation = async ({ user, payload, userContent }) => {
  return sequelize.transaction(async (transaction) => {
    let conversation = null;
    let isNew = false;
    if (payload.conversation_id) {
      conversation = await AiConversation.findOne({
        where: {
          id: payload.conversation_id,
          user_id: user.id,
          deleted_at: null,
        },
        transaction,
      });
      if (!conversation) throw notFound("AI 会话不存在或已删除");
    } else {
      isNew = true;
      conversation = await AiConversation.create(
        { user_id: user.id, title: DEFAULT_TITLE },
        { transaction },
      );
      await UserStat.increment("ai_conversation_count", {
        by: 1,
        where: { user_id: user.id },
        transaction,
      });
    }

    await AiMessage.create(
      {
        conversation_id: conversation.id,
        user_id: user.id,
        role: "user",
        content: userContent,
      },
      { transaction },
    );
    return { conversation, isNew };
  });
};

const deterministicToolCalls = (message) => {
  if (/收藏|加入.*收藏|帮我收/i.test(message))
    return [{ name: "add_favorites", arguments: {} }];
  if (/热门|最多人看|热度|爆款/i.test(message))
    return [{ name: "get_hot_images", arguments: { limit: 6 } }];
  if (/最新|刚发布|新图|最近发布/i.test(message))
    return [{ name: "get_latest_images", arguments: { limit: 6 } }];
  if (
    /找|搜索|查找|推荐|看看|图库|图片|图像|壁纸|头像|风格|标签|分类/i.test(
      message,
    )
  )
    return [
      { name: "search_images", arguments: { keyword: message, limit: 6 } },
    ];
  return [];
};

const normalizeToolCalls = ({
  calls,
  rawMessage,
  availableTags,
  categories,
}) => {
  const searchArgs = resolveSearchArgs({
    rawMessage,
    availableTags,
    categories,
  });
  return calls.map((call) => {
    if (call.name !== "search_images") return call;
    return {
      ...call,
      arguments: {
        ...call.arguments,
        keyword: call.arguments.keyword || searchArgs.keyword,
        tags: call.arguments.tags?.length
          ? call.arguments.tags
          : searchArgs.tags,
        category: call.arguments.category || searchArgs.category,
        limit: call.arguments.limit || 6,
      },
    };
  });
};

const planTools = async ({
  messages,
  availableTags,
  categories,
  memory,
  rawMessage,
}) => {
  try {
    const calls = await callToolPlanner({ messages, availableTags, memory });
    if (calls.length)
      return normalizeToolCalls({
        calls,
        rawMessage,
        availableTags,
        categories,
      });
  } catch (error) {
    // 工具规划失败不影响兜底回复。
  }
  return normalizeToolCalls({
    calls: deterministicToolCalls(rawMessage),
    rawMessage,
    availableTags,
    categories,
  });
};

const updateConversationMemory = async ({
  userId,
  conversationId,
  existingShort,
  existingLong,
}) => {
  const messages = await getConversationHistory(conversationId, userId);
  const summarized = await summarizeMemories({
    existingShort,
    existingLong,
    messages,
  });
  await upsertMemory({
    userId,
    conversationId,
    type: "short",
    content: summarized.short_memory || existingShort,
  });
  if (summarized.long_memory) {
    await upsertMemory({
      userId,
      conversationId,
      type: "long",
      content: summarized.long_memory,
    });
  }
};

const finalizeAssistantMessage = async ({
  user,
  req,
  prepared,
  firstUserMessage,
  reply,
  recommendedTags,
  recommendedImages,
  existingShort,
  existingLong,
}) => {
  const recommendedImageIds = recommendedImages.map((image) => image.id);
  const title = prepared.isNew
    ? (await generateTitle({
        userMessage: firstUserMessage,
        assistantReply: reply,
      })) || buildFallbackTitle()
    : prepared.conversation.title;

  await sequelize.transaction(async (transaction) => {
    await AiMessage.create(
      {
        conversation_id: prepared.conversation.id,
        user_id: user.id,
        role: "assistant",
        content: reply,
        recommended_tags: recommendedTags,
        recommended_image_ids: recommendedImageIds,
      },
      { transaction },
    );
    if (prepared.isNew)
      await prepared.conversation.update({ title }, { transaction });
    await UserStat.increment("ai_message_count", {
      by: 2,
      where: { user_id: user.id },
      transaction,
    });
  });
  await updateConversationMemory({
    userId: user.id,
    conversationId: prepared.conversation.id,
    existingShort,
    existingLong,
  });
  await prepared.conversation.reload();

  await writeLog({
    actor: user,
    action_type: prepared.isNew ? "AI_CONVERSATION_CREATE" : "AI_MESSAGE_SEND",
    target_type: "ai",
    target_id: prepared.conversation.id,
    title: prepared.isNew ? "创建 AI 会话" : "发送 AI 消息",
    content: `${user.username} 使用了桃灵助手`,
    ip: req.ip,
  });
};

const buildChatState = async (user, payload) => {
  const rawMessage = String(payload.message || "").trim();
  if (!rawMessage) throw badRequest("消息内容不能为空");

  const prepared = await prepareConversation({
    user,
    payload,
    userContent: rawMessage,
  });
  const [history, availableTags, categories, memories] = await Promise.all([
    getConversationHistory(prepared.conversation.id, user.id),
    getAvailableTags(),
    getAvailableCategories(),
    getMemoryText(user.id, prepared.conversation.id),
  ]);
  return {
    rawMessage,
    prepared,
    history,
    availableTags,
    categories,
    memories,
  };
};

const chat = async (user, payload, req) => {
  const state = await buildChatState(user, payload);
  const baseMessages = state.history;
  const blockedGeneration = isImageGenerationRequest(state.rawMessage);
  const toolCalls = blockedGeneration
    ? deterministicToolCalls(state.rawMessage)
    : await planTools({
        messages: baseMessages,
        availableTags: state.availableTags,
        categories: state.categories,
        memory: state.memories.text,
        rawMessage: state.rawMessage,
      });
  const tools = await executeToolCalls({
    user,
    req,
    conversationId: state.prepared.conversation.id,
    calls: toolCalls,
  });

  const deterministicReply = buildDeterministicImageReply({
    rawMessage: state.rawMessage,
    images: tools.images,
    toolResults: tools.toolResults,
    favoriteResult: tools.favoriteResult,
  });

  let aiResult = {
    reply: blockedGeneration ? imageGenerationReply : "",
    recommended_tags: [],
    search_keywords: [],
    title: "",
  };
  if (deterministicReply) {
    aiResult.reply = deterministicReply;
  } else if (!blockedGeneration) {
    try {
      aiResult = await callDashScope({
        messages: [...baseMessages, ...buildToolMessages(tools.toolResults)],
        availableTags: state.availableTags,
        memory: state.memories.text,
      });
    } catch (error) {
      aiResult.reply = fallbackReply();
    }
  }

  const imageToolUsed = hasImageToolResult(tools.toolResults);
  const recommendedImages =
    imageToolUsed || tools.favoriteResult
      ? tools.images
      : await findRecommendedImages(
          user.id,
          aiResult.search_keywords || [],
          aiResult.recommended_tags || [],
        );
  const reply =
    deterministicReply ||
    appendFavoriteHint(aiResult.reply.trim(), recommendedImages);

  await finalizeAssistantMessage({
    user,
    req,
    prepared: state.prepared,
    firstUserMessage: state.rawMessage,
    reply,
    recommendedTags: aiResult.recommended_tags || [],
    recommendedImages,
    existingShort: state.memories.shortMemory,
    existingLong: state.memories.longMemory,
  });

  return {
    conversation_id: state.prepared.conversation.id,
    title: state.prepared.conversation.title,
    reply,
    recommended_tags: aiResult.recommended_tags || [],
    recommended_images: recommendedImages,
    tool_results: tools.toolResults,
  };
};

const chatStream = async (user, payload, req, onEvent) => {
  const state = await buildChatState(user, payload);
  await onEvent("start", {
    conversation_id: state.prepared.conversation.id,
    title: state.prepared.conversation.title,
    is_new: state.prepared.isNew,
    default_stream: true,
  });

  const blockedGeneration = isImageGenerationRequest(state.rawMessage);
  const toolCalls = blockedGeneration
    ? deterministicToolCalls(state.rawMessage)
    : await planTools({
        messages: state.history,
        availableTags: state.availableTags,
        categories: state.categories,
        memory: state.memories.text,
        rawMessage: state.rawMessage,
      });
  const tools = await executeToolCalls({
    user,
    req,
    conversationId: state.prepared.conversation.id,
    calls: toolCalls,
  });
  if (tools.toolResults.length)
    await onEvent("tools", { results: tools.toolResults });

  const deterministicReply = buildDeterministicImageReply({
    rawMessage: state.rawMessage,
    images: tools.images,
    toolResults: tools.toolResults,
    favoriteResult: tools.favoriteResult,
  });

  let reply = "";
  if (deterministicReply) {
    reply = deterministicReply;
    await onEvent("delta", { delta: reply });
  } else if (blockedGeneration) {
    reply = imageGenerationReply;
    await onEvent("delta", { delta: reply });
  } else {
    try {
      reply = await streamDashScopeReply({
        messages: [...state.history, ...buildToolMessages(tools.toolResults)],
        availableTags: state.availableTags,
        memory: state.memories.text,
        onDelta: async (delta) => onEvent("delta", { delta }),
      });
    } catch (error) {
      reply = fallbackReply();
      await onEvent("delta", { delta: reply });
    }
  }

  let aiResult = { recommended_tags: [], search_keywords: [] };
  try {
    aiResult = await callDashScope({
      messages: [
        ...state.history,
        ...buildToolMessages(tools.toolResults),
        { role: "assistant", content: reply },
        {
          role: "user",
          content: "请提取本轮推荐标签、图库搜索关键词和短标题。",
        },
      ],
      availableTags: state.availableTags,
      memory: state.memories.text,
    });
  } catch (error) {
    aiResult = {
      recommended_tags: [],
      search_keywords: [state.rawMessage].filter(Boolean),
    };
  }

  const imageToolUsed = hasImageToolResult(tools.toolResults);
  const recommendedImages =
    imageToolUsed || tools.favoriteResult
      ? tools.images
      : await findRecommendedImages(
          user.id,
          aiResult.search_keywords || [],
          aiResult.recommended_tags || [],
        );
  const finalReply =
    deterministicReply || appendFavoriteHint(reply, recommendedImages);
  const suffix = finalReply.slice(reply.length);
  if (suffix) await onEvent("delta", { delta: suffix });

  await finalizeAssistantMessage({
    user,
    req,
    prepared: state.prepared,
    firstUserMessage: state.rawMessage,
    reply: finalReply,
    recommendedTags: aiResult.recommended_tags || [],
    recommendedImages,
    existingShort: state.memories.shortMemory,
    existingLong: state.memories.longMemory,
  });

  const result = {
    conversation_id: state.prepared.conversation.id,
    title: state.prepared.conversation.title,
    reply: finalReply,
    recommended_tags: aiResult.recommended_tags || [],
    recommended_images: recommendedImages,
    tool_results: tools.toolResults,
  };
  await onEvent("done", result);
  return result;
};

const createConversation = async (user, payload, req) => {
  const title = String(payload.title || DEFAULT_TITLE).trim() || DEFAULT_TITLE;
  const conversation = await sequelize.transaction(async (transaction) => {
    const created = await AiConversation.create(
      { user_id: user.id, title },
      { transaction },
    );
    await UserStat.increment("ai_conversation_count", {
      by: 1,
      where: { user_id: user.id },
      transaction,
    });
    return created;
  });
  await writeLog({
    actor: user,
    action_type: "AI_CONVERSATION_CREATE",
    target_type: "ai",
    target_id: conversation.id,
    title: "创建 AI 会话",
    content: `${user.username} 创建了 AI 会话《${conversation.title}》`,
    ip: req.ip,
  });
  return {
    id: conversation.id,
    title: conversation.title,
    created_at: conversation.created_at,
    updated_at: conversation.updated_at,
  };
};

const listConversations = async (user) =>
  AiConversation.findAll({
    where: { user_id: user.id, deleted_at: null },
    attributes: ["id", "title", "created_at", "updated_at"],
    order: [["updated_at", "DESC"]],
  });

const listMessages = async (user, conversationId) => {
  const conversation = await AiConversation.findOne({
    where: { id: conversationId, user_id: user.id, deleted_at: null },
  });
  if (!conversation) throw notFound("AI 会话不存在或已删除");
  const messages = await AiMessage.findAll({
    where: {
      conversation_id: conversationId,
      user_id: user.id,
      deleted_at: null,
    },
    attributes: [
      "id",
      "role",
      "content",
      "recommended_tags",
      "recommended_image_ids",
      "created_at",
    ],
    order: [["created_at", "ASC"]],
  });
  const imageIds = [
    ...new Set(
      messages.flatMap((message) =>
        normalizeNumberArray(message.recommended_image_ids || [], 20),
      ),
    ),
  ];
  const imageMap = new Map();
  if (imageIds.length) {
    const rows = await Image.findAll({
      where: { id: imageIds, status: "public", deleted_at: null },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name", "color"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });
    const favoriteIds = await getFavoriteIds(user.id, imageIds);
    rows.forEach((image) =>
      imageMap.set(Number(image.id), serializeAiImage(image, favoriteIds)),
    );
  }
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    recommended_tags: message.recommended_tags || [],
    recommended_image_ids: message.recommended_image_ids || [],
    recommended_images: normalizeNumberArray(
      message.recommended_image_ids || [],
      20,
    )
      .map((id) => imageMap.get(Number(id)))
      .filter(Boolean),
    created_at: message.created_at,
  }));
};

const deleteConversation = async (user, conversationId, req) => {
  const conversation = await AiConversation.findOne({
    where: { id: conversationId, user_id: user.id, deleted_at: null },
  });
  if (!conversation) throw notFound("AI 会话不存在或已删除");
  await sequelize.transaction(async (transaction) => {
    await conversation.update({ deleted_at: new Date() }, { transaction });
    await AiMessage.update(
      { deleted_at: new Date() },
      {
        where: { conversation_id: conversation.id, deleted_at: null },
        transaction,
      },
    );
  });
  await writeLog({
    actor: user,
    action_type: "AI_CONVERSATION_DELETE",
    target_type: "ai",
    target_id: conversation.id,
    title: "删除 AI 会话",
    content: `${user.username} 删除了 AI 会话《${conversation.title}》`,
    ip: req.ip,
  });
  return {};
};

const clearConversations = async (user) => {
  const conversations = await AiConversation.findAll({
    where: { user_id: user.id, deleted_at: null },
    attributes: ["id"],
  });
  const ids = conversations.map((item) => item.id);
  await sequelize.transaction(async (transaction) => {
    await AiConversation.update(
      { deleted_at: new Date() },
      { where: { user_id: user.id, deleted_at: null }, transaction },
    );
    if (ids.length)
      await AiMessage.update(
        { deleted_at: new Date() },
        { where: { conversation_id: ids, deleted_at: null }, transaction },
      );
  });
  return {};
};

module.exports = {
  chat,
  chatStream,
  createConversation,
  listConversations,
  listMessages,
  deleteConversation,
  clearConversations,
};
