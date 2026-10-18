<template>
  <div class="fixed inset-0 z-[9800] overflow-hidden select-none" style="background: #0a0a0a" @pointerdown="wake">
    <!-- ATTRACT SCREEN: a power-on check that ends on the one box that fails -->
    <!-- the two attract slides take turns; blinds wipe between them -->
    <BoothBootCheck v-if="view === 'boot'" :key="'b' + turn" @done="swap" />
    <BoothWelcomeSlide v-else :key="'w' + turn" @done="swap" />
    <SlidesBlinds v-if="turn > 0" :key="'bl' + turn" />
    <div class="scanlines absolute inset-0 pointer-events-none"></div>

    <!-- the start window, once someone touches the screen -->
    <transition name="slip">
      <div v-if="showCard" class="absolute inset-0 flex items-center justify-center px-8" style="background: rgba(0, 0, 0, 0.6)">
        <div class="win95-card w-[720px] max-w-full">
          <div class="win95-titlebar">
            <span>Lure95 — Social Engineering Range</span>
            <span class="win95-titlebar-fakebtns"><i></i><i></i><i class="x"></i></span>
          </div>

          <div class="p-10 text-center" style="font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif">
            <div class="text-[14px] tracking-[0.4em] text-[#3a3a3a] mb-2">SOCIAL ENGINEERING RANGE</div>
            <h1 class="text-6xl font-bold text-black tracking-tight">Lure95</h1>
            <p class="mt-4 text-xl text-[#303030] max-w-lg mx-auto leading-relaxed">
              A workstation. A mailbox. Real attacks.
              <b>Your behavior is the answer.</b>
            </p>

            <div class="flex flex-col gap-3 mt-8 max-w-md mx-auto">
              <button class="win95-big-btn" @click.stop="session.startFull()">
                <div class="text-center">
                  <div class="text-[13px] tracking-widest text-[#505050]">FULL EXPERIENCE</div>
                  <div class="text-4xl font-bold text-black">START SHIFT</div>
                  <div class="text-base text-[#404040] mt-1">You are covering a colleague's desk. Handle the messages that arrive.</div>
                </div>
              </button>
            </div>

            <div class="text-[12px] text-[#555] tracking-wider mt-6">
              100% OFFLINE · NO REAL CREDENTIALS, NETWORKS OR PAYLOADS
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

const showCard = ref(false)
const view = ref<'boot' | 'welcome'>('boot')
const turn = ref(0)
function swap() {
  view.value = view.value === 'boot' ? 'welcome' : 'boot'
  turn.value++
}

function wake() {
  showCard.value = true
}

// a card nobody touched goes back to the power-on check
let cardTimer: ReturnType<typeof setTimeout> | null = null
watch(showCard, (on) => {
  if (cardTimer) clearTimeout(cardTimer)
  if (on) cardTimer = setTimeout(() => { showCard.value = false }, 30000)
})

onUnmounted(() => {
  if (cardTimer) clearTimeout(cardTimer)
})
</script>

<style scoped>
.scanlines {
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.05) 0px,
    rgba(0, 0, 0, 0.05) 1px,
    transparent 1px,
    transparent 3px
  );
}
/* start card transition */
.slip-enter-active, .slip-leave-active { transition: opacity 0.25s, transform 0.25s; }
.slip-enter-from { opacity: 0; transform: translateY(14px) scale(0.97); }
.slip-leave-to { opacity: 0; transform: translateY(-10px); }

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
  font-size: 15px;
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
.win95-titlebar-fakebtns i.x { background: #c0c0c0; }
.win95-big-btn {
  padding: 16px 20px;
  text-align: left;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
}
.win95-big-btn:hover { background: #d4d4d4; }
.win95-big-btn:active {
  border-color: #565656 #fcfcfc #fcfcfc #565656;
  background: #c8c8c8;
}
</style>
