<template>
  <!-- The attract screen: a 1995 power-on check where every box ticks except the human one.
       Loops until someone touches the screen. Offline: system monospace only. -->
  <div ref="root" class="bc-root">
    <div class="bc-scr">
      <div v-for="(l, i) in shown" :key="i" :class="l.k">{{ l.t }}</div>
    </div>
    <div class="bc-scan"></div>
    <div class="bc-box" :class="{ on: boxOn }">
      <div class="bc-big">Advice isn't enough.<br><em>Try it.</em></div>
      <div class="bc-go">TOUCH TO START</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ done: [] }>()
type Line = { k: string; t: string }
// one report line: label, dots to a fixed column, status
const row = (label: string, status: string) => `${label} `.padEnd(31, '.') + ` ${status}`

// what a power-on check reports. Every piece of old advice passes, and only after that does the human fail.
const ADVICE = ['Verify the sender', 'Check the padlock', 'Use MFA', 'Check the URL', "Don't download anything", 'Use strong passwords']
const LINES: Line[] = [
  { k: 'hd', t: 'HONEY95 BIOS v1.0   (C) 1995-2026 Social Engineering Range' },
  { k: '', t: 'CPU: Pentium 90MHz     Mouse: Detected' },
  { k: 'mem', t: '' },
  { k: '', t: '' },
  { k: 'ok', t: row('Operating system', 'OK') },
  { k: 'ok', t: row('Patch level', 'OK') },
  { k: 'ok', t: row('Antivirus', 'OK') },
  { k: 'ok', t: row('Email filter', 'OK') },
  { k: 'ok', t: row('MFA enrolled', 'OK') },
  { k: 'ok', t: row('Awareness training', 'COMPLETE') },
  { k: 'pend', t: row('Human firewall', 'CHECKING') },
  // tree branches, as the DOS `tree` command draws them, to show these belong to the line above
  ...ADVICE.map((a, i): Line => ({ k: 'sub', t: row(`  ${i < ADVICE.length - 1 ? '\u251c\u2500' : '\u2514\u2500'} ${a}`, 'PASSED') })),
]

const shown = ref<Line[]>([])
const boxOn = ref(false)
let run = 0
let alive = true

const wait = (ms: number, id: number) =>
  new Promise<boolean>((res) => setTimeout(() => res(id === run && alive), ms))

async function play() {
  const id = ++run
  shown.value = []
  boxOn.value = false
  for (const src of LINES) {
    const line = reactive<Line>({ k: src.k, t: '' })
    shown.value.push(line)
    if (src.k === 'mem') {
      for (let m = 0; m <= 640; m += 64) {
        line.t = `Memory test: ${m}K`
        if (!(await wait(90, id))) return
      }
      line.t = 'Memory test: 640K OK'
      continue
    }
    for (let c = 2; c <= src.t.length + 1; c += 2) {
      line.t = src.t.slice(0, c)
      if (!(await wait(26, id))) return
    }
    line.t = src.t
    if (!(await wait(src.k === 'sub' ? 380 : 320, id))) return
  }
  // every sub-check passed, and only now does the parent report
  if (!(await wait(1100, id))) return
  const parent = shown.value.find((l) => l.k === 'pend')
  if (parent) { parent.k = 'bad'; parent.t = row('Human firewall', 'FAILED') }
  if (!(await wait(1800, id))) return
  boxOn.value = true
  if (!(await wait(8000, id))) return
  emit('done')
}

onMounted(() => { alive = true; play() })
onUnmounted(() => { alive = false; run++ })
</script>

<style scoped>
.bc-root {
  position: absolute; inset: 0; background: #0a0a0a; overflow: hidden;
  container-type: inline-size;
  font-family: 'Courier New', Consolas, monospace; color: #c8c8c8;
}
.bc-scr { position: absolute; left: 4cqw; right: 4cqw; top: 3cqw; font-size: 2cqw; line-height: 1.28; white-space: pre; font-weight: bold; }
.hd { color: #fff; } .pend { color: #e8d36a; } .ok { color: #7dff9b; } .sub { color: #8fbf9f; font-weight: normal; } .bad { color: #ff5050; animation: bc-bad 1.2s steps(1) infinite; }
.bc-scan { position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(#0000 0 .25cqw, #0000000d .25cqw .5cqw); }
.bc-box {
  /* beside the list, so the failing line stays visible */
  position: absolute; left: 55cqw; top: 15cqw; width: 41cqw; transform: scale(.96);
  background: #1f4fd8; color: #fff; border: .35cqw double #fff; padding: 2.4cqw 2cqw; text-align: center;
  opacity: 0; transition: opacity .3s, transform .3s; font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
}
.bc-box.on { opacity: 1; transform: none; }
.bc-big { font-size: 4.4cqw; line-height: 1.1; font-weight: bold; }
.bc-big em { font-style: normal; color: #ffd24a; }
.bc-go { margin-top: 1.6cqw; font-size: 2.6cqw; letter-spacing: .1em; animation: bc-bl 1s steps(1) infinite; }
@keyframes bc-bl { 50% { opacity: .15; } }
/* the verdict stays readable while it blinks */
@keyframes bc-bad { 50% { opacity: .5; } }
@media (prefers-reduced-motion: reduce) { .bad, .bc-go { animation: none; } }
</style>
