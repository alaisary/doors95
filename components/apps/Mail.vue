<template>
  <div class="flex h-full bg-[#d4d0c8] text-black win-font">
    <!-- folder pane -->
    <div class="w-56 border-r-2 border-[#808080] py-4 flex-shrink-0">
      <div class="px-4 pb-3 text-xs tracking-widest text-[#404040] font-bold">WADI GATE MAIL</div>
      <div class="px-2 space-y-0.5">
        <button
          v-for="f in folders"
          :key="f.id"
          class="w-full text-left px-3 py-2 text-sm flex justify-between"
          :class="folder === f.id ? 'bg-[#000181] text-white' : 'text-[#404040] hover:bg-[#e8e8ff]'"
          @click="openFolder(f.id)"
        >
          <span>{{ f.label }}</span><span v-if="f.id === 'inbox'" class="text-xs mt-0.5">{{ unreadCount }}</span>
        </button>
      </div>
      <template v-if="!demo">
      <div class="px-4 pt-4 text-[11px] tracking-widest text-[#404040] font-bold">COLLECTED {{ collected }}/{{ session.activeScenarios.length }}</div>
      <div class="px-4 pt-1.5 flex gap-1 flex-wrap">
        <span
          v-for="id in session.activeScenarios"
          :key="id"
          class="w-4 h-4 border-2 border-[#565656]"
          :style="{ background: session.completedScenarios.includes(id) ? (reg.byId(id) as any)?.card?.color : '#e0e0e0' }"
          :title="session.completedScenarios.includes(id) ? (reg.byId(id) as any)?.card?.chip : '?'"
        ></span>
      </div>
      </template>
    </div>

    <!-- list -->
    <div class="w-80 border-r-2 border-[#808080] overflow-y-auto flex-shrink-0 bg-white" style="width: 26rem">
      <div v-if="!visibleMails.length" class="p-6 text-sm text-[#808080]">No messages in this folder.</div>
      <button
        v-for="mail in visibleMails"
        :key="mail.id"
        class="w-full text-left px-4 py-3 border-b border-[#e0e0e0] hover:bg-[#e8e8ff] transition-colors"
        :class="selectedMail?.id === mail.id ? 'bg-[#000181] text-white' : ''"
        @click="selectMail(mail)"
      >
        <div class="flex justify-between items-baseline">
          <span class="text-sm font-medium" :class="selectedMail?.id === mail.id ? 'text-white' : (mail.read ? 'text-[#606060]' : 'text-black')">
            {{ mail.to ? 'To: ' + mail.to : mail.sender }}
          </span>
          <span class="text-[11px]" :class="selectedMail?.id === mail.id ? 'text-white/70' : 'text-[#808080]'">{{ mail.date }}</span>
        </div>
        <div class="text-sm mt-0.5 truncate" :class="selectedMail?.id === mail.id ? 'text-white' : (mail.read ? 'text-[#606060]' : 'text-black')">
          <span v-if="!mail.read" class="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle" :class="selectedMail?.id === mail.id ? 'bg-[#ffff00]' : 'bg-[#000181]'"></span>
          <span dir="auto">{{ mail.subject }}</span>
        </div>
        <!-- once handled, the mail is labelled with the technique it carried -->
        <div v-if="chipOf(mail)" class="mt-1.5">
          <span
            class="inline-block px-2 py-[1px] text-[11px] font-bold tracking-wide border-2"
            :style="chipOf(mail)!.style"
          >{{ chipOf(mail)!.outcome === 'compromised' ? '! ' : '✓ ' }}{{ chipOf(mail)!.label }}</span>
        </div>
      </button>
    </div>

    <!-- reading pane -->
    <div class="flex-1 overflow-y-auto bg-white">
      <div v-if="!selectedMail" class="h-full flex items-center justify-center text-[#808080]">
        Select a message
      </div>
      <div v-else class="p-8 max-w-none">
        <div class="flex items-start justify-between border-b-2 border-[#c0c0c0] pb-4 mb-6">
          <div>
            <h2 class="text-xl font-semibold text-black" dir="auto">{{ selectedMail.subject }}</h2>
            <div class="mt-2 text-sm text-[#404040]">
              <template v-if="selectedMail.to">
                <span class="text-black font-medium">Salim Al Harthi</span>
                <span class="ml-2 text-[#606060]">to {{ selectedMail.to }} &lt;{{ selectedMail.sender }}&gt;</span>
              </template>
              <template v-else>
                <span class="text-black font-medium">{{ selectedMail.senderName }}</span>
                <span class="ml-2 text-[#606060]">&lt;{{ selectedMail.sender }}&gt;</span>
              </template>
            </div>
            <div class="text-xs text-[#808080] mt-0.5">{{ selectedMail.to ? 'sent' : 'to me' }} · {{ selectedMail.date }}</div>
          </div>
          <button
            v-if="!selectedMail.to"
            class="px-3 py-1.5 text-xs rounded-none bg-[#c0c0c0] text-black border-2 border-t-[#fcfcfc] border-l-[#fcfcfc] border-b-[#565656] border-r-[#565656] hover:bg-[#d8d8d8] transition-colors"
            @click="reportMail"
          >
            ⚑ Report
          </button>
        </div>

        <!-- branded HTML email (Zoom invitation lookalike) -->
        <AppsZoomEmail v-if="selectedMail.template === 'zoom'" :mail="selectedMail" @open="openLink(selectedMail)" />

        <div v-else class="space-y-4 text-sm leading-relaxed text-[#202020]">
          <p v-for="(p, i) in selectedMail.body" :key="i" dir="auto">{{ p }}</p>
        </div>

        <button
          v-if="selectedMail.link && selectedMail.template !== 'zoom'"
          class="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-[#c0c0c0] text-black font-medium border-2 border-t-[#fcfcfc] border-l-[#fcfcfc] border-b-[#565656] border-r-[#565656] hover:bg-[#d8d8d8] active:border-t-[#565656] active:border-l-[#565656] active:border-b-[#fcfcfc] active:border-r-[#fcfcfc] transition-colors win-font"
          @click="openLink(selectedMail)"
        >
          {{ selectedMail.linkLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import emitter from '~/components/misc/eventHandler'

type Mail = {
  id: number
  senderName: string
  sender: string
  subject: string
  date: string
  body: string[]
  link?: string
  linkLabel?: string
  read?: boolean
  scenario?: string
  template?: 'zoom'
  to?: string        // set on sent messages
}

const session = useSessionStore()

const mails = ref<Mail[]>([
  {
    id: 1,
    senderName: 'Hamad Al Busaidi',
    sender: 'h.albusaidi@wadigate.om',
    subject: 'Q3 route optimization — final numbers',
    date: '09:12',
    body: [
      'Hi,',
      'Final numbers for the Q3 route optimization are in the shared drive. Can you sanity-check the Sohar leg before the 14:00 review?',
      'Thanks,',
      'Hamad',
    ],
    read: true,
  },
  {
    id: 2,
    senderName: 'Facilities',
    sender: 'facilities@wadigate.om',
    subject: 'إشعار: إغلاق موقف السيارات (ب) — Parking lot B resurfacing',
    date: '08:47',
    body: [
      'مرحباً،',
      'سيتم إغلاق موقف السيارات (ب) يوم الأحد 20 سبتمبر لأعمال إعادة التعبيد. يرجى استخدام موقف الزوار.',
      'Parking lot B will be closed on Sunday, Sep 20 for resurfacing. Please use the visitor lot.',
      'إدارة المرافق — Facilities',
    ],
    read: true,
  },
])

// every scenario email lives in the one shared mailbox —
// the continuous desktop: no scenario picker, each email IS a scenario
const scenarioMails: Record<string, Mail> = {
  'evilginx-bitb': {
    id: 100,
    senderName: 'Qabas AI — Pilot Program',
    sender: 'no-reply@qabas-ai.com',
    subject: 'Your free frontier AI access is active — activate today',
    date: '09:41',
    body: [
      'Hello,',
      'As part of the WADI GATE innovation pilot, your workspace has been granted free access to Claude, GPT, Gemini and DeepSeek models through Qabas AI.',
      'No subscription, no credit card. Activate with your Microsoft account before the pilot window closes on Thursday.',
      'Qabas AI — Bypassing Boundaries for AI Accessibility',
    ],
    link: 'https://app.qabas-ai.com/playground',
    linkLabel: 'Activate your access →',
    scenario: 'evilginx-bitb',
  },
  'clickfix': {
    id: 110,
    senderName: 'Finance — Invoices',
    sender: 'invoices@wadigate.om',
    subject: 'INV-2291 from Harbor Crest Marine Services — approval needed',
    date: '10:07',
    body: [
      'Hello,',
      'Invoice INV-2291 (Harbor Crest Marine Services, OMR 5,490.000) is awaiting your approval before Thursday.',
      'The document portal link is below. You will need to verify to view the invoice.',
      'Finance Automation',
    ],
    link: 'https://docs.harborcrest-invoice-portal.com/INV-2291',
    linkLabel: 'Open invoice portal →',
    scenario: 'clickfix',
  },
  'device-code': {
    id: 120,
    senderName: 'Wadi Gate Secure Docs',
    sender: 'no-reply@docs.wadigate-portal.com',
    subject: 'Hamad Al Busaidi shared 3 protected documents — "Q3 Fleet Audit"',
    date: '11:23',
    body: [
      'Hello,',
      'Hamad Al Busaidi shared 3 protected PDF documents with you, including "Q3_Fleet_Audit.pdf".',
      'The documents are protected and expire in 7 days. Sign in with your work account to view them before Sunday\'s meeting.',
      'Wadi Gate Secure Docs',
    ],
    link: 'https://docs.wadigate-portal.com/shared/q3-fleet-audit',
    linkLabel: 'View documents →',
    scenario: 'device-code',
  },
  'ejada': {
    id: 130,
    senderName: 'إجادة — Ejada (Ministry of Labour)',
    sender: 'noreply@ejada-portal.om',
    subject: 'تذكير: اكتمال التقييم السنوي — annual evaluation due',
    date: '13:02',
    body: [
      'مرحباً،',
      'يجب إكمال تقييم الأداء السنوي (إجادة) قبل نهاية هذا الأسبوع.',
      'Your annual performance evaluation must be completed before the end of the week. Sign in with your Ejada account to continue.',
      'إجادة — منظومة قياس الأداء',
    ],
    link: 'https://ejada.gov.om.workers.dev/auth/login',
    linkLabel: 'تسجيل الدخول — Sign in →',
    scenario: 'ejada',
  },
  'zoom-docs': {
    id: 140,
    senderName: 'Zoom Docs',
    // a genuine Zoom share: the sender and link are really zoom.us — the file is the trap
    sender: 'no-reply@zoom.us',
    subject: 'You are invited to "Contract Bid Proposal"',
    date: '14:18',
    body: [],
    template: 'zoom',
    link: 'https://docs.zoom.us/d/SKK1b5_JTQafbhlrTU8w?from=email',
    linkLabel: 'Open doc',
    scenario: 'zoom-docs',
  },
}

// Salim's own outbox: ordinary desk life, and a few hints that these people exist
const sentMails: Mail[] = [
  {
    id: 201,
    senderName: 'Salim Al Harthi',
    sender: 's.alharthi@wadigate.om',
    to: 'Hamad Al Busaidi',
    subject: 'Re: Q3 route optimization — final numbers',
    date: '09:31',
    body: [
      'Hi Hamad,',
      'Sohar leg looks fine. The Duqm drop adds about 40 minutes if the weigh-station queue runs long, so I left a buffer in the sheet.',
      'The diesel surcharge on row 14 does not match the contract. I did not touch it, can you confirm the rate?',
      'Salim',
    ],
    read: true,
  },
  {
    id: 202,
    senderName: 'Salim Al Harthi',
    sender: 's.alharthi@wadigate.om',
    to: 'IT Service Desk',
    subject: 'Password manager invite (the sticky note and I are breaking up)',
    date: '08:52',
    body: [
      'Hello IT,',
      'Could you send me the invite for the company password manager? Right now my passwords live on a sticky note, and Clippy has started giving me looks.',
      'I will be out for lunch around 12:30, so no rush before then. If a laptop swap is needed, I am WG-LT-0441.',
      'Thanks,',
      'Salim',
    ],
    read: true,
  },
  {
    id: 203,
    senderName: 'Salim Al Harthi',
    sender: 's.alharthi@wadigate.om',
    to: 'Facilities',
    subject: 'Re: إغلاق موقف السيارات (ب) — Parking lot B',
    date: '08:50',
    body: [
      'مرحباً، شكراً على الإشعار.',
      'Thanks for the notice. The visitor lot is already full on Sundays, so could I get a temporary pass for that day?',
      'Unrelated, but the karak machine on level 3 is swallowing coins again. It now takes a coin and gives back only a sad beep.',
      'Salim',
    ],
    read: true,
  },
]

const folders = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'sent', label: 'Sent' },
  { id: 'drafts', label: 'Drafts' },
]
const folder = ref('inbox')
function openFolder(id: string) {
  folder.value = id
  selectedMail.value = null
}

const selectedMail = ref<Mail | null>(null)
const unreadCount = computed(() => mails.value.filter((m) => !m.read).length)

// inject the scenario emails configured for this session when the desktop goes live
watch(
  () => session.phase,
  (phase) => {
    if (phase === 'live') {
      const wanted = session.activeScenarios
        .map((id) => scenarioMails[id])
        .filter(Boolean)
      // keep one copy per scenario; drop scenario mails no longer configured
      mails.value = mails.value.filter((m) => !m.scenario || wanted.some((w) => w.scenario === m.scenario))
      wanted.forEach((m) => {
        if (!mails.value.some((x) => x.scenario === m.scenario)) {
          mails.value.push({ ...m, read: session.completedScenarios.includes(m.scenario) })
        }
      })
    }
  },
  { immediate: true }
)

// newest last → sort scenario mails in by date like a real inbox
const sortedMails = computed(() => [...mails.value].sort((a, b) => a.date.localeCompare(b.date)))
// sent mail, newest first like a real Sent folder
const visibleMails = computed(() =>
  folder.value === 'inbox' ? sortedMails.value
  : folder.value === 'sent' ? [...sentMails].sort((a, b) => b.date.localeCompare(a.date))
  : [])

const reg = useScenarioRegistry()
const { demo } = useBooth()
const collected = computed(() => session.activeScenarios.filter((id) => session.completedScenarios.includes(id)).length)

// the technique label on a handled mail: filled when the visitor caught it, outlined when it got them
function chipOf(mail: Mail) {
  if (!mail.scenario || !session.completedScenarios.includes(mail.scenario)) return null
  const c = (reg.byId(mail.scenario) as any)?.card
  if (!c) return null
  const outcome = session.outcomes[mail.scenario] ?? 'resisted'
  const style = outcome === 'resisted'
    ? { background: c.color, color: '#fff', borderColor: c.color }
    : { background: '#fff', color: c.color, borderColor: c.color }
  return { label: c.chip, outcome, style }
}

function isHandled(mail: Mail) {
  return !!mail.scenario && session.completedScenarios.includes(mail.scenario)
}

function selectMail(mail: Mail) {
  const firstRead = !mail.read
  mail.read = true
  selectedMail.value = mail
  // reading a scenario email puts the user inside that attack, keeping the
  // progress of any other attack they have been in
  if (mail.scenario) session.focusScenario(mail.scenario)
  if (firstRead && mail.scenario) {
    session.log('EMAIL_OPENED', mail.sender, 'neutral')
    const labels: Record<string, string> = {
      'clickfix': 'Email with invoice link arrives',
      'evilginx-bitb': 'Lure email delivered ("Qabas AI")',
      'device-code': 'Lure email delivered ("protected documents")',
      'ejada': 'Ejada evaluation reminder delivered',
      'zoom-docs': 'Zoom Docs invitation delivered ("Contract Bid Proposal")',
    }
    session.timelineStep(labels[mail.scenario] ?? 'Phishing email opened')
    session.coach('New mail? Take your time. Read it like you mean it.')
  }
}

// follow a link: a handled email is redone from scratch, otherwise just move into it
function enterMail(scenario?: string) {
  if (!scenario) return
  if (session.completedScenarios.includes(scenario) && !session.saved[scenario] && session.scenarioId !== scenario) session.engageScenario(scenario)
  else session.focusScenario(scenario)
}

function openLink(mail: Mail) {
  enterMail(mail.scenario)
  session.log('LINK_CLICKED', mail.link!, mail.link!.includes('wadigate-secure') || mail.link!.includes('harborcrest') || mail.link!.includes('wadigate-portal') || mail.link!.includes('qabas-ai') || mail.link!.includes('workers.dev') ? 'risky' : 'neutral')
  session.timelineStep('Link clicked → ' + hostOf(mail.link!))
  emitter.emit('openPage', linkPageName(mail.link!))
  useOpenWindowsStore().openWindow('Browser')
}

function reportMail() {
  const mail = selectedMail.value
  enterMail(mail?.scenario)
  session.flag('reported_phishing')
  session.log('REPORT_CLICKED', mail?.sender, 'safe')
  session.coach('Reported. That is the muscle memory we like.')
  if (mail?.scenario) {
    session.timelineStep('Message reported to security')
    session.survive()
  }
}

function hostOf(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function linkPageName(url: string): string {
  if (url.includes('qabas-ai.com/playground')) return 'AI Playground'
  if (url.includes('harborcrest-invoice-portal.com')) return 'Invoice Portal'
  if (url.includes('wadigate-portal.com/shared')) return 'Doc Portal'
  if (url.includes('workers.dev/auth')) return 'Ejada Login'
  if (url.includes('zoom.us/d')) return 'Zoom Doc'
  if (url.includes('linkedin.com/posts')) return 'Social'
  return 'blank'
}
</script>

<style scoped>
.win-font {
  font-family: 'Windows 95', 'MS Sans Serif', 'Segoe UI', Arial, sans-serif;
}
</style>
