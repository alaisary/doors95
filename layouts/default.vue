<template>
  <div class="fixed inset-0 overflow-hidden" style="background: #008080">
    <div
      id="app-scaler"
      class="flex flex-col overflow-hidden"
      :style="{ width: vp.w + 'px', height: vp.h + 'px', transform: `scale(${vp.scale})`, transformOrigin: '0 0' }"
    >
      <slot />
    </div>

    <!-- phone/tablet browser: this is a desktop experience. Upright it blocks (nothing fits), sideways it's a one-time heads-up -->
    <div
      v-if="vp.touch && (vp.portrait || !noticeDismissed)"
      class="fixed inset-0 z-[20000] flex items-center justify-center p-4 overflow-auto"
      style="background: #008080; font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif; touch-action: none"
    >
      <div class="notice w-full" role="dialog" aria-labelledby="notice-title">
        <div class="notice-bar"><span>Lure95</span><i></i></div>
        <div class="notice-body" :class="vp.portrait ? 'flex-col text-center' : 'flex-row text-left'">
          <div class="rotate-icon shrink-0" :class="{ 'is-landscape': !vp.portrait }" aria-hidden="true">
            <svg :width="vp.portrait ? 84 : 56" :height="vp.portrait ? 84 : 56" viewBox="0 0 24 24" fill="none" stroke="#000181" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="7" y="2" width="10" height="20" rx="2" />
              <path d="M11 19h2" />
            </svg>
          </div>
          <div>
            <h2 id="notice-title" class="notice-title">Best viewed on a desktop</h2>
            <p class="notice-text">
              Lure95 is built for a big screen, but you're welcome to play on your phone.
              <template v-if="vp.portrait"><b>Turn your phone sideways</b> and everything will fit.</template>
              <template v-else>Everything is shrunk to fit, so text may look small.</template>
            </p>
            <button v-if="!vp.portrait" class="notice-btn" @click="noticeDismissed = true">Continue</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const noticeDismissed = ref(false)
updateViewport()
onMounted(() => {
  window.addEventListener('resize', updateViewport)
  window.addEventListener('orientationchange', updateViewport)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport)
  window.removeEventListener('orientationchange', updateViewport)
})
</script>

<style scoped>
.notice {
  max-width: 460px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.4);
}
.notice-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 3px 4px 3px 8px;
  background: linear-gradient(to bottom, #000181 0%, #3a6ea5 100%);
  color: #fff; font-size: 14px; font-weight: bold;
}
.notice-bar i {
  width: 16px; height: 14px; background: #c0c0c0; border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
}
.notice-body { display: flex; align-items: center; gap: 16px; padding: 20px; }
.notice-title { font-size: 22px; font-weight: bold; color: #000; margin: 0; }
.notice-text { font-size: 15px; line-height: 1.4; color: #202020; margin: 8px 0 0; }
.notice-btn {
  margin-top: 14px; padding: 6px 28px; font-size: 15px; font-weight: bold; color: #000;
  background: #c0c0c0; border: 2px solid; border-color: #fcfcfc #565656 #565656 #fcfcfc;
  outline: 1px solid #000; outline-offset: 0;
}
.notice-btn:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }
.rotate-icon { animation: rotate-hint 2.4s ease-in-out infinite; }
.rotate-icon.is-landscape { animation: none; transform: rotate(-90deg); }
@keyframes rotate-hint {
  0%, 25% { transform: rotate(0deg); }
  60%, 100% { transform: rotate(-90deg); }
}
@media (prefers-reduced-motion: reduce) { .rotate-icon { animation: none; } }
</style>
