<template>
  <!-- The attacker's screen, docked on the right: a tool banner, live counters, and one card per thing the visitor
       just caused. Amber says what a defender would see; green says what breaks that step. -->
  <div v-if="show" class="at-wrap">
    <div class="at-bar">
      <span class="at-dot" /> <span class="at-title">ATTACKER'S SCREEN</span>
      <span class="at-sub">live</span>
      <button class="at-btn" :title="min ? 'Show' : 'Hide'" @click="min = !min">{{ min ? '▢' : '–' }}</button>
    </div>
    <div v-show="!min">
      <div class="at-ban">
        <span class="at-name">{{ banner.name }}</span>
        <span class="at-tool">{{ banner.sub }}</span>
      </div>
      <div class="at-stats">
        <div v-for="s in stats" :key="s.label"><b>{{ s.value }}</b>{{ s.label }}</div>
      </div>
      <div ref="bodyEl" class="at-body">
        <template v-for="(l, i) in cards" :key="i">
          <div class="at-card">
            <span class="at-tag" :class="tagClass(l.tag)">{{ l.tag }}</span>
            <span class="at-tx">{{ l.text }}</span>
          </div>
          <div v-if="l.soc" class="at-soc">
            <div><b>DEFENDER SEES</b>{{ l.soc }}</div>
            <div v-if="l.stop" class="at-stop"><b>WHAT BREAKS IT</b>{{ l.stop }}</div>
          </div>
        </template>
      </div>
      <div v-if="session.flags.compromised" class="at-pay">
        <div class="at-pay-t">{{ banner.payoff.title }}</div>
        <div v-for="r in banner.payoff.rows" :key="r" class="at-pay-r">{{ r }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { attackerBanners } from '~/utils/attackerBanners'

const session = useSessionStore()
const bodyEl = ref<HTMLElement | null>(null)
const min = ref(false)

const show = computed(() =>
  session.phase === 'live' && session.c2Active && !!session.scenarioId)

const banner = computed(() => attackerBanners[session.scenarioId] ?? attackerBanners.clickfix)

// "[06:57:48] [+] password captured" becomes a HIT card reading "password captured"
function parse(l: { text: string; tag?: string }) {
  let t = l.text
  let tag = l.tag || ''
  for (;;) {
    const m = t.match(/^\[([^\]]*)\]\s*/)
    if (!m) break
    t = t.slice(m[0].length)
    if (/^\d\d:\d\d:\d\d$/.test(m[1])) continue
    if (!tag) tag = m[1] === '+' ? 'HIT' : m[1].toUpperCase()
  }
  if (!tag) {
    // lines written without a [bracket] still get a useful label
    if (/^(inbound|stage-2)/i.test(t)) tag = 'BEACON'
    else if (/^session token/i.test(t)) tag = 'PERSIST'
    else if (/^C2 SESSION/.test(t)) tag = 'HIT'
    else if (/^(listening|payload launched|key exchange|user is watching)/i.test(t)) tag = 'C2'
    else if (/^form/i.test(t)) tag = 'PAGE'
  }
  return { text: t, tag: tag || 'INFO' }
}

const cards = computed(() => session.c2Lines.map((l) => ({ ...l, ...parse(l) })))
const stats = computed(() => banner.value.stats({ lines: cards.value, flags: session.flags }))

function tagClass(t: string) {
  if (['CAPTURE', 'HIT'].includes(t)) return 'red'
  if (['RELAY', 'POLL', 'BEACON', 'HOOK', 'STEALER', 'KIT', 'C2'].includes(t)) return 'amber'
  if (['ACCESS', 'ENTRA', 'MAIL', 'PERSIST'].includes(t)) return 'violet'
  return 'grey'
}

watch(() => session.c2Lines.length, () => {
  min.value = false
  nextTick(() => { if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight })
})
</script>

<style scoped>
.at-wrap { position: fixed; right: 12px; top: calc(30 * var(--vh)); width: 370px; z-index: 8100; background: #0a1f22; border: 2px solid #b07400; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5); font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #e3f0ef; animation: at-in 0.35s ease-out; }
.at-bar { white-space: nowrap; display: flex; align-items: center; gap: 8px; padding: 5px 10px; background: linear-gradient(90deg, #4a3000, #b07400); color: #fff; font-size: 12px; font-weight: bold; letter-spacing: 0.1em; }
.at-dot { width: 8px; height: 8px; border-radius: 50%; background: #ff6161; animation: at-pulse 1.2s infinite; }
.at-sub { margin-left: auto; font-weight: normal; letter-spacing: 0; opacity: 0.8; }
.at-btn { background: none; border: none; font: inherit; font-size: 16px; line-height: 1; cursor: pointer; color: #fff; }
.at-ban { padding: 10px 14px 4px; display: flex; align-items: baseline; gap: 10px; }
.at-name { font: 700 30px 'Courier New', monospace; letter-spacing: 0.16em; color: #ffb020; }
.at-tool { font-size: 11px; color: #86a6a8; }
.at-stats { display: flex; gap: 10px; padding: 4px 14px 8px; border-bottom: 1px solid #1f4a50; }
.at-stats div { flex: 1; background: #143539; border-radius: 6px; padding: 4px 10px; font-size: 11px; color: #86a6a8; }
.at-stats b { display: block; font: 700 22px 'Courier New', monospace; color: #e3f0ef; line-height: 1.1; }
.at-body { height: calc(26 * var(--vh)); overflow-y: auto; padding: 8px 10px; }
.at-card { display: flex; gap: 8px; align-items: flex-start; margin-top: 6px; background: #0f2a2e; border: 1px solid #1f4a50; border-radius: 6px; padding: 5px 8px; font-size: 12.5px; line-height: 1.35; animation: at-in 0.3s ease-out; }
.at-tag { flex: none; font: 700 9.5px 'Courier New', monospace; letter-spacing: 0.08em; padding: 2px 6px; border-radius: 4px; margin-top: 1px; }
.at-tag.red { background: #3a1313; color: #ff8a8a; border: 1px solid #ff6161; }
.at-tag.amber { background: #3a2a08; color: #ffb020; border: 1px solid #b07400; }
.at-tag.violet { background: #2a2147; color: #c4b5fd; border: 1px solid #7c6bd6; }
.at-tag.grey { background: #143539; color: #86a6a8; border: 1px solid #1f4a50; }
.at-tx { word-break: break-word; }
.at-soc { margin: 3px 0 2px 8px; padding: 4px 8px; border-left: 3px solid #ffb020; background: rgba(255, 176, 32, 0.1); color: #ffd98a; font-size: 11.5px; line-height: 1.4; }
.at-soc b { margin-right: 6px; color: #ffb020; font-size: 9px; letter-spacing: 0.12em; }
.at-stop { margin-top: 3px; color: #bff0d6; border-top: 1px dashed #2a5a4a; padding-top: 3px; }
.at-stop b { color: #4cd08e; }
.at-pay { padding: 8px 14px 10px; border-top: 2px solid #ff6161; background: #2a1212; animation: at-in 0.4s ease-out; }
.at-pay-t { font-weight: 700; letter-spacing: 0.1em; font-size: 13px; color: #ff8a8a; margin-bottom: 4px; }
.at-pay-r { font-size: 12px; line-height: 1.5; color: #f3d6d6; }
.at-pay-r::before { content: '\2713\00a0'; color: #ff8a8a; }
@keyframes at-pulse { 50% { opacity: 0.3; } }
@keyframes at-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
</style>
