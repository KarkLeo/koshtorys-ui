<script setup lang="ts">
import { ref } from 'vue'
import { useToastStore } from '@/stores/toastStore.ts'

import KitButton from '@/components/kit/KitButton.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitDatePicker from '@/components/kit/KitDatePicker.vue'
import KitCategories from '@/components/kit/KitCategories.vue'
import KitToggle from '@/components/kit/KitToggle.vue'

const input = ref<string>('')
const toastStore = useToastStore()
</script>

<template>
  <main>
    <div class="row">
      <router-link to="/login">
        <kit-button>Login</kit-button>
      </router-link>
      <router-link to="/register">
        <kit-button variant="secondary-gray">Register</kit-button>
      </router-link>
    </div>
    <div class="row">
      <kit-date-picker />
    </div>
    <div class="row">
      <kit-categories />
    </div>
    <div class="row">
      <kit-toggle />
    </div>
    <div class="row">
      <KitButton>Primary</KitButton>
      <KitButton variant="secondary-gray">Primary</KitButton>

      <KitButton class="custom">Primary</KitButton>
    </div>
    <div class="row">
      <KitButton size="sm" @click="toastStore.success('Small button')">Small Button</KitButton>
      <KitButton @click="toastStore.warning('Primary button')">Primary</KitButton>
      <KitButton size="lg" @click="toastStore.error('LG Large button')">LG Large Button</KitButton>
      <KitButton size="xl" @click="toastStore.info('XL Large button')">XL Large Button</KitButton>
      <KitButton size="xxl">XXL Large Button</KitButton>
      <KitButton disabled>Disabled Button</KitButton>
    </div>
    <div class="row">
      <KitButton variant="secondary-gray" size="sm">Small Button</KitButton>
      <KitButton variant="secondary-gray">Primary</KitButton>
      <KitButton variant="secondary-gray" size="lg">LG Large Button</KitButton>
      <KitButton variant="secondary-gray" size="xl">XL Large Button</KitButton>
      <KitButton variant="secondary-gray" size="xxl">XXL Large Button</KitButton>
      <KitButton variant="secondary-gray" disabled>Disabled Button</KitButton>
    </div>

    <div class="row">
      {{ input }}
      <KitInput
        v-model="input"
        type="text"
        placeholder="Enter your email"
        :class="'custom-class'"
      />
    </div>
    <div class="row">
      <KitInput v-model="input" type="email" placeholder="Enter your email" />
      <KitInput v-model="input" type="email" placeholder="Enter your email" />
      <KitInput v-model="input" type="email" placeholder="Enter your email" disabled />
      <KitInput v-model="input" size="sm" type="email" placeholder="Enter your email" />
    </div>
    <div class="row">
      <KitInput v-model="input" type="password" error placeholder="Enter your email" />
      <KitInput v-model="input" error type="email" placeholder="Enter your email" />
      <KitInput v-model="input" error type="email" placeholder="Enter your email" disabled />
      <KitInput v-model="input" error size="sm" type="email" placeholder="Enter your email" />
    </div>
  </main>
</template>

<style scoped>
.row {
  margin: var(--spacing-lg) 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--spacing-md);
}
</style>
