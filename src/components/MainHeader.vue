<script setup lang="ts">
import { useMe, useSignOut } from '@/hooks/auth-hooks.ts'
import { useRouter } from 'vue-router'
import { Sun, Moon, LogOut } from 'lucide-vue-next'

import MainMenu from '@/components/MainMenu.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

const { user } = useMe()
const { signOut } = useSignOut()
const router = useRouter()
const { theme, toggleTheme } = useTheme()

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error(error)
  } finally {
    await router.push({ name: 'home' })
  }
}
</script>

<template>
  <header class="flex items-center justify-center border-b border-border px-4 py-4 md:px-8">
    <div class="flex w-full max-w-screen-xl items-center justify-between">
      <div>
        <span v-if="!user" class="text-lg font-semibold"
          ><span class="mr-1">&#x1F911;</span>Koshtorys</span
        >
        <MainMenu v-else />
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="icon" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" class="size-4" />
          <Moon v-else class="size-4" />
        </Button>
        <Button v-if="user" variant="ghost" size="icon" @click="handleSignOut">
          <LogOut class="size-4" />
        </Button>
        <LangSwitcher v-else />
      </div>
    </div>
  </header>
</template>
