<script setup lang="ts">
import { ChatDotRound, User, View, WarningFilled } from '@element-plus/icons-vue'
</script>

<template>
  <section class="page-view">
    <div class="page-glow page-glow--top" />
    <div class="page-glow page-glow--bottom" />

    <div class="page-shell">
      <div class="hero-section">
        <span class="soft-label">Privacy Policy</span>
        <h1>隐私政策</h1>
        <p class="hero-desc">桃灵图库重视你的隐私，我们以透明和安全的方式处理你的个人信息。</p>
        <p class="update-date">最后更新：2026 年 6 月</p>
      </div>

      <section class="content-card">
        <h2>引言</h2>
        <p>
          桃灵图库（以下简称「我们」）深知个人信息对你的重要性，并会尽全力保护你的个人信息安全。
          本隐私政策解释了我们在你使用桃灵图库服务时如何收集、使用、存储和保护你的个人信息。
        </p>
        <p>
          请在使用我们的服务前仔细阅读本政策。当你使用桃灵图库时，即表示你已充分理解并同意本政策的全部内容。
        </p>
      </section>

      <section class="content-card">
        <h2>我们收集的信息</h2>
        <div class="info-list">
          <article class="info-item">
            <ElIcon><User /></ElIcon>
            <div>
              <strong>账号信息</strong>
              <p>
                当你注册账号时，我们会收集你的用户名、邮箱地址和加密后的密码。这些信息是为你提供登录、收藏和下载服务所必需的。
              </p>
            </div>
          </article>
          <article class="info-item">
            <ElIcon><View /></ElIcon>
            <div>
              <strong>浏览记录</strong>
              <p>
                我们会记录你浏览的图片 ID
                和时间，用于优化推荐算法和统计图库热度。这些数据不会关联到你的真实身份。
              </p>
            </div>
          </article>
          <article class="info-item">
            <ElIcon><ChatDotRound /></ElIcon>
            <div>
              <strong>AI 对话内容</strong>
              <p>
                当使用桃灵助手时，你的对话内容会被保存，以便你随时查看历史会话。我们不会将对话内容用于任何其他目的。
              </p>
            </div>
          </article>
          <article class="info-item">
            <ElIcon><WarningFilled /></ElIcon>
            <div>
              <strong>设备信息</strong>
              <p>我们会收集基本的设备类型和浏览器版本信息，以确保服务兼容性和安全性。</p>
            </div>
          </article>
        </div>
      </section>

      <section class="content-card">
        <h2>信息使用目的</h2>
        <p>我们只会将收集的信息用于以下目的：</p>
        <ul>
          <li>提供、维护和改进桃灵图库的各项服务</li>
          <li>管理你的账号，处理登录、收藏和下载请求</li>
          <li>优化图片推荐和搜索结果</li>
          <li>保障服务安全，检测和防止滥用行为</li>
          <li>在必要时与你联系，例如发送服务变更通知</li>
        </ul>
      </section>

      <section class="content-card">
        <h2>信息存储与保护</h2>
        <p>
          你的个人信息存储在安全的服务器上，我们采用业界标准的加密措施来保护你的数据安全。
          密码在存储前经过哈希处理，即使是我们的工作人员也无法获取你的原始密码。
        </p>
        <p>
          我们会定期审查数据存储策略，对于超出保留期限的日志和记录进行自动清理。
          你可以在「我的」页面中随时查看和删除自己的下载记录和收藏列表。
        </p>
      </section>

      <section class="content-card">
        <h2>信息共享</h2>
        <p>我们不会将你的个人信息出售、交易或转让给第三方。以下情况除外：</p>
        <ul>
          <li>获得你的明确同意</li>
          <li>法律法规或政府机关要求</li>
          <li>为保护桃灵图库的权利、财产或安全</li>
        </ul>
      </section>

      <section class="content-card">
        <h2>你的权利</h2>
        <p>你拥有以下与个人信息相关的权利：</p>
        <ul>
          <li><strong>访问权</strong>——你可以随时查看你的个人资料和使用记录</li>
          <li><strong>更正权</strong>——你可以在「我的」页面中修改你的用户名和邮箱</li>
          <li><strong>删除权</strong>——你可以删除你的收藏和下载记录</li>
          <li><strong>注销权</strong>——请联系我们注销你的账号</li>
        </ul>
      </section>

      <section class="content-card">
        <h2>联系我们</h2>
        <p>
          如果你对本隐私政策有任何疑问或关切，请通过以下方式联系我们：<br />
          邮箱：<a href="mailto:htht0823@qq.com">htht0823@qq.com</a>
        </p>
      </section>
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-view {
  position: relative;
  min-height: calc(100vh - 112px);
  overflow: hidden;
  padding: 150px clamp(24px, 7vw, 108px) 88px;
  background:
    radial-gradient(circle at 12% 3%, rgba(255, 151, 188, 0.18), transparent 32%),
    radial-gradient(circle at 84% 6%, rgba(197, 182, 255, 0.14), transparent 30%),
    linear-gradient(180deg, #fff9fb 0%, #fff4f8 100%);
}

.page-glow {
  position: absolute;
  width: 42vw;
  max-width: 540px;
  aspect-ratio: 1;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(20px);
}

.page-glow--top {
  top: -25%;
  left: -8%;
  background: radial-gradient(circle, rgba(255, 139, 181, 0.22), transparent 70%);
}

.page-glow--bottom {
  right: -12%;
  bottom: 20%;
  background: radial-gradient(circle, rgba(197, 182, 255, 0.2), transparent 70%);
}

.page-shell {
  position: relative;
  z-index: 1;
  max-width: 880px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  margin-bottom: 48px;

  h1 {
    margin: 16px 0 12px;
    color: $color-primary;
    font-size: 42px;
    font-weight: 700;
  }
}

.hero-desc {
  max-width: 600px;
  margin: 0 auto;
  color: $color-text-secondary;
  font-size: 18px;
  line-height: 1.7;
}

.update-date {
  margin-top: 12px;
  color: $color-text-light;
  font-size: 14px;
}

.soft-label {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  padding: 0 14px;
  color: $color-primary;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(244, 139, 181, 0.16);
  border-radius: $radius-pill;
}

.content-card {
  padding: 36px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 30px;
  box-shadow: $shadow-soft;
  backdrop-filter: blur(18px);

  h2 {
    margin: 0 0 18px;
    color: $color-primary;
    font-size: 24px;
    font-weight: 600;
  }

  p {
    margin: 0 0 12px;
    color: $color-text-main;
    font-size: 15px;
    line-height: 1.9;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: $color-primary;
    }
  }

  ul {
    padding-left: 20px;
    margin: 0;
    color: $color-text-main;
    font-size: 15px;
    line-height: 2.2;
  }

  a {
    color: $color-primary-light;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.info-list {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 248, 251, 0.72);
  border-radius: 20px;

  .el-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: $color-primary;
    font-size: 24px;
  }

  strong {
    display: block;
    margin-bottom: 4px;
    color: $color-text-main;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: $color-text-secondary;
    font-size: 14px;
    line-height: 1.7;
  }
}

@media (max-width: 720px) {
  .page-view {
    padding: 100px 18px 60px;
  }

  .hero-section h1 {
    font-size: 32px;
  }

  .content-card {
    padding: 24px;
  }
}
</style>
