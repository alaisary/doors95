<template>
  <div class="min-h-full bg-slate-900 text-slate-200 flex items-center justify-center">
    <div class="w-[420px] bg-[#101827] rounded-xl border border-white/10 shadow-2xl p-8">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-9 h-9 rounded bg-sky-600 flex items-center justify-center text-white text-xs font-bold">N</div>
        <div>
          <div class="font-semibold text-sm text-white">Authentication Request</div>
          <div class="text-xs text-slate-500">login.wadigate-support-help.com</div>
        </div>
      </div>

      <template v-if="!submitted">
        <p class="text-sm text-slate-300 mb-4">Enter the code displayed on your other device to continue:</p>
        <input
          v-model="codeInput"
          class="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-sm font-mono text-white outline-none focus:border-sky-500"
          placeholder="XXX XXX"
          @keydown.enter="submit"
        />
        <button class="mt-4 w-full bg-sky-600 hover:bg-sky-500 text-white rounded py-2 text-sm font-medium" @click="submit">
          Continue
        </button>
        <p class="mt-6 text-[10px] text-slate-600 text-center">
          This page is operated by "IT Support" — simulated attacker infrastructure.
        </p>
      </template>

      <template v-else>
        <div class="text-center py-4">
          <div class="text-3xl mb-3">⏳</div>
          <p class="text-sm text-slate-300">Code accepted. Waiting for approval on the target device…</p>
          <p class="text-xs text-slate-500 mt-2">The MFA push now goes to the victim. Social pressure stage begins.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()
const codeInput = ref('')
const submitted = ref(false)

function submit() {
  if (!codeInput.value.trim()) return
  submitted.value = true
  session.log('ATTACKER_SUBMITTED_CODE', codeInput.value, 'risky')
  session.timelineStep('Attacker enters code on their device')
}
</script>
