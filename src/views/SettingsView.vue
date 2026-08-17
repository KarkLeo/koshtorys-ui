<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import { useMe, useSignOut } from '@/hooks/auth-hooks.ts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import GeneralTab from '@/components/settings/GeneralTab.vue'
import StatisticsTab from '@/components/settings/StatisticsTab.vue'

const { user } = useMe()
const { signOut } = useSignOut()
const router = useRouter()

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
  <div v-if="user" class="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
    <Tabs default-value="general" class="flex flex-col gap-6">
      <TabsList>
        <TabsTrigger value="general">{{ $t('settings.tabs.general') }}</TabsTrigger>
        <TabsTrigger value="statistics">{{ $t('settings.tabs.statistics') }}</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <GeneralTab />
        </Card>
      </TabsContent>

      <TabsContent value="statistics">
        <Card>
          <StatisticsTab />
        </Card>
      </TabsContent>
    </Tabs>

    <div class="mt-6 flex justify-end">
      <Button variant="outline" class="gap-2" @click="handleSignOut">
        <LogOut class="size-4" />
        {{ $t('settings.signOut') }}
      </Button>
    </div>
  </div>
</template>
