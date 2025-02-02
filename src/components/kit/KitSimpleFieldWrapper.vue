<script setup lang="ts">
defineProps<{
  error: boolean
  message: string
}>()
</script>

<template>
  <div :class="['kit-simple-field-wrapper', { error: error }]">
    <div class="kit-simple-field-wrapper-field">
      <slot />
    </div>
    <div class="kit-simple-field-wrapper-message" v-if="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.kit-simple-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}

.kit-simple-field-wrapper-field {
  position: relative;
}

.kit-simple-field-wrapper-message {
  min-height: var(--line-height-text-sm);

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-regular);
  color: var(--text-tertiary);
}

.error .kit-simple-field-wrapper-message {
  color: var(--text-error-primary);
}
</style>
