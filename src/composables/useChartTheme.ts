import { computed } from 'vue'
import { useTheme } from '@/hooks/use-theme'

/**
 * Resolves the app's CSS theme tokens into concrete colour strings for ECharts.
 *
 * ECharts draws to a canvas and cannot read CSS custom properties, so we read the *resolved*
 * values off `:root` with getComputedStyle. The computed is keyed on `useTheme().theme` so it
 * re-reads (and every chart's `option` re-computes) whenever the light/dark class flips — that's
 * what makes the charts theme-aware instead of hardcoded to a dark palette.
 */
export function useChartTheme() {
  const { theme } = useTheme()

  return computed(() => {
    // Touch `theme` so this recomputes on toggle; the resolved token values change with the class.
    void theme.value
    const css = getComputedStyle(document.documentElement)
    const token = (name: string) => css.getPropertyValue(name).trim()

    return {
      /** primary body ink — tooltip text, bar value labels */
      foreground: token('--foreground'),
      /** recessive ink — axis labels */
      mutedForeground: token('--muted-foreground'),
      /** hairlines — axis lines, average line, tooltip border */
      border: token('--border'),
      /** chart surface — tooltip background, slice separators, line node fill */
      card: token('--card'),
      /** brand accent — the cumulative-spending line */
      primary: token('--primary'),
      /** faint fill — the backdrop bars behind the line */
      muted: token('--muted'),
    }
  })
}
