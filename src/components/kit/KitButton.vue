<script setup lang="ts">
const {
  type = 'button',
  size = 'md',
  variant = 'primary',
  fullwidth = false,
} = defineProps<{
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  variant?: 'primary' | 'secondary-gray' | 'danger' | 'transparent'
  fullwidth?: boolean
  error?: boolean
}>()
</script>

<template>
  <button
    :type="type"
    :class="[
      'btn',
      size,
      variant,
      {
        'full-width': fullwidth,
        error: error,
      },
    ]"
    v-bind="$attrs"
  >
    <slot>Button</slot>
  </button>
</template>

<style scoped>
.btn {
  --shadow-btn: 0 1px 2px 0 rgba(16, 24, 40, 0.05), 0 -2px 0 0 rgba(16, 24, 40, 0.05) inset,
    0 0 0 1px rgba(16, 24, 40, 0.18) inset;
  --shadow-focused: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--fg-brand-secondary);
  --shadow-disabled: 0 1px 2px 0 rgba(16, 24, 40, 0.05);

  white-space: nowrap;

  box-sizing: border-box;
  border: none;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn:disabled {
  cursor: not-allowed;
}

.btn.primary {
  position: relative;
  color: var(--text-white);
  border: 1px solid transparent;
  background-color: var(--bg-brand-solid);
  box-shadow: var(--shadow-btn);
}
.btn.primary::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 2px solid;
  border-image-source: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}
.btn.primary:hover {
  background-color: var(--bg-brand-solid_hover);
}
.btn.primary:focus {
  outline: none;
  box-shadow: var(--shadow-focused), var(--shadow-btn);
}
.btn.primary:disabled {
  color: var(--fg-disabled);
  background-color: var(--bg-disabled);
  border: 1px solid var(--border-disabled_subtle);
  box-shadow: var(--shadow-disabled);
}
.btn.primary:disabled::after {
  display: none;
}

.btn.secondary-gray {
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  background-color: var(--bg-secondary);
  box-shadow: var(--shadow-btn);
}
.btn.secondary-gray:hover {
  color: var(--text-secondary_hover);
  background-color: var(--bg-secondary_hover);
}
.btn.secondary-gray:focus {
  outline: none;
  box-shadow: var(--shadow-focused), var(--shadow-btn);
}
.btn.secondary-gray:disabled {
  color: var(--fg-disabled);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-disabled_subtle);
  box-shadow: var(--shadow-disabled);
}

.btn.danger {
  background-color: #dc3545;
  color: white;
}

.btn.transparent {
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  background-color: transparent;
  box-shadow: var(--shadow-btn);
}
.btn.secondary-gray:hover {
  color: var(--text-secondary_hover);
}
.btn.secondary-gray:focus {
  outline: none;
  box-shadow: var(--shadow-focused), var(--shadow-btn);
}
.btn.secondary-gray:disabled {
  color: var(--fg-disabled);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-disabled_subtle);
  box-shadow: var(--shadow-disabled);
}

.btn.sm {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
}

.btn.md {
  padding: 10px 14px;
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
}

.btn.lg {
  padding: 10px var(--spacing-xl);
  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
}

.btn.xl {
  padding: var(--spacing-lg) 18px;
  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
}

.btn.xxl {
  padding: var(--spacing-xl) 22px;
  font-size: var(--font-size-text-lg);
  line-height: var(--line-height-text-lg);
}

.btn.sm,
.btn.sm::after,
.btn.md,
.btn.md::after,
.btn.lg,
.btn.lg::after {
  border-radius: var(--radius-md);
}
.btn.xl,
.btn.xl::after,
.btn.xxl,
.btn.xxl::after {
  border-radius: var(--radius-lg);
}

.btn.full-width {
  width: 100%;
}

.btn.error {
  border-color: var(--border-error_subtle);
}
</style>
