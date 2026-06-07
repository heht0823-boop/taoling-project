<script setup lang="ts">
import { InfoFilled, Promotion, WarningFilled } from '@element-plus/icons-vue'
</script>

<template>
  <section class="page-view">
    <div class="page-glow page-glow--top" />
    <div class="page-glow page-glow--bottom" />

    <div class="page-shell">
      <div class="hero-section">
        <span class="soft-label">Terms of Service</span>
        <h1>用户协议</h1>
        <p class="hero-desc">使用桃灵图库即表示你同意以下条款，请仔细阅读。</p>
        <p class="update-date">最后更新：2026 年 6 月</p>
      </div>

      <section class="content-card">
        <h2>接受条款</h2>
        <p>
          欢迎使用桃灵图库。本协议是你在使用桃灵图库各项服务时与桃灵图库之间达成的法律协议。
          通过访问或使用本网站，你确认已阅读、理解并同意受本协议条款的约束。
        </p>
        <p>如果你不同意本协议的任何内容，请停止使用桃灵图库的服务。</p>
      </section>

      <section class="content-card">
        <h2>服务说明</h2>
        <p>桃灵图库是一个 AI 生成图片展示与管理平台，主要提供服务包括：</p>
        <ul>
          <li>浏览和搜索公开图片图库</li>
          <li>注册账号后收藏喜欢的图片</li>
          <li>下载图片用于个人或商业用途</li>
          <li>使用桃灵助手获取创意建议和灵感推荐</li>
          <li>管理员发布、管理图片内容</li>
        </ul>
      </section>

      <section class="content-card">
        <h2>用户责任</h2>
        <div class="info-list">
          <article class="info-item">
            <ElIcon><InfoFilled /></ElIcon>
            <div>
              <strong>账号安全</strong>
              <p>
                你负责维护账号和密码的机密性。任何通过你账号进行的活动都由你承担全部责任。如发现账号被未经授权使用，请立即通知我们。
              </p>
            </div>
          </article>
          <article class="info-item">
            <ElIcon><WarningFilled /></ElIcon>
            <div>
              <strong>合法使用</strong>
              <p>
                你同意不使用桃灵图库进行任何违法活动，包括但不限于侵犯他人知识产权、传播恶意软件、进行网络攻击等。
              </p>
            </div>
          </article>
          <article class="info-item">
            <ElIcon><Promotion /></ElIcon>
            <div>
              <strong>内容使用</strong>
              <p>
                下载的图片应遵守适用的版权法律法规。桃灵图库上的 AI
                生成图片可免费用于个人和商业项目，但不得转售或重新分发。
              </p>
            </div>
          </article>
        </div>
      </section>

      <section class="content-card">
        <h2>知识产权</h2>
        <p>
          桃灵图库网站的整体设计、商标、品牌名称「桃灵图库」「Taoling Gallery」
          以及桃灵吉祥物形象的知识产权归桃灵图库所有。
        </p>
        <p>
          网站上展示的 AI 生成图片，其相关权利由桃灵图库依据适用的法律进行管理。
          用户在桃灵图库下载的图片可用于个人和商业用途，但不得以任何形式转售或作为独立产品分发。
        </p>
      </section>

      <section class="content-card">
        <h2>免责声明</h2>
        <p>
          桃灵图库按「现状」提供服务，不提供任何明示或暗示的保证，包括但不限于
          适销性、特定用途适用性和非侵权性的保证。我们不对因使用或无法使用本服务
          而产生的任何直接、间接、附带或后果性损害承担责任。
        </p>
        <p>桃灵图库保留随时修改、暂停或终止服务的权利，恕不另行通知。</p>
      </section>

      <section class="content-card">
        <h2>协议变更</h2>
        <p>
          我们可能会不时修改本协议。修改后的协议将在本页面发布，并更新顶部的
          「最后更新」日期。重大变更时，我们会通过网站公告或邮件通知你。
          继续使用服务即表示你接受修改后的协议。
        </p>
      </section>

      <section class="content-card">
        <h2>法律适用</h2>
        <p>
          本协议受中华人民共和国法律管辖。因本协议引起的或与之相关的争议，
          双方应首先友好协商解决；协商不成的，提交桃灵图库运营方所在地有管辖权的人民法院诉讼解决。
        </p>
      </section>

      <section class="content-card">
        <h2>联系我们</h2>
        <p>
          如对本协议有任何疑问，请联系：<br />
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
  max-width: 560px;
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
