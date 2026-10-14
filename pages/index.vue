<template>
  <div class="h-[var(--app-h)] overflow-hidden">
    <!-- one continuous desktop — every scenario email lives in the mailbox -->
    <!-- keyed on the run: a new visitor gets a desktop with no tabs, mail state or timers left over -->
    <RangeDesktop v-if="['live', 'consequence', 'debrief'].includes(session.phase)" :key="session.runId" />
    <BoothEntryScreen v-if="session.phase === 'entry'" />

    <!-- walked away? -->
    <div v-if="prompting" class="fixed inset-0 z-[12000] flex items-center justify-center text-center p-8" style="background: rgba(0,60,60,0.92); font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif">
      <div>
        <h2 class="text-white" style="font-size: 64px">Still there?</h2>
        <p class="mt-4 text-white/90" style="font-size: 20px">Move the mouse to keep going. This desk clears itself in {{ secondsLeft }} seconds.</p>
      </div>
    </div>

    <!-- the doors95 boot animation (BIOS → Win95 splash) on session start -->
    <ClientOnly>
      <DesktopLoadingScreen v-if="session.bootPending" :skip-bios="session.mode === 'full'" @booted="session.bootPending = false" />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
const session = useSessionStore()
const { prompting, secondsLeft } = useIdleReset()
useHead({ title: 'Honey95 — Social Engineering Range' })
// operator reset (not shown to visitors): Ctrl+Alt+R clears the desk
function operatorReset(e: KeyboardEvent) {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
    e.preventDefault()
    session.quitToEntry()
  }
}
onMounted(() => {
  session.startAuthy()
  window.addEventListener('keydown', operatorReset)
})
onUnmounted(() => window.removeEventListener('keydown', operatorReset))
</script>
