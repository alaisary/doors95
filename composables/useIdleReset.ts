// A visitor who walks away must not leave their session on the screen.
// After IDLE_MS without input a prompt appears; if it is not answered the
// station returns to the attract loop.
const IDLE_MS = 75_000
// reading a debrief is not walking away
const IDLE_READING_MS = 150_000
const GRACE_S = 15

export function useIdleReset() {
  const session = useSessionStore()
  const prompting = ref(false)
  const secondsLeft = ref(GRACE_S)
  let last = Date.now()
  let timer: ReturnType<typeof setInterval> | null = null

  function touch() {
    last = Date.now()
    if (prompting.value) prompting.value = false
  }

  function tick() {
    // the attract loop and the report (which has its own countdown) never idle out
    if (session.phase === 'entry') { last = Date.now(); return }
    const idle = Date.now() - last
    const limit = session.phase === 'debrief' ? IDLE_READING_MS : IDLE_MS
    if (!prompting.value && idle > limit) {
      prompting.value = true
      secondsLeft.value = GRACE_S
    } else if (prompting.value) {
      secondsLeft.value = Math.max(0, GRACE_S - Math.floor((idle - limit) / 1000))
      if (secondsLeft.value === 0) {
        prompting.value = false
        last = Date.now()
        session.quitToEntry()
      }
    }
  }

  const EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel'] as const
  onMounted(() => {
    EVENTS.forEach((e) => window.addEventListener(e, touch, { passive: true, capture: true }))
    timer = setInterval(tick, 1000)
  })
  onUnmounted(() => {
    EVENTS.forEach((e) => window.removeEventListener(e, touch, { capture: true } as EventListenerOptions))
    if (timer) clearInterval(timer)
  })

  return { prompting, secondsLeft }
}
