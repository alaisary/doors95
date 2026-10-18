<template>
  <div class="flex flex-col h-full bg-[#f4f4f4] text-black overflow-y-auto">
    <!-- header -->
    <div class="px-4 py-3 border-b border-[#d9d9d9] bg-white">
      <div class="text-sm font-bold" style="font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif">
        Wadi Gate Authenticator
      </div>
      <div class="text-[11px] text-[#606060] mt-0.5">One-time passcodes for work accounts</div>
    </div>

    <!-- account + rotating code -->
    <div class="p-5">
      <div class="auth-card">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-[#000181] text-white flex items-center justify-center text-sm font-bold">AF</div>
          <div class="min-w-0">
            <div class="text-[13px] font-medium truncate">s.alharthi@wadigate.om</div>
            <div class="text-[11px] text-[#606060]">Wadi Gate SSO · default</div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-4">
          <!-- the rotating TOTP code -->
          <div class="flex items-center gap-3">
            <svg viewBox="0 0 36 36" class="auth-ring">
              <circle cx="18" cy="18" r="15.9" class="auth-ring-bg"/>
              <circle
                cx="18" cy="18" r="15.9" class="auth-ring-fg"
                :stroke-dasharray="`${(session.authyTtl / 30) * 100} 100`"
              />
            </svg>
            <div>
              <div class="auth-code">{{ codeFormatted }}</div>
              <div class="text-[10px] text-[#606060]">refreshes in {{ session.authyTtl }}s</div>
            </div>
          </div>

          <button class="auth-copy" @click="copyCode">COPY</button>
        </div>
      </div>

      <div class="text-[10px] text-[#808080] mt-4 leading-relaxed">
        Codes work for whoever is signing in — they prove "someone has the device",
        not "the website asking for it" is yours.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

const codeFormatted = computed(() => {
  const c = session.authyCode
  return c.length === 6 ? `${c.slice(0, 3)} ${c.slice(3)}` : c
})

function copyCode() {
  session.clipboard = session.authyCode
  session.log('AUTHY_CODE_COPIED', 'authenticator code copied to clipboard', 'neutral')
}
</script>

<style scoped>
.auth-card {
  background: #fff;
  border: 2px solid;
  border-color: #565656 #fcfcfc #fcfcfc #565656;
  padding: 18px;
}
.auth-code {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #111;
  font-variant-numeric: tabular-nums;
}
.auth-ring { width: 40px; height: 40px; transform: rotate(-90deg); }
.auth-ring-bg { fill: none; stroke: #e0e0e0; stroke-width: 3; }
.auth-ring-fg {
  fill: none;
  stroke: #0067b8;
  stroke-width: 3;
  transition: stroke-dasharray 1s linear;
}
.auth-copy {
  padding: 8px 20px;
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #000;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
}
.auth-copy:hover { background: #d4d4d4; }
.auth-copy:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }
</style>
