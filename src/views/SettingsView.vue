<script setup lang="ts">
import { useMe } from '@/hooks/auth-hooks.ts'
import KitTabs from '@/components/kit/KitTabs.vue'
import { SETTINGS_TABS } from '@/constants/settings.ts'

const { me } = useMe()
</script>

<template>
  <kit-tabs v-if="me?.me" :tabs="SETTINGS_TABS" langPrefix="settings.tabs." with-border />
</template>
