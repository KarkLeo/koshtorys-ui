<script setup lang="ts">
import { useRoute } from 'vue-router'
import { MENU, ONBOARDING_PATHS } from '@/constants/menu'
import { useMe } from '@/hooks/auth-hooks.ts'

const router = useRoute()
const { me } = useMe()
</script>

<template>
  <nav v-if="me?.me && router.path !== ONBOARDING_PATHS" class="main-menu">
    <ul class="main-menu-list">
      <li v-for="item in MENU" :key="item.path" class="main-menu-item">
        <router-link :to="item.path" class="main-menu-link" active-class="active">
          <component :is="item.icon" />
          <span>{{ $t(`mainMenu.${item.name}`) }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.main-menu {
  padding: var(--spacing-md);
}

.main-menu-list {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  gap: var(--spacing-xl);
  padding: 0;
  margin: 0;
}

.main-menu-item {
  padding: 0;
  margin: 0;
  list-style: none;
}

.main-menu-link {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);

  color: var(--text-secondary);
  text-decoration: none;

  border-radius: var(--radius-sm);
}

.main-menu-link.active,
.main-menu-link:hover {
  background-color: var(--bg-active);
}

.main-menu-link :deep(svg) {
  width: 24px;
  height: 24px;

  color: var(--text-tertiary);

  transition: color 0.2s ease;
}
.main-menu-link:hover :deep(svg),
.main-menu-link:focus :deep(svg) {
  color: var(--text-secondary);
}
</style>
