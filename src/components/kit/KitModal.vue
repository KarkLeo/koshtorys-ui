<script setup lang="ts">
import IconXClose from '@/components/icons/IconXClose.vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import KitButton from '@/components/kit/KitButton.vue'
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close', 'cancel', 'submit'])

defineProps<{
  title: string
  subtitle: string
  cancelText: string
  submitText: string
}>()

const closeHandler = () => {
  emit('close')
}

const cancelHandler = () => {
  emit('cancel')
}

const submitHandler = () => {
  emit('submit')
}

// ===== Fixe scroll =====
const disableScroll = () => {
  document.body.style.overflow = 'hidden'
}

const enableScroll = () => {
  document.body.style.overflow = ''
}

onMounted(() => disableScroll())
onUnmounted(() => enableScroll())
</script>

<template>
  <div class="kit-modal">
    <div class="kit-modal-overlay" @click="closeHandler" />
    <div class="kit-modal-base">
      <div class="kit-modal-header">
        <h2 class="kit-modal-title">{{ title }}</h2>
        <h3 class="kit-modal-subtitle">{{ subtitle }}</h3>
        <KitIconButton class="kit-modal-close" @click="closeHandler">
          <IconXClose />
        </KitIconButton>
      </div>
      <div class="kit-modal-body">
        <slot />
      </div>
      <div class="kit-modal-footer">
        <KitButton variant="secondary-gray" fullwidth @click="cancelHandler">{{
          cancelText
        }}</KitButton>
        <KitButton fullwidth @click="submitHandler">{{ submitText }}</KitButton>
      </div>
    </div>
  </div>
</template>
<style scoped>
.kit-modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;

  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  box-sizing: border-box;
}

.kit-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;

  width: 100%;
  height: 100%;

  backdrop-filter: blur(16px);
  background-color: rgba(0, 0, 0, 0.2);
}

.kit-modal-base {
  position: relative;
  z-index: 1;

  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 2 * var(--spacing-3xl));
  display: flex;
  flex-direction: column;
  padding: var(--spacing-2xl) var(--spacing-xl);
  box-sizing: border-box;

  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow:
    0 3px 3px -1.5px #0a0d120a,
    0 8px 8px -4px #0a0d1208,
    0 20px 24px -4px #0a0d1208;
}

.kit-modal-header {
  position: relative;

  display: flex;
  flex-direction: column;
  gap: var(--radius-xs);
  margin-bottom: var(--spacing-2xl);
}

.kit-modal-title {
  margin: 0;

  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-text-lg);
  line-height: var(--line-height-text-lg);
  color: var(--text-primary);
}

.kit-modal-subtitle {
  margin: 0;

  font-weight: var(--font-weight-regular);
  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  color: var(--text-tertiary);
}

.kit-modal-close {
  position: absolute;
  top: calc(-1 * var(--spacing-2xl));
  right: calc(-1 * var(--spacing-xl));
}

.kit-modal-body {
  overflow-y: auto;
}

.kit-modal-footer {
  margin-top: var(--spacing-3xl);
  display: flex;
  flex-direction: column-reverse;
  gap: var(--spacing-lg);
}

@media screen and (min-width: 768px) {
  .kit-modal-base {
    padding: var(--spacing-3xl);
  }
  .kit-modal-footer {
    margin-top: var(--spacing-4xl);
    flex-direction: row;
  }
}
</style>
