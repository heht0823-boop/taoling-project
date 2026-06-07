<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export type TaolingMascotState =
  | 'idle'
  | 'search'
  | 'welcome'
  | 'happy'
  | 'thinking'
  | 'guide'
  | 'loading'
  | 'success'
  | 'empty'
  | 'permission'
  | 'sleepy'

const props = withDefaults(
  defineProps<{
    state?: TaolingMascotState
    autoplay?: boolean
    size?: 'sm' | 'md' | 'lg'
    priority?: boolean
  }>(),
  {
    state: 'welcome',
    autoplay: false,
    size: 'lg',
    priority: false,
  },
)

const states: TaolingMascotState[] = [
  'welcome',
  'guide',
  'happy',
  'thinking',
  'search',
  'loading',
  'success',
  'empty',
  'permission',
  'sleepy',
]
const activeState = ref<TaolingMascotState>(props.state ?? 'welcome')
let timer: ReturnType<typeof window.setInterval> | undefined

const mascotClasses = computed(() => [
  `taoling-mascot--${activeState.value}`,
  `taoling-mascot--${props.size}`,
])
const imageLoading = computed(() => (props.priority ? 'eager' : 'lazy'))
const imageSizes = computed(() => {
  if (props.size === 'sm') return '114px'
  if (props.size === 'md') return '198px'
  return '(max-width: 596px) 62vw, 310px'
})

function startAutoplay() {
  window.clearInterval(timer)
  const initialState = props.state ?? 'welcome'

  if (!props.autoplay) {
    activeState.value = initialState
    return
  }

  let index = Math.max(0, states.indexOf(initialState))
  activeState.value = states[index] ?? 'welcome'
  timer = window.setInterval(() => {
    index = (index + 1) % states.length
    activeState.value = states[index] ?? 'welcome'
  }, 2400)
}

watch(
  () => [props.state, props.autoplay] as const,
  () => startAutoplay(),
  { immediate: true },
)

onBeforeUnmount(() => {
  window.clearInterval(timer)
})
</script>

<template>
  <div class="taoling-mascot" :class="mascotClasses" aria-label="桃灵图库角色桃灵">
    <span class="mascot-shadow" />
    <picture>
      <source
        type="image/webp"
        srcset="
          /static/images/taoling/taoling-base-160w.webp 160w,
          /static/images/taoling/taoling-base-240w.webp 240w,
          /static/images/taoling/taoling-base-320w.webp 320w
        "
        :sizes="imageSizes"
      />
      <img
        class="mascot-image"
        src="/static/images/taoling/taoling-base.png"
        alt="桃灵"
        width="320"
        height="210"
        :loading="imageLoading"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
        draggable="false"
      />
    </picture>
    <span class="action action--search">
      <span class="magnifier-glass" />
      <span class="magnifier-handle" />
    </span>
    <span class="action action--guide" />
    <span class="action action--heart action--heart-one" />
    <span class="action action--heart action--heart-two" />
    <span class="action action--question">?</span>
    <span class="action action--success">✓</span>
    <span class="action action--empty">
      <span />
      <span />
      <span />
    </span>
    <span class="action action--permission">!</span>
    <span class="action action--sleepy">z</span>
    <span class="action action--spinner" />
  </div>
</template>

<style scoped lang="scss">
.taoling-mascot {
  --mascot-size: 360px;

  position: relative;
  display: grid;
  width: var(--mascot-size);
  aspect-ratio: 1;
  place-items: center;
  isolation: isolate;
}

.taoling-mascot--sm {
  --mascot-size: 132px;
}

.taoling-mascot--md {
  --mascot-size: 230px;
}

.taoling-mascot--lg {
  --mascot-size: min(430px, 72vw);
}

.taoling-mascot::before {
  position: absolute;
  inset: 18% 14% 18%;
  z-index: 0;
  content: '';
  background: radial-gradient(circle, rgba(255, 196, 218, 0.3), transparent 68%);
  border-radius: 50%;
  filter: blur(16px);
  opacity: 0.72;
  animation: aura-pulse 3.4s ease-in-out infinite;
}

.taoling-mascot picture,
.mascot-image {
  position: relative;
  z-index: 2;
  width: 86%;
  height: auto;
}

.mascot-image {
  display: block;
  width: 100%;
  object-fit: contain;
  transform-origin: 50% 72%;
  filter: drop-shadow(0 20px 30px rgba(161, 72, 120, 0.14))
    drop-shadow(0 0 10px rgba(255, 255, 255, 0.7));
  animation: mascot-breathe 3.2s ease-in-out infinite;
  user-select: none;
}

.mascot-shadow {
  position: absolute;
  z-index: 0;
  right: 24%;
  bottom: 16%;
  left: 24%;
  height: 12%;
  background: radial-gradient(ellipse, rgba(161, 72, 120, 0.16), transparent 68%);
  border-radius: 50%;
  filter: blur(8px);
  animation: shadow-breathe 3.2s ease-in-out infinite;
}

.action {
  position: absolute;
  z-index: 3;
  pointer-events: none;
}

.action--search {
  right: 17%;
  bottom: 30%;
  width: 21%;
  aspect-ratio: 1;
  opacity: 0;
  transform: rotate(-12deg) scale(0.82);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.magnifier-glass {
  position: absolute;
  inset: 2% 18% 30% 2%;
  background: radial-gradient(
    circle at 38% 30%,
    rgba(255, 255, 255, 0.95),
    rgba(183, 226, 255, 0.44)
  );
  border: 4px solid rgba(139, 110, 234, 0.62);
  border-radius: 50%;
}

.magnifier-handle {
  position: absolute;
  right: 14%;
  bottom: 12%;
  width: 13%;
  height: 48%;
  background: linear-gradient(180deg, #9edcff, #f58ab6);
  border-radius: 999px;
  transform: rotate(-42deg);
  transform-origin: 50% 0;
}

.action--guide {
  top: 23%;
  right: 16%;
  width: 9%;
  aspect-ratio: 1;
  opacity: 0;

  &::before,
  &::after {
    position: absolute;
    inset: 42% 0;
    content: '';
    background: #ff9cae;
    border-radius: 999px;
  }

  &::after {
    transform: rotate(90deg);
  }
}

.action--heart {
  width: 7%;
  aspect-ratio: 1;
  opacity: 0;
  transform: rotate(-45deg) scale(0.6);

  &::before,
  &::after {
    position: absolute;
    content: '';
    background: linear-gradient(135deg, #ff8eb7, #a477f0);
    border-radius: 50%;
  }

  &::before {
    inset: -46% 0 0;
  }

  &::after {
    inset: 0 -46% 0 0;
  }
}

.action--heart-one {
  top: 24%;
  left: 24%;
}

.action--heart-two {
  right: 20%;
  bottom: 28%;
  width: 5.5%;
}

.action--question,
.action--success,
.action--permission,
.action--sleepy {
  display: grid;
  width: 13%;
  aspect-ratio: 1;
  place-items: center;
  color: $color-primary;
  font-size: calc(var(--mascot-size) * 0.075);
  font-weight: 700;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(244, 139, 181, 0.24);
  border-radius: 50%;
  box-shadow: 0 12px 24px rgba(161, 72, 120, 0.12);
  opacity: 0;
}

.action--question {
  top: 20%;
  right: 22%;
}

.action--success {
  top: 18%;
  right: 23%;
  color: #6cba7c;
}

.action--permission {
  top: 20%;
  right: 22%;
  color: #f49a54;
}

.action--sleepy {
  top: 19%;
  right: 24%;
  color: $color-secondary;
  font-size: calc(var(--mascot-size) * 0.066);
}

.action--empty {
  top: 27%;
  right: 20%;
  display: flex;
  gap: 5%;
  width: 20%;
  opacity: 0;

  span {
    width: 25%;
    aspect-ratio: 1;
    background: rgba(161, 72, 120, 0.42);
    border-radius: 50%;
  }
}

.action--spinner {
  top: 18%;
  right: 22%;
  width: 13%;
  aspect-ratio: 1;
  border: 3px solid rgba(244, 139, 181, 0.24);
  border-top-color: $color-secondary;
  border-radius: 50%;
  opacity: 0;
}

.taoling-mascot--idle .mascot-image {
  animation: mascot-idle 4.2s ease-in-out infinite;
}

.taoling-mascot--welcome .mascot-image {
  animation: mascot-wave 1.24s ease-in-out infinite;
}

.taoling-mascot--happy .mascot-image {
  animation: mascot-hop 0.92s ease-in-out infinite;
}

.taoling-mascot--happy {
  .action--heart {
    opacity: 1;
    animation: heart-pop 1.2s ease-in-out infinite;
  }

  .action--heart-two {
    animation-delay: 0.18s;
  }
}

.taoling-mascot--thinking .mascot-image {
  animation: mascot-thinking 2.5s ease-in-out infinite;
}

.taoling-mascot--guide {
  .mascot-image {
    animation: mascot-guide 2.2s ease-in-out infinite;
  }

  .action--guide {
    opacity: 1;
    animation: guide-spark 1.4s ease-in-out infinite;
  }
}

.taoling-mascot--search {
  .mascot-image {
    animation: mascot-search 2s ease-in-out infinite;
  }

  .action--search {
    opacity: 1;
    transform: rotate(-8deg) scale(1);
    animation: inspect 1.6s ease-in-out infinite;
  }
}

.taoling-mascot--loading {
  .mascot-image {
    animation: mascot-loading 1.35s ease-in-out infinite;
  }

  .action--spinner {
    opacity: 1;
    animation: spinner-roll 0.9s linear infinite;
  }
}

.taoling-mascot--success {
  .mascot-image {
    animation: mascot-success 1.4s ease-in-out infinite;
  }

  .action--success,
  .action--heart-one {
    opacity: 1;
    animation: badge-pop 1.35s ease-in-out infinite;
  }
}

.taoling-mascot--empty {
  .mascot-image {
    animation: mascot-empty 2.6s ease-in-out infinite;
  }

  .action--empty {
    opacity: 1;

    span {
      animation: dot-bounce 1.2s ease-in-out infinite;
    }

    span:nth-child(2) {
      animation-delay: 0.15s;
    }

    span:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

.taoling-mascot--permission {
  .mascot-image {
    animation: mascot-permission 2.2s ease-in-out infinite;
  }

  .action--permission {
    opacity: 1;
    animation: badge-pop 1.4s ease-in-out infinite;
  }
}

.taoling-mascot--sleepy {
  .mascot-image {
    animation: mascot-sleepy 3s ease-in-out infinite;
    filter: drop-shadow(0 18px 28px rgba(161, 72, 120, 0.12)) saturate(0.92);
  }

  .action--sleepy {
    opacity: 1;
    animation: sleepy-float 1.8s ease-in-out infinite;
  }
}

.taoling-mascot--thinking {
  .action--question {
    opacity: 1;
    animation: question-wiggle 1.7s ease-in-out infinite;
  }
}

@keyframes aura-pulse {
  0%,
  100% {
    opacity: 0.52;
    transform: scale(0.95);
  }

  50% {
    opacity: 0.86;
    transform: scale(1.08);
  }
}

@keyframes mascot-idle {
  0%,
  100% {
    transform: translateY(0) rotate(0) scale(1);
  }

  35% {
    transform: translateY(-7px) rotate(1deg) scale(1.01);
  }

  70% {
    transform: translateY(-3px) rotate(-1deg) scale(1);
  }
}

@keyframes mascot-breathe {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-8px) scale(1.015);
  }
}

@keyframes mascot-wave {
  0% {
    transform: translateY(0) rotate(-1deg);
  }

  28% {
    transform: translateY(-8px) rotate(4deg);
  }

  54% {
    transform: translateY(-4px) rotate(-3deg);
  }

  78% {
    transform: translateY(-9px) rotate(3deg);
  }

  100% {
    transform: translateY(0) rotate(-1deg);
  }
}

@keyframes mascot-hop {
  0%,
  100% {
    transform: translateY(0) scaleY(0.98);
  }

  45% {
    transform: translateY(-22px) scaleY(1.02);
  }
}

@keyframes heart-pop {
  0%,
  100% {
    opacity: 0;
    transform: translateY(8px) rotate(-45deg) scale(0.55);
  }

  40%,
  70% {
    opacity: 1;
    transform: translateY(-10px) rotate(-45deg) scale(1);
  }
}

@keyframes mascot-thinking {
  0%,
  100% {
    transform: translateY(-4px) rotate(-4deg);
  }

  50% {
    transform: translateY(-8px) rotate(3deg);
  }
}

@keyframes mascot-guide {
  0%,
  100% {
    transform: translateX(0) translateY(0) rotate(-1deg);
  }

  50% {
    transform: translateX(10px) translateY(-8px) rotate(2deg);
  }
}

@keyframes mascot-search {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }

  50% {
    transform: translateY(-8px) rotate(-3deg);
  }
}

@keyframes mascot-loading {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }

  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}

@keyframes mascot-success {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  35% {
    transform: translateY(-16px) scale(1.04);
  }

  70% {
    transform: translateY(-6px) scale(1.01);
  }
}

@keyframes mascot-empty {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
    opacity: 0.92;
  }

  50% {
    transform: translateY(-6px) rotate(2deg);
    opacity: 1;
  }
}

@keyframes mascot-permission {
  0%,
  100% {
    transform: translateX(0) rotate(0);
  }

  20% {
    transform: translateX(-5px) rotate(-2deg);
  }

  40% {
    transform: translateX(5px) rotate(2deg);
  }

  60% {
    transform: translateX(-3px) rotate(-1deg);
  }
}

@keyframes mascot-sleepy {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg) scale(0.98);
  }

  50% {
    transform: translateY(-5px) rotate(-6deg) scale(0.98);
  }
}

@keyframes spinner-roll {
  to {
    transform: rotate(360deg);
  }
}

@keyframes badge-pop {
  0%,
  100% {
    transform: translateY(4px) scale(0.86);
  }

  50% {
    transform: translateY(-8px) scale(1.06);
  }
}

@keyframes dot-bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }

  50% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

@keyframes question-wiggle {
  0%,
  100% {
    transform: rotate(-6deg) scale(0.92);
  }

  50% {
    transform: rotate(8deg) scale(1.05);
  }
}

@keyframes sleepy-float {
  0% {
    transform: translate(0, 10px) scale(0.72);
    opacity: 0;
  }

  45% {
    opacity: 1;
  }

  100% {
    transform: translate(14px, -14px) scale(1);
    opacity: 0;
  }
}

@keyframes inspect {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: -8px -5px;
  }
}

@keyframes guide-spark {
  0%,
  100% {
    transform: scale(0.78) rotate(0);
  }

  50% {
    transform: scale(1) rotate(18deg);
  }
}

@keyframes shadow-breathe {
  0%,
  100% {
    opacity: 0.62;
    transform: scaleX(0.94);
  }

  50% {
    opacity: 0.32;
    transform: scaleX(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mascot-image,
  .mascot-shadow,
  .action {
    animation: none;
  }
}
</style>
