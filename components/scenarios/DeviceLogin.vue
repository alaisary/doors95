<template>
  <!-- the "genuine" Microsoft device-login page, opened in a new browser tab.
       The page is real-looking (and the domain really is Microsoft's) — the
       scam is the CODE the victim enters: it belongs to the attacker's device. -->
  <div class="dl-root">
    <div class="dl-card">
      <!-- code stage -->
      <template v-if="stage === 'code'">
        <div class="dl-mslogo" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
        </div>
        <h1 class="dl-h">Enter code</h1>
        <p class="dl-sub">Enter the code displayed on the page you came from to sign in to <b>Wadi Gate Secure Docs</b></p>
        <input
          v-model="enteredCode"
          type="text"
          class="dl-input dl-code"
          placeholder="Enter code"
          spellcheck="false"
          aria-label="Device code"
          @paste="onCodePaste"
          @keydown.enter="submitCode"
        >
        <p v-if="codeError" class="dl-error">We didn't recognize that code. Please try again.</p>
        <button class="dl-btn" :disabled="!enteredCode" @click="submitCode">Continue</button>
        <div class="dl-links"><a href="#" @click.prevent>Sign-in help</a></div>
      </template>

      <!-- account stage: the browser already has a Microsoft session, so no typing is needed (this is what really happens) -->
      <template v-else-if="stage === 'account'">
        <div class="dl-mslogo" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
        </div>
        <h1 class="dl-h">Pick an account</h1>
        <p class="dl-sub">to continue to Wadi Gate Secure Docs</p>
        <button class="dl-acct" @click="pickAccount">
          <span class="dl-av">SA</span>
          <span class="dl-who"><b>Salim Al Harthi</b><small>s.alharthi@wadigate.om</small><small class="dl-ok">Connected to Windows &middot; signed in</small></span>
        </button>
        <button class="dl-acct dl-other" @click="stage = 'email'">
          <span class="dl-av dl-plus">+</span>
          <span class="dl-who"><b>Use another account</b></span>
        </button>
      </template>

      <!-- confirm stage: Microsoft's own "are you trying to sign in" check -->
      <template v-else-if="stage === 'confirm'">
        <div class="dl-mslogo" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
        </div>
        <h1 class="dl-h">Are you trying to sign in to Wadi Gate Secure Docs?</h1>
        <p class="dl-sub">s.alharthi@wadigate.om<br>Only continue if you downloaded the app from a store or website that you trust.</p>
        <button class="dl-btn" @click="authorize">Continue</button>
        <div class="dl-links"><a href="#" @click.prevent>Cancel</a></div>
      </template>

      <!-- email stage -->
      <template v-else-if="stage === 'email'">
        <div class="dl-mslogo" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
        </div>
        <h1 class="dl-h">Sign in</h1>
        <p class="dl-sub">to continue to Wadi Gate Secure Docs</p>
        <input v-model="email" type="email" class="dl-input" placeholder="Email, phone, or Skype" @input="onType">
        <button class="dl-btn" :disabled="!email" @click="stage = 'password'">Next</button>
        <div class="dl-links"><a href="#" @click.prevent>Sign-in options</a></div>
      </template>

      <!-- password stage -->
      <template v-else-if="stage === 'password'">
        <button class="dl-back" title="Back" @click="stage = 'email'">←</button>
        <h1 class="dl-h">Enter password</h1>
        <p class="dl-sub">{{ email || 's.alharthi@wadigate.om' }}</p>
        <input v-model="password" type="password" class="dl-input" placeholder="Password" @input="onType">
        <div class="dl-links"><a href="#" @click.prevent>Forgot password?</a></div>
        <button class="dl-btn" :disabled="!password" @click="submitCreds">Sign in</button>
        <label class="dl-keep"><input type="checkbox"> Keep me signed in</label>
      </template>

      <!-- mfa: the REAL authenticator code, for someone else's session -->
      <template v-else-if="stage === 'mfa'">
        <h1 class="dl-h">Enter code</h1>
        <p class="dl-sub">Enter the 6-digit code from your authenticator app to finish signing in.</p>
        <input
          v-model="mfaCode"
          type="text"
          inputmode="numeric"
          class="dl-input dl-code"
          placeholder="Enter code"
          spellcheck="false"
          @paste="onMfaPaste"
          @keydown.enter="verifyCode"
        >
        <p v-if="mfaError" class="dl-error">That code is incorrect. Please try again.</p>
        <button class="dl-btn" :disabled="mfaCode.replace(/\s/g, '').length < 6" @click="verifyCode">Verify</button>
      </template>

      <!-- done -->
      <template v-else>
        <div class="dl-mslogo" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
        </div>
        <h1 class="dl-h">You're signed in</h1>
        <p class="dl-sub">Preparing your documents…</p>
        <div class="dl-waiting">Unlocking 3 documents…</div>
      </template>

      <div class="dl-foot">login.microsoftonline.com · Privacy &amp; cookies · Terms of use</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

const stage = ref<'code' | 'account' | 'confirm' | 'email' | 'password' | 'mfa' | 'done'>('code')
const enteredCode = ref('')
const codeError = ref(false)
const email = ref('')
const password = ref('')
const mfaCode = ref('')
const mfaError = ref(false)
let typed = false

function onCodePaste(e: ClipboardEvent) {
  e.preventDefault()
  if (session.clipboard) {
    enteredCode.value = session.clipboard
    session.log('PASTED', 'sign-in code pasted into device login', 'risky')
  }
}

function submitCode() {
  if (!enteredCode.value) return
  const ok = enteredCode.value.toUpperCase().replace(/[\s-]/g, '') === session.deviceCode
  if (!ok) {
    codeError.value = true
    return
  }
  codeError.value = false
  session.flag('code_shared')
  session.log('DEVICE_CODE_ENTERED', 'attacker device code entered on the genuine Microsoft page', 'risky')
  session.timelineStep('User enters the attacker\'s device code')
  session.c2Log(`[06:57:41] [+] code ${session.deviceCode} redeemed — authorization_pending`, 'text-rose-400', 'A sign-in logged with authentication protocol deviceCode, for a user who does not normally use that flow', 'Block the device-code flow in Conditional Access')
  stage.value = 'account'
  session.coach('Code accepted — on the REAL Microsoft page. You just linked someone else\'s device session to your identity.')
}

function onType() {
  if (!typed) {
    typed = true
    session.log('TYPED_INTO_FAKE_WINDOW', 'credentials entered into the device login', 'risky')
  }
}

function submitCreds() {
  if (!email.value || !password.value) return
  session.flag('entered_credentials')
  session.log('ENTERED_CREDENTIALS', 'creds entered on the GENUINE Microsoft page (attacker never sees them)', 'risky')
  session.timelineStep('Signs in on the real Microsoft page (existing session or credentials)')
  // the creds go to the real IdP — the attacker's poller only sees the flow progress
  session.c2Log('[06:57:47] [+] victim is authenticating on the REAL login — password never touches us', 'text-emerald-300')
  session.c2Log('[06:57:48] [poll] authorization_pending…', 'text-slate-400')
  stage.value = 'mfa'
}

function onMfaPaste(e: ClipboardEvent) {
  e.preventDefault()
  if (session.clipboard) {
    mfaCode.value = session.clipboard
    session.log('PASTED', 'authenticator code pasted into device login', 'risky')
  }
}

function verifyCode() {
  const entered = mfaCode.value.replace(/\s/g, '')
  if (entered.length < 6) return
  if (entered !== session.authyCode) {
    mfaError.value = true
    return
  }
  mfaError.value = false
  authorize()
}

// the visitor's browser already had a Microsoft session: one click on the account tile, no password, no MFA prompt
function pickAccount() {
  session.log('ACCOUNT_PICKED', 'existing Microsoft session reused for the attacker\'s device', 'risky')
  session.c2Log('[06:57:47] [+] victim\'s browser was already signed in — no password, no MFA prompt', 'text-emerald-300')
  stage.value = 'confirm'
}

function authorize() {
  session.flag('approved_request')
  session.log('MFA_CODE_ACCEPTED', 'attacker device session authorized on the real Microsoft page', 'risky')
  session.timelineStep('Attacker device session authorized (token issued)')
  // the token-hijack narrative: poll flips to granted, tokens extracted,
  // then the attacker walks Entra and the mailbox with the loot
  session.c2Log('[06:57:55] [poll] authorization_granted — token endpoint → 200 OK', 'text-rose-400', 'Token issued to a client and device you do not manage, from a new location', 'Require compliant devices for token issuance')
  session.c2Log('[06:57:55] [+] ACCESS TOKEN: eyJ0eXAiOiJKV1QiLCJub25jZSI6… (1.7 KB · Mail.ReadWrite Files.Read.All)', 'text-rose-400')
  session.c2Log('[06:57:55] [+] REFRESH TOKEN: 0.AXoAr619… (90-day, auto-renewing)', 'text-rose-400', 'Mail and file API calls (Graph) from an unfamiliar IP, using a session that never prompted for a password again', 'Revoke sessions and tokens, not only the password')
  session.c2Log('[06:57:56] [entra] GET graph.microsoft.com/v1.0/me → 200 — Salim Al Harthi · Entra ID', 'text-cyan-300')
  session.c2Log('[06:57:56] [mail] GET /me/messages?$top=5 → 200 — mailbox read', 'text-cyan-300')
  session.c2Log('[06:57:57] [mail] "Q3 route optimization — final numbers" (Hamad Al Busaidi)', 'text-slate-300')
  session.c2Log('[06:57:57] [persist] refresh token stored — your password no longer matters', 'text-rose-400')
  stage.value = 'done'
  session.coach('The real code worked, for the attacker\'s device. They never saw the password; the tokens were enough.')
  session.later('device-code', 1600, () => {
    session.timelineStep('Attacker device enrolled — refresh token issued')
    // the toolkit panel already told the story — no full-screen takeover,
    // the desktop stays and Skippy offers the debrief
    session.compromise('Attacker device authorized via device code', false)
  })
}


onMounted(() => {
  session.spoiler('A real Microsoft tab. Green padlock, real domain — and the code you are about to enter belongs to someone else.')
})
</script>

<style scoped>
.dl-root {
  min-height: 100%;
  background: #f2f2f2;
  font-family: 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, Arial, sans-serif;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: calc(8 * var(--vh)) 16px 40px;
}
.dl-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  padding: 44px 44px 26px;
  position: relative;
  text-align: left;
}
.dl-mslogo { display: flex; margin-bottom: 12px; }
.dl-mslogo svg { width: 24px; height: 24px; }
.dl-h { font-size: 24px; font-weight: 600; color: #1b1b1b; margin: 0 0 12px; }
.dl-sub { font-size: 13px; color: #605e5c; margin: 0 0 16px; line-height: 1.5; }

.dl-input {
  width: 100%;
  border: none;
  border-bottom: 1.6px solid #8a8886;
  outline: none;
  padding: 6px 4px 8px;
  font-size: 15px;
  color: #1b1b1b;
  background: transparent;
  margin-bottom: 22px;
  font-family: inherit;
}
.dl-input:focus { border-bottom-color: #0067b8; }
.dl-code { text-align: center; font-size: 26px; letter-spacing: 0.22em; font-family: Consolas, monospace; }
.dl-error { font-size: 12px; color: #a4262c; margin: -12px 0 16px; }

.dl-btn {
  width: 100%;
  background: #0067b8;
  color: #fff;
  border: none;
  padding: 10px 0;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
}
.dl-btn:disabled { background: #9db8d2; cursor: default; }
.dl-btn:not(:disabled):hover { background: #005da6; }

.dl-links { margin-top: 16px; font-size: 13px; }
.dl-links a { color: #0067b8; }
.dl-links a:hover { text-decoration: underline; }
.dl-back {
  position: absolute;
  left: 20px;
  top: 48px;
  border: none;
  background: none;
  color: #605e5c;
  font-size: 20px;
  cursor: pointer;
}
.dl-acct { display: flex; gap: 14px; align-items: center; width: 100%; text-align: left; background: none; border: none; border-top: 1px solid #e1e1e1; padding: 12px 4px; cursor: pointer; font-family: inherit; }
.dl-acct:last-of-type { border-bottom: 1px solid #e1e1e1; }
.dl-acct:hover { background: #f2f2f2; }
.dl-av { flex: none; width: 40px; height: 40px; border-radius: 50%; background: #0067b8; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.dl-plus { background: none; color: #1b1b1b; border: 1px solid #8a8886; font-size: 22px; }
.dl-who { display: flex; flex-direction: column; font-size: 14px; color: #1b1b1b; }
.dl-who small { font-size: 12px; color: #605e5c; }
.dl-who .dl-ok { color: #107c10; }
.dl-keep { display: flex; gap: 8px; align-items: center; margin-top: 18px; font-size: 13px; color: #1b1b1b; }
.dl-waiting { font-size: 12px; color: #605e5c; margin: 12px 0 14px; animation: dl-pulse 1.6s ease infinite; }
@keyframes dl-pulse { 50% { opacity: 0.45; } }

.dl-foot {
  margin-top: 26px;
  padding-top: 12px;
  border-top: 1px solid #e1e1e1;
  font-size: 10.5px;
  color: #a0a0a0;
  text-align: center;
}
</style>
