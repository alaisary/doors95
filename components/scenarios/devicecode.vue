<template>
  <!-- THE LURE: blurred files + a pop-up telling the target to sign in with
       Microsoft. The sign-in code belongs to the ATTACKER's device. -->
  <div class="min-h-full relative dc-root">
    <!-- blurred documents in the background -->
    <div class="dc-bg" aria-hidden="true">
      <div v-for="f in files" :key="f.name" class="dc-file">
        <svg viewBox="0 0 24 24" class="dc-file-icon"><path fill="#d93025" d="M6 2h9l5 5v15H6z"/><path fill="#f3f5f7" d="M15 2l5 5h-5z"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="6" font-weight="700">PDF</text></svg>
        <span class="dc-file-name">{{ f.name }}</span>
        <span class="dc-file-size">{{ f.size }}</span>
      </div>
    </div>

    <!-- the pop-up -->
    <div class="dc-popup">
      <div class="dc-ms-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
        </svg>
      </div>
      <h1 class="dc-pop-title">Protected documents</h1>
      <p class="dc-pop-sub">Microsoft 365 &middot; shared by Hamad Al Busaidi &middot; expires in 7 days</p>

      <div class="dc-docs">
        <div class="dc-doc"><span>Q3_Fleet_Audit.pdf</span><span class="dc-doc-lock">🔒</span></div>
        <div class="dc-doc"><span>Route_Optimization_v2.pdf</span><span class="dc-doc-lock">🔒</span></div>
        <div class="dc-doc"><span>HarborCrest_INV-2291.pdf</span><span class="dc-doc-lock">🔒</span></div>
      </div>

      <p class="dc-pop-note">
        Sign in with your Microsoft account to view these files.<br>
        <span class="dc-pop-dim">Your organization uses secure document access — the sign-in page opens in a new tab.</span>
      </p>

      <!-- the attacker's device code — clickable, it lands on the OS clipboard -->
      <div class="dc-codebox">
        <div class="dc-codelabel">Sign-in code</div>
        <button class="dc-code" title="Click to copy" @click="copyCode">{{ accessCode }}</button>
        <span class="dc-copied" :class="{ show: copied }">copied — paste it on the sign-in page</span>
      </div>

      <button class="dc-viewfiles" @click="openSignin">View Files</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import emitter from '~/components/misc/eventHandler'

const session = useSessionStore()

// the attacker's device code, MS-style (no ambiguous characters) — shared with
// the Device Login tab via the session store
const CODE_CHARS = 'BCDFGHJKMNPQRSTUVWXYZ23456789'
const accessCode = ref(
  Array.from({ length: 8 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
)

// blurred background files
const files = [
  { name: 'Q3_Fleet_Audit.pdf', size: '2.4 MB' },
  { name: 'Route_Optimization_v2.pdf', size: '1.1 MB' },
  { name: 'HarborCrest_INV-2291.pdf', size: '310 KB' },
  { name: 'Driver_Rosters_Sept.pdf', size: '890 KB' },
]

const copied = ref(false)

onMounted(() => {
  session.deviceCode = accessCode.value
  session.timelineStep('Blurred-files lure: "sign in with Microsoft to view"')
})

// clicking the code puts it on the simulated OS clipboard (paste it anywhere)
function copyCode() {
  session.clipboard = accessCode.value
  copied.value = true
  session.log('CODE_COPIED', 'sign-in code copied to clipboard', 'neutral')
  session.spoiler('Copied. That code was generated on someone else\'s machine — you are holding their house key.')
}

function openSignin() {
  session.log('MS_SIGNIN_CLICKED', 'lure page sent the victim to the "genuine" Microsoft sign-in tab', 'risky')
  session.timelineStep('Microsoft device-login page opened in a new tab')
  // the attacker's token toolkit lights up in the corner
  session.c2Start()
  session.c2Log(`[06:57:33] [+] victim landed on docs.wadigate-portal.com — code displayed: ${accessCode.value}`, 'text-emerald-300')
  session.c2Log('[06:57:34] [poll] authorization_pending…', 'text-slate-400')
  session.spoiler('The real Microsoft sign-in, in a new tab. The page is genuine — the code is theirs.')
  // open the device-login page as a real new browser tab
  emitter.emit('openPage', 'Device Login')
  useOpenWindowsStore().openWindow('Browser')
}
</script>

<style scoped>
.dc-root {
  background: #14181f;
  font-family: 'Segoe UI', system-ui, Arial, sans-serif;
  color: #1f2430;
  overflow: hidden;
}

/* ---------- blurred files background ---------- */
.dc-bg {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 22px;
  padding: 70px 34px 40px;
  filter: blur(7px) saturate(0.7);
  opacity: 0.75;
  pointer-events: none;
  user-select: none;
}
.dc-file {
  background: #fff;
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
.dc-file-icon { width: 40px; height: 40px; }
.dc-file-name { font-size: 13px; font-weight: 600; color: #202124; word-break: break-all; }
.dc-file-size { font-size: 11px; color: #5f6368; }

/* ---------- the pop-up ---------- */
.dc-popup {
  position: relative;
  z-index: 5;
  max-width: 480px;
  margin: calc(7 * var(--vh)) auto 60px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  padding: 34px 36px 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.dc-ms-mark { width: 44px; height: 44px; margin-bottom: 12px; }
.dc-ms-mark svg { width: 100%; height: 100%; display: block; }
.dc-pop-title { font-size: 24px; font-weight: 700; margin: 0 0 4px; color: #1a1a1a; }
.dc-pop-sub { font-size: 12.5px; color: #5f6368; margin: 0 0 18px; }

.dc-docs {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.dc-doc {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f6f8fb;
  border: 1px solid #e8ebf0;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 12.5px;
  color: #3c4043;
}
.dc-doc-lock { font-size: 12px; }

.dc-pop-note { font-size: 13.5px; color: #202124; line-height: 1.55; margin: 0 0 16px; }
.dc-pop-dim { font-size: 12px; color: #5f6368; }

.dc-codebox {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f5f9ff;
  border: 1.5px dashed #7aa7e8;
  border-radius: 10px;
  padding: 10px 18px;
  margin-bottom: 18px;
  flex-wrap: wrap;
  justify-content: center;
}
.dc-codelabel { font-size: 11px; color: #315a9d; letter-spacing: 0.06em; font-weight: 600; }
.dc-code {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #0067b8;
  background: none;
  border: none;
  cursor: copy;
  padding: 0;
}
.dc-code:hover { text-decoration: underline; }
.dc-copied {
  font-size: 10.5px;
  color: #217346;
  opacity: 0;
  transition: opacity 0.25s;
}
.dc-copied.show { opacity: 1; }

.dc-viewfiles {
  background: #0067b8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 40px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.dc-viewfiles:hover { background: #005da6; }
</style>
