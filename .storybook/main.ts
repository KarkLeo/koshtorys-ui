import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/vue3-vite',
  async viteFinal(config) {
    // Drop app-only Vite plugins that break / are irrelevant in Storybook:
    // vite-plugin-pwa (Workbox chokes on Storybook's large chunks) and vue-devtools.
    const flat = (config.plugins ?? []).flat(Infinity)
    config.plugins = flat.filter((plugin) => {
      const name =
        plugin && typeof plugin === 'object' && 'name' in plugin ? String(plugin.name) : ''
      return !name.includes('pwa') && !name.includes('vue-devtools')
    })
    return config
  },
}

export default config
