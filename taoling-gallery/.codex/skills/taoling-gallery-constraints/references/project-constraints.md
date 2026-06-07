「桃灵图库 Taoling Gallery」前端开发约束文档
你现在是一名资深 Vue3 + TypeScript 前端架构师，请严格按照以下约束为我开发「桃灵图库 Taoling Gallery」个人 AI 图片图库网站前端项目。
一、项目基础信息
1. 项目名称
中文名称：
桃灵图库
英文名称：
Taoling Gallery
开发阶段访问地址：
http://localhost:3000
线上域名：
hetao123.xin
注意：域名可以继续使用 hetao123.xin，但网站品牌、页面标题、导航展示、主题文案必须统一为「桃灵图库 / Taoling Gallery」。
2. 项目定位
这是一个 个人 AI 图片图库网站。
它不是普通博客，不是社区平台，不是用户投稿平台，也不是多创作者作品集网站。
本项目真实业务闭环只有：
管理员发布、编辑、删除 AI 图片。
游客浏览首页、图库、搜索筛选、图片详情。
登录用户收藏图片、下载图片、查看下载记录、使用桃灵助手。
管理员管理图片、分类、标签、用户、操作日志。
开发者为唯一管理员，负责上传、发布、编辑、删除 AI 图片作品，并对图片进行分类和标签管理。
3. 用户角色
系统只有三种访问状态：
游客
游客可以：
浏览首页
浏览图库
搜索图片
筛选分类和标签
查看图片详情
游客不可以：
收藏图片
下载图片
使用 AI 助手
进入个人中心
进入管理端
游客点击收藏、下载、AI 助手时，必须提示登录。
普通用户
普通用户可以：
登录 / 注册
浏览图片
收藏图片
取消收藏
下载图片
查看下载记录
使用桃灵助手聊天
管理个人资料
退出登录
普通用户不可以：
上传图片
管理图片
管理分类
管理标签
管理用户
查看后台统计
查看操作日志
管理员
管理员和普通用户共用同一个登录入口。
通过 users.role 字段区分身份：
role = 'admin'
role = 'user'
管理员可以：
上传 AI 图片
编辑图片信息
删除图片
修改图片公开状态
管理分类
管理标签
管理用户状态
查看统计数据
查看最近动态和操作日志
4. 登录后的跳转规则
登录入口只有一个。
登录成功后根据角色处理：
用户端和游客顶部显示首页图库AI助手我的,当管理员登录成功话顶部导航会提供控制体入口用于管理员发布图片、管理图片、管理分类、管理标签、管理用户、查看后台统计、查看操作日志。
5. 必须禁止出现的业务
本项目不是社区，所以必须禁止出现以下业务：
用户发布作品
用户作品集
用户获赞
用户关注
用户粉丝
用户评论
用户私信
用户之间互动
PRO 用户
创作者计划
打赏
社区动态
图片点赞
关注作者
作者主页
粉丝数
作品数
用户等级
如果设计稿中出现这些内容，必须删除或改成符合本项目的真实字段。
二、视觉主题规范
1. 主题名称
主题名称：
Peach Spirit Gallery｜桃灵梦境图库
中文主题：
桃灵图库
主题关键词：
浅色
柔和
桃粉
淡紫
奶白
治愈
梦幻
AI 灵感
轻拟物
圆角卡片
柔和渐变
可爱 IP
干净留白
轻量玻璃感
个人艺术图库
2. 主题定位
本项目必须严格参考当前 UI 截图。
整体风格是：
浅色桃粉紫梦幻图库风格。
不是：
暗黑赛博
深色宇宙
强霓虹科技
传统后台
普通博客
社区平台
页面应该像：
一个温柔的 AI 图片灵感岛。
一个可爱的个人图库展厅。
一个带有桃子精灵 IP 的艺术收藏空间。
一个轻量、干净、梦幻的 AI 图片管理平台。
3. 最高视觉约束
本项目必须严格参考我提供的 UI 截图，整体为浅色桃粉紫梦幻图库风格。
不允许改成暗黑赛博、深色宇宙、强霓虹科技风。
所有页面必须保持「桃灵图库」的浅色、柔和、治愈、圆角、轻拟物、桃粉紫渐变视觉体系。
4. 背景规范
主背景使用：
奶白色
极浅粉色
浅桃粉渐变
浅蓝紫渐变
柔和大面积留白
局部低透明光晕
局部柔和粉紫发光背景
禁止使用：
深黑背景
暗蓝宇宙背景
大面积赛博霓虹
强烈动态粒子
高对比科幻背景
黑客终端风
扫描线效果
推荐背景变量：
$color-bg-page: #fff8fb;
$color-bg-soft: #fff1f6;
$color-bg-card: rgba(255, 255, 255, 0.76);
$color-bg-panel: rgba(255, 246, 250, 0.86);
$color-bg-hover: #fff0f7;
5. 主色规范
主色以 桃粉 + 紫色渐变 为核心。
$color-primary: #a14878;
$color-primary-dark: #823d6f;
$color-primary-light: #f48bb5;
$color-secondary: #8b6eea;
$color-secondary-light: #c5b6ff;
$color-accent-blue: #9edcff;
$color-accent-pink: #ffd6e5;
$color-accent-purple: #eadfff;
$color-accent-yellow: #fff0bd;
$color-text-main: #332832;
$color-text-secondary: #6f5f6d;
$color-text-light: #9b8c98;
$color-border-soft: rgba(161, 72, 120, 0.14);
$color-shadow-soft: 0 18px 45px rgba(161, 72, 120, 0.10);
6. 按钮规范
按钮风格必须统一。
主按钮使用：
$gradient-primary: linear-gradient(135deg, #f58ab6 0%, #8b6eea 100%);
按钮视觉要求：
圆角胶囊按钮
桃粉紫渐变
柔和阴影
hover 轻微上浮
loading 状态明显
disabled 状态降低透明度
禁止：
黑底按钮
强霓虹边框
金属科技按钮
每个页面单独写一套按钮样式
7. 卡片规范
全站卡片统一为柔和圆角卡片。
卡片要求：
大圆角
浅色背景
轻微透明
柔和阴影
内部留白充足
hover 时轻微上浮
可带轻量玻璃感
不使用暗色玻璃拟态
不使用强霓虹描边
推荐 mixin：
@mixin peach-card {
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.10);
  border-radius: 28px;
  box-shadow: 0 18px 45px rgba(161, 72, 120, 0.08);
  backdrop-filter: blur(18px);
}
8. 导航栏规范
导航栏参考当前 UI：
顶部横向导航
左侧图标加品牌名固定：桃灵图库
中间导航：首页 / 图库/ 桃灵助手 / 我的(如果是管理员增加控制台导航入口其余的和普通用户一直避免功能入口分散不便管理)
右侧登录注册或退出登录按钮
当前菜单使用粉紫色文字或下划线高亮
管理员可显示管理入口
普通用户不显示管理员入口
导航栏推荐样式：
background: rgba(255, 248, 251, 0.9);
backdrop-filter: blur(18px);
box-shadow: 0 12px 32px rgba(244, 139, 181, 0.10);
9. 页面布局规范
整体页面布局采用：
大留白
卡片分区
柔和渐变模块
圆角面板
轻量插画
浅色背景
首页：

顶部 Hero 区
左侧标题和说明
右侧桃灵 IP动态角色动画
主按钮：开始浏览(跳转到图库页)
次按钮：认识桃灵(内容区域替换为对整个网站的介绍和桃灵的介绍作用这些详细介绍后续根据真实业务调整)
图库页：

顶部搜索区
热门标签
分类胶囊筛选
图片网格或瀑布流
图片卡片统一圆角和柔和阴影(卡片需要固定尺寸统一宽高便于卡片复用对于不同比例的图片展示全部对封面进行裁剪详情展示对应的比例和正常尺寸)
详情页：
左侧大图
右侧图片信息卡片
下方相关推荐
不出现作者关注、评论、点赞等社区内容
管理端：
不做传统后台
仍然保持桃粉紫浅色梦幻风
统计卡片、快捷入口、上传表单、管理列表统一风格
管理入口集中在 /admin/*
管理端入口统一在顶部导航栏显示控制台进入后内容区域全部替换wield管理端布局左侧侧边栏右侧内容区域实现管理员的相关操作不能按照设计稿的进行设计主题样式风格和用户端一致
10. 动效规范
允许使用：
卡片 hover 上浮
按钮 hover 渐变增强
桃灵 IP 轻微漂浮
加载 shimmer
空状态轻微呼吸动画
页面进入淡入上移
禁止使用：
强闪烁霓虹
大面积粒子爆炸
黑客终端动画
强扫描线
过度复杂 3D 动效
三、专属 IP 助手规范
1. IP 名称
中文名：
桃灵
页面展示名：
桃灵助手
英文辅助名：
Taoling Assistant
不再使用 Mira。当前 UI 已经围绕「桃灵图库」和桃子云朵 IP 建立识别，因此助手名称必须统一为「桃灵助手」。
2. IP 定位
桃灵是桃灵图库的 AI 图片灵感助手。
它不是普通聊天机器人，而是一个负责帮助用户发现图片、搜索灵感、理解标签、推荐分类、引导下载和收藏的可爱图库精灵。
桃灵负责：
引导搜索
推荐图片
推荐分类
帮助用户发现灵感
提示登录
展示空状态
展示权限不足
展示加载状态
引导用户下载或收藏
3. IP 形象设定
基础形象：
圆滚滚的桃子云朵团子
身体从奶白到浅蜜桃粉渐变
头顶一片嫩绿色小叶子
黑豆大眼睛
淡粉色腮红
短胖四肢
软陶 / 黏土 3D 质感
整体可爱、柔软、治愈
核心道具：
粉蓝渐变手柄放大镜
上传小卡片
小画册
灵感标签卡
管理员状态可使用小工作牌、上传板、分类卡片
禁止出现：
英文标签
话题标签
对话气泡
水印
白色外框
复杂背景
多人角色
复杂配饰
帽子
披风
4. IP 性格
桃灵的性格：
温柔
乖巧
好奇
有审美判断力
轻松但不幼稚
像一个陪用户逛图库的小精灵
5. 桃灵口吻示例
图库搜索页：
输入关键词，我来帮你找最合适的灵感图。
空状态：
这里还空空的呀，去图库逛逛，把喜欢的作品带回小岛吧。
权限不足：
这里是管理员专属区域哦，普通用户暂时不能进入。
AI 助手页：
你好呀，我是桃灵。想找头像、壁纸、插画、海报灵感，都可以告诉我。
上传页：
把新的灵感作品交给我吧，我会帮你收进图库里。
搜索无结果：
没有找到完全匹配的图片，可以换个关键词，比如风格、颜色、用途或场景。
6. IP 使用场景
首页：
使用较大的桃灵形象
表达欢迎和引导浏览
图库页：
搜索区右侧可放桃灵拿放大镜形象
搜索无结果时显示桃灵空状态
图片详情页：
相关推荐区可以使用小桃灵提示
不要喧宾夺主
AI 助手页：
页面头部显示桃灵头像和在线状态
消息气泡使用柔和粉紫风格
上传页：
使用桃灵上传状态图
上传成功和上传失败使用不同表情
用户中心：
无收藏、无下载记录时使用桃灵抱画册空状态
管理端：
权限不足、404、系统状态卡片可使用桃灵插画
不允许出现“创作者计划”“PRO 用户”等社区化内容
四、IP 角色绘图提示词生成规范
你作为 IP 角色设计管控模型，需要严格按照以下规则生成桃灵 IP 形象提示词。
1. 角色固定本体设定
基础形象：
主体是圆滚滚棉花云朵团子吉祥物，整体矮胖 Q 版体态，没有棱角。
配色为身体顶部奶白自然渐变到下腹浅蜜桃粉，马卡龙低饱和柔色。
头顶正中只有 1 片嫩绿色小圆叶子，固定单片叶子，不增加多片枝叶。
五官为圆圆的黑豆大眼睛、短小弯红嘴巴、淡粉色圆形腮红。
四肢短胖迷你。
整体为软黏土 / 软陶 3D 质感。
角色定位为网站智能搜索助手 IP，温柔乖巧、好奇探索的服务型吉祥物。
标志性道具：
粉蓝渐变手柄放大镜。

固定实现要求：
项目内页面必须优先使用固定桃灵本体资产：
public/static/images/taoling/taoling-base.png
以及统一动画组件：
src/components/business/TaolingMascot.vue
后续页面、空状态、权限状态、加载状态、桃灵助手、管理端提示、登录注册页都不得重新绘制另一只桃灵。
不得直接照设计稿裁出带白底圆牌、白色外框、文字徽章、Tao Ling 文案的图片。
不得为了某个页面单独改变桃灵的本体五官、身体轮廓、叶子、翅膀、基础配色。
允许在固定本体外叠加：
动作层
表情提示层
柔和道具层
状态徽章
轻微投影
粉紫光晕
关键帧动画
这些叠加层不能遮挡或破坏桃灵主脸部识别。

TaolingMascot 组件状态：
idle：日常待机，轻微呼吸漂浮。
welcome：迎宾挥手感，适合登录、首页欢迎。
search：搜索引导，可叠加粉蓝放大镜，不遮挡主脸。
happy：开心弹跳，可叠加柔和爱心。
thinking：思索状态，可叠加问号提示。
guide：指引状态，可叠加小星光或图卡提示。
loading：加载状态，可叠加柔和转圈。
success：成功状态，可叠加绿色成功徽章。
empty：空状态，可叠加省略点。
permission：权限不足，可叠加柔和感叹号。
sleepy：低优先级待机，可叠加小 z 气泡。
页面创建时必须按场景选择这些状态，优先复用组件，不要重新写一套角色动画。
2. 画面硬性规范
背景规则：
透明 PNG
无白色底色
无白色边框
无圆角外框
无浅粉外围衬边
画面仅保留角色本身
无多余画布底色
文字与装饰禁令：
禁止出现 # 标签
禁止出现英文单词
禁止出现彩色对话气泡
禁止出现标语
禁止出现水印
禁止出现图案装饰
构图：
角色居中独立立绘
单人出镜
无场景
无地面阴影
如需落地动作，只能有极淡软阴影，不能有深色投影块
1:1 正方形构图
3. 基础 5 态
每次生成必须拆分为 5 张独立透明底图片。
常态搜索
双手握持粉蓝渐变手柄放大镜贴在右眼前方，歪头好奇探视。
迎宾挥手
单手抬起小手左右挥手，另一只手自然垂落，眉眼弯起微笑。
开心弹跳
双脚悬空离地蹦跳，两只小手向上扬起，咧嘴开心。
思索发呆
单小手托腮，放大镜收在身侧，眯眼歪头思考。
指引介绍
双手平伸向前，掌心朝外，放大镜抱在怀里，面向用户指引。
4. 黑名单禁用词
生成提示词必须规避：
白底
白框
粉色外框
对话框
话题标签
英文文案
多余花草
场景背景
多人
阴影色块
复杂配饰
帽子
披风
渐变外描边
五、技术栈要求
必须使用：
Vue3
TypeScript
Vite
Vue Router
Pinia
SCSS
Element Plus 按需引入
Axios
禁止使用：
Vue2 写法
Options API 中的 data、methods、computed 分块写法
jQuery
大量直接 DOM 操作
页面里直接写接口请求
页面里写大量重复 CSS
不存在的 class
未定义变量
未安装的第三方库
无必要大型 UI 库
临时 mock 数据长期残留
Vue 组件必须使用：
<script setup lang="ts">
并使用：
Composition API
ref
reactive
computed
watch
defineProps
defineEmits
六、推荐项目目录结构
src
├── apis
│   ├── auth.ts
│   ├── image.ts
│   ├── category.ts
│   ├── tag.ts
│   ├── favorite.ts
│   ├── download.ts
│   ├── assistant.ts
│   ├── user.ts
│   └── admin.ts
├── assets
│   └── styles
│       ├── index.scss
│       ├── variables.scss
│       ├── mixins.scss
│       ├── reset.scss
│       ├── theme.scss
│       ├── transition.scss
│       └── element-overrides.scss
├── static
│   ├── images
│   │   ├── taoling
│   │   ├── gallery
│   │   ├── empty
│   │   └── backgrounds
│   └── icons
│       ├── common
│       ├── nav
│       ├── auth
│       ├── gallery
│       ├── assistant
│       ├── user
│       └── admin
├── components
│   ├── layout
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   └── PageContainer.vue
│   ├── business
│   │   ├── ImageCard.vue
│   │   ├── TagChip.vue
│   │   ├── CategoryFilter.vue
│   │   ├── TaolingAssistantBubble.vue
│   │   ├── ImageUploader.vue
│   │   └── AdminLogList.vue
│   ├── feedback
│   │   ├── EmptyState.vue
│   │   ├── LoadingSkeleton.vue
│   │   ├── ConfirmDialog.vue
│   │   ├── LoginRequiredDialog.vue
│   │   ├── PermissionDenied.vue
│   │   └── PeachProgress.vue
│   └── element
│       ├── PeachButton.vue
│       ├── PeachInput.vue
│       ├── PeachSelect.vue
│       ├── PeachPagination.vue
│       └── PeachDialog.vue
├── composables
│   ├── usePagination.ts
│   ├── useLoading.ts
│   ├── useDebounce.ts
│   ├── useThrottle.ts
│   ├── useAuthGuard.ts
│   ├── useImageLazyLoad.ts
│   ├── useRetryRequest.ts
│   └── useScrollLoad.ts
├── router
│   ├── index.ts
│   └── guard.ts
├── stores
│   ├── user.ts
│   ├── image.ts
│   ├── category.ts
│   ├── tag.ts
│   ├── favorite.ts
│   ├── download.ts
│   ├── assistant.ts
│   └── admin.ts
├── types
│   ├── common.ts
│   ├── auth.ts
│   ├── image.ts
│   ├── category.ts
│   ├── tag.ts
│   ├── favorite.ts
│   ├── download.ts
│   ├── assistant.ts
│   ├── user.ts
│   └── admin.ts
├── utils
│   ├── request.ts
│   ├── storage.ts
│   ├── auth.ts
│   ├── format.ts
│   ├── validate.ts
│   ├── image.ts
│   ├── performance.ts
│   └── error.ts
├── views
│   ├── Home.vue
│   ├── Gallery.vue
│   ├── ImageDetail.vue
│   ├── Assistant.vue
│   ├── Auth.vue
│   ├── UserProfile.vue
│   ├── Permission.vue
│   ├── NotFound.vue
│   └── admin
│       ├── AdminDashboard.vue
│       ├── UploadImage.vue
│       ├── ImageManage.vue
│       ├── CategoryManage.vue
│       ├── TagManage.vue
│       └── UserManage.vue
├── App.vue
└── main.ts
七、代码分层强制规则
接口调用必须遵循：
apis -> store -> pages
具体要求：
apis 目录只负责封装接口请求，不写业务状态。
stores 目录负责调用 apis，并维护页面所需状态。
views / pages 只能调用 store，不允许直接调用 apis。
公共业务逻辑放 composables。
公共 UI 放 components。
类型定义放 types。
请求拦截、响应拦截放 utils/request.ts。
静态资源放 static。
全局样式放 assets/styles。
页面局部样式只写当前页面特有布局，不重复写通用样式。
禁止：
页面里直接 axios.get
页面里直接 import apis
多个页面重复写同一个搜索栏
多个页面重复写分页
多个页面重复写弹窗
多个页面重复写空状态
组件内写死接口字段导致不可复用
组件内写死中文业务文案且不允许 props 覆盖
八、环境变量规范
必须使用 .env 管理环境配置。
创建：
.env.development
.env.production
.env.example
示例：
VITE_APP_TITLE=桃灵图库
VITE_API_BASE_URL=/api
VITE_UPLOAD_BASE_URL=/uploads
VITE_ENABLE_MOCK=false
VITE_ROUTER_MODE=history
所有接口地址必须从环境变量读取。
禁止在代码中硬编码完整接口域名。

开发接口联调补充：

后端开发服务固定运行在：

http://localhost:3000

开发环境接口基地址必须和后端服务对齐，通常为：

VITE_API_BASE_URL=http://localhost:3000/api

页面开发只要涉及接口调用，必须先确认当前环境变量与后端基地址一致。

浏览器验证页面时，涉及接口的功能需要直接通过前端页面或请求封装调用真实后端接口，检查：

HTTP 状态是否正常。
统一返回结构 code / message / data 是否正常。
分页结构 list / pagination 是否正常。
页面使用的字段名、字段类型、空值情况是否和后端返回一致。
权限接口是否按游客、普通用户、管理员状态返回正确结果。

前端开发时默认后端服务已经由用户启动并维护。
不要为了页面开发去修改、重启或调试后端服务，除非用户明确要求处理后端。
如果接口返回字段和 API.md 或页面需求不一致，只记录现象并按前端职责做兼容或提示用户确认，不能凭空改造业务接口。
九、Vite 配置要求
vite.config.ts 必须包含：
@ 指向 src
Element Plus 自动按需引入
SCSS 全局变量和 mixins 自动注入
生产环境构建优化
图片资源处理
合理 chunk 拆分
SCSS 全局注入示例：
additionalData: `
@use "@/assets/styles/variables.scss" as *;
@use "@/assets/styles/mixins.scss" as *;
十、SCSS 样式规范
必须创建：
variables.scss
mixins.scss
theme.scss
reset.scss
transition.scss
element-overrides.scss
index.scss
1. variables.scss 必须包含
// 桃灵图库主题色
$color-bg-page: #fff8fb;
$color-bg-soft: #fff1f6;
$color-bg-panel: rgba(255, 246, 250, 0.86);
$color-bg-card: rgba(255, 255, 255, 0.76);

$color-primary: #a14878;
$color-primary-dark: #823d6f;
$color-primary-light: #f48bb5;

$color-secondary: #8b6eea;
$color-secondary-light: #c5b6ff;

$color-accent-pink: #ffd6e5;
$color-accent-blue: #bfe9ff;
$color-accent-purple: #eadfff;
$color-accent-yellow: #fff0bd;

$color-text-main: #332832;
$color-text-secondary: #6f5f6d;
$color-text-light: #9b8c98;
$color-text-white: #ffffff;

$color-border-soft: rgba(161, 72, 120, 0.14);
$color-border-light: rgba(255, 255, 255, 0.7);

$gradient-primary: linear-gradient(135deg, #f58ab6 0%, #8b6eea 100%);
$gradient-card-pink: linear-gradient(135deg, #fff2f7 0%, #f7ecff 100%);
$gradient-card-blue: linear-gradient(135deg, #f2f8ff 0%, #eef0ff 100%);
$gradient-card-peach: linear-gradient(135deg, #ffe8ef 0%, #fff5f8 100%);

$radius-sm: 10px;
$radius-md: 16px;
$radius-lg: 24px;
$radius-xl: 32px;
$radius-pill: 999px;

$shadow-soft: 0 18px 45px rgba(161, 72, 120, 0.08);
$shadow-card: 0 20px 60px rgba(161, 72, 120, 0.10);
$shadow-button: 0 10px 24px rgba(139, 110, 234, 0.24);

$transition-fast: 0.18s ease;
$transition-normal: 0.28s ease;

$z-header: 100;
$z-dialog: 1000;
$z-toast: 2000;
2. mixins.scss 必须包含
peach-card
soft-border
gradient-button
text-ellipsis
multi-ellipsis
flex-center
page-soft-bg
responsive
scrollbar
safe-area
hover-lift
skeleton-shimmer
禁止：
使用未定义变量
使用不存在的 class
每个页面重复写按钮基础样式
每个页面重复写卡片基础样式
每个页面重复写输入框基础样式
大面积 inline style
十一、Element Plus 使用规范
允许使用 Element Plus，但必须按需引入。
Element Plus 原始组件不能直接大量裸用，必须二次封装或统一覆盖样式。
需要二次封装：
PeachButton.vue
PeachInput.vue
PeachSelect.vue
PeachPagination.vue
PeachDialog.vue
二次封装要求：
样式符合桃灵图库主题。
支持 props 控制类型、loading、disabled、icon、size。
支持 emits。
组件要有清晰注释。
不允许每个页面单独改 Element Plus 样式。
弹窗必须使用统一：
ConfirmDialog
PeachDialog
弹窗要有：
标题
内容
确认按钮
取消按钮
loading
危险操作样式
自定义图标
插槽
关闭回调
十二、图标与静态资源规范
静态资源目录必须使用：
static/images
static/icons
图标必须优先使用 SVG。
图标风格：
线性图标
圆角端点
桃粉紫渐变
轻微柔和 glow
不复杂
不赛博
不暗黑
图标命名规范：
icon-[模块]-[功能].svg
示例：
icon-nav-home.svg
icon-nav-gallery.svg
icon-nav-assistant.svg
icon-auth-user.svg
icon-auth-lock.svg
icon-gallery-download.svg
icon-gallery-favorite.svg
icon-gallery-search.svg
icon-admin-upload.svg
icon-admin-image.svg
icon-admin-user.svg
icon-common-empty.svg
icon-common-error.svg
按模块保存：
static/icons/common
static/icons/nav
static/icons/auth
static/icons/gallery
static/icons/assistant
static/icons/user
static/icons/admin
如果一个图标已经存在，必须复用，不要重复创建。
十三、TypeScript 类型规范
必须创建 types 文件夹，并根据接口业务拆分类型。
通用类型文件：
types/common.ts
需要包含：
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
export interface PageParams {
  page: number
  pageSize: number
}
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
export interface PageResult<T> {
  list: T[]
  pagination: Pagination
}
export type Role = 'admin' | 'user'
export type Status = 'public' | 'private' | 'disabled' | 'deleted'
业务类型：
auth.ts
image.ts
category.ts
tag.ts
favorite.ts
download.ts
assistant.ts
user.ts
admin.ts
类型要求：

所有接口请求参数必须定义类型。
所有接口响应数据必须定义类型。
store state 必须有类型。
props 必须有类型。
emits 必须有类型。
不允许滥用 any。
临时无法确定类型时使用 unknown 并添加注释。
类型字段必须和后端接口字段一致。
不创建重复类型，能复用就复用。
类型文件必须有清晰注释。
十四、接口模块规范
apis 只做接口封装。
1. auth.ts
registerApi
loginApi
getMeApi
2. image.ts
getImageListApi
getImageDetailApi
getRelatedImagesApi
getFeaturedImagesApi
3. favorite.ts
addFavoriteApi
cancelFavoriteApi
getFavoriteListApi
4. download.ts
createDownloadApi
getDownloadListApi
deleteDownloadRecordApi
clearDownloadRecordsApi
5. assistant.ts
getConversationListApi
createConversationApi
getConversationMessagesApi
sendAssistantMessageApi
deleteConversationApi
clearConversationsApi
6. admin.ts
getDashboardStatsApi
getAdminLogsApi
getAdminImageListApi
uploadImageApi
updateImageApi
deleteImageApi
updateImageStatusApi
getAdminUserListApi
getAdminUserDetailApi
updateUserStatusApi
7. 所有 apis 函数必须
有明确入参类型。
有明确返回类型。
使用 request 工具。
不处理 UI 状态。
不直接操作 localStorage。
不写业务跳转。
十五、Axios 请求封装规范
utils/request.ts 必须包含：
axios 实例
baseURL 读取环境变量
timeout
请求拦截器
响应拦截器
token 注入
401 统一处理
403 统一处理
网络错误提示
业务错误统一抛出
可配置是否显示错误提示
可配置是否重试
可取消重复请求
请求头：
Authorization: Bearer token
401 处理：
清除本地 token
清除 user store
跳转登录页
保留 redirect 参数
403 处理：
跳转权限不足页或弹出权限提示
请求失败要求：
开发环境 console 输出错误详情
生产环境只展示友好提示
十六、Pinia Store 规范
store 负责调用 apis 并管理业务状态。
1. stores/user.ts
负责：
用户信息
token
是否登录
是否管理员
登录
注册
获取当前用户
退出登录
获取个人中心统计
更新个人资料
2. stores/image.ts
负责：
图片列表
精选图片
图片详情
相关图片
搜索参数
分页参数
loading
获取图片列表
获取详情
获取相关图片
3. stores/favorite.ts
负责：
收藏列表
收藏图片
取消收藏
获取我的收藏
4. stores/download.ts
负责：
下载记录
创建下载
获取下载记录
删除记录
清空记录
5. stores/assistant.ts
负责：
会话列表
当前会话
消息列表
发送消息
删除会话
清空会话
loading
6. stores/admin.ts
负责：
统计数据
管理日志
管理员图片列表
用户列表
分类标签管理
上传图片
编辑图片
删除图片
修改状态
7. store 规范
每个 action 必须有注释。
异步 action 必须处理 loading。
错误不能静默吞掉。
分页状态统一使用 usePagination 或 store 内统一结构。
页面只能调用 store action。
页面不能直接 import apis。
store 不直接操作 DOM。
十七、路由规范
必须使用 Vue Router。
必须路由懒加载。
1. 路由列表
/home
/gallery
/images/:id
/assistant
/auth
/profile
/permission
/not-found
/admin/dashboard
/admin/upload
/admin/images
/admin/categories
/admin/tags
/admin/users
2. 路由 meta
meta: {
  title: string
  requiresAuth: boolean
  requiresAdmin: boolean
  keepAlive: boolean
  showHeader: boolean
  showFooter: boolean
}
3. 游客可访问
/home
/gallery
/images/:id
/auth
4. 需要登录
/assistant
/profile
5. 需要管理员
/admin/*
6. 跳转规则
未登录访问 /assistant，跳转 /auth，提示：登录后即可解锁桃灵助手。
未登录访问 /profile，跳转 /auth。
普通用户访问 /admin/*，跳转 /permission。
管理员登录成功跳转 /admin/dashboard。
普通用户登录成功跳转 /gallery。
已登录用户访问 /auth，自动跳转对应页面。
根据 meta.title 设置 document.title。
十八、页面开发规范
所有页面必须：
使用 <script setup lang="ts">
使用 Composition API
调用 store，不直接调 apis
使用公共组件
使用全局样式和 mixins
有 loading 状态
有空状态
有错误状态
有权限状态
有必要注释
响应式适配桌面和移动端
不能展示不存在的数据
视觉必须符合桃灵图库浅色桃粉紫主题
页面开发优先顺序
1. Auth 登录注册页
2. Layout：AppHeader、AppFooter、PageContainer
3. Home 首页
4. Gallery 图库
5. ImageDetail 图片详情
6. Assistant 桃灵助手
7. UserProfile 我的页面
8. AdminDashboard 管理首页
9. UploadImage 上传图片
10. ImageManage 图片管理
11. CategoryManage 分类管理
12. TagManage 标签管理
13. UserManage 用户管理
14. Permission 权限不足
15. NotFound 404
十九、页面业务字段约束
1. 图库图片卡片只允许展示
图片缩略图
标题
分类
标签
下载数
收藏数
查看详情
收藏按钮
下载按钮
不能展示：
作者头像
作者名称
点赞
评论
关注
粉丝
作品数
用户等级
2. 图片详情只允许展示
大图
标题
描述
分类
标签
发布时间
下载次数
收藏次数
收藏按钮
下载按钮
相关推荐
桃灵推荐
不能展示：
作者主页
关注作者
评论区
点赞
打赏
3. 用户中心只允许展示
头像
用户名
邮箱
收藏数量
下载数量
我的收藏
下载记录
AI 会话记录
账号资料
退出登录
不能展示：
作品数
获赞数
关注数
粉丝数
创作者等级
PRO 用户
4. 管理员用户管理只允许展示
头像
用户名
邮箱
角色
状态
注册时间
最后登录时间
收藏数量
下载数量
AI 会话数量
禁用/恢复操作
不能展示：
作品集
获赞
关注者
粉丝
PRO 用户
创作者计划
二十、组件封装要求

必须封装以下组件。

1. AppHeader.vue

全站顶部导航。

要求：

展示品牌名
展示导航菜单
根据登录状态展示登录按钮或退出登录
管理员显示管理入口
普通用户隐藏管理入口
移动端适配折叠菜单
当前路由高亮

视觉：

浅色半透明导航
桃粉紫高亮
柔和阴影
圆角底部视觉
2. AppFooter.vue

全站底部。

展示：

项目名
版权信息
关于我们
隐私政策
用户协议
联系桃灵
3. PageContainer.vue

统一页面容器。

负责：

页面最大宽度
上下间距
移动端内边距
统一背景
4. ImageCard.vue

图片卡片。

props 接收 image 数据。

支持：

hover
收藏事件
下载事件
查看详情事件
图片加载失败占位
loading skeleton

注意：

ImageCard 不直接调用接口，通过 emits 通知页面或 store。
5. TagChip.vue

标签胶囊。

支持：

颜色
点击
选中状态
禁用状态
6. CategoryFilter.vue

分类筛选。

支持：

分类列表
当前选中
change 事件
7. TaolingAssistantBubble.vue

右下角桃灵悬浮入口。

规则：

未登录点击提示登录
登录后跳转 Assistant
带轻微漂浮动画
使用桃灵小头像或光球形态
8. EmptyState.vue

统一空状态。

props：

type
title
description
image
actionText

默认使用桃灵空状态图。

适用场景：

无收藏
无下载
无图片
搜索无结果
无权限
404
AI 会话为空
9. LoadingSkeleton.vue

统一骨架屏。

支持类型：

image-grid
detail
profile
admin-stats
chat

带 shimmer 动画。

10. ConfirmDialog.vue

统一确认弹窗。

删除、清空、禁用等危险操作必须使用。

支持：

danger 类型
loading
自定义标题
自定义描述
确认回调
取消回调
11. LoginRequiredDialog.vue

未登录提示弹窗。

用于：

收藏
下载
AI 助手
个人中心
12. PeachProgress.vue

全局加载进度条。

用于：

路由切换
页面加载
上传进度

可加入桃灵轻微漂浮动画。

二十一、性能优化要求

这是图片网站，必须重视图片加载体验。

1. 基础优化

必须实现：

路由懒加载。
页面组件按需加载。
大组件异步加载。
图片懒加载。
图片列表使用 thumbnailUrl。
详情页使用 imageUrl。
支持 WebP。
图片上传前做格式和大小校验。
图片加载失败显示占位图。
列表分页加载或无限滚动。
搜索输入防抖。
滚动事件节流。
使用骨架屏减少白屏。
loading 防止重复点击。
路由切换显示顶部进度条。
分类、标签短时间缓存。
生产环境合理分包。
2. 图片优化

必须实现：

列表优先使用 thumbnailUrl
img 标签加 loading="lazy"
大图加载前显示模糊占位或 skeleton
图片加载失败显示 EmptyState 或默认图
上传文件限制 JPG、PNG、WEBP
上传前检查文件大小
需要前端压缩时封装 utils/image.ts
3. 缓存建议
分类列表缓存 5-10 分钟
标签列表缓存 5-10 分钟
用户信息从 token 恢复时请求 /auth/me
图片列表不做长期缓存，避免管理员更新后用户看不到新内容
二十二、安全与稳定性要求

必须处理：

登录注册防重复提交。
收藏防重复点击。
下载防重复点击。
删除操作必须二次确认。
上传文件类型校验。
上传文件大小校验。
表单输入长度限制。
用户输入内容 trim。
token 过期处理。
权限不足处理。
接口失败提示。
网络错误提示。
空数据提示。
请求重试机制。
避免 XSS，不使用 v-html 渲染用户输入。
所有展示文本做默认兜底。
所有列表渲染必须有稳定 key。
表单提交必须 loading。
危险操作支持回滚或重新请求最新数据。
管理端删除后刷新列表或本地移除并保证分页正确。
防抖节流

必须封装：

useDebounce
useThrottle

搜索：

输入关键词防抖 300-500ms 后请求

下载：

点击下载按钮后按钮进入 loading，接口返回 downloadUrl 后再触发浏览器下载

收藏：

先调用接口成功后更新 UI。
失败时恢复原状态或重新拉取详情。
二十三、错误处理和边界状态

必须处理以下状态。

1. 全局
网络错误
接口超时
服务器异常
权限不足
登录过期
页面不存在
2. 图库
无图片
搜索无结果
分类无结果
标签无结果
加载更多中
没有更多了
图片加载失败
3. 详情
图片不存在
图片已删除
图片非公开
相关推荐为空
4. AI 助手
未登录
会话为空
消息发送失败
AI 回复失败
重新发送
清空会话确认
5. 用户中心
无收藏
无下载记录
资料加载失败
6. 管理端
统计加载失败
日志为空
图片列表为空
上传失败
编辑失败
删除失败
分类为空
标签为空
用户为空

所有空状态优先使用桃灵角色插画。

二十四、接口业务约束

接口统一返回结构：

{
  code: number
  message: string
  data: T
}

分页结构：

{
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
1. 认证接口
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
2. 公开图片
GET /api/images
GET /api/images/:id
GET /api/images/:id/related
3. 公开分类标签
GET /api/categories
GET /api/tags
4. 收藏
POST /api/user/favorites
DELETE /api/user/favorites/:imageId
GET /api/user/favorites
5. 下载
POST /api/user/downloads
GET /api/user/downloads
DELETE /api/user/downloads/:recordId
DELETE /api/user/downloads
6. AI 助手
POST /api/user/ai/conversations
GET /api/user/ai/conversations
GET /api/user/ai/conversations/:conversationId/messages
POST /api/user/ai/chat
DELETE /api/user/ai/conversations/:conversationId
DELETE /api/user/ai/conversations
7. 用户中心
GET /api/user/profile/summary
PUT /api/user/profile
8. 管理中心
GET /api/admin/dashboard/stats
GET /api/admin/logs
9. 管理员图片
POST /api/admin/images
GET /api/admin/images
GET /api/admin/images/:id
PUT /api/admin/images/:id
PATCH /api/admin/images/:id/status
DELETE /api/admin/images/:id
10. 管理员分类
GET /api/admin/categories
POST /api/admin/categories
PUT /api/admin/categories/:id
DELETE /api/admin/categories/:id
11. 管理员标签
GET /api/admin/tags
POST /api/admin/tags
PUT /api/admin/tags/:id
DELETE /api/admin/tags/:id
12. 管理员用户
GET /api/admin/users
GET /api/admin/users/:id
PATCH /api/admin/users/:id/status
二十五、页面与接口对应关系
Auth.vue
调用 userStore.register
调用 userStore.login
调用 userStore.getMe
Home.vue
调用 imageStore.getFeaturedImages
调用 categoryStore.getCategories
调用 tagStore.getTags
Gallery.vue
调用 imageStore.getImageList
调用 categoryStore.getCategories
调用 tagStore.getTags
调用 favoriteStore.addFavorite
调用 favoriteStore.cancelFavorite
调用 downloadStore.createDownload
ImageDetail.vue
调用 imageStore.getImageDetail
调用 imageStore.getRelatedImages
调用 favoriteStore.addFavorite
调用 favoriteStore.cancelFavorite
调用 downloadStore.createDownload
Assistant.vue
调用 assistantStore.getConversationList
调用 assistantStore.createConversation
调用 assistantStore.getMessages
调用 assistantStore.sendMessage
调用 assistantStore.deleteConversation
调用 assistantStore.clearConversations
UserProfile.vue
调用 userStore.getProfileSummary
调用 favoriteStore.getFavoriteList
调用 downloadStore.getDownloadList
调用 downloadStore.deleteDownloadRecord
调用 downloadStore.clearDownloadRecords
AdminDashboard.vue
调用 adminStore.getDashboardStats
调用 adminStore.getAdminLogs
UploadImage.vue
调用 categoryStore.getAdminCategories
调用 tagStore.getAdminTags
调用 adminStore.uploadImage
ImageManage.vue
调用 adminStore.getAdminImageList
调用 adminStore.updateImage
调用 adminStore.updateImageStatus
调用 adminStore.deleteImage
CategoryManage.vue
调用 categoryStore.getAdminCategories
调用 categoryStore.createCategory
调用 categoryStore.updateCategory
调用 categoryStore.deleteCategory
TagManage.vue
调用 tagStore.getAdminTags
调用 tagStore.createTag
调用 tagStore.updateTag
调用 tagStore.deleteTag
UserManage.vue
调用 adminStore.getAdminUserList
调用 adminStore.getAdminUserDetail
调用 adminStore.updateUserStatus
二十六、开发顺序要求
第一阶段：项目基础工程
创建 Vite + Vue3 + TypeScript 项目结构。
配置 @ alias。
安装并配置 Pinia、Vue Router、Axios、Element Plus、SCSS。
创建 .env.example、.env.development、.env.production。
创建全局样式文件和 SCSS 变量、mixins。
创建 request.ts 请求封装。
创建 types 基础类型。
创建路由和路由守卫。
创建 Pinia store 基础结构。
第二阶段：基础组件
AppHeader
AppFooter
PageContainer
PeachButton
PeachInput
PeachSelect
PeachDialog
ConfirmDialog
EmptyState
LoadingSkeleton
TaolingAssistantBubble
PeachProgress
第三阶段：用户端页面
Auth
Home
Gallery
ImageDetail
Assistant
UserProfile
Permission
NotFound
第四阶段：管理端页面
AdminDashboard
UploadImage
ImageManage
CategoryManage
TagManage
UserManage
第五阶段：优化
图片懒加载。
搜索防抖。
下载和收藏 loading。
骨架屏。
空状态。
错误重试。
移动端适配。
打包检查。
删除无用代码。
Git 提交。
二十七、注释规范

所有核心文件必须有注释。

必须注释：

API 方法用途。
Store action 用途。
路由守卫逻辑。
请求拦截器逻辑。
权限判断逻辑。
复杂组件 props。
复用 composable 的参数和返回值。
关键性能优化逻辑。
上传、下载、收藏这类关键业务流程。

注释要求：

清晰
简洁
说明为什么这样做
不要写废话注释
不要每一行都注释
二十八、Git 提交规范

每完成一个阶段必须 git commit。

每次提交前必须：

npm run type-check
npm run build
检查控制台是否有明显错误
删除无用 console
检查未使用变量
检查是否有未定义样式
检查是否误用不存在业务字段

提交信息规范：

feat: 初始化项目基础架构
feat: 完成桃灵图库全局主题样式与布局组件
feat: 完成登录注册页面
feat: 完成图库列表与筛选功能
feat: 完成图片详情页面
feat: 完成桃灵助手页面
feat: 完成用户中心页面
feat: 完成管理中心统计页面
feat: 完成图片上传与管理页面
feat: 完成分类标签管理页面
feat: 完成用户管理页面
perf: 优化图片懒加载和骨架屏
fix: 修复权限拦截和登录状态恢复
style: 统一桃灵图库主题细节

如果当前环境无法执行 git，也必须输出建议提交命令和提交说明。

二十九、最终交付要求

完成后必须输出：

本次创建和修改的文件清单。
项目启动命令。
环境变量说明。
路由列表。
Store 模块说明。
API 模块说明。
已完成页面列表。
未完成或需要后端联调的事项。
构建结果。
Git 提交记录或建议提交命令。
三十、开发时最高优先级原则
最高优先级一

以真实业务接口字段为准，不要照抄设计稿里不存在的功能。

最高优先级二

全站必须统一：

桃灵图库｜浅色桃粉紫梦幻图库主题

禁止做成：

Neon Muse
暗黑赛博
深色宇宙
强霓虹科技
社区平台
传统后台
最高优先级三

页面不能直接调用 apis，必须遵循：

apis -> store -> pages
最高优先级四

能复用组件就复用组件，能用全局样式就不要写局部重复样式。

最高优先级五

所有用户操作必须考虑：

loading
空状态
错误状态
权限状态
登录状态
最高优先级六

这是图片网站，必须重视：

图片懒加载
缩略图
WebP
骨架屏
图片加载失败占位
分页加载
搜索防抖
最高优先级七

禁止出现社区类功能：

关注
粉丝
点赞
评论
作品集
获赞
作者主页
打赏
私信
PRO 用户
创作者计划

三十一、接口文档按需接入约束

开发任何需要后端数据的页面或功能前，必须先阅读项目目录或用户提供的 API.md 中与当前页面相关的接口章节。

必须先确认：

当前页面需要哪些接口。
API.md 是否已经提供对应接口。
接口字段、请求参数、权限要求、响应结构是否满足当前页面。

接口接入必须按当前页面或当前功能的真实需求逐步完成，不允许一次性把 API.md 中所有接口全部注册进项目。

正确流程：

先读当前页面相关 API.md 章节。
再补充当前页面需要的 types。
再创建或补充对应 apis 方法。
再在对应 store 中注册 action 和状态。
最后页面只调用 store，不直接调用 apis。

禁止：

一次性创建全部接口模块和全部 store action。
为了未来可能使用而提前堆叠页面、工具函数、接口、类型。
页面未开发时提前接入无关接口。
API.md 未提供接口时凭空编造完整接口。
页面直接 axios 请求。
页面直接 import apis。

基础工程可以提前完成：

环境变量。
Vite alias 和基础配置。
Pinia。
Vue Router 和路由守卫壳子。
Axios request 封装。
基础通用类型。
全局 SCSS 变量、mixins、reset、theme。
Element Plus 按需引入配置。

页面、业务组件、业务工具函数、接口模块、store action 必须根据后续具体开发需求逐步完善，避免功能冗余、结构混乱和长期未使用代码。
