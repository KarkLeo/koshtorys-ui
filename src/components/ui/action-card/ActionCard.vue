<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean }>()
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent"
    @click="emit('click')"
  >
    <slot name="icon" />
    <span class="text-sm font-medium">{{ label }}</span>
  </button>
</template>
