<script setup lang="ts">
const { type = 'button' } = defineProps<{
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button :type="type" class="icon-btn" v-bind="$attrs">
    <slot>Button</slot>
  </button>
</template>

<style scoped>
.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  padding: var(--spacing-md);
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

.icon-btn :deep(svg) {
  width: 24px;
  height: 24px;

  color: var(--text-tertiary);

  transition: color 0.2s ease;
}
.icon-btn:hover :deep(svg),
.icon-btn:focus :deep(svg) {
  color: var(--text-secondary);
}
</style>
