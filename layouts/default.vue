<template>
  <div class="fixed inset-0 overflow-hidden" style="background: #008080">
    <div
      id="app-scaler"
      class="flex flex-col overflow-hidden"
      :style="{ width: vp.w + 'px', height: vp.h + 'px', transform: `scale(${vp.scale})`, transformOrigin: '0 0' }"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
updateViewport()
onMounted(() => window.addEventListener('resize', updateViewport))
onBeforeUnmount(() => window.removeEventListener('resize', updateViewport))
</script>
