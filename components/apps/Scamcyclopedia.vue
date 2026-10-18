<template>
  <div class="sc-root">
    <!-- sidebar: the attacks from your shift, then the general field guide -->
    <aside class="sc-side">
      <input v-model="query" class="sc-search" placeholder="Search the field guide" spellcheck="false">

      <div class="sc-sec">YOUR SHIFT <span class="sc-count">{{ collected }}/{{ live.length }}</span></div>
      <button
        v-for="e in live"
        :key="e.id"
        class="sc-row"
        :class="{ on: sel === 'live:' + e.id, locked: !e.met }"
        @click="sel = 'live:' + e.id"
      >
        <template v-if="e.met">
          <span class="sc-dot" :style="{ background: e.color }"></span>
          <span class="sc-name">{{ e.chip }}</span>
          <span class="sc-mark" :class="e.outcome">{{ e.outcome === 'compromised' ? '!' : '✓' }}</span>
        </template>
        <template v-else>
          <span class="sc-dot off"></span>
          <span class="sc-name">???</span>
        </template>
      </button>

      <div class="sc-sec">FIELD GUIDE</div>
      <button
        v-for="(g, i) in guide"
        :key="g.title"
        class="sc-row"
        :class="{ on: sel === 'guide:' + g.title }"
        @click="sel = 'guide:' + g.title"
      >
        <span class="sc-dot guide"></span>
        <span class="sc-name">{{ g.title }}</span>
      </button>
      <div v-if="!guide.length" class="sc-none">No match.</div>
    </aside>

    <main class="sc-main">
      <!-- an attack you have not met yet: nothing is named, so nothing is spoiled -->
      <template v-if="liveSel && !liveSel.met">
        <h2 class="sc-title">???</h2>
        <p class="sc-lead">Not met yet. Handle the messages in your mailbox, and each one unlocks here.</p>
      </template>

      <!-- an attack you met: the same short card as the debrief, plus the deeper layer -->
      <template v-else-if="liveSel">
        <h2 class="sc-title" :style="{ color: liveSel.color }">{{ liveSel.chip }}</h2>
        <div class="sc-sub">{{ liveSel.technique.name }}</div>
        <div class="sc-met">You met this one: "{{ liveSel.title }}" — {{ liveSel.outcome === 'compromised' ? 'it worked' : 'you caught it' }}.</div>

        <div class="sc-grid">
          <div>
            <div v-if="shot" class="sc-hero" :style="{ aspectRatio: `${shot.w} / ${shot.h}` }">
              <img :src="`/art/debrief/${liveSel.card.hero}.png`" alt="" draggable="false">
              <div class="sc-ring" :style="{ left: shot.x + '%', top: shot.y + '%', width: shot.cw + '%', height: shot.ch + '%' }"></div>
            </div>
            <div class="sc-tell">{{ liveSel.card.tell }}</div>
          </div>
          <div class="sc-side-col">
            <div class="sc-tag">RULE</div><div class="sc-rule">{{ liveSel.card.rule }}</div>
            <div class="sc-tag">HABIT</div><div class="sc-habit">{{ liveSel.card.habit }}</div>
            <div v-if="liveSel.stats?.length" class="sc-stat">{{ liveSel.stats[0].text }}<span v-if="liveSel.stats[0].source"> ({{ liveSel.stats[0].source }}, {{ liveSel.stats[0].year }})</span></div>
          </div>
        </div>

        <div class="sc-tag mt">HOW IT SHOWS UP</div>
        <div class="sc-chips"><span v-for="v in liveSel.technique.variants" :key="v.label" class="sc-chip" :title="v.desc">{{ v.label }}</span></div>
        <div class="sc-tag mt">CONTROLS FOR IT AND SECURITY</div>
        <div class="sc-chips"><span v-for="c in liveSel.controls" :key="c.label" class="sc-chip ctl" :title="c.detail">{{ c.label }}</span></div>
        <div class="sc-src">Sources:
          <span v-for="(s, i) in liveSel.sources" :key="s.title" :title="`${s.title} (${s.date})`">{{ s.publisher }}<span v-if="i < liveSel.sources.length - 1">, </span></span>
        </div>
      </template>

      <!-- the general field guide -->
      <template v-else-if="guideSel">
        <h2 class="sc-title">{{ guideSel.title }}</h2>
        <p class="sc-lead">{{ guideSel.description }}</p>
        <div class="sc-tag">HOW TO DETECT</div>
        <ul class="sc-list"><li v-for="tip in guideSel.detection" :key="tip">{{ tip }}</li></ul>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const session = useSessionStore()
const reg = useScenarioRegistry()

// Attacks you have not met are shown as "???": the app must not name the bait before you have seen it.
// Set to false to show every attack from the start.
const LOCK_UNMET = true

const query = ref('')
const sel = ref('guide:Phishing')

const live = computed(() => reg.list.map((s) => {
  const met = !LOCK_UNMET || session.completedScenarios.includes(s.id)
  return { ...s, met, chip: s.card.chip, color: s.card.color, outcome: session.outcomes[s.id] ?? 'resisted' }
}))
const collected = computed(() => reg.list.filter((s) => session.completedScenarios.includes(s.id)).length)

const guide = computed(() => {
  const q = query.value.trim().toLowerCase()
  return !q ? FIELD_GUIDE : FIELD_GUIDE.filter((g) => (g.title + ' ' + g.description).toLowerCase().includes(q))
})

const liveSel = computed(() => sel.value.startsWith('live:') ? live.value.find((e) => 'live:' + e.id === sel.value) : null)
const guideSel = computed(() => FIELD_GUIDE.find((g) => 'guide:' + g.title === sel.value) ?? FIELD_GUIDE[0])
const shot = computed(() => (liveSel.value ? DEBRIEF_SHOTS[liveSel.value.card.hero] : null))

// the general field guide: text kept as it was written, no new claims
const FIELD_GUIDE = [
    {
        title: 'Quishing (QR Phishing)',
        description:
            'QR codes in emails, posters or parking meters hide their destination — you cannot hover a QR code. Scanning can start an attacker\'s device flow or open a lookalike login.',
        detection: [
            'Never scan QR codes from unexpected emails.',
            'Preview the URL your scanner shows before opening it.',
            'Type critical portal addresses manually instead of scanning.',
            'Same rules as links apply — the QR is just a link you cannot read.',
        ],
    },
    {
        title: 'MFA Fatigue (Push Bombing)',
        description:
            'The attacker who already has your password spams MFA push approvals hoping you tap "Approve" to make it stop — often at 2 a.m., often with number matching hints via a follow-up call.',
        detection: [
            'Any MFA prompt you did not initiate: deny.',
            'Never read number-matching digits to a caller.',
            'Enable number matching and rate limiting on push approvals.',
            'A denied prompt flood means your password is compromised — change it.',
        ],
    },
    {
        title: 'Rogue RMM (ScreenConnect abuse)',
        description:
            'Fake "Adobe Reader update" pages (BITB with a legitimate-looking get.adobe.com URL) deliver installers for remote-management tools like ScreenConnect. The attacker uses your legitimate software against you for persistent access.',
        detection: [
            'Only download updates from the vendor\'s official site or built-in updaters.',
            'Alert on RMM tools nobody in your org deployed.',
            'Watch for executables launched from the Downloads folder.',
            'One detected RMM instance often means a second is already installed.',
        ],
    },
    {
        title: 'Phishing',
        description:
            'Phishing scams try to trick you into giving away sensitive information by pretending to be a trustworthy entity.',
        detection: [
            'Check the sender’s email address carefully.',
            'Look for generic greetings and urgent language.',
            'Hover over links to see their real destination.',
            'Never enter credentials on suspicious sites.',
        ],
    },
    {
        title: 'Typosquatting',
        description:
            'Typosquatting involves registering domain names similar to popular sites to trick users into visiting fake websites.',
        detection: [
            'Double-check website URLs for misspellings.',
            'Bookmark important sites and use those links.',
            'Be wary of sites with unusual domain extensions.',
        ],
    },
    {
        title: 'Tech Support Scam',
        description:
            'Scammers pretend to be tech support and claim your device is infected, asking for remote access or payment.',
        detection: [
            'Unsolicited calls or pop-ups claiming issues are suspicious.',
            'Legitimate companies do not ask for remote access unexpectedly.',
            'Never give payment info to unknown callers.',
        ],
    },
    {
        title: 'Lottery Scam',
        description:
            'You are told you have won a lottery or prize, but must pay a fee or provide personal info to claim it.',
        detection: [
            'You can’t win a lottery you didn’t enter.',
            'Legitimate prizes never require upfront payment.',
            'Look for poor grammar and urgent requests.',
        ],
    },
    {
        title: 'Fake Download Sites',
        description:
            'Fake download sites often offer pirated or cracked software, but actually distribute malware or adware.',
        detection: [
            'Avoid downloading software from unofficial or suspicious sites.',
            'Check for excessive ads, pop-ups, or forced downloads.',
            'Verify file hashes or signatures when possible.',
            'Prefer open-source or official vendor sites.',
        ],
    },
    {
        title: 'Social Engineering',
        description:
            'Social engineering scams manipulate people into revealing confidential information or performing actions that compromise security.',
        detection: [
            'Be cautious of urgent requests for sensitive info.',
            'Verify identities before sharing information.',
            'Do not share passwords or codes, even if asked by someone you know.',
            'Watch for emotional manipulation or pressure tactics.',
        ],
    },
    {
        title: 'Fake Browser Extensions',
        description:
            'Malicious browser extensions may claim to add features but actually steal data or inject ads.',
        detection: [
            'Install extensions only from official browser stores.',
            'Check reviews, permissions, and publisher reputation.',
            'Regularly review and remove unused extensions.',
            'Be wary of extensions asking for excessive permissions.',
        ],
    },
    {
        title: 'Malicious Email Attachments',
        description:
            'Scammers send emails with attachments containing malware, often disguised as invoices, resumes, or important documents.',
        detection: [
            'Do not open attachments from unknown or unexpected sources.',
            'Check file extensions and scan attachments with antivirus software.',
            'Be cautious of urgent or alarming messages with attachments.',
            'Verify with the sender if unsure about an attachment.',
        ],
    },
    {
        title: 'Fake Update Prompts',
        description:
            'Pop-ups or websites may prompt you to install fake updates, which actually install malware.',
        detection: [
            'Update software only through official channels or built-in updaters.',
            'Ignore unsolicited update prompts from websites.',
            'Check for browser warnings about deceptive sites.',
        ],
    },
    {
        title: 'Impersonation Scams',
        description:
            'Attackers impersonate trusted contacts or organizations to trick you into sharing information or money.',
        detection: [
            'Verify requests for sensitive info through a separate communication channel.',
            'Look for subtle differences in email addresses or usernames.',
            'Be skeptical of urgent or unusual requests from known contacts.',
        ],
    },
]
</script>

<style scoped>
.sc-root { display: flex; width: 100%; height: 100%; background: #c0c0c0; color: #000; font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif; }
.sc-side { width: 270px; flex-shrink: 0; overflow-y: auto; padding: 10px; border-right: 2px solid #808080; background: #d4d0c8; }
.sc-search { width: 100%; padding: 6px 8px; font-size: 15px; font-family: inherit; background: #fff; border: 2px solid; border-color: #565656 #fcfcfc #fcfcfc #565656; outline: none; margin-bottom: 10px; }
.sc-sec { margin: 10px 0 4px; font-size: 13px; letter-spacing: 0.25em; font-weight: bold; color: #404040; display: flex; justify-content: space-between; }
.sc-count { letter-spacing: 0; }
.sc-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; font-size: 16px; font-family: inherit; background: transparent; border: none; cursor: pointer; }
.sc-row:hover { background: #e8e8ff; }
.sc-row.on { background: #000181; color: #fff; }
.sc-row.locked .sc-name { color: #707070; }
.sc-row.on.locked .sc-name { color: #fff; }
.sc-dot { width: 14px; height: 14px; border: 2px solid #565656; flex-shrink: 0; }
.sc-dot.off { background: #e0e0e0; }
.sc-dot.guide { background: #808080; }
.sc-name { flex: 1; }
.sc-mark { font-weight: bold; }
.sc-mark.compromised { color: #ff5a5a; }
.sc-mark.resisted { color: #0a7a2a; }
.sc-row.on .sc-mark.resisted { color: #7fff7f; }
.sc-none { padding: 8px; color: #606060; font-size: 14px; }

.sc-main { flex: 1; min-width: 0; overflow-y: auto; padding: 18px 24px; background: #fcfcfc; }
.sc-title { font-size: 40px; line-height: 1.05; font-weight: bold; color: #000181; }
.sc-sub { margin-top: 6px; font-size: 18px; color: #404040; }
.sc-met { margin: 8px 0 14px; padding: 4px 10px; font-size: 15px; background: #ffff00; display: inline-block; }
.sc-lead { margin: 12px 0 14px; font-size: 18px; line-height: 1.4; color: #202020; max-width: 70ch; }
.sc-grid { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 18px; }
@media (max-width: 900px) { .sc-grid { grid-template-columns: 1fr; } }
.sc-hero { position: relative; width: 100%; background: #fff; border: 2px solid; border-color: #565656 #fcfcfc #fcfcfc #565656; overflow: hidden; }
.sc-hero img { width: 100%; height: 100%; display: block; object-fit: cover; }
.sc-ring { position: absolute; border: 4px solid #e00000; border-radius: 8px; box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.7); box-sizing: border-box; pointer-events: none; }
.sc-tell { margin-top: 8px; padding: 6px 10px; font-size: 20px; font-weight: bold; color: #b00000; background: #fcfcfc; border: 2px solid; border-color: #565656 #fcfcfc #fcfcfc #565656; }
.sc-tag { font-size: 14px; letter-spacing: 0.28em; font-weight: bold; color: #404040; margin-top: 4px; }
.sc-tag.mt { margin-top: 18px; }
.sc-rule { font-size: 32px; line-height: 1.12; font-weight: bold; color: #000181; margin-bottom: 12px; }
.sc-habit { font-size: 22px; line-height: 1.2; margin-bottom: 12px; }
.sc-stat { font-size: 15px; color: #303030; line-height: 1.35; }
.sc-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.sc-chip { padding: 3px 10px; font-size: 14px; background: #fcfcfc; border: 2px solid; border-color: #fcfcfc #565656 #565656 #fcfcfc; cursor: help; }
.sc-chip.ctl { background: #e6e6ff; }
.sc-src { margin-top: 14px; font-size: 13px; color: #505050; }
.sc-list { margin-top: 8px; padding-left: 24px; font-size: 18px; line-height: 1.45; list-style: disc; }
.sc-list li { margin-bottom: 6px; }
</style>
