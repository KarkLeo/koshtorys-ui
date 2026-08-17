// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [{
  name: 'app/files-to-lint',
  files: ['**/*.{ts,mts,tsx,vue}'],
}, {
  name: 'app/files-to-ignore',
  // Generated output — never hand-edited, so linting it is noise.
  ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/storybook-static/**'],
}, ...pluginVue.configs['flat/essential'], ...vueTsEslintConfig(), skipFormatting, ...storybook.configs["flat/recommended"], {
  // Shadcn-vue UI primitives are vendored generated code: intentionally single-word names
  // (Button, Card, Input, …) and the odd `any` in slot typings. Those are the library's shape,
  // not our smell, and hand-fixes would be lost on regeneration — relax both rules for this folder.
  name: 'app/shadcn-ui-generated',
  files: ['src/components/ui/**/*.vue'],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
}];
