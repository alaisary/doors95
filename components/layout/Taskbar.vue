<template>
  <!-- doors95-style bottom bar (light) -->
  <div class="win95-taskbar">
    <div class="flex items-center gap-1 min-w-0">
      <LayoutBottomBarButton @click="startOpen = !startOpen">
        <div class="flex flex-row items-center justify-start gap-1.5 w-[4.6rem] -mx-1 cursor-pointer">
          <IconStar class="w-4 h-4" />
          <span class="win95-tb-label font-bold">Start</span>
        </div>
      </LayoutBottomBarButton>

      <div class="win95-tb-sep"></div>

      <div class="flex flex-row items-center gap-1 min-w-0 overflow-hidden">
        <LayoutBottomBarButton
          v-for="name in currentlyOpenWindows.openWindows"
          :key="name"
          @click="currentlyOpenWindows.setLastClickedWindow(name)"
        >
          <div class="win95-tb-label text-left cursor-pointer min-w-[4rem] max-w-[180px] truncate"
            :class="{ 'font-bold': currentlyOpenWindows.lastClickedWindow === name }"
            :style="currentlyOpenWindows.minimizedWindows.includes(name) ? 'opacity:.55' : ''">
            {{ name }}
          </div>
        </LayoutBottomBarButton>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-shrink-0">
      <button
        class="win95-run-btn win95-tb-label"
        title="Run (Win+R)"
        @click="emits('run-dialog')"
      >
        ▸ Run…
      </button>
      <div class="win95-tb-tray">
        <IconWireless class="w-4 h-4 text-black" />
        <LayoutBottomBarClock />
      </div>
    </div>

    <!-- start menu -->
    <div v-if="startOpen" class="win95-startmenu">
      <div class="win95-startmenu-banner"><span class="rotate">Honey95</span></div>
      <div class="win95-startmenu-items">
        <button v-for="item in menu" :key="item.label" class="win95-startmenu-item" @click="pick(item)">
          <span class="w-6 text-center flex-shrink-0">{{ item.icon }}</span>
          <span class="win95-tb-label">{{ item.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const currentlyOpenWindows = useOpenWindowsStore()
const session = useSessionStore()

const startOpen = ref(false)

const emits = defineEmits(['run-dialog'])

const menu = [
  { label: 'Run…', icon: '▸', action: 'run' },
  { label: 'Mail', icon: '✉', action: 'open', win: 'Mail' },
  { label: 'WhatsApp', icon: '💬', action: 'open', win: 'WhatsApp' },
  { label: 'Browser', icon: '🌐', action: 'open', win: 'Browser' },
  { label: 'Authenticator', icon: '🔑', action: 'open', win: 'Authenticator' },
  { label: 'Notepad', icon: '📝', action: 'open', win: 'Notepad' },
  { label: 'Terminal', icon: '▮', action: 'open', win: 'Terminal' },
  { label: 'Antivirus', icon: '🛡', action: 'open', win: 'Antivirus' },
  { label: 'Scamcyclopedia', icon: '📚', action: 'open', win: 'Scamcyclopedia' },
  { label: 'Dino Game', icon: '🦖', action: 'open', win: 'Dino Game' },
  { label: 'Credits', icon: 'ℹ', action: 'open', win: 'Credits' },
  { label: 'Shut down', icon: '⏻', action: 'off' },
]

function pick(item: { label: string; action: string; win?: string }) {
  startOpen.value = false
  if (item.action === 'run') emits('run-dialog')
  else if (item.action === 'open' && item.win) useOpenWindowsStore().openWindow(item.win)
  else if (item.action === 'off') session.quitToEntry()
}

</script>

<style scoped>
.win95-taskbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 40px;
  background: #c0c0c0;
  border-top: 2px solid #fcfcfc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 4px;
  gap: 6px;
  z-index: 5000;
}
.win95-tb-label {
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 12px;
  color: #000;
}
.win95-tb-sep {
  width: 2px;
  height: 26px;
  border-left: 1px solid #808080;
  border-right: 1px solid #fcfcfc;
  margin: 0 2px;
  flex-shrink: 0;
}
.win95-tb-tray {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border: 2px solid;
  border-color: #808080 #fcfcfc #fcfcfc #808080;
}
.win95-run-btn {
  padding: 4px 8px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
}
.win95-run-btn:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }
.win95-reset-btn {
  padding: 4px 6px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
}
.win95-reset-btn:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }

/* start menu */
.win95-startmenu {
  position: absolute;
  bottom: 42px;
  left: 2px;
  width: 230px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.3);
  display: flex;
  z-index: 5100;
}
.win95-startmenu-banner {
  width: 26px;
  background: linear-gradient(to top, #000181, #3a6ea5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 8px 0;
  flex-shrink: 0;
}
.win95-startmenu-banner .rotate {
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 1px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.win95-startmenu-items {
  flex: 1;
  padding: 3px;
  display: flex;
  flex-direction: column;
}
.win95-startmenu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}
.win95-startmenu-item:hover {
  background: #000181;
}
.win95-startmenu-item:hover .win95-tb-label { color: #fff; }
</style>
