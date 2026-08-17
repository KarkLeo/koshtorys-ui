<script setup lang="ts">
const version = __APP_VERSION__
const buildDate = __BUILD_DATE__
</script>

<template>
  <footer class="flex items-center justify-center border-t border-border px-4 py-4 md:px-8">
    <div class="flex w-full max-w-screen-xl flex-col items-end gap-1">
      <div class="text-sm font-light text-muted-foreground">Development test: v{{ version }}</div>
      <div class="text-xs font-light text-muted-foreground">
        Build: {{ new Date(buildDate).toLocaleDateString() }}
        {{ new Date(buildDate).toLocaleTimeString() }}
      </div>
    </div>
  </footer>
</template>
