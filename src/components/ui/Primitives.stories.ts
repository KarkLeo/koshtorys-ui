import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ShadcnDemoView from '@/views/ShadcnDemoView.vue'

// Combined "kitchen-sink" of the Shadcn primitives (Button, Input, Select, Switch,
// Checkbox, Radio, Tabs, Calendar, Dialog, …) — see ShadcnDemoView for the source.
const meta = {
  title: 'Primitives/Kitchen Sink',
  component: ShadcnDemoView,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShadcnDemoView>

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
