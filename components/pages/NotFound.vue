<template>
  <div class="min-h-full bg-white flex items-center justify-center py-24">
    <div class="text-center max-w-md">
      <div class="flex justify-center gap-4 mb-6 text-slate-300">
        <div class="text-5xl">🌐</div>
        <div class="text-5xl">⛓️‍💥</div>
      </div>
      <h1 class="text-lg font-medium text-slate-700 mb-2">This site can't be reached</h1>
      <p class="text-sm text-slate-500 mb-1"><b class="text-slate-700">{{ host }}</b> took too long to respond.</p>
      <p class="text-xs text-slate-400 font-mono mt-4">ERR_CONNECTION_TIMED_OUT</p>
      <button class="mt-6 px-4 py-1.5 rounded bg-sky-600 text-white text-xs hover:bg-sky-500" @click="reloadPage">Reload</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ url?: string }>()

const host = computed(() => {
  try {
    return new URL(props.url || 'https://unknown').host
  } catch {
    return props.url || 'unknown host'
  }
})

const emit = defineEmits(['reload'])
function reloadPage() {
  emit('reload')
}
</script>
