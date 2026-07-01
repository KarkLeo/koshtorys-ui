<script setup lang="ts">
import { useRoute } from 'vue-router'
import { NAV_TABS, ONBOARDING_PATHS } from '@/constants/menu'
import { useMe } from '@/hooks/auth-hooks.ts'

const route = useRoute()
const { user } = useMe()
</script>

<template>
  <nav v-if="user && route.path !== ONBOARDING_PATHS" class="p-2">
    <ul class="m-0 flex items-center justify-center gap-2 p-0">
      <li v-for="item in NAV_TABS" :key="item.path" class="list-none">
        <router-link
          :to="item.path"
          class="flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-secondary-foreground no-underline transition-colors hover:bg-accent [&.active]:bg-accent [&_svg]:size-5 [&_svg]:text-muted-foreground [&:hover_svg]:text-secondary-foreground [&.active_svg]:text-secondary-foreground"
          active-class="active"
        >
          <component :is="item.icon" />
          <span>{{ $t(`nav.${item.name}`) }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>
