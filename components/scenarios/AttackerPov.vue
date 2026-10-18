<template>
  <!-- attacker POV: fullscreen recording of the evilginx operator's screen.
       Opens with a CRT glitch-in, auto-closes with a glitch-out when the
       recording ends (or on demand) -->
  <Teleport to="#app-scaler">
    <div v-if="open" class="pov-overlay" :class="{ 'pov-out': closing }" @click.self="requestClose">
      <div class="pov-frame">
        <div class="pov-hdr">
          <span class="pov-rec"><span class="pov-dot" />REC</span>
          <span class="pov-title">ATTACKER POV — live relay · qabas.ai ↔ login.microsoftonline.com</span>
          <span class="pov-time">{{ elapsed }}</span>
          <button class="pov-unmute" @click="toggleMute">{{ muted ? '🔇 SOUND OFF' : '🔊 SOUND ON' }}</button>          <button class="pov-close" title="Close" @click="requestClose">✕</button>
        </div>

        <div class="pov-screen" :class="{ 'pov-glitching': glitching }">
          <!-- webm first (Firefox without system H.264, and it's 6x smaller);
               mp4 fallback for Safari -->
          <video
            ref="videoEl"
            autoplay
            playsinline
            preload="auto"
            @ended="requestClose"
            @timeupdate="onTime"
          >
            <source src="/videos/attacker-pov.webm" type="video/webm">
            <source src="/videos/attacker-pov.mp4" type="video/mp4">
          </video>
          <div class="pov-scanlines" />
          <div class="pov-roll" />
          <div class="pov-tear" />
          <div class="pov-tear t2" />
          <div class="pov-vignette" />
        </div>

        <div class="pov-ftr">what the attacker sees while the victim types — relayed in real time</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const open = defineModel<boolean>({ default: false })

const videoEl = ref<HTMLVideoElement | null>(null)
const closing = ref(false)
// sound on by default — the ATTACKER POV click is the user gesture that
// unlocks unmuted autoplay; falls back to muted if the browser refuses
const muted = ref(false)
const glitching = ref(false)
const elapsed = ref('00:00')

function fmt(t: number) {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
function onTime() {
  const v = videoEl.value
  if (v) elapsed.value = fmt(v.currentTime)
}

function toggleMute() {
  muted.value = !muted.value
  if (videoEl.value) videoEl.value.muted = muted.value
}

// close = glitch-out animation, then actually unmount
function requestClose() {
  if (closing.value) return
  closing.value = true
  stopGlitch()
  setTimeout(() => {
    open.value = false
    closing.value = false
    videoEl.value?.pause()
  }, 700)
}

// random signal-loss bursts while the recording plays
let glitchTimer: ReturnType<typeof setTimeout> | null = null
function scheduleGlitch() {
  stopGlitch()
  glitchTimer = setTimeout(() => {
    glitching.value = true
    setTimeout(() => (glitching.value = false), 90 + Math.random() * 150)
    if (open.value && !closing.value) scheduleGlitch()
  }, 1800 + Math.random() * 4200)
}
function stopGlitch() {
  if (glitchTimer) clearTimeout(glitchTimer)
  glitchTimer = null
  glitching.value = false
}

watch(open, (v) => {
  if (v) {
    closing.value = false
    nextTick(() => {
      const el = videoEl.value
      if (el) {
        el.currentTime = 0
        el.muted = muted.value
        el.play().catch(() => {
          // unmuted autoplay refused (gesture not honored) — play muted instead
          muted.value = true
          el.muted = true
          el.play().catch(() => {})
        })
      }
      scheduleGlitch()
    })
  } else {
    stopGlitch()
    videoEl.value?.pause()
  }
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value && !closing.value) requestClose()
}
onMounted(() => window.addEventListener('keydown', onKeydown, true))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown, true)
  stopGlitch()
})
</script>

<style scoped>
.pov-overlay {
  position: fixed;
  inset: 0;
  z-index: 9500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 5, 3, 0.88);
  backdrop-filter: blur(3px);
  font-family: Consolas, 'Courier New', monospace;
  animation: pov-fade-in 180ms ease-out both;
}
.pov-overlay.pov-out { animation: pov-fade-out 640ms ease-in 60ms both; }

.pov-frame {
  width: min(calc(94 * var(--vw)), calc(86 * var(--vh) * 16 / 9));
  background: rgba(5, 9, 7, 0.97);
  border: 1px solid rgba(244, 63, 94, 0.45);
  box-shadow: 0 0 0 1px rgba(244, 63, 94, 0.15), 0 0 70px rgba(16, 185, 129, 0.12), 0 26px 80px rgba(0, 0, 0, 0.7);
  animation: pov-glitch-in 650ms both;
}
.pov-out .pov-frame { animation: pov-glitch-out 620ms steps(3, jump-none) both; }

.pov-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(244, 63, 94, 0.3);
  background: rgba(244, 63, 94, 0.07);
}
.pov-rec {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #fb7185;
}
.pov-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f43f5e;
  box-shadow: 0 0 8px #f43f5e;
  animation: pov-blink 1.1s steps(1) infinite;
}
.pov-title { font-size: 14px; font-weight: 700; letter-spacing: 0.08em; color: #a7f3d0; }
.pov-time { margin-left: auto; font-size: 13px; color: rgba(167, 243, 208, 0.7); }
.pov-unmute,
.pov-close {
  background: none;
  border: 1px solid rgba(167, 243, 208, 0.35);
  border-radius: 3px;
  color: #a7f3d0;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  cursor: pointer;
  line-height: 1.5;
}
.pov-unmute:hover { background: rgba(16, 185, 129, 0.18); color: #fff; }
.pov-close:hover { background: #f43f5e; border-color: #f43f5e; color: #fff; }

.pov-screen { position: relative; overflow: hidden; background: #000; }
.pov-screen video { display: block; width: 100%; max-height: calc(80 * var(--vh)); }

/* signal-loss jitter while a glitch burst runs */
.pov-glitching video {
  animation: pov-jitter 130ms steps(2) infinite;
  filter: contrast(1.5) saturate(2.2) hue-rotate(-12deg);
}

.pov-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.22) 0 1px, transparent 1px 3px);
}
.pov-roll {
  position: absolute;
  left: 0;
  right: 0;
  height: 90px;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(16, 185, 129, 0.07), transparent);
  animation: pov-roll 7s linear infinite;
}
.pov-tear {
  position: absolute;
  left: -10%;
  width: 120%;
  height: 8px;
  pointer-events: none;
  opacity: 0;
  background: rgba(16, 185, 129, 0.35);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
}
.pov-tear.t2 { background: rgba(244, 63, 94, 0.3); box-shadow: 0 0 12px rgba(244, 63, 94, 0.5); }
.pov-glitching .pov-tear { opacity: 1; animation: pov-tear 130ms steps(2) infinite; }
.pov-glitching .pov-tear.t2 { animation-delay: 65ms; }
.pov-vignette { position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.75); }

.pov-ftr {
  padding: 6px 12px;
  font-size: 13px;
  letter-spacing: 0.1em;
  color: rgba(148, 163, 184, 0.75);
  border-top: 1px solid rgba(244, 63, 94, 0.2);
}

@keyframes pov-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes pov-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes pov-blink { 50% { opacity: 0.15; } }

/* the picture slams in through torn scanline slices */
@keyframes pov-glitch-in {
  0%   { opacity: 0; transform: translateY(20px) scaleX(1.06); clip-path: inset(45% 0 45% 0); filter: contrast(2) saturate(0); }
  10%  { opacity: 1; transform: translateY(-8px) scaleX(0.98); clip-path: inset(8% 0 62% 0); filter: contrast(1.6) saturate(2); }
  22%  { transform: translateX(-12px) scaleY(1.02); clip-path: inset(62% 0 6% 0); }
  34%  { transform: translateX(14px) skewX(3deg); clip-path: inset(18% 0 22% 0); }
  48%  { transform: translateX(-5px); clip-path: inset(0 30% 0 20%); }
  62%  { transform: translate(4px, -3px); clip-path: inset(0 0 0 0); }
  78%  { transform: translate(-2px, 1px); }
  100% { opacity: 1; transform: none; clip-path: inset(0 0 0 0); filter: none; }
}

/* the picture tears itself apart and the signal dies */
@keyframes pov-glitch-out {
  0%   { opacity: 1; transform: none; filter: none; clip-path: inset(0 0 0 0); }
  18%  { transform: translateX(-16px) skewX(9deg); filter: contrast(2.4) saturate(3) hue-rotate(90deg); clip-path: inset(12% 0 34% 0); }
  40%  { transform: translateX(18px) skewX(-11deg) scaleY(1.05); filter: contrast(3) brightness(1.8); clip-path: inset(52% 0 8% 0); }
  64%  { transform: translateX(-9px); clip-path: inset(28% 0 46% 0); opacity: 1; }
  82%  { transform: translateX(6px); filter: brightness(0.3); clip-path: inset(44% 0 44% 0); opacity: 0.7; }
  100% { opacity: 0; transform: scale(1.05); clip-path: inset(50% 0 50% 0); filter: brightness(0); }
}

@keyframes pov-jitter {
  0%   { transform: translate(-6px, 2px) scaleY(1.01); }
  25%  { transform: translate(5px, -3px) skewX(3deg); }
  50%  { transform: translate(-3px, 1px); }
  75%  { transform: translate(7px, 2px) skewX(-4deg); }
  100% { transform: translate(-5px, -2px); }
}
@keyframes pov-tear {
  0%   { top: 22%; transform: translateX(-30px); }
  50%  { top: 58%; transform: translateX(42px); }
  100% { top: 36%; transform: translateX(-22px); }
}
@keyframes pov-roll { from { top: -90px; } to { top: 100%; } }
</style>
