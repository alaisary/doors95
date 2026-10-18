import { defineStore } from 'pinia'

export const useOpenWindowsStore = defineStore("windows", {
  state: () => ({ 
    openWindows: [] as string[],
    lastClickedWindow: "",
    minimizedWindows: [] as string[],
    maximizedWindows: [] as string[],
    installableSoftware: {
      minecraft: false
    }
  }),
  actions: {
    openWindow(windowName: string) {
      if (!this.openWindows.includes(windowName)) {
        this.openWindows.push(windowName)
        // (re)opening a window restores it
        this.minimizedWindows = this.minimizedWindows.filter((w) => w !== windowName)
        setTimeout(() => {
          this.lastClickedWindow = windowName
        }, 1)
      } else {
        // clicking an already-open window un-minimizes it
        this.minimizedWindows = this.minimizedWindows.filter((w) => w !== windowName)
        this.lastClickedWindow = windowName
      }
    },
    closeWindow(windowName: string) {
      const index = this.openWindows.indexOf(windowName)
      if (index !== -1) {
        this.openWindows.splice(index, 1)
      }
      this.minimizedWindows = this.minimizedWindows.filter((w) => w !== windowName)
      this.maximizedWindows = this.maximizedWindows.filter((w) => w !== windowName)
    },
    closeAllWindows() {
      this.openWindows = []
      this.minimizedWindows = []
      this.maximizedWindows = []
    },
    minimizeWindow(windowName: string) {
      if (this.openWindows.includes(windowName) && !this.minimizedWindows.includes(windowName)) {
        this.minimizedWindows.push(windowName)
        if (this.lastClickedWindow === windowName) this.lastClickedWindow = ""
      }
    },
    toggleMaximize(windowName: string) {
      if (this.maximizedWindows.includes(windowName)) {
        this.maximizedWindows = this.maximizedWindows.filter((w) => w !== windowName)
      } else {
        this.maximizedWindows.push(windowName)
      }
    },
    isMaximized(windowName: string) {
      return this.maximizedWindows.includes(windowName)
    },
    setLastClickedWindow(windowName: string) {
      // focusing a window from the taskbar also restores it
      this.minimizedWindows = this.minimizedWindows.filter((w) => w !== windowName)
      this.lastClickedWindow = windowName
    }
  }
})
