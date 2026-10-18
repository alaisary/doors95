<template>
  <!-- the dummy RCE payload's UI: a WinForms-style "Cloudflare Security Challenge"
       dialog, ported 1:1 from the reference cloudflare-animation script -->
  <div v-if="!finished" class="fixed inset-0 z-[8000] pointer-events-none">
    <!-- WinForms dialog: anchored at origin so drag == cursor (no offset jumps) -->
    <div ref="el" class="cff-form pointer-events-auto" :style="dragStyle">
      <!-- FixedDialog-style titlebar: no minimize/maximize, only close -->
      <div ref="dragHandle" class="cff-titlebar">
        <span>Cloudflare Security Challenge</span>
        <button class="cff-close" title="Close" @click="finish">✕</button>
      </div>

      <div class="cff-card">
        <!-- dark header: ☁ Cloudflare (orange) + Security Challenge -->
        <div class="cff-hdr">
          <span class="cff-cloud">☁</span>
          <span class="cff-cfname">Cloudflare</span>
          <span class="cff-hdrsub">Security Challenge</span>
        </div>

        <div class="cff-status" :class="{ ok: completed }">
          {{ completed ? 'Verification successful' : 'Verifying your connection...' }}
        </div>
        <div class="cff-node">Node {{ nodeId }}</div>
        <div class="cff-sep"></div>

        <!-- the six fake checks -->
        <div
          v-for="(r, i) in rows"
          :key="r.name"
          class="cff-row"
          :class="{ alt: i % 2 === 1, show: r.visible }"
        >
          <span class="cff-row-name">{{ r.name }}</span>
          <span class="cff-row-status" :class="{ pass: r.passed, spin: r.running }">{{ r.status }}</span>
          <span class="cff-row-result" :class="{ pass: r.passed }">{{ r.result }}</span>
        </div>

        <!-- progress track -->
        <div class="cff-track">
          <div class="cff-fill" :class="{ ok: completed }" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="cff-phase">{{ phaseLabel }}</div>

        <!-- success panel -->
        <div v-if="completed" class="cff-result">✔&nbsp; Verification complete</div>

        <div class="cff-foot">
          <span v-if="completed" class="cff-ray">ray {{ rayId }}</span>
          <button class="cff-btn" :class="{ ok: completed }" :disabled="!completed" @click="finish">
            {{ completed ? 'OK' : 'Verify' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDraggable } from '@vueuse/core'

const session = useSessionStore()

const el = ref<HTMLElement | null>(null)
const dragHandle = ref<HTMLElement | null>(null)
const { style: dragStyle } = useDraggable(el, {
  handle: dragHandle,
  initialValue: {
    x: Math.max(30, Math.round((vp.w) / 2 - 190)),
    y: Math.max(30, Math.round((vp.h) * 0.16)),
  },
})

const nodeId = `CDN-${100 + Math.floor(Math.random() * 900)}-${10 + Math.floor(Math.random() * 90)}`
const rayId = (() => {
  const hex = Array.from({ length: 16 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`
})()

type Row = { name: string; act: string; visible: boolean; running: boolean; passed: boolean; status: string; result: string }
const rows = ref<Row[]>(
  [
    ['TLS Handshake', 'connect'],
    ['Edge Routing', 'resolve'],
    ['Browser Integrity', 'analyze'],
    ['Bot Detection', 'evaluate'],
    ['Request Signature', 'verify'],
    ['Token Exchange', 'sign'],
  ].map(([name, act]) => ({ name, act, visible: false, running: false, passed: false, status: '', result: '' }) as Row)
)

const progress = ref(0)
const phaseLabel = ref('')
const completed = ref(false)
const finished = ref(false)

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
let disposed = false
let autoTimer: ReturnType<typeof setTimeout> | null = null

// phase labels straight from the reference script
function labelFor(p: number): string {
  if (p < 55) return 'connecting'
  if (p < 68) return 'handshake'
  if (p < 82) return 'verifying'
  if (p < 93) return 'signing'
  if (p < 100) return 'finalizing'
  return 'done'
}

async function runAnimation() {
  const spin = ['/', '—', '\\', '|']
  await wait(600)
  if (disposed) return

  for (let ci = 0; ci < rows.value.length; ci++) {
    const r = rows.value[ci]
    r.visible = true
    r.status = '···'
    r.result = ''
    await wait(140)
    if (disposed) return

    r.running = true
    for (let s = 0; s < 6; s++) {
      r.status = `${spin[s % 4]}  ${r.act}`
      r.result = '---'
      await wait(55)
      if (disposed) return
    }
    r.running = false
    r.passed = true
    r.status = 'passed'
    r.result = `${96 + Math.floor(Math.random() * 5)}/100`
    progress.value = Math.round(((ci + 1) / rows.value.length) * 46)
    phaseLabel.value = 'analyzing...'
    await wait(40)
    if (disposed) return
  }

  // 46 → 100 with the C2 story happening "underneath"
  for (let p = 46; p <= 100; p++) {
    const label = labelFor(p)
    if (label !== phaseLabel.value) {
      phaseLabel.value = label
      c2Phase(label)
    }
    progress.value = p
    await wait(25)
    if (disposed) return
  }
  await wait(300)
  if (disposed) return

  completed.value = true
  phaseLabel.value = ''
  session.c2Log('form: "Verification complete" shown to user', 'text-slate-300')

  // booth pacing: continue automatically if the user just stares at the green box
  autoTimer = setTimeout(() => finish(), 6500)
}

// sync the C2 side panel with what the form is pretending to do
function c2Phase(label: string) {
  switch (label) {
    case 'connecting':
      session.c2SetState('connecting')
      session.c2Log('inbound TLS 198.51.100.77:443 ← WG-LT-0441 · accepted', 'text-emerald-300', 'The workstation connects out to a rare IP on 443 with no browser behind it', 'Egress filtering and alerts on rare destinations')
      break
    case 'handshake':
      session.c2Log('key exchange ok · channel encrypted (TLS 1.3)', 'text-emerald-300')
      break
    case 'verifying':
      session.c2Log('user is watching the fake form — implant installing…', 'text-amber-300')
      break
    case 'signing':
      session.c2Log('session token issued · persistence: "OneDriveSyncTelemetry"', 'text-rose-400', 'New Run key or scheduled task named like a sync tool, created by a PowerShell child process', 'Application control (AppLocker or WDAC)')
      break
    case 'finalizing':
      session.c2Log('stage-2 beacon armed', 'text-rose-400')
      break
    case 'done':
      session.c2SetState('connected')
      session.c2Log('C2 SESSION ESTABLISHED — attacker has remote control', 'text-rose-400')
      break
  }
}

function finish() {
  if (finished.value) return
  finished.value = true
  if (autoTimer) clearTimeout(autoTimer)
  session.c2Log('form closed — user believes the connection was verified', 'text-slate-300')
  session.timelineStep('Attacker foothold established on workstation')
  // the C2 panel already showed the attacker's side — no console takeover;
  // the desktop stays and Skippy offers the debrief
  session.compromise('ClickFix payload executed — user ran the attacker\'s command', false)
}

onMounted(() => runAnimation())
onUnmounted(() => {
  disposed = true
  if (autoTimer) clearTimeout(autoTimer)
})
</script>

<style scoped>
.cff-form {
  position: absolute;
  left: 0;
  top: 0;
  width: 380px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.4);
}
.cff-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 4px 3px 8px;
  background: linear-gradient(to bottom, #000181 0%, #3a6ea5 100%);
  color: #fff;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 13px;
  font-weight: bold;
  cursor: move;
  user-select: none;
}
.cff-close {
  width: 20px;
  height: 18px;
  font-size: 11px;
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

.cff-card {
  margin: 8px;
  background: #fff;
  border: 1px solid #dadce0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* header */
.cff-hdr {
  height: 54px;
  background: #1a1e2e;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 6px;
}
.cff-cloud { font-size: 22px; color: #fff; line-height: 1; }
.cff-cfname {
  color: #f6821f;
  font-weight: 600;
  font-size: 15px;
  margin-left: 4px;
}
.cff-hdrsub { color: #8c909e; font-size: 12.5px; margin-left: 2px; }

.cff-status {
  padding: 14px 18px 2px;
  font-size: 14px;
  color: #1d1f20;
}
.cff-status.ok { color: #166534; font-weight: 600; }
.cff-node {
  padding: 2px 18px 0;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 10px;
  color: #717174;
}
.cff-sep {
  height: 1px;
  background: #dadce0;
  margin: 10px 18px 0;
}

/* check rows */
.cff-row {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 18px;
  font-size: 12px;
  visibility: hidden;
}
.cff-row.show { visibility: visible; }
.cff-row.alt { background: #fafafa; }
.cff-row-name { flex: 1; color: #36393a; }
.cff-row-status {
  width: 90px;
  font-family: Consolas, 'Courier New', monospace;
  color: #717174;
}
.cff-row-status.spin { color: #f6821f; }
.cff-row-status.pass { color: #22c55e; }
.cff-row-result {
  width: 56px;
  text-align: right;
  font-family: Consolas, 'Courier New', monospace;
  color: #717174;
}
.cff-row-result.pass { color: #22c55e; }

/* progress */
.cff-track {
  height: 4px;
  background: #e6e8ec;
  margin: 8px 18px 0;
}
.cff-fill {
  height: 100%;
  background: #f6821f;
  transition: width 0.1s linear;
}
.cff-fill.ok { background: #22c55e; }
.cff-phase {
  padding: 4px 18px 0;
  font-size: 10px;
  color: #717174;
  min-height: 18px;
}

/* success panel */
.cff-result {
  margin: 8px 18px 0;
  padding: 8px 0;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
}

.cff-foot {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 10px 18px 12px;
  gap: 10px;
  min-height: 44px;
}
.cff-ray {
  margin-right: auto;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 9px;
  color: #aaacb2;
}
.cff-btn {
  padding: 5px 22px;
  font-size: 12px;
  color: #717174;
  background: #ebeef0;
  border: 1px solid #c8cace;
  cursor: default;
}
.cff-btn.ok {
  background: #f6821f;
  color: #fff;
  border-color: #f6821f;
  cursor: pointer;
  font-weight: 600;
}
.cff-btn.ok:hover { background: #ff9036; }
</style>
