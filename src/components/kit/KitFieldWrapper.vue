<script setup lang="ts">
defineProps<{
  label: string
  error: boolean
  message: string
  required: boolean
}>()
</script>

<template>
  <div :class="['wrapper', { error: error }]">
    <label class="inner">
      <span class="label">
        {{ label }}
        <span v-if="required" class="required">*</span>
      </span>
      <span class="field">
        <slot />
      </span>
    </label>
    <div class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}

.inner {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.label {
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.required {
  color: var(--text-brand-tertiary);
}

.field {
  position: relative;
}

.message {
  min-height: var(--line-height-text-sm);

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-regular);
  color: var(--text-tertiary);
}

.error .message {
  color: var(--text-error-primary);
}
</style>
