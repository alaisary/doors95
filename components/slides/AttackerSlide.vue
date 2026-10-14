<template>
  <!-- Slide 1 of 2 after a compromise: what the attacker sees. Opened from Skippy's button, never automatic.
       NEXT goes to the debrief (slide 2). -->
  <div v-if="show" class="sl-root">
    <SlidesBlinds />
    <div :key="run" class="sl-stage">
      <component :is="scene" />
      <div class="sl-taskbar">
        <span class="sl-start"><b>Start</b></span>
        <span class="sl-item">Attacker's screen: {{ name }}</span>
        <span class="sl-gap" />
        <button class="sl-btn" @click="run++">&#10226; REPLAY</button>
        <button class="sl-btn" @click="session.scenarioDone()">CLOSE</button>
        <button class="sl-btn sl-next" @click="session.showSlide('debrief')">NEXT: WHAT JUST HAPPENED &#9654;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AiTM from './scenes/AiTM.vue'
import DeviceCode from './scenes/DeviceCode.vue'
import Ejada from './scenes/Ejada.vue'
import ClickFix from './scenes/ClickFix.vue'
import ZoomDocs from './scenes/ZoomDocs.vue'
import Ironcastle from './scenes/Ironcastle.vue'
import { attackerBanners } from '~/utils/attackerBanners'
import { hasAttackerSlide } from '~/utils/attackerSlides'

const session = useSessionStore()
const run = ref(0)

const SCENES: Record<string, any> = {
  'evilginx-bitb': AiTM,
  'device-code': DeviceCode,
  ejada: Ejada,
  clickfix: ClickFix,
  'zoom-docs': ZoomDocs,
  ironcastle: Ironcastle,
}

const show = computed(() =>
  session.phase === 'debrief' && session.slide === 'attacker' && hasAttackerSlide(session.scenarioId))
const scene = computed(() => SCENES[session.scenarioId])
const name = computed(() => attackerBanners[session.scenarioId]?.name ?? '')
watch(show, (v) => { if (v) run.value++ })

// preview a slide without playing the scenario: open the app with ?slide=<scenario id>
onMounted(() => {
  const id = new URLSearchParams(location.search).get('slide')
  if (id && hasAttackerSlide(id)) {
    session.scenarioId = id
    session.phase = 'debrief'
    session.slide = 'attacker'
  }
})
</script>

<style>
/* the Windows 95 look for the attacker slide; sl- prefix keeps it clear of the rest of the app */
.sl-root { position: fixed; inset: 0; z-index: 9600; background: rgba(0, 48, 48, 0.96); display: flex; align-items: center; justify-content: center; font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif; }
.sl-stage { position: relative; container-type: inline-size; width: min(calc(100 * var(--vw)), calc(100 * var(--vh) * 16 / 9)); aspect-ratio: 16 / 9; background: #008080; overflow: hidden; color: #000; font-size: 1.15cqw; }
.sl-stage::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, #0000000a 0 1px, transparent 1px 3px); }
.sl-scene { position: absolute; inset: 0; }
.sl-w { position: absolute; background: #c0c0c0; border: 0.25cqw solid; border-color: #fff #565656 #565656 #fff; box-shadow: 0.35cqw 0.35cqw 0 #0006; display: flex; flex-direction: column; min-height: 0; }
.sl-tb { flex: none; display: flex; justify-content: space-between; align-items: center; padding: 0.3cqw 0.6cqw; background: linear-gradient(90deg, #000181, #3a6ea5); color: #fff; font-weight: bold; font-size: 1.1cqw; }
.sl-tb.atk { background: linear-gradient(90deg, #5a0000, #b03030); }
.sl-tb.real { background: linear-gradient(90deg, #004d00, #2f8f2f); }
.sl-tb i { display: inline-block; width: 1.1cqw; height: 1cqw; background: #c0c0c0; border: 0.15cqw solid; border-color: #fff #565656 #565656 #fff; margin-left: 0.25cqw; }
.sl-bd { flex: 1; min-height: 0; padding: 0.7cqw 0.8cqw; position: relative; overflow: hidden; }
.sl-sunk { border: 0.2cqw solid; border-color: #565656 #fff #fff #565656; background: #fff; padding: 0.4cqw 0.6cqw; }
.sl-con { border: 0.2cqw solid; border-color: #565656 #fff #fff #565656; background: #000; color: #cfe; padding: 0.5cqw 0.7cqw; font-family: 'Courier New', monospace; font-size: 0.9cqw; }
.sl-rb { border: 0.2cqw solid; border-color: #fff #565656 #565656 #fff; background: #c0c0c0; padding: 0.4cqw 0.7cqw; }
.sl-tip { position: absolute; background: #ffffe1; border: 0.12cqw solid #000; padding: 0.5cqw 0.8cqw; font-size: 0.9cqw; line-height: 1.6; box-shadow: 0.25cqw 0.25cqw 0 #0005; }
.sl-seen b { color: #a05a00; letter-spacing: 0.06em; }
.sl-stop b { color: #0a6b0a; letter-spacing: 0.06em; }
.sl-stage .dim { color: #555; } .sl-stage .red { color: #a00000; } .sl-stage .grn { color: #0a6b0a; } .sl-stage .ctr { text-align: center; }
.sl-ban { font: bold 2.6cqw 'Courier New', monospace; letter-spacing: 0.16em; color: #ffb020; line-height: 1; }
.sl-ban small { display: block; font: 0.85cqw 'Windows 95', Arial; letter-spacing: 0; color: #9fb; margin-top: 0.3cqw; }
.sl-kpi { display: flex; gap: 0.6cqw; }
.sl-kpi div { flex: 1; text-align: center; font-size: 0.85cqw; }
.sl-kpi b { display: block; font: bold 2cqw 'Courier New'; color: #fff; }
.sl-arr { position: absolute; font-size: 0.95cqw; color: #000; text-align: center; }
.sl-arr i { display: block; font-style: normal; font-size: 1.7cqw; line-height: 0.8; }
.sl-tree { font-size: 1cqw; line-height: 1.9; }
.sl-tree .sl-t { white-space: nowrap; }
.sl-tree .sl-l1 { margin-left: 2cqw; }
.sl-tree .sl-l2 { margin-left: 4cqw; }
.sl-lv { width: 100%; border-collapse: collapse; font-size: 0.98cqw; color: #000; }
.sl-lv th { background: #c0c0c0; border: 0.12cqw solid; border-color: #fff #565656 #565656 #fff; text-align: left; padding: 0.2cqw 0.5cqw; font-weight: normal; color: #000; }
.sl-lv td { padding: 0.22cqw 0.5cqw; border-bottom: 0.08cqw solid #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #000; }
.sl-lv tr.sel td { background: #000181; color: #fff; }
/* things appear one after another once the blinds have opened */
.sl-rv { opacity: 0; animation: sl-rv 0.45s both; animation-delay: calc(var(--d, 0s) + 0.6s); }
@keyframes sl-rv { from { opacity: 0; transform: translateY(0.8cqw); } to { opacity: 1; transform: none; } }
.sl-taskbar { position: absolute; left: 0; right: 0; bottom: 0; height: 3.6cqw; background: #c0c0c0; border-top: 0.2cqw solid #fff; display: flex; align-items: center; gap: 0.8cqw; padding: 0 0.6cqw; z-index: 5; font-size: 1.05cqw; }
.sl-taskbar > span, .sl-btn { border: 0.18cqw solid; border-color: #fff #565656 #565656 #fff; padding: 0.3cqw 1cqw; background: #c0c0c0; font: inherit; color: #000; }
.sl-item { border-color: #565656 #fff #fff #565656 !important; background: #d4d0c8 !important; font-weight: bold; }
.sl-gap { flex: 1; border: none !important; background: none !important; }
.sl-btn { cursor: pointer; padding: 0.45cqw 1.2cqw; }
.sl-btn:active { border-color: #565656 #fff #fff #565656; }
.sl-next { font-weight: bold; background: #d4d0c8; animation: sl-pulse 1.6s ease-in-out infinite; animation-delay: 5s; }
@keyframes sl-pulse { 50% { filter: brightness(1.12); } }
@media (prefers-reduced-motion: reduce) { .sl-rv { animation: none; opacity: 1; } .sl-next { animation: none; } }
</style>
