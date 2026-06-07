<script setup lang="ts">
import { IceCream, MagicStick, PictureFilled, Star } from '@element-plus/icons-vue'
</script>

<template>
  <section class="page-view">
    <div class="page-glow page-glow--top" />
    <div class="page-glow page-glow--bottom" />

    <div class="page-shell">
      <div class="hero-section">
        <span class="soft-label">Taoling Gallery</span>
        <h1>关于桃灵图库</h1>
        <p class="hero-desc">一座由 AI 灵感浇灌的小岛，每一幅作品都是桃灵为你珍藏的梦。</p>
      </div>

      <section class="content-card">
        <h2>桃灵的故事</h2>
        <p>
          桃灵图库（Taoling Gallery）诞生于对美与灵感的执着追求。我们相信，每一张 AI
          生成的图像背后，都藏着一个等待被发现的故事。桃灵——这个名字取自桃粉色的
          温柔与灵感的灵动，我们希望这里能成为创作者、设计师和所有热爱视觉艺术的人的灵感小岛。
        </p>
        <p>
          从梦幻的水彩背景到精致的国风插画，从超现实的未来城市到治愈系的可爱角色，
          桃灵团队精心挑选每一幅作品，确保图库中的每一张图片都具备高质量的艺术价值和实用场景。
        </p>
      </section>

      <section class="content-card">
        <h2>我们的使命</h2>
        <div class="feature-grid">
          <article class="feature-item">
            <ElIcon><MagicStick /></ElIcon>
            <strong>AI 驱动的美学</strong>
            <p>利用前沿的 AI 生成技术，持续产出风格多元、质量上乘的视觉作品。</p>
          </article>
          <article class="feature-item">
            <ElIcon><Star /></ElIcon>
            <strong>治愈的视觉体验</strong>
            <p>以桃粉、淡紫、奶油白构筑温柔的浏览氛围，让每一次访问都是一次心灵疗愈。</p>
          </article>
          <article class="feature-item">
            <ElIcon><PictureFilled /></ElIcon>
            <strong>精心策展的图库</strong>
            <p>所有图片均由人工分类和标签化管理，方便你快速找到契合的灵感素材。</p>
          </article>
          <article class="feature-item">
            <ElIcon><IceCream /></ElIcon>
            <strong>开放与共享</strong>
            <p>无需登录即可浏览公开图库，注册后还能收藏、下载，与桃灵助手对话获取创意建议。</p>
          </article>
        </div>
      </section>

      <section class="content-card">
        <h2>品牌理念</h2>
        <p>
          <strong>「灵感如桃花般绽放」</strong>——桃灵图库不仅仅是一个图片集合，
          它是一段视觉旅程。我们希望每一位访客都能在这里找到触动人心的那一帧，
          无论是商业项目的设计参考，还是个人创作的灵感火花。
        </p>
        <p>
          桃灵图库坚持非社区化的纯粹展示理念，不设用户投稿、评论、关注等社交功能，
          只专注于做好一件事：让优秀的 AI 作品被看见、被欣赏、被使用。
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
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.feature-item {
  display: grid;
  gap: 10px;
  padding: 24px;
  background: rgba(255, 248, 251, 0.72);
  border-radius: 24px;

  .el-icon {
    color: $color-primary;
    font-size: 28px;
  }

  strong {
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

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .content-card {
    padding: 24px;
  }
}
</style>
