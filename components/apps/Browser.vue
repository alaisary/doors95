<template>
  <div class="flex flex-col h-full bg-white text-slate-800">
    <!-- tab strip (Chromium style) — window controls live in the Win95 titlebar -->
    <div class="flex items-stretch h-9 bg-[#dee1e6] select-none flex-shrink-0">
      <div class="flex-1 flex items-stretch gap-px pl-2 pt-1 overflow-hidden min-w-0">
        <div
          v-for="tab in tabs"
          :key="tab.name"
          class="group flex items-center gap-2 px-3 rounded-t-lg text-[12px] cursor-pointer transition-colors flex-1 min-w-[56px] max-w-[240px] overflow-hidden"
          :class="activeTab === tab.name ? 'bg-white text-slate-800' : 'hover:bg-black/5 text-slate-600'"
          @click="makeActive(tab.name)"
        >
          <span class="w-3.5 h-3.5 rounded-sm flex-shrink-0 flex items-center justify-center text-[9px]" :class="favicon(tab).cls">{{ favicon(tab).glyph }}</span>
          <span class="truncate flex-1 text-left">{{ tab.title }}</span>
          <button class="opacity-60 group-hover:opacity-100 hover:bg-black/10 rounded-full w-4 h-4 leading-none flex-shrink-0" @click.stop="closeTab(tab.name)">✕</button>
        </div>
        <button class="w-8 rounded-full hover:bg-black/10 text-slate-600 flex-shrink-0" title="New tab" @click="newTab">＋</button>
      </div>
    </div>

    <!-- toolbar -->
    <div class="flex items-center gap-1 px-2 py-1.5 bg-white border-b border-slate-200 flex-shrink-0">
      <button class="tool-btn" title="Back" :disabled="history.length < 2" @click="goBack">←</button>
      <button class="tool-btn" title="Forward" disabled style="opacity:0.3">→</button>
      <button class="tool-btn" title="Reload" @click="reload">⟳</button>

      <!-- omnibox -->
      <div class="flex-1 flex items-center gap-2 bg-slate-100 hover:bg-white rounded-full px-3 py-1.5 border border-transparent hover:border-slate-300 transition-colors mx-1 min-w-0">
        <span
          class="text-[13px] flex-shrink-0 cursor-pointer"
          :class="urlBarFocused ? 'text-slate-400' : isSecureHost ? 'text-emerald-600' : 'text-amber-600'"
          :title="urlBarFocused ? '' : 'View site information'"
          @mouseenter="hoverLock"
          @click="openInspector"
        >{{ urlBarFocused ? '' : isSecureHost ? '🔒' : '⚠' }}</span>
        <input
          v-model="urlInput"
          class="flex-1 bg-transparent outline-none text-[13px] text-slate-800 placeholder-slate-500 min-w-0"
          placeholder="Search or type a URL"
          spellcheck="false"
          @focus="onUrlFocus"
          @blur="onUrlBlur"
          @keydown.enter="navigate(urlInput)"
        />
        <span class="text-slate-400 text-xs flex-shrink-0">☆</span>
      </div>

      <button class="tool-btn" title="Extensions">🧩</button>
      <button class="tool-btn" title="Profile">
        <span class="w-5 h-5 rounded-full bg-sky-600 text-white text-[9px] flex items-center justify-center font-bold">AF</span>
      </button>
      <button class="tool-btn" title="Menu" @click="openInspector">⋮</button>
    </div>

    <!-- bookmarks bar -->
    <div class="flex items-center gap-1 px-3 py-1 bg-white border-b border-slate-200 text-[11px] text-slate-600 flex-shrink-0">
      <button class="px-2 py-0.5 rounded hover:bg-slate-100" @click="open('Intranet')">🏢 Intranet</button>
      <button class="px-2 py-0.5 rounded hover:bg-slate-100" @click="open('newtab')">📋 Workday</button>
    </div>

    <!-- viewport: fixed-area scroll container — page content can never resize the window -->
    <div class="flex-1 min-h-0 relative bg-white" :class="{ 'blur-[2px] pointer-events-none': devtoolsOpen }">
      <!-- touching a page puts the visitor inside that page's attack, whatever else was in focus -->
      <div class="absolute inset-0 overflow-y-auto" @pointerdown.capture="focusPage(activeTab)" @focusin.capture="focusPage(activeTab)">
        <!-- kept alive: each tab keeps its own state while you move around the desktop.
             The key carries that scenario's epoch, so only a restart remounts its page. -->
        <KeepAlive :max="16">
          <component :is="pageComponent" :key="pageKey" v-bind="pageProps" />
        </KeepAlive>
      </div>
    </div>

    <!-- devtools / connection info panel -->
    <div v-if="devtoolsOpen" class="h-56 border-t border-cyan-500/30 bg-[#05080f] text-[12px] font-mono text-cyan-200 overflow-auto p-3 flex-shrink-0">
      <div class="text-cyan-500/70 mb-2">// SITE INFORMATION (simulated)</div>
      <div>URL ........ {{ currentUrl }}</div>
      <div>TLS ........ {{ certInfo.issuer }}</div>
      <div>CERT ....... valid · CN={{ certInfo.cn }}</div>
      <div class="mt-2 text-cyan-500/70">// NETWORK (SIMULATED)</div>
      <div v-for="(l, i) in activeNetLog" :key="i">{{ l }}</div>
      <div class="mt-2 text-cyan-500/70">// NOTE: a valid certificate only proves the domain is the domain. It says nothing about who owns the domain.</div>
      <button class="mt-3 px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30" @click="devtoolsOpen = false">close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import emitter from '~/components/misc/eventHandler'

type Tab = { name: string; title: string; url: string; netLog: string[] }

const session = useSessionStore()
const windowsStore = useOpenWindowsStore()

const tabs = ref<Tab[]>([])
const activeTab = ref('')
const urlInput = ref('')
const urlBarFocused = ref(false)
const devtoolsOpen = ref(false)
const history = ref<string[]>([])

const pageRegistry: Record<string, { title: string; url: string }> = {
  newtab: { title: 'New Tab', url: 'https://newtab' },
  Intranet: { title: 'Wadi Gate Intranet', url: 'https://intranet.wadigate.om' },
  'AI Playground': { title: 'Qabas AI — Frontier models, free', url: 'https://app.qabas-ai.com/playground' },
  'Invoice Portal': { title: 'Secure Document Portal — Harbor Crest', url: 'https://docs.harborcrest-invoice-portal.com/INV-2291' },
  'Doc Portal': { title: 'Wadi Gate Secure Docs — Protected documents', url: 'https://docs.wadigate-portal.com/shared/q3-fleet-audit' },
  // the "genuine" Microsoft device-login — real domain, green padlock, attacker's code
  'Device Login': { title: 'Microsoft — Sign in', url: 'https://login.microsoftonline.com/devicelogin' },
  'Attacker Site': { title: 'Authentication Request', url: 'https://login.wadigate-support-help.com/authcode' },
  'Ejada Login': { title: 'إجــادة — تسجيل الدخول', url: 'https://ejada.gov.om.workers.dev/auth/login' },
  // a REAL Zoom share: the address is genuinely zoom.us — the file is the trap
  'Zoom Doc': { title: 'Contract Bid Proposal, Zoom Docs', url: 'https://docs.zoom.us/d/SKK1b5_JTQafbhlrTU8w?from=email' },
  Social: { title: 'Priya Nair on LinkedIn', url: 'https://www.linkedin.com/posts/priya-nair_frontier-ai-activity-7312' },
  IronCastle: { title: 'IronCastle AI: frontier intelligence, developer pricing', url: 'https://ironcastle.ai' },
}

// domains that belong to the attacker in the scenarios — TLS still shows "valid"
const attackerHosts = ['wadigate-secure', 'harborcrest', 'wadigate-support-help', 'qabas-ai', 'wadigate-portal', 'workers.dev']

const activePageName = computed(() => activeTab.value)

// which scenario each page belongs to (the page is part of that attack)
const PAGE_SCENARIO: Record<string, string> = {
  'AI Playground': 'evilginx-bitb',
  'Invoice Portal': 'clickfix',
  'Doc Portal': 'device-code',
  'Device Login': 'device-code',
  'Attacker Site': 'device-code',
  'Ejada Login': 'ejada',
  'Zoom Doc': 'zoom-docs',
  Social: 'ironcastle',
  IronCastle: 'ironcastle',
}
const PAGE_COMPONENT: Record<string, any> = {
  newtab: resolveComponent('PagesNewtab'),
  Intranet: resolveComponent('PagesIntranet'),
  'AI Playground': resolveComponent('ScenariosBitb'),
  'Invoice Portal': resolveComponent('ScenariosClickfix'),
  'Doc Portal': resolveComponent('ScenariosDevicecode'),
  'Device Login': resolveComponent('ScenariosDeviceLogin'),
  'Attacker Site': resolveComponent('ScenariosAttackerDevice'),
  'Ejada Login': resolveComponent('ScenariosEjada'),
  'Zoom Doc': resolveComponent('ScenariosZoomdocs'),
  Social: resolveComponent('ScenariosIroncastleSocial'),
  IronCastle: resolveComponent('ScenariosIroncastleSite'),
}
const pageComponent = computed(() => PAGE_COMPONENT[activeTab.value] ?? resolveComponent('PagesNotFound'))
const pageProps = computed(() => (PAGE_COMPONENT[activeTab.value] ? {} : { url: notFoundUrl.value }))
const pageKey = computed(() => {
  const sc = PAGE_SCENARIO[activeTab.value]
  return sc ? `${activeTab.value}-${session.epochs[sc] ?? 0}` : activeTab.value
})
// being on an attack's page puts the visitor inside that attack, keeping any earlier progress
function focusPage(name: string) {
  const sc = PAGE_SCENARIO[name]
  if (sc) session.focusScenario(sc)
}
const notFoundUrl = computed(() => activeTab.value.startsWith('notfound:') ? activeTab.value.slice(9) : activeTab.value)

const activeTabObj = computed(() => tabs.value.find((t) => t.name === activeTab.value))
const currentUrl = computed(() => activeTabObj.value?.url ?? '')
const activeNetLog = computed(() => activeTabObj.value?.netLog ?? [])

const isSecureHost = computed(() => {
  try {
    const host = new URL(currentUrl.value).host
    return !attackerHosts.some((h) => host.includes(h))
  } catch {
    return false
  }
})

const certInfo = computed(() => ({ issuer: "Let's Encrypt (valid)", cn: hostOf(currentUrl.value) || '—' }))

function favicon(tab: Tab) {
  if (tab.name === 'newtab') return { glyph: 'N', cls: 'bg-slate-200 text-slate-600' }
  if (tab.name === 'Intranet') return { glyph: 'N', cls: 'bg-sky-600 text-white' }
  if (tab.name === 'AI Playground') return { glyph: 'Q', cls: 'bg-[#0e0e12] text-white' }
  if (tab.name === 'Doc Portal') return { glyph: 'D', cls: 'bg-[#0067b8] text-white' }
  if (tab.name === 'Zoom Doc') return { glyph: 'Z', cls: 'bg-[#0b5cff] text-white' }
  if (tab.name === 'Social') return { glyph: 'in', cls: 'bg-[#0a66c2] text-white' }
  if (tab.name === 'IronCastle') return { glyph: 'I', cls: 'bg-[#0b0d12] text-[#ffb020]' }
  if (tab.name === 'Ejada Login') return { glyph: 'إ', cls: 'bg-[#37d3c4] text-white' }
  if (tab.name === 'Device Login') return { glyph: '▦', cls: 'bg-[#0067b8] text-white' }
  return { glyph: '🌐', cls: 'bg-transparent' }
}

// NOTE: valid TLS on attacker domains is the POINT — https ≠ trustworthy
function hostOf(url: string) {
  try { return new URL(url).host } catch { return '' }
}

function onUrlFocus() {
  urlBarFocused.value = true
  urlInput.value = currentUrl.value
}
function onUrlBlur() {
  urlBarFocused.value = false
  urlInput.value = currentUrl.value
}
function hoverLock() {
  session.log('HOVERED_LINK', currentUrl.value, 'neutral')
}

// clicking the lock/warning icon opens the connection inspector — the
// "developer/security information" route idea1.md asks for
function openInspector() {
  if (['Invoice Portal', 'AI Playground', 'Attacker Site', 'Zoom Doc', 'IronCastle', 'Social'].includes(activePageName.value)) {
    session.flag('inspected_url')
  }
  session.log('URL_INSPECTED', currentUrl.value, 'safe')
  devtoolsOpen.value = true
}

function navigate(input: string) {
  let url = input.trim()
  if (!url) return
  if (!/^https?:\/\//.test(url)) url = 'https://' + url
  session.log('URL_INSPECTED', url, 'neutral')
  const match = Object.entries(pageRegistry).find(([, p]) => p.url === url)
  if (match) open(match[0])
  else open('notfound:' + url)
}

function open(name: string) {
  if (name.startsWith('notfound:')) {
    const url = name.slice(9)
    if (!tabs.value.some((t) => t.name === name)) tabs.value.push({ name, title: hostOf(url) || url, url, netLog: [`GET ${url} → DNS NXDOMAIN`] })
    activeTab.value = name
    urlInput.value = url
    return
  }
  const page = pageRegistry[name]
  if (!page) return
  if (!tabs.value.some((t) => t.name === name)) {
    const netLog: string[] = [`GET ${page.url} → 200`]
    // the reverse-proxy tunnel only exists on attacker infrastructure
    if (attackerHosts.some((h) => page.url.includes(h))) {
      netLog.push(`wss://relay.${hostOf(page.url)} → 101 (proxy tunnel)`)
    }
    tabs.value.push({ name, title: page.title, url: page.url, netLog })
  }
  focusPage(name)
  activeTab.value = name
  urlInput.value = tabs.value.find((t) => t.name === name)?.url ?? page.url
  history.value.push(name)
  session.log('PAGE_OPENED', page.url, 'neutral')
}

function closeTab(name: string) {
  const idx = tabs.value.findIndex((t) => t.name === name)
  if (idx === -1) return
  tabs.value.splice(idx, 1)
  session.log('TAB_CLOSED', name, 'neutral')
  // walking away from an engaged scenario's page = breaking the chain
  if (session.scenarioId && PAGE_SCENARIO[name] === session.scenarioId) {
    session.flag('closed_attacker_page')
    session.timelineStep('Attacker page closed — chain broken')
    session.survive()
  }
  if (activeTab.value === name) {
    activeTab.value = tabs.value[Math.max(0, idx - 1)]?.name ?? 'newtab'
    onUrlBlur()
  }
  if (!tabs.value.length) open('newtab')
}

function makeActive(name: string) {
  focusPage(name)
  activeTab.value = name
  const url = tabs.value.find((t) => t.name === name)?.url
  if (url) urlInput.value = url
}

function goBack() {
  if (history.value.length > 1) {
    history.value.pop()
    makeActive(history.value[history.value.length - 1])
  }
}

function reload() {
  session.log('PAGE_RELOADED', currentUrl.value, 'neutral')
  const tab = activeTabObj.value
  if (tab) tab.netLog = [`GET ${tab.url} → 200`]
}

function newTab() {
  open('newtab')
}

// bus: other apps can open pages (e.g. Mail links)
emitter.on('openPage', (name: string) => open(name))
// scenario pages can update the address bar as they navigate internally
emitter.on('setUrl', (url: string) => {
  const t = activeTabObj.value
  if (t) {
    t.url = url
    if (!urlBarFocused.value) urlInput.value = url
  }
})

// boot with newtab
onMounted(() => open('newtab'))

// expose for scenario pages
defineExpose({ open, closeTab, devtoolsOpen })
</script>

<style scoped>
.tool-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: rgb(71 85 105);
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tool-btn:hover:not(:disabled) { background: rgba(0, 0, 0, 0.06); }
.tool-btn:disabled { cursor: default; }
</style>
