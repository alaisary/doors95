<template>
  <!-- the classic "so I don't forget" sticky note — draggable by its header,
       the contents are selectable and copyable (into the simulated clipboard) -->
  <div ref="noteEl" class="sticky-note" :style="noteStyle">
    <div class="sn-tape" aria-hidden="true"></div>
    <div class="sn-title" title="drag me" @pointerdown="onDown">SO I DON'T FORGET</div>
    <ul class="sn-list" @copy="onCopy">
      <li>work mail: <b>s.alharthi@wadigate.om</b></li>
      <li>password: <b>CorrectHorseBattery!</b></li>
      <li>ejada portal: <b>77123456</b></li>
    </ul>
    <div class="sn-foot">— Salim (do NOT lose this desk!)</div>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

const noteEl = ref<HTMLElement | null>(null)
const wx = ref(0)
const wy = ref(0)
const noteStyle = computed(() => ({ transform: `translate(${wx.value}px, ${wy.value}px) rotate(2deg)` }))

let readOnce = false

function onDown(e: PointerEvent) {
  if (e.button !== 0) return
  const startX = toApp(e.clientX)
  const startY = toApp(e.clientY)
  const startWx = wx.value
  const startWy = wy.value
  let moved = false

  const onMove = (ev: PointerEvent) => {
    const dx = toApp(ev.clientX) - startX
    const dy = toApp(ev.clientY) - startY
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true
    wx.value = startWx + dx
    wy.value = startWy + dy
  }
  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    if (!moved && !readOnce) {
      readOnce = true
      session.log('STICKY_NOTE_READ', 'the password lives on a sticky note on the desk', 'risky')
      session.coach('Your password, on a sticky note, on the desk. One photo of this desk and your accounts are done.')
    }
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

// copying from the note also lands in the SIMULATED OS clipboard, so the text
// can be pasted into the Run dialog / logins with Ctrl+V
function onCopy() {
  const sel = window.getSelection()?.toString().trim()
  if (sel) {
    session.clipboard = sel
    session.log('COPIED_FROM_NOTE', 'text copied from the sticky note', 'neutral')
  }
}
</script>

<style scoped>
.sticky-note {
  position: absolute;
  right: 26px;
  top: 96px;
  width: 310px;
  background: #fff7a1;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  padding: 20px 18px 14px;
  font-family: 'Segoe Script', 'Comic Sans MS', 'Bradley Hand', cursive;
  color: #3a3417;
  z-index: 5;
}
.sn-tape {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(-3deg);
  width: 96px;
  height: 24px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}
.sn-title {
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
  border-bottom: 1px dashed rgba(58, 52, 23, 0.35);
  padding-bottom: 7px;
  cursor: grab;
  user-select: none;
}
.sn-title:active { cursor: grabbing; }
.sn-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 15px;
  line-height: 1.45;
  /* selectable + copyable */
  user-select: text;
  cursor: text;
}
.sn-list b { font-weight: 700; word-break: break-all; }
.sn-foot {
  margin-top: 12px;
  font-size: 13px;
  text-align: right;
  color: #6b6230;
  user-select: none;
}
</style>
