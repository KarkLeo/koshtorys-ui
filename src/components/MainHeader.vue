<script setup lang="ts">
import { useMe, useSignOut } from '@/hooks/auth-hooks.ts'
import { useRouter } from 'vue-router'

import MainMenu from '@/components/MainMenu.vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconLogout from '@/components/icons/IconLogout.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'

const { refreshMe, me } = useMe()
const { signOut } = useSignOut()
const router = useRouter()

const handleSignOut = async () => {
  try {
    await signOut()
    refreshMe()
  } catch (error) {
    console.error(error)
  } finally {
    await router.push({ name: 'home' })
  }
}
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <div class="left-side">
        <MainMenu />
      </div>
      <div class="right-side">
        <KitIconButton v-if="me?.me" @click="handleSignOut">
          <IconLogout />
        </KitIconButton>
        <LangSwitcher v-else />
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  box-sizing: border-box;

  border-bottom: 1px solid var(--border-secondary);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  max-width: var(--container-max-width-desktop);
  width: 100%;
}

@media screen and (min-width: 768px) {
  .header {
    padding: var(--spacing-xl) var(--spacing-4xl);
  }
}
</style>
