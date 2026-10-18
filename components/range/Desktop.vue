<template>
  <!-- doors95-style light desktop: original wallpaper + win95 windows -->
  <div
    class="relative w-[var(--app-w)] h-[var(--app-h)] overflow-hidden"
    style="background: #008080"
  >
    <!-- company plate -->
    <div class="absolute bottom-16 right-4 text-right pointer-events-none select-none">
      <div class="text-2xl font-semibold text-white/70 tracking-tight" style="text-shadow: 1px 1px 0 rgba(0,0,0,.6)">WADI GATE LOGISTICS</div>
      <div class="text-[11px] tracking-[.35em] text-white/50 mt-1" style="text-shadow: 1px 1px 0 rgba(0,0,0,.6)">WORKSTATION WG-LT-0441</div>
    </div>

    <!-- the "so I don't forget" sticky note (right side, draggable) -->
    <RangeStickyNote />

    <!-- windows -->
    <DesktopWindow name="Mail" :initialX="260" :initialY="36" :width="mailWidth" :initialHeight="900" :heightVh="88"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsMail />
    </DesktopWindow>

    <DesktopWindow name="Browser" :initialX="270" :initialY="55" :width="1180" :initialHeight="900" :heightVh="88"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsBrowser />
    </DesktopWindow>

    <DesktopWindow v-if="waOpen" name="WhatsApp" :initialX="280" :initialY="70" :width="960" :initialHeight="720" :heightVh="82"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsWhatsApp />
    </DesktopWindow>

    <DesktopWindow v-if="terminalOpen" name="Terminal" :initialX="620" :initialY="260" :width="620" :initialHeight="380" :heightVh="40"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsTerminal />
    </DesktopWindow>

    <DesktopWindow v-if="notepadOpen" name="Notepad" :initialX="420" :initialY="180" :width="560"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsNotepad />
    </DesktopWindow>

    <DesktopWindow v-if="authyOpen" name="Authenticator" :initialX="900" :initialY="140" :width="400"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsAuthenticator />
    </DesktopWindow>

    <!-- reused doors95 apps -->
    <DesktopWindow v-if="dinoOpen" name="Dino Game" :initialX="500" :initialY="120" :width="620"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsDinoGame />
    </DesktopWindow>

    <DesktopWindow v-if="scamOpen" name="Scamcyclopedia" :initialX="260" :initialY="50" :width="mailWidth" :initialHeight="860" :heightVh="86"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsScamcyclopedia />
    </DesktopWindow>

    <DesktopWindow v-if="avOpen" name="Antivirus" :initialX="480" :initialY="150" :width="600"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsAntivirus />
    </DesktopWindow>

    <DesktopWindow v-if="creditsOpen" name="Credits" :initialX="560" :initialY="200" :width="420"
      :lastClickedWindow="currentlyOpenWindows.lastClickedWindow"
      :currentlyOpenWindows="currentlyOpenWindows.openWindows"
      @clickInsideWindow="setLastClickedWindow" @close="closeWindow">
      <AppsCredits />
    </DesktopWindow>

    <RangeRunDialog v-model:visible="runVisible" @exec="onExec" />

    <!-- the fake verification window of the ClickFix payload (victim side) -->
    <ScenariosCloudflareForm v-if="session.payloadRunning" />
    <!-- zoom-docs: the security warning + the infostealer's attacker view -->
    <ScenariosJsExecution />
    <ScenariosAttackerTerminal />
    <!-- ironcastle: the install hook's loot, as a side panel -->

    <!-- the original doors95 ants payload, crawling while the implant is live -->
    <RangeVirusPayload />

    <!-- desktop icons (original doors95 icons where we have them) -->
    <div class="desk-icons absolute top-8 left-8 flex flex-col flex-wrap content-start gap-x-2 pointer-events-auto" style="max-height: calc(var(--app-h) - 70px)">
      <RangeIcon windowName="Mail" label="Mail" @open="(n) => openWin(n)"><IconMail /></RangeIcon>
      <RangeIcon windowName="Browser" label="Browser" @open="(n) => openWin(n)">
        <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="19" fill="#1a6fd4"/>
          <path d="M24 5a19 19 0 0 1 0 38" fill="none" stroke="#9fd0ff" stroke-width="2"/>
          <path d="M5 24h38" stroke="#9fd0ff" stroke-width="2"/>
          <path d="M9 13c8 4 22 4 30 0M9 35c8-4 22-4 30 0" fill="none" stroke="#9fd0ff" stroke-width="2"/>
          <ellipse cx="24" cy="24" rx="8" ry="19" fill="none" stroke="#9fd0ff" stroke-width="1.5"/>
          <circle cx="24" cy="24" r="19" fill="none" stroke="#0d4f9e" stroke-width="2"/>
        </svg>
      </RangeIcon>
      <RangeIcon windowName="WhatsApp" label="WhatsApp" :badge="waUnread" @open="(n) => openWin(n)">
        <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 5C13.5 5 5 13.3 5 23.5c0 3.6 1.1 7 3 9.8L6 43l10-2.6c2.3 1.2 5 1.9 8 1.9 10.5 0 19-8.3 19-18.5S34.500 5 24 5z" fill="#25d366"/>
          <path d="M24 5C13.5 5 5 13.3 5 23.5c0 3.6 1.1 7 3 9.8L6 43l10-2.6c2.3 1.2 5 1.9 8 1.9 10.5 0 19-8.3 19-18.5S34.500 5 24 5z" fill="none" stroke="#0b6b3a" stroke-width="2"/>
          <path d="M17.500 15.500c-.7 0-1.600.4-2.100 1.300-1 1.800-.3 4.500 1.900 7.300 2.400 3.100 5.300 4.800 7.700 5.300 1.600.3 3-.3 3.600-1.700.3-.7.3-1.200 0-1.500l-2.700-1.500c-.5-.3-1-.2-1.400.2l-.9 1c-1.700-.8-3.100-2.200-4-3.900l.9-.9c.4-.4.5-.9.2-1.400l-1.500-2.600c-.2-.4-.7-.6-1.200-.6z" fill="#fff"/>
        </svg>
      </RangeIcon>
      <RangeIcon windowName="Authenticator" label="Authenticator" @open="(n) => openWin(n)">
        <svg width="48" height="48" viewBox="0 0 48 48" shape-rendering="crispEdges" aria-hidden="true">
          <rect x="14" y="20" width="20" height="22" fill="#c0c0c0"/>
          <rect x="14" y="20" width="20" height="6" fill="#000181"/>
          <rect x="19" y="30" width="10" height="8" fill="#565656"/>
          <rect x="22" y="33" width="4" height="4" fill="#ffd34d"/>
          <path d="M17 20 v-4 a7 7 0 0 1 14 0 v4" fill="none" stroke="#c0c0c0" stroke-width="4"/>
        </svg>
      </RangeIcon>
      <RangeIcon windowName="Notepad" label="Notepad" @open="(n) => openWin(n)">
        <IconNotepad />
      </RangeIcon>
      <RangeIcon windowName="Terminal" label="Terminal" @open="(n) => openWin(n)">
        <svg width="48" height="48" viewBox="0 0 48 48" shape-rendering="crispEdges" aria-hidden="true">
          <rect x="4" y="6" width="40" height="36" fill="#c0c0c0"/>
          <rect x="4" y="6" width="40" height="5" fill="#000181"/>
          <rect x="8" y="15" width="32" height="23" fill="#0a0a0a"/>
          <rect x="11" y="19" width="6" height="2" fill="#00ff41"/>
          <rect x="11" y="23" width="10" height="2" fill="#00ff41"/>
          <rect x="24" y="27" width="5" height="2" fill="#00ff41"/>
        </svg>
      </RangeIcon>
      <RangeIcon windowName="Dino Game" label="Dino Game" @open="(n) => openWin(n)"><IconDino /></RangeIcon>
      <RangeIcon windowName="Scamcyclopedia" label="Scamcyclopedia" @open="(n) => openWin(n)">
        <img src="/icons/books.png" alt="Scamcyclopedia" class="w-12 h-12" draggable="false">
      </RangeIcon>
      <RangeIcon windowName="Antivirus" label="Antivirus" @open="(n) => openWin(n)">
        <img src="/icons/antivirus.png" alt="Antivirus" class="w-12 h-12" draggable="false">
      </RangeIcon>
      <RangeIcon windowName="Credits" label="Credits" @open="(n) => openWin(n)">
        <img src="/icons/group.png" alt="Credits" class="w-12 h-12" draggable="false">
      </RangeIcon>
      <!-- the "document" the Zoom Docs lure saved: actually a Windows Script -->
      <div v-if="zoomFileReady" @contextmenu.prevent="openJsMenu">
        <RangeIcon windowName="Contract_Bid_Proposal.js" label="Contract_Bid_Proposal.js" @open="openZoomFile">
          <svg width="48" height="48" viewBox="0 0 48 48" shape-rendering="crispEdges" aria-hidden="true">
            <path d="M9 3h22l9 9v33H9z" fill="#fff" stroke="#000" stroke-width="2"/>
            <path d="M31 3v9h9" fill="#c0c0c0" stroke="#000" stroke-width="2"/>
            <rect x="14" y="20" width="21" height="3" fill="#000181"/><rect x="14" y="27" width="21" height="3" fill="#000181"/><rect x="14" y="34" width="13" height="3" fill="#000181"/>
          </svg>
        </RangeIcon>
      </div>
    </div>

    <!-- file context menu (right-click on the .js) -->
    <div
      v-if="jsMenu.open"
      class="ctx-menu"
      :style="{ left: `${jsMenu.x}px`, top: `${jsMenu.y}px` }"
      @pointerdown.stop
      @contextmenu.prevent
    >
      <button class="ctx-item" @click="runZoomFile">Open</button>
      <button class="ctx-item" @click="inspectZoomFile">Open with Notepad</button>
      <div class="ctx-sep"></div>
      <button class="ctx-item" @click="fileProperties">Properties</button>
    </div>

    <!-- file Properties for the downloaded script: shows what the file really is -->
    <div v-if="propsOpen" class="fp-win" @pointerdown.stop>
      <div class="fp-bar"><span>Contract_Bid_Proposal.js Properties</span><button class="fp-x" @click="propsOpen = false">✕</button></div>
      <div class="fp-body">
        <dl>
          <dt>Type of file:</dt><dd><b>JavaScript File (.js)</b></dd>
          <dt>Opens with:</dt><dd>Microsoft Windows Based Script Host</dd>
          <dt>Location:</dt><dd>C:\Users\s.alharthi\Desktop</dd>
          <dt>Size:</dt><dd>28 KB</dd>
        </dl>
        <div class="fp-actions"><button class="fp-ok" @click="propsOpen = false">OK</button></div>
      </div>
    </div>

    <LayoutTaskbar @run-dialog="runVisible = true" />
    <RangeCoach />
    <SlidesAttackerSlide />
    <RangeDebrief />
  </div>
</template>

<script lang="ts" setup>
import emitter from '~/components/misc/eventHandler'

const currentlyOpenWindows = useOpenWindowsStore()
const session = useSessionStore()

// the mail window opens large enough to read a message without resizing it
const mailWidth = Math.min(1300, Math.max(900, vp.w - 320))

const runVisible = ref(false)
const terminalOpen = computed(() => currentlyOpenWindows.openWindows.includes('Terminal'))
const waOpen = computed(() => currentlyOpenWindows.openWindows.includes('WhatsApp'))
// Dana's three messages are unread until her chat is opened
const waUnread = computed(() => (session.chatRead || session.completedScenarios.includes('ironcastle') || !session.activeScenarios.includes('ironcastle') ? 0 : 3))
const notepadOpen = computed(() => currentlyOpenWindows.openWindows.includes('Notepad'))
const authyOpen = computed(() => currentlyOpenWindows.openWindows.includes('Authenticator'))
const dinoOpen = computed(() => currentlyOpenWindows.openWindows.includes('Dino Game'))
const scamOpen = computed(() => currentlyOpenWindows.openWindows.includes('Scamcyclopedia'))
const avOpen = computed(() => currentlyOpenWindows.openWindows.includes('Antivirus'))
const creditsOpen = computed(() => currentlyOpenWindows.openWindows.includes('Credits'))

const openWin = (name: string) => currentlyOpenWindows.openWindow(name)
const closeWindow = (name: string) => currentlyOpenWindows.closeWindow(name)
const setLastClickedWindow = (name: string) => currentlyOpenWindows.setLastClickedWindow(name)

// the downloaded "document" appears on the desktop only in the zoom-docs chain
const zoomFileReady = computed(() => {
  const f = session.flagsOf('zoom-docs')
  return !!f.zoom_js_downloaded && !f.compromised && session.phase === 'live'
    && (session.scenarioId === 'zoom-docs' || !session.completedScenarios.includes('zoom-docs'))
})

// double-clicking the icon asks Windows to open the file, which raises the
// security warning (JsExecution.vue) where the visitor decides
function openZoomFile() {
  session.focusScenario('zoom-docs')
  if (session.scenarioId !== 'zoom-docs') return
  if (session.flags.zoom_js_running || session.flags.compromised || session.outcomeReady) return
  session.flag('zoom_open_prompt')
  session.log('FILE_OPEN_REQUESTED', 'Contract_Bid_Proposal.js from the desktop', 'neutral')
}

const jsMenu = ref({ open: false, x: 0, y: 0 })
const propsOpen = ref(false)

// What Notepad shows: an inert illustration that makes clear this is a script
// and not a document. Deliberately not working or realistic code.
const JS_FILE_CONTENT = [
  '// Contract_Bid_Proposal.js',
  '// Type: JavaScript File. Opening it runs it. It does not display a document.',
  '//',
  '// [ about 28 KB of scrambled script on a single line ]',
  '//',
  '// In order, a file like this:',
  '//   1. starts a hidden command window',
  '//   2. downloads a second program from the sender',
  '//   3. hands control of this workstation to it',
].join('\n')

function openJsMenu(e: MouseEvent) {
  jsMenu.value = { open: true, x: toApp(e.clientX) + 12, y: toApp(e.clientY) + 12 }
}
function closeJsMenu() { jsMenu.value.open = false }
function runZoomFile() { closeJsMenu(); openZoomFile() }
function inspectZoomFile() {
  closeJsMenu()
  session.focusScenario('zoom-docs')
  if (session.scenarioId !== 'zoom-docs') return
  session.inspectedFile = { name: 'Contract_Bid_Proposal.js', content: JS_FILE_CONTENT }
  session.flag('inspected_file')
  session.log('FILE_OPENED_IN_NOTEPAD', 'inspected the .js attachment before running it', 'safe')
  session.timelineStep('You opened the file in Notepad instead of running it')
  openWin('Notepad')
  session.survive()
}
function fileProperties() {
  closeJsMenu()
  session.focusScenario('zoom-docs')
  if (session.scenarioId !== 'zoom-docs') return
  session.flag('inspected_file')
  session.log('FILE_PROPERTIES', 'Contract_Bid_Proposal.js, type: JavaScript File (.js)', 'safe')
  session.timelineStep('You checked the file\u2019s properties')
  propsOpen.value = true
  session.survive()
}
function onGlobalPointerDown() { if (jsMenu.value.open) closeJsMenu() }
function onGlobalKeydown(e: KeyboardEvent) { if (e.key === 'Escape') closeJsMenu() }

function onExec(cmd: string) {
  session.log('RUN_OK', cmd.slice(0, 80), 'neutral')
  if (/powershell|\.ps1|cmd |curl|wget/i.test(cmd)) {
    // delegate to the real simulated terminal so the sequence plays out there
    openWin('Terminal')
    nextTick(() => emitter.emit('terminalExec', cmd))
  } else {
    session.coach('That did nothing. Try the terminal instead — or better: why is a web page giving you commands?')
  }
}

// Win+R opens the Run dialog, like a real workstation.
// Robustness: some window managers (e.g. Kali/XFCE) grab the Super key
// before the browser sees it, so we also latch a lone Meta/OS press
// and support Ctrl+R as a fallback combo.
let metaLatched = false
let metaLatchTimer: ReturnType<typeof setTimeout> | null = null

function onKeydown(e: KeyboardEvent) {
  if (session.phase !== 'live') return
  // Ctrl+Alt+R is the operator reset (pages/index.vue), not the Run dialog
  if (e.altKey) return

  // latch a lone Win press so Win-then-R sequences work too
  if (e.key === 'Meta' || e.key === 'OS') {
    metaLatched = true
    if (metaLatchTimer) clearTimeout(metaLatchTimer)
    metaLatchTimer = setTimeout(() => (metaLatched = false), 1500)
    return
  }

  if (e.key.toLowerCase() !== 'r') return
  const winHeld =
    e.metaKey ||
    (typeof e.getModifierState === 'function' &&
      (e.getModifierState('OS') || e.getModifierState('Meta')))
  if (winHeld || metaLatched || e.ctrlKey) {
    e.preventDefault()
    e.stopPropagation()
    metaLatched = false
    runVisible.value = true
  }
}

function onKeyup(e: KeyboardEvent) {
  if (e.key === 'Meta' || e.key === 'OS') {
    if (metaLatchTimer) clearTimeout(metaLatchTimer)
    metaLatchTimer = setTimeout(() => (metaLatched = false), 800)
  }
}

onMounted(() => {
  window.addEventListener('pointerdown', onGlobalPointerDown)
  window.addEventListener('keydown', onGlobalKeydown)
  window.addEventListener('keydown', onKeydown, true)
  window.addEventListener('keyup', onKeyup, true)
})
onUnmounted(() => {
  window.removeEventListener('pointerdown', onGlobalPointerDown)
  window.removeEventListener('keydown', onGlobalKeydown)
  window.removeEventListener('keydown', onKeydown, true)
  window.removeEventListener('keyup', onKeyup, true)
  if (metaLatchTimer) clearTimeout(metaLatchTimer)
})
</script>

<style scoped>
.fp-win { position: fixed; left: 50%; top: calc(28 * var(--vh)); transform: translateX(-50%); z-index: 8800; width: 420px; background: #c0c0c0; border: 2px solid; border-color: #fcfcfc #565656 #565656 #fcfcfc; box-shadow: 4px 4px 0 rgba(0,0,0,.35); font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif; color: #000; }
.fp-bar { display: flex; justify-content: space-between; align-items: center; padding: 3px 4px 3px 8px; background: linear-gradient(to bottom, #000181, #3a6ea5); color: #fff; font-size: 13px; font-weight: bold; }
.fp-x { width: 20px; height: 18px; font-size: 11px; line-height: 1; background: #c0c0c0; border: 2px solid; border-color: #fcfcfc #565656 #565656 #fcfcfc; cursor: pointer; }
.fp-body { padding: 14px 16px 12px; font-size: 14px; }
.fp-body dl { display: grid; grid-template-columns: 110px 1fr; row-gap: 8px; margin: 0; }
.fp-body dt { color: #404040; }
.fp-body dd { margin: 0; word-break: break-all; }
.fp-actions { display: flex; justify-content: flex-end; margin-top: 14px; }
.fp-ok { min-width: 80px; padding: 3px 12px; font: inherit; background: #c0c0c0; border: 2px solid; border-color: #fcfcfc #565656 #565656 #fcfcfc; cursor: pointer; }
/* icons run down the left edge and wrap into a second column instead of off the screen */
.desk-icons > * { width: 240px; }
.ctx-menu {
  position: fixed;
  z-index: 9000;
  min-width: 170px;
  padding: 2px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.35);
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
}
.ctx-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 3px 22px;
  font-size: 12.5px;
  color: #000;
  background: transparent;
  cursor: default;
}
.ctx-item:hover { background: #000181; color: #fff; }
.ctx-sep { height: 2px; margin: 3px 2px; border-top: 1px solid #808080; border-bottom: 1px solid #fcfcfc; }
</style>
