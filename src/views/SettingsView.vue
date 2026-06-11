<script setup lang="ts">
import { useMe } from '@/hooks/auth-hooks.ts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import GeneralTab from '@/components/settings/GeneralTab.vue'
import StatisticsTab from '@/components/settings/StatisticsTab.vue'

const { user } = useMe()
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
  </div>
</template>
