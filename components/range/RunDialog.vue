<template>
  <div v-if="visible" class="fixed inset-0 z-[8500] bg-black/25 flex items-start justify-center" @keydown.esc="cancel">
    <div class="mt-28 win95-run">
      <div class="win95-run-titlebar">
        <div class="flex items-center gap-2">
          <svg viewBox="0 0 88 88" style="height:14px;width:14px"><path fill="#fff" d="M0 12.5 35.7 7.6v34.9L0 42.6zM39.9 7 87.9 0v42.3L39.9 42.7zM0 46.2 35.7 48.6V83L0 78.1zM39.9 48.3 87.9 48.6v41.3L39.9 83.6z"/></svg>
          <span>Run</span>
        </div>
        <button class="win95-run-close" @click="cancel">✕</button>
      </div>

      <div class="p-4">
        <div class="flex gap-4">
          <svg viewBox="0 0 88 88" class="flex-shrink-0" style="height:38px;width:38px"><path fill="#0078d4" d="M0 12.5 35.7 7.6v34.9L0 42.6zM39.9 7 87.9 0v42.3L39.9 42.7zM0 46.2 35.7 48.6V83L0 78.1zM39.9 48.3 87.9 48.6v41.3L39.9 83.6z"/></svg>
          <div class="flex-1">
            <p class="win95-run-label">Type the name of a program, and Windows will execute it for you.</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="win95-run-label">Open:</span>
              <div class="win95-run-input flex-1 flex items-center">
                <input
                  ref="inputEl"
                  v-model="value"
                  class="flex-1 bg-transparent outline-none win95-run-label"
                  style="font-family: 'Windows 95', 'MS Sans Serif', monospace"
                  spellcheck="false"
                  @paste="onPaste"
                  @keydown.ctrl.v.prevent="paste"
                  @keydown.enter="execute"
                >
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <UiButton @click="execute">OK</UiButton>
          <UiButton @click="cancel">Cancel</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

const visible = defineModel<boolean>('visible', { default: false })
const value = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

watch(visible, (v) => {
  if (v) {
    value.value = ''
    nextTick(() => inputEl.value?.focus())
    session.flag('run_dialog_opened')
    session.log('RUN_DIALOG_OPENED', undefined, 'neutral')
  }
})

// Ctrl+V in the simulated OS pastes the SIMULATED clipboard (session state),
// which the fake verification page silently hijacked. The cursor lands at the
// END of the input so the reassuring "# comment" tail is what the user sees.
function paste() {
  if (session.clipboard) {
    value.value = session.clipboard
    session.log('PASTED', 'clipboard content pasted into Run', 'risky')
    nextTick(() => {
      const el = inputEl.value
      if (el) {
        el.focus()
        el.setSelectionRange(el.value.length, el.value.length)
      }
    })
  }
}
function onPaste(e: Event) {
  e.preventDefault()
  paste()
}

function execute() {
  if (!value.value.trim()) return
  emit('exec', value.value.trim())
  visible.value = false
}
function cancel() {
  session.log('RUN_CANCELLED', undefined, 'safe')
  session.flag('run_cancelled')
  session.coach('You cancelled — good pause. Nothing on a verification page should ever land in Run.')
  visible.value = false
  if (session.scenarioId === 'clickfix') session.survive()
}

const emit = defineEmits(['exec'])
</script>

<style scoped>
.win95-run {
  width: 440px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.35);
}
.win95-run-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 4px 3px 8px;
  background: linear-gradient(to bottom, #000181 0%, #3a6ea5 100%);
  color: #fff;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 13px;
  font-weight: bold;
}
.win95-run-close {
  width: 20px;
  height: 18px;
  font-size: 11px;
  line-height: 1;
  color: #000;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 2px;
}
.win95-run-close:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }
.win95-run-label {
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 12.5px;
  color: #000;
}
.win95-run-sim {
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 10.5px;
  color: #555;
  margin-top: 2px;
}
.win95-run-input {
  background: #fff;
  border: 2px solid;
  border-color: #565656 #fcfcfc #fcfcfc #565656;
  padding: 3px 6px;
}
</style>
