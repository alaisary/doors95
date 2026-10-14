<template>
  <!-- THE LURE: a pixel-faithful clone of the government "Ejada" login — hosted
       on ejada.gov.om.workers.dev. The real domain is workers.dev. -->
  <div class="ej-root" dir="rtl">
    <div class="ej-limiter">
      <div class="ej-container">
        <div class="ej-wrap">
          <!-- form side (cloned from إجــادة.html) -->
          <form class="ej-form" @submit.prevent="submit">
            <span class="ej-title">تسجيل الدخول</span>
            <span v-if="harvested" class="ej-msg">تم إرسال البيانات…</span>

            <div class="ej-input-wrap">
              <input v-model="username" class="ej-input" type="text" autocomplete="off" @input="onType">
              <span class="ej-label">اسم المستخدم</span>
            </div>

            <div class="ej-input-wrap">
              <input v-model="password" class="ej-input" type="password" autocomplete="off" @input="onType">
              <span class="ej-label">كلمة المرور</span>
            </div>

            <div class="ej-links">
              <a href="#" class="ej-forgot" @click.prevent>نسيت كلمة المرور</a>
              <a href="#" class="ej-english" @click.prevent>English</a>
            </div>

            <button type="submit" class="ej-btn" :disabled="!username || !password">دخــول</button>
          </form>

          <!-- branding side (extracted from the original page) -->
          <div class="ej-more">
            <img src="/images/ejada-side.png" alt="إجادة" draggable="false">
          </div>
        </div>

        <a href="#" class="ej-home" @click.prevent="homeNudge">
          <b>الرئيسية</b>
        </a>
      </div>
    </div>

    <!-- ===== URL ANATOMY: the whole lesson in one overlay ===== -->
    <div v-if="anatomyOpen" class="ej-anatomy" @click.self="anatomyOpen = false">
      <div class="ej-anatomy-card" dir="ltr">
        <div class="ej-anatomy-head">Where is this page really hosted?</div>

        <!-- the hostname, segmented and annotated -->
        <div class="ej-anatomy-url">
          <div class="ej-seg-group">
            <div class="ej-seg-label bad">attacker chooses these labels</div>
            <div class="ej-seg bad">
              <span class="ej-part">ejada</span><span class="ej-dot">.</span><span class="ej-part">gov</span><span class="ej-dot">.</span><span class="ej-part">om</span>
            </div>
          </div>
          <div class="ej-dot big">.</div>
          <div class="ej-seg-group">
            <div class="ej-seg-label real">← the registrable domain</div>
            <div class="ej-seg real"><span class="ej-part">workers</span><span class="ej-dot">.</span><span class="ej-part">dev</span></div>
          </div>
        </div>

        <p class="ej-anatomy-text">
          <b>Read a hostname right-to-left.</b> The registrable domain — the part that says who
          owns the server — is the last two labels before the first single slash:
          <b class="ej-realtext">workers.dev</b>. That is a free Cloudflare Workers host.
          Everything to its left — including <span class="ej-badtext">ejada.gov.om</span> — is just
          subdomain labels that <b>whoever created this worker picked</b>. The real portal lives at
          <b>ejada.gov.om</b>, full stop.
        </p>

        <div class="ej-anatomy-note">
          A padlock means "the connection is encrypted" — it says nothing about who you are talking to.
        </div>

        <button class="ej-anatomy-close" @click="anatomyOpen = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import emitter from '~/components/misc/eventHandler'

const session = useSessionStore()

const username = ref('')
const password = ref('')
const harvested = ref(false)
const anatomyOpen = ref(false)
let typed = false

onMounted(() => {
  session.timelineStep('Cloned "Ejada" login served from ejada.gov.om.workers.dev')
  session.c2Start()
  session.c2Log('[kit] clone served from ejada.gov.om.workers.dev, waiting for a login', 'text-slate-300', 'DNS and proxy hit for a brand keyword inside a hostname on a free-hosting domain', 'Block or isolate sign-in pages on free-hosting platforms')
  session.coach('It looks exactly like إجادة — but read the address bar. Not sure what you are looking at? Ask me: I can explain the address.')
})

// Skippy's "EXPLAIN THE ADDRESS" button opens the anatomy overlay
function openAnatomy() {
  anatomyOpen.value = true
  session.flag('inspected_url')
  session.log('URL_ANATOMY_OPENED', 'user inspected the hostname anatomy', 'safe')
}
emitter.on('explainUrl', openAnatomy)
onUnmounted(() => emitter.off('explainUrl', openAnatomy))

function onType() {
  if (!typed) {
    typed = true
    session.log('TYPED_INTO_FAKE_WINDOW', 'government portal credentials typed into clone', 'risky')
  }
}

function submit() {
  if (!username.value || !password.value) return
  harvested.value = true
  session.flag('entered_credentials')
  session.log('CREDENTIALS_HARVESTED', 'Ejada username + password submitted to workers.dev clone', 'risky')
  session.timelineStep('Government portal credentials harvested')
  session.c2Log(`[kit] POST /login captured: ${username.value} / ********`, 'text-rose-400', 'The form post is encrypted, so only a TLS-inspecting proxy would log it. Without one, the earlier DNS and proxy hit is the only signal.', 'Origin-bound password managers refuse to fill on a look-alike')
  session.c2Log('[bot] new login forwarded to the operator chat', 'text-slate-300')
  session.coach('Those credentials went to whoever created that workers.dev site, not to the ministry.')
  session.later('ejada', 1400, () => {
    session.c2Log('[+] portal login with the captured credentials: 200 OK, account takeover', 'text-rose-400', 'If the portal logs sign-ins: a login from a new IP and device soon after the clone was visited', 'Alerts on new-device sign-ins to the portal')
    session.compromise('Government portal credentials harvested from domain-confusion clone', false)
  })
}

function homeNudge() {
  session.log('REAL_SITE_LINK_CLICKED', 'user looked for the real portal', 'safe')
  session.coach('Good instinct — but reach government portals from your own bookmark or by typing ejada.gov.om, never from a page like this.')
}
</script>

<style scoped>
.ej-root {
  min-height: 100%;
  background: #fff;
  font-family: 'Droid Arabic Kufi', 'Segoe UI', Tahoma, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ---------- cloned login layout ---------- */
.ej-limiter { width: 100%; display: flex; justify-content: center; padding: 18px 12px 40px; }
.ej-container { width: 100%; max-width: 900px; }
.ej-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  direction: rtl;
}
.ej-form {
  width: 400px;
  background: #fff;
  padding: 26px 24px;
  display: flex;
  flex-direction: column;
}
.ej-title {
  font-size: 19px;
  color: #403866;
  text-align: center;
  margin-bottom: 18px;
}
.ej-msg {
  text-align: center;
  color: #37d3c4;
  font-size: 13px;
  margin-bottom: 10px;
}
.ej-input-wrap {
  position: relative;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  margin-bottom: 12px;
  height: 56px;
  display: flex;
  align-items: flex-end;
}
.ej-input-wrap:focus-within { border-color: #6675df; }
.ej-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 0 16px 10px;
  font-size: 15px;
  color: #555;
  font-family: inherit;
}
.ej-label {
  position: absolute;
  top: 8px;
  right: 16px;
  font-size: 13px;
  color: #999;
  pointer-events: none;
}
.ej-links {
  display: flex;
  justify-content: space-between;
  margin: 6px 0 18px;
  font-size: 13px;
}
.ej-forgot { color: blue; text-decoration: underline; }
.ej-english { color: #55c3bb; text-decoration: underline; }
.ej-btn {
  background: #37d3c4;
  border: none;
  color: #fff;
  font-family: inherit;
  font-size: 16px;
  padding: 12px 0;
  border-radius: 8px;
  cursor: pointer;
}
.ej-btn:disabled { background: #a8e2dd; cursor: default; }
.ej-btn:not(:disabled):hover { background: #2ab7a9; }

.ej-more {
  flex: 1;
  min-width: 260px;
  overflow: hidden;
  border-radius: 10px;
}
.ej-more img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ej-home {
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #37d3c4;
  font-size: 14px;
}

/* ---------- URL anatomy overlay ---------- */
.ej-anatomy {
  position: absolute;
  inset: 0;
  z-index: 60;
  background: rgba(20, 24, 40, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.ej-anatomy-card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 14px;
  padding: 26px 30px 22px;
  font-family: 'Segoe UI', Arial, sans-serif;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
}
.ej-anatomy-head {
  font-size: 18px;
  font-weight: 700;
  color: #202124;
  margin-bottom: 18px;
  text-align: center;
}
.ej-anatomy-url {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.ej-seg-group { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.ej-seg-label { font-size: 10px; letter-spacing: 0.04em; }
.ej-seg-label.bad { color: #c5221f; }
.ej-seg-label.real { color: #188038; }
.ej-seg {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-family: Consolas, monospace;
  font-size: 20px;
}
.ej-seg.bad { background: #fce8e6; color: #c5221f; }
.ej-seg.real { background: #e6f4ea; color: #137333; }
.ej-dot { font-weight: 700; color: #5f6368; }
.ej-dot.big { font-size: 22px; padding-bottom: 8px; }
.ej-anatomy-text {
  font-size: 14px;
  color: #3c4043;
  line-height: 1.65;
  margin: 0 0 14px;
}
.ej-realtext { color: #137333; }
.ej-badtext {
  color: #c5221f;
  font-family: Consolas, monospace;
  font-size: 13px;
}
.ej-anatomy-note {
  background: #fef7e0;
  border: 1px solid #f9ab00;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12.5px;
  color: #7c5a00;
  margin-bottom: 16px;
}
.ej-anatomy-close {
  display: block;
  margin: 0 auto;
  background: #1a73e8;
  border: none;
  color: #fff;
  border-radius: 8px;
  padding: 10px 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.ej-anatomy-close:hover { background: #1765cc; }
</style>
