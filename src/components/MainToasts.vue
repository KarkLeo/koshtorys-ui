<script setup lang="ts">
import IconAlertCircle from '@/components/icons/IconAlertCircle.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconInfoCircle from '@/components/icons/IconInfoCircle.vue'
import IconXClose from '@/components/icons/IconXClose.vue'
import { useToastStore } from '@/stores/toastStore.ts'

// eslint-disable-next-line
const iconsComponents: Record<string, any> = {
  success: IconCheckCircle,
  error: IconAlertCircle,
  warning: IconAlertCircle,
  info: IconInfoCircle,
}

const toastStore = useToastStore()
</script>

<template>
  <div :class="['main-toasts', { active: toastStore.toasts.length }]">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="['main-toasts-toast', toast.type]"
      >
        <div class="main-toasts-toast-icon-wrapper">
          <component :is="iconsComponents[toast.type]" class="main-toasts-toast-icon" />
        </div>
        <div class="main-toasts-toast-content">
          <p class="main-toasts-toast-message">{{ toast.message }}</p>
        </div>
        <button class="main-toasts-toast-close" @click="toastStore.removeToast(toast.id)">
          <IconXClose class="main-toasts-toast-close-icon" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    all 0.5s ease,
    opacity 0.5s ease;
}

.toast-enter-from {
  transform: translateY(50px);
  opacity: 0;
}

.toast-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.toast-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.toast-leave-to {
  transform: translateY(-50px);
  opacity: 0;
}

.main-toasts {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;

  width: min-content;
  padding: var(--spacing-3xl);
  box-sizing: border-box;

  transition: background 0.5s ease;
}
.main-toasts.active {
  background: linear-gradient(216.43deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 51.68%);
}
.main-toasts > * {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  gap: var(--spacing-xl);
}

.main-toasts-toast {
  width: 400px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl) var(--spacing-xl);
  box-sizing: border-box;

  background-color: var(--bg-primary_alt);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  box-shadow:
    0 2px 2px -1px #0a0d120a,
    0 4px 6px -2px #0a0d1208,
    0 12px 16px -4px #0a0d1214;
}

.main-toasts-toast-icon-wrapper {
  position: relative;
  z-index: 2;

  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  color: var(--color);
}
.main-toasts-toast-icon-wrapper:before,
.main-toasts-toast-icon-wrapper:after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: -1;

  display: block;
  box-sizing: border-box;

  border: 2px solid var(--color);
  border-radius: 50%;
  transform: translateY(-50%) translateX(-50%);
}
.main-toasts-toast-icon-wrapper:before {
  width: 28px;
  height: 28px;

  opacity: 0.3;
}
.main-toasts-toast-icon-wrapper:after {
  width: 38px;
  height: 38px;

  opacity: 0.1;
}

.main-toasts-toast-message {
  margin: 0;

  font-size: var(--font-size-text-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-text-sm);
  color: var(--fg-primary);
}

.main-toasts-toast-close {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  box-sizing: border-box;
  margin-left: auto;

  color: var(--fg-quinary);

  background-color: transparent;
  border: none;
  cursor: pointer;
}
.main-toasts-toast-close:hover {
  color: var(--fg-quinary_hover);
}

.success {
  --color: var(--fg-success-primary);
}
.error {
  --color: var(--fg-error-primary);
}
.warning {
  --color: var(--fg-warning-primary);
}
.info {
  --color: var(--fg-brand-primary);
}
</style>
