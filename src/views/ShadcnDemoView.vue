<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { Skeleton } from '@/components/ui/skeleton'

const inputValue = ref('')
const passwordValue = ref('')
const selectValue = ref('')
const comboboxValue = ref('')
const switchValue = ref(false)
const radioValue = ref('option1')
const toggleValue = ref('center')
const checkboxValue = ref(false)
const calendarValue = ref<string>(new Date().toLocaleDateString())
const dialogOpen = ref(false)

const frameworks = [
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
]

const filteredFrameworks = ref(frameworks)

const handleComboboxSearch = (searchTerm: string) => {
  if (!searchTerm) {
    filteredFrameworks.value = frameworks
  } else {
    filteredFrameworks.value = frameworks.filter((framework) =>
      framework.label.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }
}
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="mx-auto max-w-7xl space-y-12">
      <div class="space-y-4">
        <h1 class="text-4xl font-bold">shadcn-vue Component Demo</h1>
        <p class="text-muted-foreground">
          Explore all shadcn-vue components installed in the project
        </p>
      </div>

      <!-- Buttons Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Buttons</h2>
        <div class="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div class="flex flex-wrap gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <!-- Input Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Input</h2>
        <div class="grid max-w-md gap-4">
          <div class="space-y-2">
            <Label for="text-input">Text Input</Label>
            <Input id="text-input" v-model="inputValue" type="text" placeholder="Enter text..." />
          </div>
          <div class="space-y-2">
            <Label for="password-input">Password Input</Label>
            <Input
              id="password-input"
              v-model="passwordValue"
              type="password"
              placeholder="Enter password..."
            />
          </div>
          <div class="space-y-2">
            <Label for="disabled-input">Disabled Input</Label>
            <Input id="disabled-input" type="text" placeholder="Disabled" disabled />
          </div>
        </div>
      </section>

      <!-- Select Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Select</h2>
        <div class="max-w-md space-y-2">
          <Label>Choose a framework</Label>
          <Select v-model="selectValue">
            <SelectTrigger>
              <SelectValue placeholder="Select a framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Frameworks</SelectLabel>
                <SelectItem value="vue">Vue.js</SelectItem>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p v-if="selectValue" class="text-sm text-muted-foreground">
            Selected: {{ selectValue }}
          </p>
        </div>
      </section>

      <!-- Combobox Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Combobox</h2>
        <div class="max-w-md space-y-2">
          <Label>Search frameworks</Label>
          <Combobox v-model="comboboxValue">
            <ComboboxAnchor>
              <ComboboxInput
                placeholder="Search framework..."
                @input="handleComboboxSearch($event.target.value)"
              />
              <ComboboxTrigger />
            </ComboboxAnchor>
            <ComboboxList>
              <ComboboxEmpty>No framework found.</ComboboxEmpty>
              <ComboboxItem
                v-for="framework in filteredFrameworks"
                :key="framework.value"
                :value="framework.value"
              >
                {{ framework.label }}
              </ComboboxItem>
            </ComboboxList>
          </Combobox>
          <p v-if="comboboxValue" class="text-sm text-muted-foreground">
            Selected: {{ comboboxValue }}
          </p>
        </div>
      </section>

      <!-- Switch Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Switch</h2>
        <div class="flex items-center space-x-2">
          <Switch id="airplane-mode" v-model:checked="switchValue" />
          <Label for="airplane-mode">Airplane Mode</Label>
        </div>
        <p class="text-sm text-muted-foreground">Switch is {{ switchValue ? 'ON' : 'OFF' }}</p>
      </section>

      <!-- Radio Group Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Radio Group</h2>
        <RadioGroup v-model="radioValue">
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="option1" value="option1" />
            <Label for="option1">Option 1</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="option2" value="option2" />
            <Label for="option2">Option 2</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="option3" value="option3" />
            <Label for="option3">Option 3</Label>
          </div>
        </RadioGroup>
        <p class="text-sm text-muted-foreground">Selected: {{ radioValue }}</p>
      </section>

      <!-- Toggle Group Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Toggle Group</h2>
        <ToggleGroup v-model="toggleValue" type="single">
          <ToggleGroupItem value="left" aria-label="Left align">Left</ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center align">Center</ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right align">Right</ToggleGroupItem>
        </ToggleGroup>
        <p class="text-sm text-muted-foreground">Selected: {{ toggleValue }}</p>
      </section>

      <!-- Checkbox Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Checkbox</h2>
        <div class="flex items-center space-x-2">
          <Checkbox id="terms" v-model:checked="checkboxValue" />
          <Label for="terms">Accept terms and conditions</Label>
        </div>
        <p class="text-sm text-muted-foreground">
          Checkbox is {{ checkboxValue ? 'checked' : 'unchecked' }}
        </p>
      </section>

      <!-- Dialog Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Dialog</h2>
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog description. You can put any content here.
              </DialogDescription>
            </DialogHeader>
            <div class="py-4">
              <p class="text-sm">Dialog body content goes here.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" @click="dialogOpen = false">Cancel</Button>
              <Button @click="dialogOpen = false">Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <!-- Tabs Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Tabs</h2>
        <Tabs default-value="tab1" class="max-w-md">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" class="space-y-2">
            <h3 class="text-lg font-medium">Tab 1 Content</h3>
            <p class="text-sm text-muted-foreground">This is the content for the first tab.</p>
          </TabsContent>
          <TabsContent value="tab2" class="space-y-2">
            <h3 class="text-lg font-medium">Tab 2 Content</h3>
            <p class="text-sm text-muted-foreground">This is the content for the second tab.</p>
          </TabsContent>
          <TabsContent value="tab3" class="space-y-2">
            <h3 class="text-lg font-medium">Tab 3 Content</h3>
            <p class="text-sm text-muted-foreground">This is the content for the third tab.</p>
          </TabsContent>
        </Tabs>
      </section>

      <!-- Calendar with Popover Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Calendar (Date Picker)</h2>
        <div class="space-y-2">
          <Label>Pick a date</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" class="w-64 justify-start text-left font-normal">
                <span>{{ calendarValue }}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar />
            </PopoverContent>
          </Popover>
        </div>
      </section>

      <!-- Context Menu Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Context Menu</h2>
        <ContextMenu>
          <ContextMenuTrigger
            class="flex h-40 w-full items-center justify-center rounded-md border border-dashed text-sm"
          >
            Right-click here
          </ContextMenuTrigger>
          <ContextMenuContent class="w-64">
            <ContextMenuItem>Back</ContextMenuItem>
            <ContextMenuItem disabled>Forward</ContextMenuItem>
            <ContextMenuItem>Reload</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Save Page As...</ContextMenuItem>
            <ContextMenuItem>Print...</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </section>

      <!-- Popover Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Popover</h2>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent class="w-80">
            <div class="space-y-2">
              <h4 class="font-medium leading-none">Popover Title</h4>
              <p class="text-sm text-muted-foreground">
                This is a popover. You can put any content inside it.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </section>

      <!-- Skeleton Section -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Skeleton</h2>
        <div class="flex items-center space-x-4">
          <Skeleton class="h-12 w-12 rounded-full" />
          <div class="space-y-2">
            <Skeleton class="h-4 w-64" />
            <Skeleton class="h-4 w-48" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
