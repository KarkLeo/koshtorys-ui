<script setup lang="ts">
defineProps<{
  label: string
  description?: string
  error?: boolean
  message?: string
}>()
</script>

<template>
  <div class="border-t border-border py-5 md:py-6">
    <div class="flex w-full flex-col gap-3 md:grid md:grid-cols-[6fr_4fr] md:gap-10">
      <div class="flex flex-col gap-1">
        <h3 class="text-sm font-semibold text-foreground md:text-base">{{ label }}</h3>
        <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
      </div>
      <div class="flex flex-col gap-2">
        <slot />
        <p
          v-if="message"
          class="text-sm"
          :class="error ? 'text-destructive' : 'text-muted-foreground'"
        >
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>
