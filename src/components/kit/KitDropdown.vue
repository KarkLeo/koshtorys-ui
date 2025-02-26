<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import IconChevronDown from '@/components/icons/IconChevronDown.vue'
import IconCheck from '@/components/icons/IconCheck.vue'

const props = defineProps<{
  options: string[]
  placeholder?: string
  getOptionLabel?: (option: string) => string
}>()

const model = defineModel<string | null>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const selectedIndex = ref<number>(-1)
const isPositionTopOfPage = ref<boolean>(true)
const maxVisibleHeight = ref<number>(320)

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    checkPositionOnPage()
    await nextTick()
    listRef.value?.focus()
    selectedIndex.value = props.options.indexOf(model.value ?? '')
  }
}

const checkPositionOnPage = () => {
  if (dropdownRef.value) {
    const { top, bottom } = dropdownRef.value.getBoundingClientRect()
    const bottomSpace = document.documentElement.clientHeight - bottom
    isPositionTopOfPage.value = top < bottomSpace
    maxVisibleHeight.value = Math.min(Math.max(top, bottomSpace), 320)
  }
}

const selectOption = async (option: string, index: number) => {
  selectedIndex.value = index
  model.value = option
  isOpen.value = false
  await nextTick()
  buttonRef.value?.focus()
}

const handleKeyDown = (event: KeyboardEvent) => {
  event.preventDefault()
  switch (event.key) {
    case 'ArrowDown':
      selectedIndex.value =
        selectedIndex.value < props.options.length - 1 ? selectedIndex.value + 1 : 0
      break
    case 'ArrowUp':
      selectedIndex.value =
        selectedIndex.value > 0 ? selectedIndex.value - 1 : props.options.length - 1
      break
    case 'Enter':
      if (selectedIndex.value >= 0 && selectedIndex.value < props.options.length) {
        selectOption(props.options[selectedIndex.value], selectedIndex.value)
      }
      break
    case 'Escape':
      selectedIndex.value = props.options.indexOf(model.value ?? '')
      isOpen.value = false
      buttonRef.value?.focus()
      break
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  checkPositionOnPage()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    :class="['dropdown', { 'on-top': isPositionTopOfPage, 'on-bottom': !isPositionTopOfPage }]"
    ref="dropdownRef"
    :style="{ '--max-height': `${maxVisibleHeight}px` }"
  >
    <button
      type="button"
      class="dropdown-toggle"
      :class="{ open: isOpen }"
      @click="toggleDropdown"
      aria-haspopup="listbox"
      ref="buttonRef"
    >
      <span v-if="model" class="selected-option">{{
        getOptionLabel ? getOptionLabel(model) : model
      }}</span>
      <span v-else class="placeholder">{{ placeholder }}</span>
      <IconChevronDown class="chevron" />
      <span class="outline"></span>
    </button>
    <ul
      v-if="isOpen"
      class="dropdown-menu"
      role="listbox"
      tabindex="0"
      @keydown="handleKeyDown"
      ref="listRef"
    >
      <li v-for="(option, index) in options" :key="index" class="dropdown-item">
        <button
          type="button"
          role="option"
          :aria-selected="selectedIndex === index"
          tabindex="-1"
          :class="{ selected: selectedIndex === index }"
          class="dropdown-item-handler"
          @click.prevent="selectOption(option, index)"
        >
          <span class="option">{{ getOptionLabel ? getOptionLabel(option) : option }}</span>
          <IconCheck v-if="option === model" class="check" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  display: block;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--spacing-md);
  width: 100%;
  padding: 10px 14px;
  box-sizing: border-box;

  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-regular);
  text-align: left;

  background-color: var(--bg-primary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
}
.dropdown-toggle:focus {
  outline: none;
}
.dropdown-toggle:disabled {
  color: var(--text-disabled);

  background-color: var(--bg-disabled_subtle);
}

.placeholder {
  width: 100%;

  color: var(--text-placeholder);
}
.selected-option {
  width: 100%;

  color: var(--text-primary);
}
.dropdown-toggle :deep(.chevron) {
  width: 20px;
  height: 20px;

  color: var(--fg-tertiary);
}

.outline {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);

  pointer-events: none;
}
.dropdown-toggle:focus .outline,
.dropdown-toggle.open .outline {
  border: 2px solid var(--border-brand);
}
.dropdown-toggle:disabled .outline {
  border: 1px solid var(--border-disabled);
}

.on-top .dropdown-menu {
  top: calc(100% + var(--spacing-xs));
  bottom: auto;
}

.on-bottom .dropdown-menu {
  top: auto;
  bottom: calc(100% + var(--spacing-xs));
}

.dropdown-menu {
  position: absolute;
  left: 0;
  z-index: 1000;
  overflow-x: hidden;

  width: 100%;
  max-height: calc(var(--max-height, 320px) - 2 * var(--spacing-xs));
  box-sizing: border-box;
  margin: 0;
  padding: var(--spacing-xs) 0;

  list-style: none;

  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  box-shadow:
    0 4px 6px -2px rgba(16, 24, 40, 0.03),
    0 12px 16px -4px rgba(16, 24, 40, 0.08);
  outline: none;
}

.dropdown-menu::-webkit-scrollbar {
  width: var(--spacing-md);
  background-color: transparent;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: var(--border-primary);
  border-radius: var(--radius-xs);
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: stretch;
  margin: 0;
  padding: 1px var(--spacing-sm);
  box-sizing: border-box;
}

.dropdown-item-handler {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  width: 100%;
  padding: 10px 10px 10px var(--spacing-md);

  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  text-align: left;

  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.dropdown-item-handler :deep(.check) {
  width: 20px;
  height: 20px;

  color: var(--fg-brand-primary);
}
.option {
  white-space: nowrap;
}

.dropdown-item-handler:hover,
.dropdown-item-handler.selected {
  background-color: var(--bg-active);
}
</style>
