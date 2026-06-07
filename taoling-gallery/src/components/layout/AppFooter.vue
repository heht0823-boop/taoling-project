<template>
  <footer class="app-footer">
    <div class="footer-main">
      <span class="footer-brand">
        <img
          src="/static/icons/nav/brand-leaf.svg"
          alt=""
          width="24"
          height="24"
          decoding="async"
          aria-hidden="true"
        />
        桃灵图库
      </span>
      <nav class="footer-links" aria-label="页脚导航">
        <RouterLink to="/about">关于我们</RouterLink>
        <RouterLink to="/privacy">隐私政策</RouterLink>
        <RouterLink to="/terms">用户协议</RouterLink>
        <RouterLink to="/contact">联系桃灵</RouterLink>
        <RouterLink to="/messages">留言板</RouterLink>
      </nav>
      <p>{{ currentYear }} 桃灵图库. All rights reserved.</p>
    </div>

    <div class="footer-divider" />

    <div class="footer-bottom">
      <span class="copyright">&copy; {{ currentYear }} 桃灵图库</span>
      <span class="sep">|</span>
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        class="icp-link"
      >
        川ICP备2024000000号
      </a>
      <span class="sep">|</span>
      <a
        href="https://beian.mps.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        class="gongan-link"
      >
        <img
          src="/static/icons/gongan.png"
          alt="公安备案图标"
          class="gongan-icon"
          width="14"
          height="14"
        />
        川公网安备51102502000175号
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped lang="scss">
.app-footer {
  padding: 20px clamp(28px, 7vw, 108px);
  background: rgba(255, 255, 255, 0.72);
  border-top: 1px solid rgba(161, 72, 120, 0.18);
}

.footer-main {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto minmax(280px, 1fr);
  gap: 24px;
  align-items: center;
  min-height: 80px;
}

.footer-brand {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  color: $color-primary;
  font-size: 20px;

  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
    filter: drop-shadow(0 6px 12px rgba(161, 72, 120, 0.18));
  }
}

.footer-links {
  display: flex;
  gap: 28px;
  color: $color-text-secondary;
  font-size: 14px;

  a {
    color: $color-text-secondary;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: $color-primary;
    }
  }
}

.footer-main p {
  justify-self: end;
  margin: 0;
  color: #0077b6;
  font-size: 16px;
}

.footer-divider {
  height: 1px;
  margin: 16px 0;
  background: linear-gradient(to right, transparent, rgba(161, 72, 120, 0.14), transparent);
}

.footer-bottom {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 13px;
  color: $color-text-light;

  .sep {
    color: rgba(161, 72, 120, 0.22);
  }
}

.copyright {
  color: $color-text-light;
}

.icp-link,
.gongan-link {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  color: $color-text-light;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: $color-primary;
  }
}

.gongan-icon {
  flex-shrink: 0;
  object-fit: contain;
}

@media (max-width: 820px) {
  .footer-main {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 16px;
    text-align: center;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .footer-main p {
    justify-self: center;
  }

  .footer-bottom {
    gap: 4px;
  }
}
</style>
