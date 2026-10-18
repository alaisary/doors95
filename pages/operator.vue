<template>
  <div class="min-h-screen bg-[#0b1220] text-slate-200 p-10 font-sans">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-3xl font-bold text-white">Operator Console</h1>
        <NuxtLink to="/" class="text-sm text-cyan-400 hover:text-cyan-300">← back to booth</NuxtLink>
      </div>
      <p class="text-sm text-slate-500 mb-10">Booth controls. Not exposed to participants.</p>

      <!-- toggles -->
      <div class="grid grid-cols-2 gap-4 mb-10">
        <button v-for="t in toggles" :key="t.label"
          class="p-4 rounded-xl border text-left transition-colors"
          :class="t.on ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-white/10 bg-white/5'"
          @click="t.flip()"
        >
          <div class="text-sm font-medium">{{ t.label }}</div>
          <div class="text-xs mt-1" :class="t.on ? 'text-cyan-300' : 'text-slate-500'">{{ t.on ? 'ON' : 'OFF' }}</div>
        </button>
      </div>

      <!-- scenario control -->
      <div class="text-xs tracking-widest text-slate-500 mb-3">SCENARIOS</div>
      <div class="space-y-2 mb-10">
        <div v-for="s in reg.list" :key="s.id" class="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <span class="text-xs text-slate-600 w-14">{{ s.codename }}</span>
          <span class="flex-1 text-sm text-slate-200">{{ s.title }}</span>
          <button class="px-3 py-1.5 text-xs rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30" @click="start(s.id)">start</button>
          <button class="px-3 py-1.5 text-xs rounded bg-white/10 text-slate-300 hover:bg-white/20" @click="skip(s.id)">skip</button>
        </div>
      </div>

      <!-- session state -->
      <div class="text-xs tracking-widest text-slate-500 mb-3">SESSION LOG ({{ session.events.length }})</div>
      <div class="bg-black/40 rounded-xl p-4 font-mono text-[11px] text-slate-400 max-h-64 overflow-y-auto space-y-0.5">
        <div v-for="e in session.events" :key="e.id">
          <span class="text-slate-600">[{{ e.t.toFixed(1) }}s]</span>
          <span :class="e.verdict === 'risky' ? 'text-rose-400' : e.verdict === 'safe' ? 'text-emerald-400' : ''">
            {{ e.type }}
          </span>
          <span v-if="e.detail" class="text-slate-600"> — {{ e.detail }}</span>
        </div>
        <div v-if="!session.events.length" class="text-slate-700">no events yet</div>
      </div>

      <button class="mt-8 px-5 py-2.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30" @click="fullReset">
        RESET ALL STATE
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const session = useSessionStore()
const reg = useScenarioRegistry()

const { demo, setDemo } = useBooth()
const toggles = computed(() => [
  { label: 'Coach hints', on: session.coachVisible, flip: () => { session.coachVisible = !session.coachVisible } },
  { label: 'Demo mode (presenter-led: no counter, no spoilers)', on: demo.value, flip: () => setDemo(!demo.value) },
])

function start(id: string) { session.startScenario(id) }
function skip(id: string) {
  const idx = session.activeScenarios.indexOf(id)
  if (idx >= 0) session.activeScenarios.splice(idx, 1)
}
function fullReset() { session.$reset(); session.quitToEntry() }
</script>
