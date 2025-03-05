<script setup lang="ts">
import KitButton from '@/components/kit/KitButton.vue'
</script>

<template>
  <main>
    <h1 class="title">🤑Koshtorys</h1>
    <h2 class="sub-title">Development test: v 0.1.2</h2>

    <div class="row">
      <router-link to="/login">
        <KitButton>{{ $t('login.title') }}</KitButton>
      </router-link>
      <router-link to="/register">
        <KitButton variant="secondary-gray">{{ $t('register.title') }}</KitButton>
      </router-link>
    </div>
  </main>
</template>

<style scoped>
.title {
  margin: var(--spacing-xl) auto 0;

  font-size: var(--font-size-display-lg);
  line-height: var(--line-height-display-lg);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}
.sub-title {
  margin: 0 auto var(--spacing-xl);

  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

.row {
  margin: var(--spacing-4xl) auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xl);
}
</style>
