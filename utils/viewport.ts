import { reactive } from 'vue'

// The whole desktop is laid out for a 1920x1080 screen and scaled up to fit bigger ones.
// Inside the scaler, "viewport" means the scaler's own size (vp.w x vp.h), not the real window.
export const DESIGN_W = 1920
export const DESIGN_H = 1080

export const vp = reactive({
  scale: 1,
  w: typeof window !== 'undefined' ? window.innerWidth : DESIGN_W,
  h: typeof window !== 'undefined' ? window.innerHeight : DESIGN_H,
})

export function updateViewport() {
  if (typeof window === 'undefined') return
  const iw = window.innerWidth
  const ih = window.innerHeight
  const scale = Math.max(1, Math.min(iw / DESIGN_W, ih / DESIGN_H))
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
