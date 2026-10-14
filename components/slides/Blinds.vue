<template>
  <!-- venetian blinds that open on a new slide: a Windows 95 style wipe. Plays once when the slide appears. -->
  <div class="bl-wrap" aria-hidden="true">
    <i v-for="n in 14" :key="n" class="bl-bar" :style="{ left: `${(n - 1) * (100 / 14)}%`, animationDelay: `${(n - 1) * 35}ms` }" />
  </div>
</template>

<style scoped>
.bl-wrap { position: fixed; inset: 0; z-index: 50; pointer-events: none; overflow: hidden; }
.bl-bar { position: absolute; top: 0; bottom: 0; width: calc(100% / 14 + 1px); background: linear-gradient(90deg, #00302f, #006060); transform-origin: top; animation: bl-open 0.55s ease-in both; }
@keyframes bl-open { 0% { transform: scaleY(1); } 100% { transform: scaleY(0); } }
@media (prefers-reduced-motion: reduce) { .bl-bar { animation-duration: 0.01s; animation-delay: 0s !important; } }
</style>
