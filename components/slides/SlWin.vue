<template>
  <div class="sl-w sl-rv" :style="{ left: `${x}cqw`, top: `${y}cqw`, width: `${w}cqw`, height: `${h}cqw`, '--d': `${d}s` }">
    <div class="sl-tb" :class="kind"><span>{{ title }}</span><span><i /><i /></span></div>
    <div class="sl-bd"><slot /></div>
  </div>
</template>

<script setup lang="ts">
// a Windows 95 window on the slide stage; every size is in cqw so it scales with the stage
withDefaults(defineProps<{ x: number; y: number; w: number; h: number; title: string; kind?: '' | 'atk' | 'real'; d?: number }>(), { kind: '', d: 0 })
</script>
