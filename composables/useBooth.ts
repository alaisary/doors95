// Booth-level settings that must outlive a session reset and reach the booth tab
// even when the operator console is open in another tab: kept in localStorage.
const KEY = 'lure95.demo'
const demo = ref(false)
let wired = false

function read() {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}

export function useBooth() {
  if (!wired && typeof window !== 'undefined') {
    wired = true
    demo.value = read()
    window.addEventListener('storage', (e) => { if (e.key === KEY) demo.value = read() })
  }
  function setDemo(on: boolean) {
    demo.value = on
    try { localStorage.setItem(KEY, on ? '1' : '0') } catch { /* private window: stays per-tab */ }
  }
  return { demo, setDemo }
}
