import { reactive } from 'vue'

// The whole desktop is laid out for a 1920x1080 screen and scaled up to fit bigger ones.
// Inside the scaler, "viewport" means the scaler's own size (vp.w x vp.h), not the real window.
export const DESIGN_W = 1920
export const DESIGN_H = 1080

// Touch devices (phones/tablets) are smaller than the smallest layout the desktop supports,
// so they shrink the desktop to fit this floor instead of squeezing the layout.
const MIN_W = 1280
const MIN_H = 720

export const vp = reactive({
  scale: 1,
  w: typeof window !== 'undefined' ? window.innerWidth : DESIGN_W,
  h: typeof window !== 'undefined' ? window.innerHeight : DESIGN_H,
  // touch device held upright — the desktop can't fit, so we ask for landscape
  portrait: false,
  // phone/tablet browser (coarse pointer) — gets the "best on desktop" notice
  touch: false,
})

export function updateViewport() {
  if (typeof window === 'undefined') return
  const iw = window.innerWidth
  const ih = window.innerHeight
  const touch = window.matchMedia('(pointer: coarse)').matches
  vp.touch = touch
  vp.portrait = touch && ih > iw
  let scale = Math.max(1, Math.min(iw / DESIGN_W, ih / DESIGN_H))
  if (touch && (iw < MIN_W || ih < MIN_H)) scale = Math.min(iw / MIN_W, ih / MIN_H)
  vp.scale = scale
  vp.w = iw / scale
  vp.h = ih / scale
  const s = document.documentElement.style
  s.setProperty('--app-w', `${vp.w}px`)
  s.setProperty('--app-h', `${vp.h}px`)
  s.setProperty('--vw', `${vp.w / 100}px`)
  s.setProperty('--vh', `${vp.h / 100}px`)
}

// pointer coordinates (real pixels) -> scaled desktop coordinates
export const toApp = (n: number) => n / vp.scale
