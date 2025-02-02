<script setup lang="ts">
import { CURRENCIES } from '@/constants/currencies'
import KitDropdown from '@/components/kit/KitDropdown.vue'

defineOptions({ inheritAttrs: false })
const model = defineModel()
const currencyModel = defineModel('currency', { type: String })

const {
  size = 'md',
  error = false,
  min,
  max,
} = defineProps<{
  size?: 'sm' | 'md'
  error?: boolean
  min?: number
  max?: number
}>()
</script>

<template>
  <span :class="['money-field', { error: error }]">
    <input
      v-model="model"
      type="number"
      :class="['input', size, { error: error }]"
      v-bind="$attrs"
      :min="min"
      :max="max"
    />
    <kit-dropdown :options="CURRENCIES" v-model="currencyModel" placeholder="Select currency" />
    <span class="outline" />
  </span>
</template>

<style scoped>
.money-field {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  background-color: var(--bg-primary);
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

.message {
  position: absolute;
  top: 100%;
  left: 0;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-regular);
  color: var(--text-tertiary);
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

.money-field :deep(.dropdown .outline) {
  display: none;
}
</style>
