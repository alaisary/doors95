<template>
  <div
    class="absolute top-0 left-0 w-full h-full bg-transparent flex items-center justify-center pointer-events-none overflow-hidden"
    :style="{ zIndex: windowZIndex }"
    v-show="isOpen"
  >
    <div
      ref="el"
      class="win95-window absolute flex flex-col select-none pointer-events-auto"
      :style="style"
      @pointerdown="$emit('clickInsideWindow', name)"
    >
      <!-- title bar -->
      <div
        ref="dragHandle"
        class="win95-titlebar flex items-center justify-between flex-shrink-0"
        :class="{ inactive: !isFocused }"
        @dblclick="toggleMax"
      >
        <div class="flex items-center gap-2 min-w-0">
          <slot name="windowIcon">
            <div class="win95-titlebar-icon"></div>
          </slot>
          <span class="win95-titlebar-text truncate">{{ name }}</span>
        </div>
        <div class="flex items-center gap-[2px] flex-shrink-0">
          <button class="win95-titlebar-btn" title="Minimize" @click.prevent="minimizeWin">_</button>
          <button class="win95-titlebar-btn" title="Maximize" @click.prevent="toggleMax">{{ isMaximized ? '❐' : '▢' }}</button>
          <button class="win95-titlebar-btn win95-close" title="Close" @click.prevent="emit('close', name)">✕</button>
        </div>
      </div>

      <!-- content -->
      <div class="flex-1 min-h-0 overflow-hidden relative bg-white">
        <slot />
      </div>

      <!-- resize affordances (hidden while maximized) -->
      <template v-if="!isMaximized">
        <div class="rz rz-e" @pointerdown="startResize($event, 'e')"></div>
        <div class="rz rz-s" @pointerdown="startResize($event, 's')"></div>
        <div class="rz rz-se" @pointerdown="startResize($event, 'se')"><span></span></div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDraggable } from '@vueuse/core'

const props = defineProps({
  name: { type: String, required: true },
  lastClickedWindow: { type: String, default: '' },
  currentlyOpenWindows: { type: Array },
  initialX: { type: Number, default: 480 },
  initialY: { type: Number, default: 90 },
  width: { type: Number, default: 940 },
  // window height cap in px (viewport cap still applies)
  initialHeight: { type: Number, default: 660 },
  // how much of the viewport height the window may use
  heightVh: { type: Number, default: 78 },
  // bottom edge of usable area (taskbar) so resize/maximize never covers it
  taskbarInset: { type: Number, default: 44 },
})

const emit = defineEmits(['close', 'clickInsideWindow'])
const el = ref<HTMLElement | null>(null)
const dragHandle = ref<HTMLElement | null>(null)

const windowsStore = useOpenWindowsStore()

const windowZIndex = computed(() => (props.lastClickedWindow === props.name ? 1000 : 0))
const isOpen = computed(() =>
  (props.currentlyOpenWindows as string[] | undefined)?.includes(props.name)
  && !windowsStore.minimizedWindows.includes(props.name)
)
const isFocused = computed(() => props.lastClickedWindow === props.name)
const isMaximized = computed(() => windowsStore.maximizedWindows.includes(props.name))

const { x, y, style: dragStyle } = useDraggable(el, {
  handle: dragHandle,
  initialValue: { x: props.initialX, y: props.initialY },
  onStart: () => {
    if (isMaximized.value) return false // no dragging a maximized window
    emit('clickInsideWindow', props.name)
  },
})

// ---- size (resizable like a real window) ----
const MIN_W = 420
const MIN_H = 260
const w = ref(props.width)
const h = ref(Math.min(vp.h * (props.heightVh / 100), props.initialHeight))
const prevGeometry = ref<{ x: number; y: number; w: number; h: number } | null>(null)

const style = computed(() => [
  dragStyle.value,
  {
    width: `${w.value}px`,
    height: `min(${props.heightVh}vh, ${h.value}px)`,
    ...(isMaximized.value ? { width: `calc(calc(100 * var(--vw)) - 16px)`, height: `calc(calc(100 * var(--vh)) - ${props.taskbarInset + 8}px)` } : {}),
  },
])

// maximize fills the desktop area above the taskbar; remembers the old geometry
watch(isMaximized, (maxi) => {
  if (maxi) {
    prevGeometry.value = { x: x.value, y: y.value, w: w.value, h: h.value }
    x.value = 8
    y.value = 8
  } else if (prevGeometry.value) {
    x.value = prevGeometry.value.x
    y.value = prevGeometry.value.y
    w.value = prevGeometry.value.w
    h.value = prevGeometry.value.h
    prevGeometry.value = null
  }
})

function toggleMax() {
  windowsStore.toggleMaximize(props.name)
  emit('clickInsideWindow', props.name)
}
function minimizeWin() {
  windowsStore.minimizeWindow(props.name)
}

// ---- pointer-based resize (right edge, bottom edge, corner) ----
function startResize(e: PointerEvent, dir: 'e' | 's' | 'se') {
  if (isMaximized.value) return
  e.preventDefault()
  e.stopPropagation()
  emit('clickInsideWindow', props.name)

  const startX = toApp(e.clientX)
  const startY = toApp(e.clientY)
  const startW = w.value
  const startH = h.value
  const maxX = vp.w - 8
  const maxY = vp.h - props.taskbarInset - 4

  const onMove = (ev: PointerEvent) => {
    if (dir === 'e' || dir === 'se') {
      w.value = Math.max(MIN_W, Math.min(startW + toApp(ev.clientX) - startX, maxX - x.value))
    }
    if (dir === 's' || dir === 'se') {
      h.value = Math.max(MIN_H, Math.min(startH + toApp(ev.clientY) - startY, maxY - y.value))
    }
  }
  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

// clamp size on viewport shrink
function clampToViewport() {
  w.value = Math.min(w.value, vp.w - 16)
  h.value = Math.min(h.value, vp.h - props.taskbarInset - 8)
}
onMounted(() => window.addEventListener('resize', clampToViewport))
onUnmounted(() => window.removeEventListener('resize', clampToViewport))
</script>

<style scoped>
.win95-window {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.35);
}

.win95-titlebar {
  height: 26px;
  padding: 0 3px 0 6px;
  background: linear-gradient(to bottom, #000181 0%, #3a6ea5 100%);
  color: #fff;
  cursor: move;
  user-select: none;
}
.win95-titlebar.inactive {
  background: linear-gradient(to bottom, #7a7a7a 0%, #9d9d9d 100%);
  color: #d8d8d8;
}
.win95-titlebar-text {
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 0.5px;
}
.win95-titlebar-icon {
  width: 12px;
  height: 12px;
  background: #c0c0c0;
  border: 1px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
}

.win95-titlebar-btn {
  width: 20px;
  height: 18px;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
  color: #000;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 2px;
}
.win95-titlebar-btn:active {
  border-color: #565656 #fcfcfc #fcfcfc #565656;
}
.win95-close {
  margin-left: 2px;
  color: #000;
}

/* ---- resize handles ---- */
.rz {
  position: absolute;
  z-index: 30;
}
.rz-e {
  top: 6px;
  right: -2px;
  width: 6px;
  height: calc(100% - 12px);
  cursor: ew-resize;
}
.rz-s {
  bottom: -2px;
  left: 6px;
  height: 6px;
  width: calc(100% - 12px);
  cursor: ns-resize;
}
.rz-se {
  right: -2px;
  bottom: -2px;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}
.rz-se span {
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 10px;
  height: 10px;
  background:
    linear-gradient(135deg, transparent 0 50%, #565656 50% 55%, transparent 55% 70%, #565656 70% 75%, transparent 75% 90%, #565656 90% 95%, transparent 95%);
  pointer-events: none;
}
</style>
