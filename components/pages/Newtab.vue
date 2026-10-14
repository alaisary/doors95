<template>
  <div class="min-h-full bg-white flex flex-col items-center justify-center gap-8">
    <div class="text-center">
      <div class="text-2xl font-semibold text-slate-700 mb-1">Wadi Gate Logistics</div>
      <div class="text-xs tracking-widest text-slate-400">WORKDAY</div>
    </div>

    <!-- search -->
    <div class="w-96 flex items-center gap-3 bg-slate-100 hover:bg-white rounded-full px-5 py-3 border border-transparent hover:border-slate-300 shadow-sm transition-colors">
      <span class="text-slate-400">🔍</span>
      <input
        class="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
        placeholder="Search the web (simulated)"
        @keydown.enter.prevent
      />
    </div>

    <div class="flex gap-4">
      <div v-for="b in bookmarks" :key="b.name"
        class="w-24 px-3 py-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer text-center transition-colors"
        @click="launch(b.page)"
      >
        <div class="text-2xl mb-1">{{ b.emoji }}</div>
        <div class="text-[11px] text-slate-600">{{ b.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import emitter from '~/components/misc/eventHandler'
import { useOpenWindowsStore } from '~/stores/windows'

const bookmarks = [
  { name: 'Mail', page: '__open_mail', emoji: '✉️' },
  { name: 'Intranet', page: 'Intranet', emoji: '🏢' },
  { name: 'Compliance', page: 'newtab', emoji: '📋' },
]

function launch(page: string) {
  if (page === '__open_mail') {
    useOpenWindowsStore().openWindow('Mail')
    return
  }
  emitter.emit('openPage', page)
}
</script>
