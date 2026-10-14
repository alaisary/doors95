<template>
  <div class="min-h-full bg-slate-50 text-slate-800">
    <!-- intranet header -->
    <div class="bg-sky-700 text-white px-8 py-5">
      <div class="max-w-4xl mx-auto flex items-center gap-3">
        <div class="w-9 h-9 rounded bg-white/15 flex items-center justify-center font-bold">N</div>
        <div>
          <div class="font-semibold">Wadi Gate Logistics — Employee Intranet</div>
          <div class="text-[11px] text-sky-200">intranet.wadigate.om · sign in with corporate SSO</div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto p-8">
      <h1 class="text-xl font-semibold mb-1">Good morning, Salim</h1>
      <p class="text-sm text-slate-500 mb-6">Thursday · Sep 18 · Rotterdam HQ</p>

      <div class="grid grid-cols-2 gap-4 mb-8">
        <div v-for="c in cards" :key="c.title" class="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div class="text-2xl mb-2">{{ c.emoji }}</div>
          <div class="font-medium text-sm">{{ c.title }}</div>
          <div class="text-xs text-slate-500 mt-1">{{ c.sub }}</div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div class="text-xs tracking-widest text-slate-400 mb-3">SECURITY NOTICE — IT OPERATIONS</div>
        <p class="text-sm text-slate-600 leading-relaxed">
          Employees are reminded that IT will <b>never</b> ask you to install software, run commands,
          or read out authentication codes over chat or phone. Verification pages never require your
          Run dialog or terminal. Report suspicious messages using the ⚑ Report button in mail.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

const cards = [
  { emoji: '📅', title: 'Shift schedule', sub: 'Your week at a glance' },
  { emoji: '💰', title: 'Payroll portal', sub: 'Payslips and tax documents' },
  { emoji: '📦', title: 'Shipment tracking', sub: 'Live fleet and cargo status' },
  { emoji: '🛡', title: 'Report phishing', sub: 'One click to the security team' },
]

onMounted(() => {
  session.flag('read_security_notice')
  session.log('SECURITY_OPENED', 'intranet security notice', 'safe')
})
</script>
