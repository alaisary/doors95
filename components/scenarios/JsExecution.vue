<template>
  <!-- THE DECISION: a file downloaded from the internet carries a tag, so
       Windows asks before running it. The "Open File - Security Warning"
       dialog, in this workstation's chrome. Nothing is executed beyond it. -->
  <Teleport to="#app-scaler">
    <div v-if="visible" class="sw-backdrop">
      <div class="sw-win" role="alertdialog" aria-labelledby="sw-title" aria-describedby="sw-q">
        <div class="sw-titlebar">
          <span id="sw-title">Open File - Security Warning</span>
          <button class="sw-cap" aria-label="Close" @click="cancel">✕</button>
        </div>

        <div class="sw-body">
          <p id="sw-q" class="sw-q">Do you want to open this file?</p>
          <div class="sw-file">
            <svg width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true" class="flex-shrink-0">
              <path d="M6 2h14l6 6v22H6z" fill="#fff" stroke="#000"/><path d="M20 2v6h6" fill="#c0c0c0" stroke="#000"/>
              <rect x="9" y="13" width="14" height="2" fill="#000181"/><rect x="9" y="17" width="14" height="2" fill="#000181"/><rect x="9" y="21" width="9" height="2" fill="#000181"/>
            </svg>
            <dl class="sw-facts">
              <div><dt>Name:</dt><dd>C:\Users\s.alharthi\Desktop\Contract_Bid_Proposal.js</dd></div>
              <div><dt>Publisher:</dt><dd>Unknown publisher</dd></div>
              <div><dt>Type:</dt><dd>JavaScript File</dd></div>
              <div><dt>From:</dt><dd>C:\Users\s.alharthi\Desktop</dd></div>
            </dl>
          </div>
          <div class="sw-actions">
            <button ref="runBtn" class="sw-btn" @click="run">Open</button>
            <button class="sw-btn" @click="cancel">Cancel</button>
          </div>
        </div>

        <div class="sw-foot">
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" class="flex-shrink-0">
            <path d="M16 3l11 4v8c0 7-4.5 12-11 15C9.5 27 5 22 5 15V7z" fill="#f5a800" />
            <path d="M16 9.500v8" stroke="#1b1b1b" stroke-width="2.6" stroke-linecap="round" /><circle cx="16" cy="21.5" r="1.6" fill="#1b1b1b" />
          </svg>
          <p>While files from the Internet can be useful, this file type can potentially harm your computer. If you do not trust the source, do not open this software.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const session = useSessionStore()
const runBtn = ref<HTMLButtonElement | null>(null)

// asked for (download prompt, double-click or context menu), not yet answered
const visible = computed(() =>
  session.scenarioId === 'zoom-docs' &&
  !!session.flags.zoom_open_prompt &&
  !session.flags.zoom_js_running &&
  !session.flags.compromised &&
  session.phase === 'live'
)

watch(visible, (v) => { if (v) nextTick(() => runBtn.value?.focus()) })

let beat: ReturnType<typeof setTimeout> | null = null

// Open: the dialog closes and, as with a real script host, nothing appears.
// After a beat the outcome shows on the attacker's side.
function run() {
  if (session.flags.zoom_js_running) return
  session.flag('zoom_js_running')
  session.flag('ran_command')
  session.log('DOUBLE_CLICKED_FILE', 'chose Open on the security warning for Contract_Bid_Proposal.js', 'risky')
  session.timelineStep('You chose Open on the security warning', true)
  session.c2Log('[stealer] wscript.exe executed Contract_Bid_Proposal.js, payload running in memory', 'text-rose-400', 'wscript.exe launched by explorer.exe from the Downloads folder', 'Open scripts in Notepad by default; attack-surface rules')
  beat = session.later('zoom-docs', 1600, () => {
    // console=false → stay on the desktop; the stealer panel appears and
    // Skippy offers the debrief
    session.c2Log('[+] 38 passwords and 1,204 cookies harvested, log uploaded to the panel', 'text-rose-400', 'Unusual read access to browser credential stores, then an outbound upload from a script host', 'Endpoint protection that alerts on credential-store access')
    session.compromise('The script ran and started an infostealer', false)
  })
}

function cancel() {
  session.flag('zoom_open_prompt', false)
  session.flag('cancelled_warning')
  session.log('FILE_OPEN_CANCELLED', 'cancelled the security warning', 'safe')
  session.timelineStep('You cancelled at the security warning')
  session.survive()
}

onUnmounted(() => { if (beat) clearTimeout(beat) })
</script>

<style scoped>
.sw-backdrop {
  position: fixed;
  inset: 0;
  z-index: 8800;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}
.sw-win {
  width: 470px;
  max-width: calc(calc(100 * var(--vw)) - 40px);
  margin-top: calc(24 * var(--vh));
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.35);
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  color: #000;
}
.sw-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 4px 3px 8px;
  background: linear-gradient(to bottom, #000181 0%, #3a6ea5 100%);
  color: #fff;
  font-size: 13px;
  font-weight: bold;
}
.sw-cap {
  width: 20px;
  height: 18px;
  font-size: 11px;
  line-height: 1;
  color: #000;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
}
.sw-body { padding: 14px 16px 16px; }
.sw-q { font-size: 14px; color: #000181; margin-bottom: 12px; }
.sw-file { display: flex; gap: 14px; align-items: flex-start; }
.sw-facts { min-width: 0; flex: 1; font-size: 12px; line-height: 20px; }
.sw-facts div { display: grid; grid-template-columns: 78px minmax(0, 1fr); }
.sw-facts dt { color: #404040; }
.sw-facts dd { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sw-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.sw-btn {
  min-width: 88px;
  padding: 3px 12px;
  font-family: inherit;
  font-size: 12.5px;
  color: #000;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
}
.sw-btn:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }
.sw-foot {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 16px 14px;
  font-size: 12px;
  line-height: 17px;
  border-top: 2px solid #808080;
}
</style>
