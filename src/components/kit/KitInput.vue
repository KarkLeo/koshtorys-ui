<script setup lang="ts" xmlns:bind="http://www.w3.org/1999/xhtml">
defineOptions({ inheritAttrs: false })
const model = defineModel()

const {
  type = 'text',
  size = 'md',
  error = false,
} = defineProps<{
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  size?: 'sm' | 'md'
  error?: boolean
}>()
</script>

<template>
  <span :class="['field', { error: error }]">
    <input
      v-model="model"
      :type="type"
      :class="['input', size, { error: error }]"
      v-bind="$attrs"
    />
    <span class="outline" />
  </span>
</template>

<style scoped>
.field {
  position: relative;
}

.input {
  width: 100%;
  display: block;
  box-sizing: border-box;

  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-regular);
  color: var(--text-primary);

  background-color: var(--bg-primary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

/* Type number - hire arrows */
.input[type='number']::-webkit-outer-spin-button,
.input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input[type='number'] {
  -moz-appearance: textfield;
}

.input::placeholder {
  color: var(--text-placeholder);
}

.input:focus {
  outline: none;
}

.input:disabled {
  color: var(--text-disabled);

  background-color: var(--bg-disabled_subtle);
}

.outline {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);

  pointer-events: none;
}

.input:focus + .outline {
  border: 2px solid var(--border-brand);
}

.input:disabled + .outline {
  border: 1px solid var(--border-disabled);
}

.error .outline {
  border: 1px solid var(--border-error_subtle);
}

.error .input:focus + .outline {
  border: 2px solid var(--border-error);
}

.input.sm {
  padding: var(--spacing-md) var(--spacing-lg);
}

.input.md {
  padding: 10px 14px;
}
</style>
