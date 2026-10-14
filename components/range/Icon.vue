<template>
  <button
    class="flex flex-col items-center gap-1 w-full py-1 rounded group transition-colors"
    @click="emit('open', windowName)"
    @dblclick="emit('open', windowName)"
  >
    <div class="relative w-12 h-12 flex items-center justify-center group-active:scale-95 transition-transform">
      <slot />
      <span v-if="badge" class="win95-badge">{{ badge }}</span>
    </div>
    <span class="win95-icon-label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps({ windowName: String, label: String, badge: { type: Number, default: 0 } })
const emit = defineEmits(['open'])
</script>

<style scoped>
.win95-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  background: #25d366;
  color: #fff;
  border: 2px solid #fff;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
}
.win95-icon-label {
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 16px;
  color: #fff;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.8);
  padding: 1px 4px;
}
.win95-icon-label { text-align: center; line-height: 1.15; }
.group:hover .win95-icon-label {
  background: #000181;
  outline: 1px dotted #fff;
}
</style>
