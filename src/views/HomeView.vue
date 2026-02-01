<script setup lang="ts">
import { Button } from '@/components/ui/button'

const version = __APP_VERSION__
</script>

<template>
  <main class="flex flex-1 flex-col items-center justify-center px-4">
    <h1 class="mt-6 text-center text-5xl font-semibold">
      <span class="mr-1">&#x1F911;</span>Koshtorys
    </h1>
    <h2 class="mb-6 mt-0 text-center text-base font-semibold text-foreground">
      Development test: v{{ version }}
    </h2>

    <div class="mt-8 flex items-center justify-center gap-4">
      <router-link to="/login">
        <Button>{{ $t('login.title') }}</Button>
      </router-link>
      <router-link to="/register">
        <Button variant="outline">{{ $t('register.title') }}</Button>
      </router-link>
    </div>
  </main>
</template>
