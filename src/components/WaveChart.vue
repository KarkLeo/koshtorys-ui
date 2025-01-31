<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// ===== Helpers =====

interface StopColors {
  stop: number
  color1: string
  color2: string
}

const MAIN_STOP_COLORS: StopColors[] = [
  { stop: 0, color1: '#4DEF8E', color2: '#FFEB3A' },
  { stop: 16.6, color1: '#39A0FF', color2: '#8FFF85' },
  { stop: 33.3, color1: '#72EDF2', color2: '#5151E5' },
  { stop: 50, color1: '#43CBFF', color2: '#9708CC' },
  { stop: 66.6, color1: '#F9D423', color2: '#E14FAD' },
  { stop: 100, color1: '#B01EFF', color2: '#E1467C' },
]

const BACKGROUND_STOP_COLORS: StopColors[] = [
  { stop: 0, color2: '#4DEF8E', color1: '#FFEB3A' },
  { stop: 16.6, color2: '#39A0FF', color1: '#8FFF85' },
  { stop: 33.3, color2: '#72EDF2', color1: '#5151E5' },
  { stop: 50, color2: '#43CBFF', color1: '#9708CC' },
  { stop: 66.6, color2: '#F9D423', color1: '#E14FAD' },
  { stop: 83.3, color2: '#F49062', color1: '#FD371F' },
  { stop: 100, color2: '#B01EFF', color1: '#E1467C' },
]

const getStartEndColors = (colors: StopColors[], value: number) => {
  const normalizedValue = normalizeValue(value)
  let startColor: string = '',
    endColor: string = ''

  for (let i = 0; i < colors.length - 1; i++) {
    if (normalizedValue >= colors[i].stop && normalizedValue <= colors[i + 1].stop) {
      const range = colors[i + 1].stop - colors[i].stop
      const position = (normalizedValue - colors[i].stop) / range

      startColor = interpolateColor(colors[i].color1, colors[i + 1].color1, position)
      endColor = interpolateColor(colors[i].color2, colors[i + 1].color2, position)
      break
    }
  }

  return { startColor, endColor }
}

const adjustOpacityRGBColor = (color: string, opacity: string): string =>
  color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)

const createGradient = (
  colors: StopColors[],
  opacity1: string,
  opacity2: string,
  value: number,
): CanvasGradient | string => {
  if (!ctx.value) return 'rgba(0, 0, 0, 0)'

  const gradient = ctx.value.createLinearGradient(0, 0, ctx.value.canvas.width, 0)

  const { startColor, endColor } = getStartEndColors(colors, value)
  gradient.addColorStop(0, adjustOpacityRGBColor(startColor, opacity1))
  gradient.addColorStop(1, adjustOpacityRGBColor(endColor, opacity2))

  return gradient
}

const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  const result = {
    r: Math.round(c1.r + factor * (c2.r - c1.r)),
    g: Math.round(c1.g + factor * (c2.g - c1.g)),
    b: Math.round(c1.b + factor * (c2.b - c1.b)),
  }

  return `rgb(${result.r}, ${result.g}, ${result.b})`
}

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

const easeInOutExpo = (t: number) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const normalizeValue = (value: number) => Math.min(100, Math.max(0, value))
const getPercentage = (value: number, fullValue: number) =>
  fullValue > 0 ? (value / fullValue) * 100 : 0

// ==========

const { max, current } = defineProps<{
  max: number
  current: number
  message?: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = computed(() => canvasRef?.value?.getContext('2d'))

const chartAnimationId = ref<number | null>(null)
const chartTransitionId = ref<number | null>(null)

const value = ref<number>(normalizeValue(getPercentage(current, max)))
const phase = ref<number>(0)
const frequency = ref<number>(0.06)
const dAmplitude = ref<number>(0)
const dPhaseStep = ref<number>(0)
const dPhase = 1.2

watch(
  () => [max, current],
  () => {
    if (chartTransitionId.value) cancelAnimationFrame(chartTransitionId.value)

    const FRAMES = 30
    const HALF_FRAMES = FRAMES / 2
    const PHASE_STEP_DELTA = 0.1

    const valueDelta = normalizeValue(getPercentage(current, max)) - value.value
    const valueStep = valueDelta / FRAMES
    const valueStart = value.value

    let count = 0
    const animateChanges = () => {
      value.value = normalizeValue(valueStart + valueStep * count)

      // ===== Splash animate =====
      if (count <= HALF_FRAMES) {
        dAmplitude.value = 0.5 * valueDelta * easeInOutExpo(count / HALF_FRAMES)
        dPhaseStep.value = PHASE_STEP_DELTA * easeInOutExpo(count / HALF_FRAMES)
      } else {
        dAmplitude.value = valueDelta * easeInOutExpo((FRAMES - count) / HALF_FRAMES) * 0.5
        dPhaseStep.value = PHASE_STEP_DELTA * easeInOutExpo((FRAMES - count) / HALF_FRAMES)
      }

      if (count <= FRAMES) {
        count++
        chartTransitionId.value = requestAnimationFrame(animateChanges)
      } else {
        value.value = normalizeValue(getPercentage(current, max))
        frequency.value = 0.06
      }
    }
    animateChanges()
  },
)
// ===== Setup gradients  =====
const getMainGradient = (value: number) => createGradient(MAIN_STOP_COLORS, '1', '1', value)
const getSecondaryGradient = (value: number) =>
  createGradient(BACKGROUND_STOP_COLORS, '0.4', '0.4', value)
const getBackgroundGradient = (value: number) =>
  createGradient(MAIN_STOP_COLORS, '0.2', '0.1', value)

// ===== Draw =====
const draw = () => {
  if (!ctx.value || !canvasRef.value) return

  const canvasWidth = canvasRef.value?.width
  const canvasHeight = canvasRef.value?.height

  const chartWidth = (canvasWidth / 100) * value.value
  const amplitude = (value.value < 70 ? 5 : 5 + value.value / 50) + dAmplitude.value
  const phaseStep = 0.03 + (0.03 / 100) * value.value + dPhaseStep.value

  // Clear canvas
  ctx.value.clearRect(0, 0, canvasWidth, canvasHeight)

  // Draw background
  ctx.value.beginPath()
  ctx.value.moveTo(0, 0)
  ctx.value.lineTo(chartWidth, 0)
  ctx.value.lineTo(chartWidth, canvasHeight)
  ctx.value.lineTo(0, canvasHeight)
  ctx.value.closePath()

  ctx.value.fillStyle = getBackgroundGradient(value.value)
  ctx.value.fill()

  // Draw secondary wave
  ctx.value.beginPath()
  ctx.value.moveTo(0, 0)
  ctx.value.lineTo(chartWidth - amplitude, 0)
  ctx.value.lineTo(chartWidth - amplitude, canvasHeight)
  ctx.value.lineTo(0, canvasHeight)
  ctx.value.moveTo(chartWidth - amplitude, 0)
  for (let y = 0; y <= canvasHeight; y++) {
    const x = amplitude * Math.sin(frequency.value * y - phase.value * dPhase)
    ctx.value.lineTo(chartWidth - amplitude + x, y)
  }
  ctx.value.lineTo(chartWidth - amplitude, canvasHeight)
  ctx.value.closePath()

  ctx.value.fillStyle = getSecondaryGradient(value.value)
  ctx.value.fill()

  // Draw main wave
  ctx.value.beginPath()
  ctx.value.moveTo(0, 0)
  ctx.value.lineTo(chartWidth - amplitude, 0)
  ctx.value.lineTo(chartWidth - amplitude, canvasHeight)
  ctx.value.lineTo(0, canvasHeight)
  ctx.value.moveTo(chartWidth - amplitude, 0)
  for (let y = 0; y <= canvasHeight; y++) {
    const x = amplitude * Math.sin(frequency.value * y + phase.value)
    ctx.value.lineTo(chartWidth - amplitude + x, y)
  }
  ctx.value.lineTo(chartWidth - amplitude, canvasHeight)
  ctx.value.closePath()

  ctx.value.fillStyle = getMainGradient(value.value)
  ctx.value.fill()

  // Update phase and draw next frame
  phase.value += phaseStep
  chartAnimationId.value = requestAnimationFrame(draw)
}

onMounted(() => {
  draw()
})
onBeforeUnmount(() => {
  if (chartAnimationId.value) {
    cancelAnimationFrame(chartAnimationId.value)
  }
})
</script>
<template>
  <div class="wave-chart-wrapper">
    <div class="wave-chart-border">
      <canvas class="wave-chart" ref="canvasRef" width="600" height="50" />
    </div>
    <div class="wave-chart-message">
      {{ message }}
    </div>
  </div>
</template>
<style scoped>
.wave-chart-wrapper {
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: start;
}

.wave-chart {
  display: block;
  margin: 0;
  box-sizing: border-box;
  aspect-ratio: 600/50;

  object-fit: cover;

  border-radius: var(--radius-md);
}

.wave-chart-border {
  position: relative;
  padding: var(--spacing-xs);
  box-sizing: border-box;
  width: 100%;

  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.wave-chart-message {
  position: absolute;
  top: 50%;
  left: 50%;

  font-size: var(--font-size-display-xs);
  line-height: var(--line-height-display-xs);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);

  transform: translate(-50%, -50%);
}
</style>
