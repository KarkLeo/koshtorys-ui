<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'
import IconChevronDown from '@/components/icons/IconChevronDown.vue'
import IconCheck from '@/components/icons/IconCheck.vue'

const {
  options,
  getOptionLabel = (_) => _,
  getOptionClass = (_) => _,
  getOptionStyle = () => ({}),
} = defineProps<{
  options: string[]
  placeholder?: string
  getOptionLabel?: (option: string) => string
  getOptionClass?: (option: string) => string
  getOptionStyle?: (option: string) => object
  withDot?: boolean
  error?: boolean
}>()

const model = defineModel<string | null>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLElement | null>(null)
const selectedIndex = ref<number>(-1)
const search = ref<string>('')
const isFiltered = ref(false)
const isPositionTopOfPage = ref<boolean>(true)
const maxVisibleHeight = ref<number>(360)

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    checkPositionOnPage()
    await nextTick()
    searchRef.value?.focus()
    selectedIndex.value = options.indexOf(model.value ?? '')
  } else {
    search.value = model?.value ? getOptionLabel(model.value) : ''
    isFiltered.value = false
  }
}

const checkPositionOnPage = () => {
  if (dropdownRef.value) {
    const { top, bottom } = dropdownRef.value.getBoundingClientRect()
    const bottomSpace = document.documentElement.clientHeight - bottom
    isPositionTopOfPage.value = top < bottomSpace
    maxVisibleHeight.value = Math.min(Math.max(top, bottomSpace), 360)
  }
}

const selectOption = async (option: string, index: number) => {
  selectedIndex.value = index
  model.value = option
  isOpen.value = false
  isFiltered.value = false
  await nextTick()
  searchRef.value?.focus()
}

const handleKeyDown = (event: KeyboardEvent) => {
  event.preventDefault()
  switch (event.key) {
    case 'ArrowDown':
      selectedIndex.value = selectedIndex.value < options.length - 1 ? selectedIndex.value + 1 : 0
      break
    case 'ArrowUp':
      selectedIndex.value = selectedIndex.value > 0 ? selectedIndex.value - 1 : options.length - 1
      break
    case 'Enter':
      if (selectedIndex.value >= 0 && selectedIndex.value < options.length) {
        selectOption(options[selectedIndex.value], selectedIndex.value)
      }
      break
    case 'Escape':
      selectedIndex.value = options.indexOf(model.value ?? '')
      isOpen.value = false
      searchRef.value?.blur()
      break
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
    isFiltered.value = false
    search.value = model.value ? getOptionLabel(model.value) : ''
  }
}

onMounted(() => {
  checkPositionOnPage()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(model, () => {
  search.value = model?.value ? getOptionLabel(model.value) : ''
})

const filteredOptions = computed(() => {
  return isFiltered.value
    ? options.filter((option) =>
        getOptionLabel(option).toLowerCase().includes(search.value.toLowerCase()),
      )
    : options
})

const handleInput = () => {
  isFiltered.value = true
  isOpen.value = true
  checkPositionOnPage()
}
</script>

<template>
  <div
    :class="[
      'dropdown',
      { 'on-top': isPositionTopOfPage, 'on-bottom': !isPositionTopOfPage, error: error },
    ]"
    ref="dropdownRef"
    :style="{ '--max-height': `${maxVisibleHeight}px` }"
  >
    <div class="dropdown-toggle" :class="{ open: isOpen }" @click="toggleDropdown">
      <input
        v-model="search"
        class="search-input"
        :placeholder="placeholder"
        ref="searchRef"
        @input="handleInput"
      />
      <IconChevronDown class="chevron" />
      <div class="outline" />
    </div>
    <ul v-if="isOpen" class="dropdown-menu" role="listbox" tabindex="0" @keydown="handleKeyDown">
      <li
        v-for="(option, index) in filteredOptions"
        :key="index"
        :class="['dropdown-item', getOptionClass(option)]"
        :style="getOptionStyle(option)"
      >
        <button
          type="button"
          role="option"
          :aria-selected="selectedIndex === index"
          tabindex="-1"
          :class="{ selected: selectedIndex === index }"
          class="dropdown-item-handler"
          @click.prevent="selectOption(option, index)"
        >
          <span v-if="withDot" class="dropdown-item-dot" />
          <span class="option">{{ getOptionLabel(option) }}</span>
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
  padding: 0 14px 0 0;
  box-sizing: border-box;

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

.dropdown-toggle :deep(.chevron) {
  width: 20px;
  height: 20px;

  color: var(--fg-tertiary);
}

.search-input {
  width: 100%;
  padding: 8px 14px;

  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-regular);
  text-align: left;
  color: var(--text-primary);

  background-color: transparent;
  border: none;
  outline: none;
}
.search-input::placeholder {
  color: var(--text-placeholder);
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
.search-input:focus ~ .outline,
.dropdown-toggle:focus .outline,
.dropdown-toggle.open .outline {
  border: 2px solid var(--border-brand);
}
.dropdown-toggle:disabled .outline {
  border: 1px solid var(--border-disabled);
}

.error .outline {
  border: 1px solid var(--border-error_subtle);
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

.dropdown-item-dot {
  width: 8px;
  height: 8px;
  margin-right: var(--spacing-sm);
  flex-shrink: 0;
  flex-grow: 0;

  background-color: var(--fg-brand-primary);
  border-radius: 50%;
}

.dropdown-item-handler {
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
