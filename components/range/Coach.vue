<template>
  <div v-if="session.phase === 'live'" class="fixed z-[9000] pointer-events-none" style="right: 12px; bottom: 52px">
    <div class="pointer-events-auto flex items-end gap-0">
      <!-- clippy-style speech bubble (reuses the original skippy bubble look) -->
      <div v-if="session.coachText" class="skippy-bubble">
        <div class="skippy-bubble-text">
          <VueTypewriterEffect
            :strings="[session.coachText]"
            :autoStart="true"
            :loop="false"
            :delay="0.01"
            :deleteSpeed="0"
            :pauseFor="999999999999"
            :key="session.coachText"
            cursor=" "
            class="text-gray-800 whitespace-pre-line"
          />
          <!-- an outcome happened: Skippy offers the debrief instead of forcing
               it (a clickfix infection must first be scanned + disinfected) -->
          <button v-if="session.debriefAvailable" class="skippy-outcome-btn" @click="session.goToDebrief()">
            WHAT JUST HAPPENED?
          </button>

          <!-- the domain-confusion scenario: Skippy can explain the address -->
          <button
            v-if="session.phase === 'live' && session.scenarioId === 'ejada' && !session.outcomeReady"
            class="skippy-explain-btn"
            @click="emitter.emit('explainUrl')"
          >
            EXPLAIN THE ADDRESS
          </button>
        </div>
      </div>

      <!-- the skippy character (original doors95 texture) -->
      <button class="relative flex-shrink-0 hover:scale-105 active:scale-95 transition-transform" title="Skippy" @click="cycle">
        <img src="/textures/skippy.png" alt="Skippy" class="w-[140px] h-[140px] select-none" draggable="false">
        <span v-if="nudgeReady" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border border-black rounded-full animate-ping"></span>
        <span v-if="session.outcomeReady" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border border-black rounded-full animate-ping"></span>
        <span v-if="session.compromised && session.scenarioId === 'clickfix' && !session.flags.disinfected" class="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 border border-black rounded-full animate-ping"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import VueTypewriterEffect from 'vue-typewriter-effect'
import emitter from '~/components/misc/eventHandler'

const session = useSessionStore()
const nudgeReady = ref(false)

// passive nudge at a timed milestone, scenario-independent urgency.
// session.elapsed is not reactive (Date.now() inside a computed freezes),
// so poll it on an interval instead of watching.
let nudged = false
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (!nudged && session.elapsedNow() > 45 && !session.compromised && session.phase === 'live') {
      nudged = true
      nudgeReady.value = true
    }
    if (session.phase !== 'live' && nudged && !nudgeReady.value) nudged = false
  }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

function cycle() {
  nudgeReady.value = false
  session.useHint('nudge')
}
</script>

<style scoped>
/* clippy speech bubble — same look as the original doors95 skippy bubble */
.skippy-bubble {
  position: relative;
  display: inline-block;
  background: #ffffcc;
  border: 1px solid #000;
  padding: 1rem;
  border-radius: 8px;
  min-width: 320px;
  max-width: 430px;
  word-wrap: break-word;
  font-size: 0.95rem;
  margin-bottom: 26px;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.25);
}
.skippy-bubble::after {
  content: '';
  position: absolute;
  right: -10px;
  bottom: 26px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-left-color: #ffffcc;
  border-right: none;
  z-index: 1;
}
.skippy-bubble::before {
  content: '';
  position: absolute;
  right: -11px;
  bottom: 25px;
  width: 0;
  height: 0;
  border: 11px solid transparent;
  border-left-color: black;
  border-right: none;
  z-index: 0;
}
.skippy-bubble-text :deep(.okay-button) { display: none; }

/* the domain-explain offer — same win95 style */
.skippy-explain-btn {
  display: block;
  margin-top: 10px;
  padding: 6px 14px;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #000;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
}
.skippy-explain-btn:hover { background: #d4d4d4; }
.skippy-explain-btn:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }

/* the debrief offer — win95 style */
.skippy-outcome-btn {
  display: block;
  margin-top: 10px;
  padding: 6px 14px;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #000;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
  animation: skippy-pulse 1.6s ease infinite;
}
.skippy-outcome-btn:hover { background: #d4d4d4; }
.skippy-outcome-btn:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }
@keyframes skippy-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.55); }
  50% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
}
</style>
