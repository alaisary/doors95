<template>
  <!-- the original doors95 "ant runner" payload: ants crawling over the desktop
       while the clickfix implant is live. pure theatre — pointer-events none -->
  <div v-if="payloads.antRunner" class="ant-container" aria-hidden="true">
    <div
      v-for="ant in ants"
      :key="ant.id"
      class="ant"
      :style="{
        left: ant.x + 'px',
        top: ant.y + 'px',
        transform: `rotate(${ant.angle}deg)`,
      }"
    >🐜</div>
  </div>
</template>

<script setup lang="ts">
const payloads = usePayloadsStore()

const antCount = 26
const ants = ref<any[]>([])

function createAnt(id: number) {
  const direction = Math.random() * 360
  const speed = Math.random() * 1.5 + 0.5
  const radians = (direction * Math.PI) / 180
  return {
    id,
    x: Math.random() * vp.w,
    y: Math.random() * vp.h,
    speed,
    direction,
    dx: Math.cos(radians) * speed,
    dy: Math.sin(radians) * speed,
    angle: direction + 90,
  }
}

let raf: number | null = null

function animate() {
  for (const ant of ants.value) {
    ant.direction += (Math.random() - 0.5) * 5
    const radians = (ant.direction * Math.PI) / 180
    ant.dx = Math.cos(radians) * ant.speed
    ant.dy = Math.sin(radians) * ant.speed
    ant.x += ant.dx
    ant.y += ant.dy

    const w = vp.w
    const h = vp.h
    if (ant.x > w) ant.x = 0
    if (ant.x < 0) ant.x = w
    if (ant.y > h) ant.y = 0
    if (ant.y < 0) ant.y = h
    ant.angle = ant.direction + 180
  }
  raf = requestAnimationFrame(animate)
}

watch(
  () => payloads.antRunner,
  (active) => {
    if (active) {
      ants.value = Array.from({ length: antCount }, (_, i) => createAnt(i))
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(animate)
    } else {
      if (raf) cancelAnimationFrame(raf)
      raf = null
      ants.value = []
    }
  },
  { immediate: true }
)

onUnmounted(() => { if (raf) cancelAnimationFrame(raf) })
</script>

<style scoped>
.ant-container {
  position: fixed;
  inset: 0;
  z-index: 7400;
  overflow: hidden;
  pointer-events: none;
}
.ant {
  position: absolute;
  font-size: 1.4rem;
  user-select: none;
  pointer-events: none;
}
</style>
