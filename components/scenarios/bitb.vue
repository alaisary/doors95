<template>
  <!-- THE LURE: "Qabas AI" free-models landing, ported from the Mimic phishlet
       (evilginx2/phishlets/Mimic-main/landing.html) -->
  <div class="min-h-full relative ql-root">
    <!-- top announcement -->
    <div class="ql-topbar">
      <span class="ql-badge-free">COMPLETELY FREE</span>
      <span>Direct access to the latest frontier models — no subscriptions.</span>
    </div>

    <!-- nav -->
    <nav class="ql-navbar">
      <a href="#" class="ql-brand" @click.prevent>
        <svg class="ql-brand-logo" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Qabas AI
      </a>
      <ul class="ql-nav-links">
        <li><a href="#models">Models</a></li>
        <li><a href="#playground">Playground</a></li>
        <li><a href="#pricing">Pricing</a></li>
      </ul>
      <button class="ql-btn-primary" @click="openSignin">Sign in</button>
    </nav>

    <main class="ql-container">
      <!-- hero -->
      <section class="ql-hero">
        <h1 class="ql-hero-title">Every frontier AI model.<br>One place. Free.</h1>
        <p class="ql-hero-subtitle">
          No multiple subscriptions. Use Claude Opus 5, GPT-5.6 Sol, Gemini 3.7 Flash, DeepSeek V4 Pro
          and Llama 4 405B through one fast, unified interface.
        </p>

        <!-- Microsoft sign-in button — the lure's call to action -->
        <div class="ql-ms-login-container">
          <button id="microsoft-signin-btn" class="ql-ms-login-btn" @click="openSignin">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
            </svg>
            <span class="ql-btn-text">
              <span class="ql-main-text">Sign in with Microsoft</span>
              <span class="ql-sub-text">Use your work, school or personal account</span>
            </span>
          </button>
        </div>

        <!-- playground teaser: it actually responds, so the lure feels real -->
        <div id="playground" class="ql-prompt-container">
          <div v-if="chatLog.length" class="ql-chatlog">
            <div v-for="(m, i) in chatLog" :key="i" class="ql-chat-msg" :class="m.role">
              {{ m.text }}
            </div>
          </div>
          <textarea
            v-model="chatInput"
            class="ql-prompt-textarea"
            placeholder="Ask anything, or paste code you want analyzed…"
            @keydown.enter.prevent="sendChat"
          ></textarea>
          <div class="ql-prompt-bar">
            <div class="ql-model-select-wrapper">
              <select v-model="modelName" class="ql-model-select">
                <option>Claude Opus 5 (Anthropic)</option>
                <option>GPT-5.6 Sol (OpenAI)</option>
                <option>Gemini 3.7 Flash (Google)</option>
                <option>DeepSeek V4 Pro (DeepSeek)</option>
                <option>Llama 4 405B (Meta)</option>
              </select>
            </div>
            <button class="ql-btn-send" title="Send" @click="sendChat">←</button>
          </div>
        </div>

        <div class="ql-quick-prompts">
          <span class="ql-qp-item">💻 Write code with Claude Opus 5</span>
          <span class="ql-qp-item">🧠 Deep reasoning with DeepSeek V4 Pro</span>
          <span class="ql-qp-item">📚 Scientific summaries with GPT-5.6 Sol</span>
        </div>
      </section>

      <!-- models grid -->
      <section id="models" style="padding-top: 20px">
        <div class="ql-section-head">
          <h2 class="ql-section-title">Frontier models available on Qabas AI</h2>
          <p class="ql-section-desc">Switch between leading models with one click — at zero cost.</p>
        </div>
        <div class="ql-models-grid">
          <div v-for="m in models" :key="m.name" class="ql-model-card">
            <div>
              <div class="ql-model-card-top">
                <div>
                  <div class="ql-model-name">{{ m.name }}</div>
                  <div class="ql-model-provider">{{ m.provider }}</div>
                </div>
                <span class="ql-free-pill">FREE</span>
              </div>
              <p class="ql-model-desc">{{ m.desc }}</p>
            </div>
            <div class="ql-model-specs">
              <span>Context: {{ m.ctx }}</span><span>{{ m.extra }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- pricing -->
      <section id="pricing">
        <div class="ql-section-head">
          <h2 class="ql-section-title">Access plans</h2>
          <p class="ql-section-desc">Free forever for individuals. Upgrade only for teams.</p>
        </div>
        <div class="ql-pricing-grid">
          <div class="ql-price-card ql-highlight">
            <div>
              <div class="ql-price-title">Free Developer</div>
              <div class="ql-price-amount">$0</div>
              <div class="ql-price-sub">Free forever — no credit card required</div>
              <ul class="ql-price-list">
                <li>Full access to every frontier model</li>
                <li>Unlimited interactive Playground use</li>
                <li>100 API requests per day</li>
              </ul>
            </div>
            <button class="ql-btn-primary" style="text-align: center" @click="openSignin">Start now</button>
          </div>
          <div class="ql-price-card">
            <div>
              <div class="ql-price-title">Pro API</div>
              <div class="ql-price-amount">Usage-based</div>
              <div class="ql-price-sub">The lowest inference prices for production systems</div>
              <ul class="ql-price-list">
                <li>Uncapped rate limits</li>
                <li>99.9% SLA on dedicated capacity</li>
                <li>Production API keys</li>
              </ul>
            </div>
            <a href="#api" class="ql-btn-primary" style="text-align: center; background: #141419; color: #fff">View API docs</a>
          </div>
        </div>
      </section>
    </main>

    <footer>Qabas AI — Bypassing Boundaries for AI Accessibility. 2026.</footer>

    <!-- ============ THE ATTACK: fake browser window (Mimic-style BITB) ==== -->
    <div
      v-if="winOpen"
      ref="bitbEl"
      class="bitb-window"
      :style="bitbStyle"
      @pointerdown="bringToFront"
    >
      <!-- fake title bar (Windows chrome) -->
      <div ref="dragHandle" class="bitb-titlebar" @pointerdown="onTitleDown">
        <svg class="bitb-favicon" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
        <span class="bitb-win-title">Microsoft — Sign in</span>
        <div class="flex-1"></div>
        <div class="bitb-caption-btns">
          <button class="bitb-cap" title="Minimise"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14"/></svg></button>
          <button class="bitb-cap" title="Maximise"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="6" width="12" height="12" rx="1"/></svg></button>
          <button class="bitb-cap bitb-cap-close" title="Close" @click="dismissBitb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        </div>
      </div>

      <!-- fake address bar -->
      <div class="bitb-addressbar">
        <button class="bitb-siteinfo" title="View site information" @click="togglePopup">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="8" x2="20" y2="8"/><circle cx="9" cy="8" r="2.2" fill="currentColor" stroke="none"/>
            <line x1="4" y1="16" x2="20" y2="16"/><circle cx="15" cy="16" r="2.2" fill="currentColor" stroke="none"/>
          </svg>
        </button>
        <div class="bitb-url">
          <span class="bitb-scheme">https://</span><span class="bitb-domain">login.microsoftonline.com</span><span class="bitb-path">{{ msPath }}</span>
        </div>

        <!-- site info popup -->
        <div v-if="popupOpen" class="bitb-popup">
          <div class="bitb-popup-header">
            <span class="bitb-popup-domain">login.microsoftonline.com</span>
            <button class="bitb-popup-close" title="Close" @click="popupOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
          <button class="bitb-popup-row" @click="openCert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            <span class="flex-1">Connection is secure</span>
            <svg class="bitb-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
          </button>
          <button class="bitb-popup-row" @click="openCert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9" r="1" fill="currentColor" stroke="none"/></svg>
            <span class="flex-1">Cookies and site data</span>
            <svg class="bitb-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>

      <!-- fake page: microsoft sign-in -->
      <div class="bitb-page">
        <!-- cert viewer overlay (the fake "proof" of authenticity) -->
        <div v-if="certOpen" class="bitb-cert-overlay">
          <div class="bitb-cert-dialog">
            <div class="bitb-cert-titlebar">
              <span>Certificate Viewer</span>
              <button class="bitb-cert-close" @click="certOpen = false">✕</button>
            </div>
            <div class="bitb-cert-tabs">
              <button class="bitb-cert-tab" :class="{ active: certTab === 'general' }" @click="certTab = 'general'">General</button>
              <button class="bitb-cert-tab" :class="{ active: certTab === 'details' }" @click="certTab = 'details'">Details</button>
            </div>
            <div class="bitb-cert-body">
              <template v-if="certTab === 'general'">
                <p class="bitb-cert-ok">✔ The connection to this site is secure.</p>
                <p class="bitb-cert-info">This certificate proves you are connected to <b>login.microsoftonline.com</b>, operated by Microsoft Corporation.</p>
                <p class="bitb-cert-info bitb-dim">…or at least, that is what this page wants you to believe. This entire dialog is HTML inside the web page.</p>
              </template>
              <template v-else>
                <div class="bitb-cert-row"><span class="bitb-cert-label">Subject</span><span>CN = stamp2.login.microsoftonline.com · O = Microsoft Corporation</span></div>
                <div class="bitb-cert-row"><span class="bitb-cert-label">Issuer</span><span>CN = Microsoft TLS G2 RSA CA OCSP 04 · O = Microsoft Corporation · C = US</span></div>
                <div class="bitb-cert-row"><span class="bitb-cert-label">Validity</span><span>Mon, 20 Jul 2026 → Mon, 12 Oct 2026</span></div>
                <div class="bitb-cert-row"><span class="bitb-cert-label">Subject Alt Name</span><span>DNS: *.microsoftonline.com · DNS: *.login.microsoftonline.com</span></div>
                <div class="bitb-cert-row"><span class="bitb-cert-label">Public Key</span><span>Elliptic Curve Public Key (P-256)</span></div>
                <div class="bitb-cert-row"><span class="bitb-cert-label">Hierarchy</span><span>DigiCert Global Root G2 → Microsoft TLS RSA Root G2</span></div>
              </template>
            </div>
          </div>
        </div>

        <!-- email stage -->
        <template v-if="msStage === 'email'">
          <div class="ms-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
          </div>
          <h2 class="ms-h">Sign in</h2>
          <p class="ms-sub">to continue to Qabas AI</p>
          <input v-model="email" type="email" class="ms-input" placeholder="Email, phone, or Skype" @input="onType">
          <button class="ms-next" :disabled="!email" @click="msStage = 'password'">Next</button>
          <div class="ms-links"><a href="#" @click.prevent>Sign-in options</a></div>
        </template>

        <!-- password stage -->
        <template v-else-if="msStage === 'password'">
          <button class="ms-back" title="Back" @click="msStage = 'email'">←</button>
          <h2 class="ms-h">Enter password</h2>
          <p class="ms-sub">{{ email || 's.alharthi@wadigate.om' }}</p>
          <input v-model="password" type="password" class="ms-input" placeholder="Password" @input="onType">
          <p v-if="pwError" class="ms-error">Your account or password is incorrect. If you don't remember your password, reset it now.</p>
          <div class="ms-links"><a href="#" @click.prevent>Forgot password?</a></div>
          <button class="ms-next" :disabled="!password" @click="submitCreds">Sign in</button>
          <label class="ms-keep"><input type="checkbox"> Keep me signed in</label>
        </template>

        <!-- mfa stage: enter the code from the (real) authenticator app -->
        <template v-else-if="msStage === 'mfa'">
          <h2 class="ms-h">Enter code</h2>
          <p class="ms-sub">Enter the 6-digit code from your authenticator app to finish signing in.</p>
          <input
            v-model="mfaCode"
            type="text"
            inputmode="numeric"
            class="ms-input ms-code"
            placeholder="Enter code"
            spellcheck="false"
            @paste="onMfaPaste"
            @keydown.enter="verifyCode"
          >
          <p v-if="codeError" class="ms-error">That code is incorrect. Please try again.</p>
          <button class="ms-next" :disabled="mfaCode.replace(/\s/g, '').length < 6" @click="verifyCode">Verify</button>
        </template>

        <!-- done -->
        <template v-else>
          <div class="ms-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
          </div>
          <h2 class="ms-h">Welcome back!</h2>
          <p class="ms-sub">Redirecting to Qabas AI…</p>
          <div class="ms-waiting">Staying signed in…</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

// ---- landing data ----
const models = [
  { name: 'Claude Opus 5', provider: 'Anthropic', desc: 'Anthropic\'s most capable model for coding, logic and complex analysis.', ctx: '500K', extra: '~35ms' },
  { name: 'GPT-5.6 Sol', provider: 'OpenAI', desc: 'Next-generation multimodal model with fast responses and high accuracy.', ctx: '256K', extra: 'Multimodal' },
  { name: 'Gemini 3.7 Flash', provider: 'Google', desc: 'Google\'s fastest model with instant processing across domains.', ctx: '128K', extra: 'Low latency' },
  { name: 'DeepSeek V4 Pro', provider: 'DeepSeek', desc: 'Advanced open-source deep reasoning with a transparent chain of thought.', ctx: '256K', extra: 'Reasoning chain' },
  { name: 'Llama 4 405B', provider: 'Meta AI', desc: 'The largest open-weight model with world-class, fluid responses.', ctx: '256K', extra: 'Fast inference' },
  { name: 'Grok 4.6', provider: 'xAI', desc: 'xAI\'s advanced model with strong analytical capabilities.', ctx: '128K', extra: 'Real-time data' },
]

// ---- fake browser window (BITB) ----
// manual delta-based drag: this window lives INSIDE the browser window, so
// useDraggable's viewport coords would double the movement — we track deltas
const bitbEl = ref<HTMLElement | null>(null)
const dragHandle = ref<HTMLElement | null>(null)
const wx = ref(180)
const wy = ref(60)
const bitbStyle = computed(() => ({ transform: `translate(${wx.value}px, ${wy.value}px)` }))

// the fake window can never leave the visible page area, like the real browser it is imitating inside
function pageBounds() {
  const el = bitbEl.value
  let host: HTMLElement | null = el?.parentElement ?? null
  while (host && !/(auto|scroll)/.test(getComputedStyle(host).overflowY)) host = host.parentElement
  host = host ?? el?.offsetParent as HTMLElement | null
  if (!el || !host) return { x0: 0, y0: 0, x1: 9999, y1: 9999 }
  const w = el.offsetWidth, h = el.offsetHeight
  const x0 = 0, y0 = host.scrollTop
  return { x0, y0, x1: Math.max(x0, host.clientWidth - w), y1: Math.max(y0, y0 + host.clientHeight - h) }
}

function onTitleDown(e: PointerEvent) {
  if (e.button !== 0) return
  e.preventDefault()
  const startX = toApp(e.clientX)
  const startY = toApp(e.clientY)
  const startWx = wx.value
  const startWy = wy.value
  const onMove = (ev: PointerEvent) => {
    const nx = startWx + (toApp(ev.clientX) - startX)
    const ny = startWy + (toApp(ev.clientY) - startY)
    const b = pageBounds()
    wx.value = Math.max(b.x0, Math.min(nx, b.x1))
    wy.value = Math.max(b.y0, Math.min(ny, b.y1))
  }
  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

function bringToFront() {
  if (bitbEl.value) bitbEl.value.style.zIndex = '50'
}

const winOpen = ref(false)
const popupOpen = ref(false)
const certOpen = ref(false)
const certTab = ref<'general' | 'details'>('general')
const msStage = ref<'email' | 'password' | 'mfa' | 'done'>('email')
const email = ref('')
const password = ref('')
const { error: pwError, check: checkPassword } = usePasswordCheck()
const mfaCode = ref('')
const codeError = ref(false)
let typed = false

// ---- playground chat: the lure "works", so it feels real ----
const chatLog = ref<{ role: 'you' | 'ai'; text: string }[]>([])
const chatInput = ref('')
const modelName = ref('Claude Opus 5 (Anthropic)')
const aiReplies = [
  'Sure — here is the short version: break the problem into smaller pieces, verify each one, then reassemble. Want me to go deeper on any step?',
  'Good question. The quick answer is "it depends on your constraints" — but in most cases the simplest approach that covers the edge cases wins.',
  'Here is a starting point. Note the trade-off: this optimizes for readability first; you can tighten it later if performance matters.',
  'I can help with that. Give me a bit more context (what you tried, what happened) and I will walk through it step by step.',
  'Short answer: yes. Longer answer: do it carefully — check who has access, what gets logged, and what breaks if it fails.',
  'Interesting. Two ways to look at it: the textbook way, and the way it is actually done in the field. I will show both.',
]
let replyIdx = 0
let playedOnce = false

function sendChat() {
  const q = chatInput.value.trim()
  if (!q) return
  chatLog.value.push({ role: 'you', text: q })
  chatInput.value = ''
  if (!playedOnce) {
    playedOnce = true
    session.log('PLAYGROUND_USED', 'user chatted with the lure "AI"', 'neutral')
  }
  setTimeout(() => {
    chatLog.value.push({ role: 'ai', text: aiReplies[replyIdx++ % aiReplies.length] })
  }, 500 + Math.random() * 600)
}

// the spoofed URL shown in the fake address bar (from the Mimic kit config)
const msPath = '/organizations/oauth2/v2.0/authorize?client_id=4765445b-32c6-49b0-83e6-1d93765276ca&redirect_uri=https%3A%2F%2Fwww.office.com%2Flandingv2&response_type=code%20id_token&scope=openid%20profile'

function openSignin() {
  if (winOpen.value) return
  winOpen.value = true
  // the attacker's evilginx console lights up in the corner
  session.c2Start()
  session.c2Log('[06:57:33] [inf] phishing page served: app.qabas-ai.com/playground', 'text-slate-400', undefined, undefined, 'SERVE')
  session.c2Log('[06:57:33] [inf] fake "Microsoft" BITB window rendered — waiting for the victim…', 'text-slate-400', undefined, undefined, 'SERVE')
  session.log('MS_SIGNIN_CLICKED', 'lure page opened fake "Microsoft" window', 'risky')
  session.timelineStep('Fake "Microsoft" browser window rendered inside page')
  session.coach('A login window appeared. Look closely — is it a window, or part of the page?')
}

function togglePopup() {
  popupOpen.value = !popupOpen.value
  if (popupOpen.value) session.log('SITE_INFO_CLICKED', 'site info in fake window', 'neutral')
}

function openCert() {
  popupOpen.value = false
  certOpen.value = true
  session.flag('checked_certificate')
  session.log('CERT_INSPECTED', 'certificate viewer inside fake browser window', 'safe')
  session.coach('A "valid Microsoft certificate" — rendered by the page itself. Certificates only ever appear in YOUR browser chrome.')
}

// user interacting with the fake window is itself logged
function onType() {
  if (!typed) {
    typed = true
    session.log('TYPED_INTO_FAKE_WINDOW', 'credentials entered into page-rendered login', 'risky')
  }
}

function submitCreds() {
  if (!email.value || !password.value) return
  if (!checkPassword(password.value)) return
  session.flag('entered_credentials')
  session.log('ENTERED_CREDENTIALS', 'creds submitted to attacker reverse-proxy', 'risky')
  session.timelineStep('Credentials submitted → relayed by proxy')
  session.c2Log(`[06:57:47] [+] email captured: ${email.value}`, 'text-rose-400', undefined, undefined, 'CAPTURE')
  session.c2Log('[06:57:48] [+] password captured: ********** — relayed in real time', 'text-rose-400', 'Sign-in to the real tenant from a hosting-provider IP, not the user\u2019s usual network', 'Passkeys or FIDO2 keys: bound to the real domain', 'CAPTURE')
  msStage.value = 'mfa'
  session.spoiler('Now it wants your authenticator code. The code from your real app works here — that is the trap.')
}

// Ctrl+V pastes the SIMULATED OS clipboard (what the Authenticator app copied)
function onMfaPaste(e: ClipboardEvent) {
  e.preventDefault()
  if (session.clipboard) {
    mfaCode.value = session.clipboard
    session.log('PASTED', 'authenticator code pasted into fake login', 'risky')
  }
}

function verifyCode() {
  const entered = mfaCode.value.replace(/\s/g, '')
  if (entered.length < 6) return
  if (entered !== session.authyCode) {
    codeError.value = true
    session.log('MFA_CODE_WRONG', 'wrong code entered', 'neutral')
    return
  }
  codeError.value = false
  session.flag('approved_request')
  session.log('MFA_CODE_ACCEPTED', 'REAL TOTP code relayed — attacker session validated', 'risky')
  session.timelineStep('Real authenticator code accepted → attacker captures session')
  session.c2Log('[06:57:55] [+] TOTP verified: the victim typed their REAL code', 'text-rose-400', undefined, undefined, 'RELAY')
  session.c2Log('[06:57:55] [+] session cookie captured: auth_session=eyJhbGciOi… (LIVE, MFA-VALID)', 'text-rose-400', 'MFA passed from a hosting IP the user never uses, then mailbox use from another IP and ASN.', 'Compliant-device checks and token protection', 'CAPTURE')
  session.c2Log('[06:57:55] [+] cookies replayable → mailbox · payroll · scheduling', 'text-rose-400', undefined, undefined, 'ACCESS')
  msStage.value = 'done'
  session.coach('A real code from a real app let the attacker in. Codes prove nothing about who is asking.')
  session.later('evilginx-bitb', 1600, () => {
    session.timelineStep('Attacker replays session cookie, MFA never checked again')
    // the evilginx terminal already told the story — no full-screen takeover,
    // the desktop stays and Skippy offers the debrief
    session.compromise('Live session cookie stolen via reverse proxy', false)
  })
}


function dismissBitb() {
  session.flag('closed_attacker_page')
  session.log('BITB_WINDOW_CLOSED', undefined, 'safe')
  session.coach('Interesting instinct. That window was not your browser — it was part of the web page.')
  session.survive()
}

onMounted(() => {
  session.timelineStep('Lure landing rendered — "Qabas AI" free AI models')
})
</script>

<style scoped>
/* ================= landing (ported from Mimic landing.html) ================= */
.ql-root {
  --bg: #070709;
  --surface: #0e0e12;
  --surface-card: #141419;
  --border: #22222a;
  --border-light: #32323e;
  --text-main: #f4f4f6;
  --text-sub: #9ca0aa;
  --text-muted: #5e616b;
  --status-green: #10b981;
  background-color: var(--bg);
  color: var(--text-main);
  font-family: 'Readex Pro', -apple-system, 'Segoe UI', system-ui, sans-serif;
  line-height: 1.6;
}
.ql-root a { text-decoration: none; }

.ql-topbar {
  background: #0b0b0e;
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  text-align: center;
  font-size: 12px;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.ql-badge-free {
  background: #fff;
  color: #000;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.ql-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 32px;
  max-width: 1200px;
  margin: 0 auto;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: rgba(7, 7, 9, 0.92);
  backdrop-filter: blur(12px);
  z-index: 10;
}
.ql-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 20px;
  color: #fff;
  letter-spacing: -0.5px;
}
.ql-brand-logo { width: 22px; height: 22px; stroke: #fff; stroke-width: 2.2; fill: none; }
.ql-nav-links { display: flex; gap: 28px; list-style: none; }
.ql-nav-links a { color: var(--text-sub); font-size: 13px; }
.ql-nav-links a:hover { color: #fff; }
.ql-btn-primary {
  background: #fff;
  color: #000;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-block;
}
.ql-btn-primary:hover { opacity: 0.88; }

.ql-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
.ql-hero { padding: 55px 0 30px; text-align: center; }
.ql-hero-title { font-size: 46px; font-weight: 700; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 18px; color: #fff; }
.ql-hero-subtitle { font-size: 16px; color: var(--text-sub); max-width: 680px; margin: 0 auto 34px; font-weight: 300; }

.ql-ms-login-container { max-width: 400px; margin: 0 auto 26px; padding: 0 20px; }
.ql-ms-login-btn {
  width: 100%;
  background: #fff;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
.ql-ms-login-btn:hover { background: #f8f9fa; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5); transform: translateY(-1px); }
.ql-ms-login-btn svg { width: 24px; height: 24px; flex-shrink: 0; }
.ql-btn-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
.ql-main-text { font-size: 16px; font-weight: 600; }
.ql-sub-text { font-size: 11px; color: #6b6b6b; font-weight: 400; }

.ql-prompt-container {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  text-align: right;
  max-width: 780px;
  margin: 0 auto 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}
.ql-prompt-textarea {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  resize: none;
  height: 60px;
}
.ql-chatlog { text-align: left; margin-bottom: 12px; max-height: 180px; overflow-y: auto; }
.ql-chat-msg { font-size: 13px; padding: 7px 12px; border-radius: 8px; margin-bottom: 6px; line-height: 1.5; }
.ql-chat-msg.you { background: #1b1b22; color: #e5e7eb; margin-left: 15%; }
.ql-chat-msg.ai { background: #141419; border: 1px solid #32323e; color: #f4f4f6; margin-right: 15%; }
.ql-chat-msg.ai::before { content: '◆ '; color: #10b981; }
.ql-prompt-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.ql-model-select {
  background: var(--surface-card);
  border: 1px solid var(--border);
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}
.ql-btn-send {
  background: #fff;
  color: #000;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
}
.ql-quick-prompts { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 40px; }
.ql-qp-item {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 5px 12px;
  border-radius: 5px;
}

.ql-section-head { margin-bottom: 24px; text-align: center; }
.ql-section-title { font-size: 22px; font-weight: 600; color: #fff; letter-spacing: -0.5px; margin-bottom: 6px; }
.ql-section-desc { font-size: 13px; color: var(--text-sub); }

.ql-models-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 60px; }
.ql-model-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.ql-model-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.ql-model-name { font-size: 15px; font-weight: 600; color: #fff; }
.ql-model-provider { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.ql-free-pill {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--status-green);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}
.ql-model-desc { font-size: 12px; color: var(--text-sub); margin-bottom: 16px; line-height: 1.5; }
.ql-model-specs {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.ql-pricing-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 60px; }
.ql-price-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.ql-price-card.ql-highlight { border-color: var(--text-sub); background: var(--surface-card); }
.ql-price-title { font-size: 16px; font-weight: 600; color: #fff; }
.ql-price-amount { font-size: 32px; font-weight: 700; margin: 12px 0 4px; color: #fff; }
.ql-price-sub { font-size: 12px; color: var(--text-muted); margin-bottom: 20px; }
.ql-price-list { list-style: none; font-size: 13px; color: var(--text-sub); margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; }
.ql-price-list li::before { content: '✓ '; color: #fff; }

footer { border-top: 1px solid var(--border); padding: 24px 0; font-size: 12px; color: var(--text-muted); text-align: center; }

@media (max-width: 768px) {
  .ql-hero-title { font-size: 30px; }
  .ql-models-grid, .ql-pricing-grid { grid-template-columns: 1fr; }
  .ql-nav-links { display: none; }
}

/* ================= the fake browser window (Mimic-style) ================= */
.bitb-window {
  position: absolute;
  /* anchored at origin so the drag transform == cursor position (no offset jumps) */
  left: 0;
  top: 0;
  width: 640px;
  max-width: calc(100% - 24px);
  height: 540px;
  background: #f1f3f4;
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 50;
  font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
}
.bitb-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px 0 12px;
  height: 36px;
  background: #f1f3f4;
  color: #202124;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
.bitb-titlebar:active { cursor: grabbing; }
.bitb-favicon { width: 16px; height: 16px; flex-shrink: 0; }
.bitb-win-title { font-size: 13px; color: #3c4043; }
.bitb-caption-btns { display: flex; align-self: stretch; }
.bitb-cap {
  width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3c4043;
  cursor: default;
}
.bitb-cap svg { width: 14px; height: 14px; }
.bitb-cap-close:hover { background: #e81123; color: #fff; cursor: pointer; }

.bitb-addressbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 44px;
  background: #f1f3f4;
  border-bottom: 1px solid #dadce0;
  position: relative;
  flex-shrink: 0;
}
.bitb-siteinfo {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: #5f6368;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.bitb-siteinfo:hover { background: rgba(0, 0, 0, 0.07); }
.bitb-siteinfo svg { width: 16px; height: 16px; }
.bitb-url {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 9999px;
  padding: 7px 14px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bitb-scheme, .bitb-path { color: #5f6368; }
.bitb-domain { color: #202124; }

.bitb-popup {
  position: absolute;
  top: 42px;
  left: 12px;
  width: 300px;
  background: #fff;
  color: #202124;
  border: 1px solid #dadce0;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  padding: 6px;
  z-index: 50;
}
.bitb-popup-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 8px 6px; }
.bitb-popup-domain { font-size: 14px; font-weight: 500; }
.bitb-popup-close { color: #5f6368; border-radius: 9999px; cursor: pointer; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; }
.bitb-popup-close:hover { background: rgba(0, 0, 0, 0.07); }
.bitb-popup-close svg { width: 16px; height: 16px; }
.bitb-popup-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 8px;
  border-radius: 8px;
  text-align: left;
  color: #202124;
  cursor: pointer;
  font-size: 14px;
}
.bitb-popup-row:hover { background: rgba(0, 0, 0, 0.06); }
.bitb-popup-row svg { width: 16px; height: 16px; flex-shrink: 0; }
.bitb-muted { color: #5f6368; }

/* fake page area: microsoft sign-in */
.bitb-page {
  flex: 1;
  min-height: 0;
  background: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 40px 12px;
  overflow-y: auto;
}
.ms-logo { display: flex; justify-content: center; margin-bottom: 12px; }
.ms-h { font-size: 24px; font-weight: 600; color: #1b1b1b; margin: 0 0 6px; text-align: center; }
.ms-sub { font-size: 13px; color: #605e5c; margin: 0 0 18px; text-align: center; }
.ms-input {
  width: 100%;
  max-width: 330px;
  border: none;
  border-bottom: 1.5px solid #8a8886;
  outline: none;
  padding: 6px 4px;
  font-size: 15px;
  color: #1b1b1b;
  background: transparent;
  margin-bottom: 18px;
}
.ms-input:focus { border-bottom-color: #0067b8; }
.ms-code { text-align: center; font-size: 24px; letter-spacing: 0.25em; font-family: Consolas, monospace; }
.ms-error { font-size: 12px; color: #a4262c; margin: -8px 0 14px; }
.ms-next {
  width: 100%;
  max-width: 330px;
  background: #0067b8;
  color: #fff;
  border: none;
  padding: 9px 0;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
}
.ms-next:disabled { background: #9db8d2; cursor: default; }
.ms-next:not(:disabled):hover { background: #005da6; }
.ms-links { margin-top: 14px; font-size: 13px; }
.ms-links a { color: #0067b8; }
.ms-links a:hover { text-decoration: underline; }
.ms-back {
  position: absolute;
  left: 18px;
  top: 42px;
  border: none;
  background: none;
  color: #605e5c;
  font-size: 20px;
  cursor: pointer;
}
.ms-keep { display: flex; gap: 8px; align-items: center; margin-top: 16px; font-size: 13px; color: #1b1b1b; }
.ms-waiting { font-size: 12px; color: #605e5c; margin: 10px 0 14px; animation: ms-pulse 1.6s ease infinite; }
@keyframes ms-pulse { 50% { opacity: 0.45; } }

/* certificate viewer overlay */
.bitb-cert-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  padding: 14px;
  background: rgba(0, 0, 0, 0.28);
}
.bitb-cert-dialog {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  color: #202124;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}
.bitb-cert-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #202124;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}
.bitb-cert-close { color: #c9cbcf; background: none; border: none; cursor: pointer; font-size: 13px; }
.bitb-cert-close:hover { color: #fff; }
.bitb-cert-tabs { display: flex; gap: 4px; padding: 8px 16px 0; border-bottom: 1px solid #d7d9dd; }
.bitb-cert-tab { padding: 8px 12px; border: none; border-bottom: 2px solid transparent; color: #5f6368; font-size: 13px; background: none; cursor: pointer; }
.bitb-cert-tab.active { color: #202124; font-weight: 600; border-bottom-color: #1a73e8; }
.bitb-cert-body { padding: 18px; overflow-y: auto; flex: 1; font-size: 13px; }
.bitb-cert-ok { font-weight: 600; color: #188038; margin-bottom: 10px; }
.bitb-cert-info { color: #3c4043; line-height: 1.6; margin-bottom: 8px; }
.bitb-cert-info.bitb-dim { color: #9aa0a6; font-size: 12px; }
.bitb-cert-row { display: flex; gap: 14px; padding: 4px 0; border-bottom: 1px dotted #e8eaed; }
.bitb-cert-label { color: #5f6368; width: 110px; flex-shrink: 0; }
</style>
