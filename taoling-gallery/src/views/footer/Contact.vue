<script setup lang="ts">
import { ChatDotRound, Message, PhoneFilled, Promotion, Tickets } from '@element-plus/icons-vue'

const contactItems = [
  {
    icon: Message,
    label: '电子邮件',
    value: 'htht0823@qq.com',
    href: 'mailto:htht0823@qq.com',
  },
  {
    icon: PhoneFilled,
    label: '商务合作',
    value: 'htht0823@qq.com',
    href: 'mailto:htht0823@qq.com',
  },
  {
    icon: Tickets,
    label: '法律事务',
    value: 'htht0823@qq.com',
    href: 'mailto:htht0823@qq.com',
  },
]

const faqList = [
  {
    q: '如何下载图片？',
    a: '注册并登录后，在图片详情页点击下载按钮即可。下载记录可在「我的」页面查看。',
  },
  {
    q: '下载的图片可以商用吗？',
    a: '桃灵图库上的 AI 生成图片可免费用于个人和商业项目，但不得转售或重新分发。',
  },
  {
    q: '如何收藏图片？',
    a: '登录后，在图片详情页点击收藏图标即可。收藏的图片可在「我的收藏」中查看。',
  },
  {
    q: '遇到问题如何反馈？',
    a: '你可以通过上方的邮箱地址联系我们，我们会在 1-3 个工作日内回复。',
  },
]
</script>

<template>
  <section class="page-view">
    <div class="page-glow page-glow--top" />
    <div class="page-glow page-glow--bottom" />

    <div class="page-shell">
      <div class="hero-section">
        <span class="soft-label">Contact Us</span>
        <h1>联系桃灵</h1>
        <p class="hero-desc">有任何问题、建议或合作意向？桃灵期待听到你的声音。</p>
      </div>

      <div class="contact-grid">
        <article v-for="item in contactItems" :key="item.label" class="contact-card">
          <ElIcon><component :is="item.icon" /></ElIcon>
          <strong>{{ item.label }}</strong>
          <a :href="item.href">{{ item.value }}</a>
        </article>
      </div>

      <section class="content-card">
        <div class="card-header">
          <h2>
            <ElIcon><ChatDotRound /></ElIcon> 常见问题
          </h2>
        </div>
        <div v-for="(faq, index) in faqList" :key="index" class="faq-item">
          <strong>{{ faq.q }}</strong>
          <p>{{ faq.a }}</p>
        </div>
      </section>

      <section class="content-card">
        <div class="card-header">
          <h2>
            <ElIcon><Promotion /></ElIcon> 关注我们
          </h2>
        </div>
        <p>
          桃灵图库目前还在不断成长中。未来我们会在更多平台与你见面， 分享精选的 AI
          灵感作品和创作故事。敬请期待！
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

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.contact-card {
  display: grid;
  gap: 12px;
  place-items: center;
  padding: 32px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(161, 72, 120, 0.1);
  border-radius: 30px;
  box-shadow: $shadow-soft;
  backdrop-filter: blur(18px);

  .el-icon {
    color: $color-primary;
    font-size: 32px;
  }

  strong {
    color: $color-text-main;
    font-size: 16px;
  }

  a {
    color: $color-primary-light;
    font-size: 14px;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
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
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin: 0 0 18px;
    color: $color-primary;
    font-size: 24px;
    font-weight: 600;

    .el-icon {
      font-size: 22px;
    }
  }

  p {
    margin: 0;
    color: $color-text-main;
    font-size: 15px;
    line-height: 1.9;
  }
}

.faq-item {
  padding: 18px 0;
  border-bottom: 1px solid rgba(161, 72, 120, 0.1);

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  strong {
    display: block;
    margin-bottom: 6px;
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

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .content-card {
    padding: 24px;
  }
}
</style>
