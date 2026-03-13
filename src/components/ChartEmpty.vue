<template>
  <div class="empty" role="status" :aria-label="title || '暂无数据'">
    <div class="badge">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <g
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 17V7" />
          <path d="M9 17v-6" />
          <path d="M13 17v-3" />
          <path d="M17 17V9" />
          <path d="M4 17h16" />
          <path d="M7 9.5l2.2-2.2 2.4 2.4L17 4.5" />
        </g>
      </svg>
    </div>

    <div class="text">
      <div class="title">{{ title || "暂无数据" }}</div>
      <div class="desc">{{ desc || "当前时间段没有可展示的统计，稍后自动恢复。" }}</div>
    </div>

    <div class="skeleton" aria-hidden="true">
      <div class="progress" role="presentation">
        <div class="p1" />
        <div class="p2" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: "" },
  desc: { type: String, default: "" },
});
</script>

<style scoped>
.empty {
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 12px;
  display: grid;
  place-content: center;
  gap: 10px;
  padding: 18px 14px;
  color: #6b7280;
  text-align: center;
  background: transparent;
  box-shadow: none;
}

.badge {
  width: 44px;
  height: 44px;
  margin: 0 auto;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: rgba(55, 65, 81, 0.85);
  background: rgba(255, 255, 255, 0.72);
  box-shadow:
    0 10px 22px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.icon {
  width: 22px;
  height: 22px;
}

.title {
  font-weight: 760;
  letter-spacing: 0.2px;
  color: rgba(17, 24, 39, 0.9);
  font-size: 13px;
}

.desc {
  font-size: 12px;
}

.skeleton {
  display: grid;
  align-items: center;
  margin: 4px auto 0;
  width: min(240px, 92%);
  height: 44px;
  place-items: center;
}

.progress {
  position: relative;
  width: min(240px, 100%);
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.p1,
.p2 {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -40%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(130, 220, 255, 0),
    rgba(130, 220, 255, 0.95),
    rgba(130, 220, 255, 0)
  );
  filter: saturate(0.9);
  opacity: 0.95;
}

.p1 {
  width: 45%;
  animation: indeterminate1 1.8s cubic-bezier(0.65, 0.0, 0.35, 1) infinite;
}
.p2 {
  width: 30%;
  animation: indeterminate2 1.8s cubic-bezier(0.65, 0.0, 0.35, 1) infinite;
}

@keyframes indeterminate1 {
  0% {
    transform: translateX(-120%);
    opacity: 0.55;
  }
  50% {
    transform: translateX(60%);
    opacity: 0.95;
  }
  100% {
    transform: translateX(220%);
    opacity: 0.55;
  }
}

@keyframes indeterminate2 {
  0% {
    transform: translateX(-200%);
    opacity: 0.35;
  }
  60% {
    transform: translateX(20%);
    opacity: 0.9;
  }
  100% {
    transform: translateX(260%);
    opacity: 0.35;
  }
}
</style>

