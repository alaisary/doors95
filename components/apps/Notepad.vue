<template>
  <div class="flex flex-col h-full bg-white text-black">
    <!-- menu bar -->
    <div class="np-menubar">
      <span v-for="m in ['File', 'Edit', 'Format', 'View', 'Help']" :key="m" class="np-menu">{{ m }}</span>
    </div>

    <!-- editor -->
    <textarea
      ref="editorEl"
      v-model="text"
      class="np-editor"
      spellcheck="false"
      @paste="onPaste"
      placeholder="Paste anything here to inspect it safely — nothing runs in Notepad."
    ></textarea>

    <!-- status bar -->
    <div class="np-status">
      <span>{{ chars }} chars · {{ words }} words</span>
      <span>Ctrl+V pastes the OS clipboard</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

const text = ref('')
const editorEl = ref<HTMLTextAreaElement | null>(null)

// Notepad only ever displays text — nothing here can execute.
watch(
  () => session.inspectedFile,
  (f) => {
    if (f) {
      text.value = f.content
      nextTick(() => editorEl.value?.focus())
    }
  },
  { immediate: true }
)

const chars = computed(() => text.value.length)
const words = computed(() => (text.value.trim() ? text.value.trim().split(/\s+/).length : 0))

// pasting into Notepad pastes the SIMULATED OS clipboard — a safe way to
// inspect whatever a web page dropped there before running anything
function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  if (!session.clipboard) return
  const el = editorEl.value
  if (!el) return
  const pos = el.selectionStart ?? text.value.length
  text.value = text.value.slice(0, pos) + session.clipboard + text.value.slice(el.selectionEnd ?? pos)
  nextTick(() => {
    const p = pos + session.clipboard.length
    el.focus()
    el.setSelectionRange(p, p)
  })
  session.log('NOTEPAD_PASTE', 'clipboard inspected in Notepad', 'safe')
  if (session.scenarioId === 'clickfix' && session.flags.captcha_clicked && !session.flags.ran_command) {
    session.coach('Smart move — inspecting the clipboard in Notepad before running anything. That comment after # is decoration, the rest is a live command.')
    session.flag('inspected_clipboard')
    session.survive()
  }
}
</script>

<style scoped>
.np-menubar {
  display: flex;
  gap: 14px;
  padding: 3px 8px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
  font-family: 'Windows 95', 'MS Sans Serif', Tahoma, sans-serif;
  font-size: 12px;
}
.np-menu { cursor: default; }
.np-menu:hover { background: #000181; color: #fff; }

.np-editor {
  flex: 1;
  min-height: 0;
  border: none;
  outline: none;
  padding: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  resize: none;
  background: #fff;
  color: #000;
  line-height: 1.45;
}

.np-status {
  display: flex;
  justify-content: space-between;
  padding: 3px 8px;
  background: #c0c0c0;
  border-top: 1px solid #fcfcfc;
  font-family: 'Windows 95', 'MS Sans Serif', Tahoma, sans-serif;
  font-size: 11px;
  color: #333;
}
</style>
