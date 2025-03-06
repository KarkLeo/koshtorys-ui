<script setup lang="ts">
const version = __APP_VERSION__
const buildDate = __BUILD_DATE__
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-text">Development test: v{{ version }}</div>
      <div class="footer-subtext">
        Build: {{ new Date(buildDate).toLocaleDateString() }}
        {{ new Date(buildDate).toLocaleTimeString() }}
      </div>
    </div>
  </footer>
</template>
<style scoped>
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  box-sizing: border-box;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  gap: var(--spacing-xs);
  padding: var(--spacing-xl);
  box-sizing: border-box;
  max-width: var(--container-max-width-desktop);
  width: 100%;

  border-top: 1px solid var(--border-secondary);
}

.footer-text {
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-light);
  color: var(--text-quaternary);
}

.footer-subtext {
  font-size: var(--font-size-text-xs);
  line-height: var(--line-height-text-xs);
  font-weight: var(--font-weight-light);
  color: var(--text-quaternary);
}

@media screen and (min-width: 768px) {
  .footer {
    padding: var(--spacing-xl) var(--spacing-4xl);
  }
}
</style>
