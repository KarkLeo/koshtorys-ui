<script setup lang="ts">
import { useRoute } from 'vue-router'
import { MENU, ONBOARDING_PATHS } from '@/constants/menu'
import { useMe } from '@/hooks/auth-hooks.ts'

const router = useRoute()
const { me } = useMe()
</script>

<template>
  <nav v-if="me?.me && router.path !== ONBOARDING_PATHS" class="p-2">
    <ul class="flex items-center justify-center gap-4 p-0 m-0">
      <li v-for="item in MENU" :key="item.path" class="list-none">
        <router-link
          :to="item.path"
          class="flex items-center justify-center gap-1 rounded-md px-3 py-2 text-secondary-foreground no-underline transition-colors hover:bg-accent [&.active]:bg-accent [&_svg]:size-5 [&_svg]:text-muted-foreground [&:hover_svg]:text-secondary-foreground"
          active-class="active"
        >
          <component :is="item.icon" />
          <span>{{ $t(`mainMenu.${item.name}`) }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>
