<template>
  <div v-if="session.phase === 'debrief' && session.slide === 'debrief' && scenario && card" class="fixed inset-0 z-[9600] overflow-y-auto" style="background: rgba(0,96,96,0.92)">
    <SlidesBlinds />
    <div class="win95-card mx-auto my-[calc(1.5*var(--vh))]" style="width: min(1560px, calc(100% - 40px))">
      <div class="win95-titlebar">
        <span>Debrief</span>
        <span class="win95-titlebar-fakebtns"><i></i><i></i><i class="x"></i></span>
      </div>

      <div class="p-5 db-font">
        <!-- the technique is the title -->
        <h1 class="technique-title">{{ card.chip }}</h1>
        <div class="technique-sub">{{ scenario.technique.name }}</div>
        <div class="flex items-center gap-4 flex-wrap mt-2 mb-3">
          <span class="stamp" :class="session.compromised ? 'bad' : 'good'">{{ session.compromised ? 'COMPROMISED' : 'SPOTTED IT' }}</span>
          <div class="verdict">{{ session.compromised ? card.verdict.lose : card.verdict.win }}</div>
        </div>

        <div class="grid gap-4 db-grid">
          <!-- the picture, with a red ring on the tell -->
          <div>
            <div v-if="shot" class="hero" :style="{ aspectRatio: `${shot.w} / ${shot.h}` }">
              <img :src="`/art/debrief/${card.hero}.png`" alt="" draggable="false">
              <div class="ring" :style="{ left: shot.x + '%', top: shot.y + '%', width: shot.cw + '%', height: shot.ch + '%' }"></div>
            </div>
            <div class="tell">{{ card.tell }}</div>
          </div>

          <div class="flex flex-col gap-3">
            <div>
              <div class="tag">RULE</div>
              <div class="rule">{{ card.rule }}</div>
            </div>
            <div>
              <div class="tag">HABIT</div>
              <div class="habit">{{ card.habit }}</div>
            </div>
            <!-- the old advice from the attract loop, and how this attack beat it -->
            <div class="slip">
              <div class="slip-advice">{{ card.slip.advice }}</div>
              <div class="slip-answer">{{ card.slip.answer }}</div>
            </div>
            <div v-if="scenario.stats?.length" class="stat">
              {{ scenario.stats[0].text }}
              <span v-if="scenario.stats[0].source" class="stat-src">{{ scenario.stats[0].source }}, {{ scenario.stats[0].year }} · vendor-reported, indicative</span>
            </div>
            <!-- the three layers of detection: what a person sees, what blocks it, what a SOC sees -->
            <div v-if="scenario.detection" class="det-grid">
              <div class="det">
                <div class="tag">1 · HUMAN TELL</div>
                <div class="det-text">{{ scenario.detection.human }}</div>
              </div>
              <div class="det">
                <div class="tag">2 · CONTROL</div>
                <div class="det-text">{{ scenario.detection.control }}</div>
              </div>
              <div class="det">
                <div class="tag">3 · SOC SIGNAL</div>
                <div class="det-text">{{ scenario.detection.signal }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- for the people who run IT -->
        <div v-if="itOpen" class="it-drawer mt-5">
          <div class="tag">HOW IT WORKS</div>
          <div class="it-name">{{ scenario.technique.name }}</div>
          <div class="chips">
            <span v-for="v in scenario.technique.variants" :key="v.label" class="chip" :title="v.desc">{{ v.label }}</span>
          </div>
          <div class="tag mt-3">CONTROLS</div>
          <div class="chips">
            <span v-for="c in scenario.controls" :key="c.label" class="chip ctl" :title="c.detail">{{ c.label }}</span>
          </div>
          <div class="sources">
            Sources:
            <span v-for="(src, i) in scenario.sources" :key="src.title" :title="`${src.title} (${src.date})`">{{ src.publisher }}<span v-if="i < scenario.sources.length - 1">, </span></span>
          </div>
        </div>

        <div class="flex gap-3 flex-wrap mt-3">
          <button v-if="session.compromised && hasAttackerSlide(session.scenarioId)" class="win95-btn px-6 py-2.5" @click="session.showSlide('attacker')">◀ ATTACKER'S VIEW</button>
          <button class="win95-btn px-6 py-2.5 font-bold" @click="session.scenarioDone()">BACK TO DESKTOP →</button>
          <button class="win95-btn px-6 py-2.5" @click="replay">⟲ REPLAY</button>
          <button class="win95-btn px-6 py-2.5" @click="itOpen = !itOpen">FOR IT FOLKS {{ itOpen ? '▴' : '▾' }}</button>
          <button v-if="session.allDone()" class="win95-btn px-6 py-2.5 font-bold" style="background: #d4d4d4" @click="session.quitToEntry()">FINISH SESSION →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { hasAttackerSlide } from '~/utils/attackerSlides'
const session = useSessionStore()
const scenario = computed(() => session.scenario as any)
const card = computed(() => scenario.value?.card)
const itOpen = ref(false)
watch(() => session.phase, () => { itOpen.value = false })

function replay() {
  const id = session.scenarioId
  if (!id) return
  session.scenarioDone()
  session.engageScenario(id, true)
  session.coach('Same attack, fresh start. Watch for the tells this time.')
}

const shot = computed(() => DEBRIEF_SHOTS[card.value?.hero ?? ''])

</script>

<style scoped>
.det-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
.det { background: #fcfcfc; border: 2px solid; border-color: #565656 #fcfcfc #fcfcfc #565656; padding: 10px 12px; }
.det-text { margin-top: 2px; font-size: 14px; line-height: 1.35; color: #111; }
@media (max-width: 900px) { .det-grid { grid-template-columns: 1fr; } }
.db-font { font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif; color: #000; }
.win95-card {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.4);
}
.win95-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px 4px 10px;
  background: linear-gradient(to bottom, #000181 0%, #3a6ea5 100%);
  color: #fff;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 14px;
  font-weight: bold;
}
.win95-titlebar-fakebtns { display: flex; gap: 3px; }
.win95-titlebar-fakebtns i {
  width: 16px;
  height: 14px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
}
.win95-btn {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  color: #000;
  cursor: pointer;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 18px;
}
.win95-btn:hover { background: #d4d4d4; }
.win95-btn:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }

.stamp {
  padding: 4px 14px;
  font-size: 22px;
  letter-spacing: 0.12em;
  border: 4px solid;
  transform: rotate(-3deg);
  background: #fcfcfc;
}
.stamp.bad { color: #d00000; border-color: #d00000; }
.stamp.good { color: #0a7a2a; border-color: #0a7a2a; }
.technique-title { font-size: 60px; line-height: 1; font-weight: bold; color: #000181; letter-spacing: 0.01em; }
.technique-sub { margin-top: 10px; font-size: 22px; color: #404040; }
.verdict { font-size: 26px; line-height: 1.1; font-weight: bold; }

.db-grid { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); }
@media (max-width: 860px) { .db-grid { grid-template-columns: 1fr; } }

/* the picture */
.hero { position: relative; width: 100%; background: #fff; border: 2px solid; border-color: #565656 #fcfcfc #fcfcfc #565656; overflow: hidden; }
.hero img { width: 100%; height: 100%; display: block; object-fit: cover; }
.ring { position: absolute; border: 4px solid #e00000; border-radius: 8px; box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.7); box-sizing: border-box; pointer-events: none; }
.tell { margin-top: 10px; padding: 8px 12px; background: #fcfcfc; border: 2px solid; border-color: #565656 #fcfcfc #fcfcfc #565656; font-size: 21px; font-weight: bold; color: #b00000; }

.tag { font-size: 15px; letter-spacing: 0.3em; line-height: 1.6; margin-bottom: 6px; color: #404040; font-weight: bold; }
.rule { font-size: 34px; line-height: 1.12; font-weight: bold; color: #000181; }
.habit { font-size: 25px; line-height: 1.2; }

.slip { padding: 8px 12px; background: #fcfcfc; border: 2px dashed #565656; transform: rotate(0.6deg); }
.slip-advice { font-size: 20px; font-weight: bold; color: #565656; text-decoration: line-through; text-decoration-color: #d00000; text-decoration-thickness: 3px; }
.slip-answer { margin-top: 2px; font-size: 24px; color: #000; }

.stat { font-size: 17px; color: #303030; line-height: 1.3; }
.stat-src { display: block; margin-top: 2px; font-size: 12px; color: #606060; }

.it-drawer { padding: 12px 14px; background: #d4d0c8; border: 2px solid; border-color: #565656 #fcfcfc #fcfcfc #565656; }
.it-name { font-size: 18px; font-weight: bold; margin: 2px 0 6px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 2px 10px; font-size: 13px; background: #fcfcfc; border: 2px solid; border-color: #fcfcfc #565656 #565656 #fcfcfc; cursor: help; }
.chip.ctl { background: #e6e6ff; }
.sources { margin-top: 10px; font-size: 12px; color: #404040; }
</style>
