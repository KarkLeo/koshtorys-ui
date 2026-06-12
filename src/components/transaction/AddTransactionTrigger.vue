<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
const emit = defineEmits<{ open: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-2xl justify-center p-4">
    <Button size="lg" class="w-full rounded-full shadow-lg" @click="emit('open')">
      + {{ t('transaction.form.buttons.add') }}
    </Button>
  </div>
</template>
