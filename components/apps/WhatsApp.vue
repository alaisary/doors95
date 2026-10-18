<template>
  <div class="wa-root">
    <!-- chat list -->
    <aside class="wa-list">
      <div class="wa-list-head">
        <span class="wa-list-title">WhatsApp</span>
      </div>
      <button
        v-for="c in chats"
        :key="c.id"
        class="wa-chat"
        :class="{ on: activeId === c.id }"
        @click="openChat(c)"
      >
        <span class="wa-ava" :style="{ background: c.color }">
          <img v-if="c.img" :src="c.img" alt="" draggable="false">
          <template v-else>{{ c.initials }}</template>
        </span>
        <span class="wa-chat-info">
          <span class="wa-chat-top">
            <span class="wa-chat-name" dir="auto">{{ c.name }}</span>
            <span class="wa-chat-time">{{ c.time }}</span>
          </span>
          <span class="wa-chat-snip" dir="auto">{{ c.snippet }}</span>
        </span>
        <span v-if="unread(c)" class="wa-badge">{{ unread(c) }}</span>
      </button>
    </aside>

    <!-- conversation -->
    <section class="wa-pane">
      <div v-if="!active" class="wa-empty">Select a chat</div>
      <template v-else>
        <div class="wa-head">
          <span class="wa-ava sm" :style="{ background: active.color }">
            <img v-if="active.img" :src="active.img" alt="" draggable="false">
            <template v-else>{{ active.initials }}</template>
          </span>
          <div class="wa-head-info">
            <div class="wa-head-name" dir="auto">{{ active.name }}</div>
            <div class="wa-head-sub">{{ active.presence }}</div>
          </div>
        </div>

        <div class="wa-msgs">
          <div class="wa-day">Today</div>
          <div v-for="(m, i) in active.messages" :key="i" class="wa-msg" :class="m.out ? 'out' : 'in'">
            <div v-if="m.who && !m.out" class="wa-who" dir="auto">{{ m.who }}</div>
            <div v-if="m.text" class="wa-text" dir="auto">{{ m.text }}</div>
            <!-- a shared link shows as the usual preview card -->
            <button v-if="m.link" class="wa-link" @click="followLink(active, m.link)">
              <span class="wa-link-thumb"><img src="/ironcastle-logo.svg" alt="" draggable="false"></span>
              <span class="wa-link-info">
                <span class="wa-link-title">Priya Nair on LinkedIn</span>
                <span class="wa-link-desc">Frontier models for $10 a month. Developers are talking about this one.</span>
                <span class="wa-link-domain">linkedin.com</span>
              </span>
            </button>
            <div class="wa-time">{{ m.time }}</div>
          </div>
        </div>

        <div class="wa-input">Type a message</div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import emitter from '~/components/misc/eventHandler'

type Msg = { who?: string; text?: string; link?: string; time: string; out?: boolean }
type Chat = {
  id: string; name: string; initials: string; color: string; img?: string
  presence: string; time: string; snippet: string; scenario?: string; messages: Msg[]
}

const session = useSessionStore()
const windows = useOpenWindowsStore()

const chats: Chat[] = [
  {
    id: 'dana', name: 'Dana Al Kindi', initials: 'DK', color: '#7c2d12', img: '/avatars/dana.jpg',
    presence: 'online', time: '15:06', scenario: 'ironcastle',
    snippet: 'I have not tried it. can you take a look and set it up?',
    messages: [
      { text: 'half my feed is talking about this today', time: '15:05' },
      { text: 'frontier models for $10 a month. might fit the budget for the routing prototype', time: '15:06' },
      { text: 'I have not tried it. can you take a look and set it up if it seems fine?', link: 'https://www.linkedin.com/posts/priya-nair_frontier-ai-activity-7312', time: '15:06' },
    ],
  },
  {
    id: 'ops', name: 'Ops Team | فريق العمليات', initials: 'OT', color: '#0d9488',
    presence: 'Hamad, Dana, you', time: '09:12',
    snippet: 'صباح الخير جميعاً، اجتماع الأحد الساعة 9:30',
    messages: [
      { who: 'Hamad Al Busaidi', text: 'صباح الخير جميعاً، اجتماع الأحد الساعة 9:30', time: '09:12' },
      { who: 'Hamad Al Busaidi', text: 'Sunday review is at 9:30. Please bring the Q3 route numbers.', time: '09:12' },
      { who: 'Dana Al Kindi', text: 'Noted, thank you', time: '09:20' },
      { out: true, text: 'Will do', time: '09:24' },
    ],
  },
  {
    id: 'hamad', name: 'Hamad Al Busaidi', initials: 'HB', color: '#1d4e89', img: '/avatars/hamad.jpg',
    presence: 'last seen today at 09:31', time: '09:31',
    snippet: 'Thanks, I will check the diesel rate',
    messages: [
      { out: true, text: 'Sent you the notes on the Sohar leg. One thing on the diesel surcharge.', time: '09:31' },
      { text: 'Thanks, I will check the diesel rate', time: '09:33' },
    ],
  },
]

const activeId = ref('')
const active = computed(() => chats.find((c) => c.id === activeId.value))

// Dana's three messages show as unread until her chat is opened
const unread = (c: Chat) => (c.scenario === 'ironcastle' && !session.chatRead && !session.completedScenarios.includes('ironcastle') ? 3 : 0)

function openChat(c: Chat) {
  activeId.value = c.id
  if (c.scenario !== 'ironcastle') return
  // reading the message puts the visitor inside that attack, keeping any other progress
  session.focusScenario('ironcastle')
  if (!session.chatRead) {
    session.chatRead = true
    session.log('CHAT_OPENED', 'Dana Al Kindi', 'neutral')
    session.timelineStep('A colleague messages about cheap AI access')
    session.coach('A message from a colleague. Take your time. Read it like you mean it.')
  }
}

function followLink(c: Chat, url: string) {
  // a handled message is redone from scratch, otherwise just move into it
  if (c.scenario) {
    if (session.completedScenarios.includes(c.scenario) && !session.saved[c.scenario] && session.scenarioId !== c.scenario) session.engageScenario(c.scenario)
    else session.focusScenario(c.scenario)
  }
  session.log('LINK_CLICKED', url, 'neutral')
  session.timelineStep('Link clicked → linkedin.com')
  emitter.emit('openPage', 'Social')
  windows.openWindow('Browser')
}
</script>

<style scoped>
.wa-root { display: flex; width: 100%; height: 100%; background: #fff; font-family: 'Segoe UI', system-ui, Arial, sans-serif; color: #111b21; }
.wa-list { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #d1d7db; background: #fff; }
.wa-list-head { padding: 14px 16px; background: #008069; }
.wa-list-title { font-size: 20px; font-weight: 600; color: #fff; }
.wa-chat { display: flex; align-items: center; gap: 12px; padding: 12px 14px; text-align: left; background: #fff; border: none; border-bottom: 1px solid #f0f2f5; cursor: pointer; width: 100%; }
.wa-chat:hover { background: #f5f6f6; }
.wa-chat.on { background: #f0f2f5; }
.wa-ava { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; overflow: hidden; }
.wa-ava.sm { width: 40px; height: 40px; }
.wa-ava img { width: 100%; height: 100%; object-fit: cover; }
.wa-chat-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.wa-chat-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.wa-chat-name { font-size: 16px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wa-chat-time { font-size: 12px; color: #667781; flex-shrink: 0; }
.wa-chat-snip { font-size: 14px; color: #667781; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wa-badge { min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; background: #25d366; color: #fff; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }

.wa-pane { flex: 1; min-width: 0; display: flex; flex-direction: column; background: #efeae2; }
.wa-empty { margin: auto; color: #667781; font-size: 18px; }
.wa-head { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #f0f2f5; border-bottom: 1px solid #d1d7db; }
.wa-head-name { font-size: 17px; font-weight: 500; }
.wa-head-sub { font-size: 13px; color: #667781; }
.wa-msgs { flex: 1; overflow-y: auto; padding: 14px 8% 10px; display: flex; flex-direction: column; gap: 6px; }
.wa-day { align-self: center; padding: 3px 12px; border-radius: 8px; background: #fff; color: #54656f; font-size: 12.5px; margin-bottom: 6px; box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13); }
.wa-msg { max-width: 72%; padding: 6px 9px 4px; border-radius: 8px; box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13); display: flex; flex-direction: column; gap: 3px; }
.wa-msg.in { align-self: flex-start; background: #fff; border-top-left-radius: 0; }
.wa-msg.out { align-self: flex-end; background: #d9fdd3; border-top-right-radius: 0; }
.wa-who { font-size: 13px; font-weight: 600; color: #0d9488; }
.wa-text { font-size: 15.5px; line-height: 1.35; white-space: pre-wrap; word-break: break-word; }
.wa-time { align-self: flex-end; font-size: 11px; color: #667781; }
.wa-link { display: flex; flex-direction: column; text-align: left; padding: 0; border: none; border-radius: 6px; overflow: hidden; background: #f0f2f5; cursor: pointer; }
.wa-link-thumb { display: flex; align-items: center; justify-content: center; height: 90px; background: #0b0d12; }
.wa-link-thumb img { height: 52px; }
.wa-link-info { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; }
.wa-link-title { font-size: 14.5px; font-weight: 600; }
.wa-link-desc { font-size: 13px; color: #54656f; }
.wa-link-domain { font-size: 12px; color: #667781; }
.wa-input { padding: 12px 16px; background: #f0f2f5; color: #667781; font-size: 15px; border-top: 1px solid #d1d7db; }
</style>
