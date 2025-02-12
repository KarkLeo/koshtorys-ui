<script setup lang="ts">
const { type = 'button', size = 'xl' } = defineProps<{
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
}>()
</script>

<template>
  <button :type="type" :class="['icon-btn', size]" v-bind="$attrs">
    <slot>Button</slot>
  </button>
</template>

<style scoped>
.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.icon-btn:hover,
.icon-btn:focus {
  background-color: var(--bg-active);
}
.icon-btn:disabled {
  cursor: not-allowed;
}

.icon-btn.sm {
  width: 36px;
  height: 36px;
  padding: var(--spacing-md);
}
.icon-btn.md {
  width: 40px;
  height: 40px;
  padding: 10px;
}
.icon-btn.lg {
  width: 44px;
  height: 44px;
  padding: var(--spacing-lg);
}
.icon-btn.xl {
  width: 48px;
  height: 48px;
  padding: var(--spacing-md);
}
.icon-btn.xl {
  width: 56px;
  height: 56px;
  padding: var(--spacing-xl);
}

.icon-btn :deep(svg) {
  color: var(--text-tertiary);

  transition: color 0.2s ease;
}
.icon-btn:hover :deep(svg),
.icon-btn:focus :deep(svg) {
  color: var(--text-secondary);
}

.icon-btn.sm :deep(svg),
.icon-btn.md :deep(svg),
.icon-btn.lg :deep(svg) {
  width: 20px;
  height: 20px;
}
.icon-btn.xl :deep(svg),
.icon-btn.xxl :deep(svg) {
  width: 24px;
  height: 24px;
}
</style>
