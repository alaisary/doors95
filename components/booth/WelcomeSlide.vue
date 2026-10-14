<template>
  <!-- Attract slide 2: welcome to the booth. Alternates with the power-on check until someone touches the screen. -->
  <div class="ws-root">
   <div class="ws-stage">
    <div class="ws-grid" />
    <div class="ws-win">
      <div class="ws-tb"><span>Welcome.exe</span><span><i /><i /><i /></span></div>
      <div class="ws-bd">
        <div class="ws-top">
          <div class="ws-logo"><img src="/images/logo.png" alt="Insight - security with insight"></div>
          <div class="ws-event">
            <small>7TH INSIGHT INFORMATION SECURITY TECHNOLOGY CONVENTION</small>
            <b>ISTC 2026</b>
          </div>
        </div>
        <h1>Welcome to the<br><em>Social Engineering</em> booth</h1>
        <p class="ws-line">Six real attacks. One workstation. <b>You are the target.</b></p>
        <div class="ws-chips"><span>PHISHING</span><span>MFA BYPASS</span><span>FAKE LOGINS</span><span>MALWARE</span><span>SUPPLY CHAIN</span></div>
        <div class="ws-go">TOUCH TO START</div>
      </div>
    </div>
    <div class="ws-task"><span><b>Start</b></span><span class="ws-it">Honey95 - Social Engineering Range</span><span class="ws-gap" /><span>100% OFFLINE</span></div>
   </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ done: [] }>()
let t: ReturnType<typeof setTimeout>
onMounted(() => { t = setTimeout(() => emit('done'), 14000) })
onUnmounted(() => clearTimeout(t))
</script>

<style scoped>
.ws-root { position: absolute; inset: 0; container-type: size; background: #006666; display: flex; align-items: center; justify-content: center; overflow: hidden; font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif; color: #000; }
.ws-stage { position: relative; container-type: inline-size; width: min(100cqw, 100cqh * 16 / 9); aspect-ratio: 16 / 9; background: #008080; overflow: hidden; }
.ws-grid { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, #0000000d 0 .25cqw, transparent .25cqw .5cqw); }
.ws-win { position: absolute; left: 9cqw; right: 9cqw; top: 3.5cqw; background: #c0c0c0; border: .3cqw solid; border-color: #fff #565656 #565656 #fff; box-shadow: .8cqw .8cqw 0 #0006; animation: ws-in .7s .35s both; }
.ws-tb { display: flex; justify-content: space-between; align-items: center; padding: .5cqw .9cqw; background: linear-gradient(90deg, #000181, #3a6ea5); color: #fff; font-weight: bold; font-size: 1.7cqw; }
.ws-tb i { display: inline-block; width: 1.5cqw; height: 1.4cqw; margin-left: .3cqw; background: #c0c0c0; border: .2cqw solid; border-color: #fff #565656 #565656 #fff; }
.ws-bd { padding: 2cqw 3.4cqw 2.2cqw; text-align: center; }
.ws-top { display: flex; align-items: center; justify-content: space-between; gap: 2cqw; text-align: left; }
.ws-logo { line-height: 0; padding: 0 1cqw; }
.ws-logo img { width: 15cqw; display: block; filter: drop-shadow(0 0 .25cqw #fffc) drop-shadow(0 0 .1cqw #fff); }
.ws-event small { display: block; font-size: 1.35cqw; letter-spacing: .08em; color: #333; max-width: 36cqw; line-height: 1.35; }
.ws-event b { display: block; font: bold 5.2cqw 'Courier New', monospace; letter-spacing: .08em; color: #000181; line-height: 1.1; margin-top: .4cqw; }
h1 { font-size: 3.9cqw; line-height: 1.2; margin: 2cqw 0 1cqw; font-weight: bold; }
h1 em { font-style: normal; color: #a00000; }
.ws-line { font-size: 1.9cqw; color: #222; margin: 0; }
.ws-chips { display: flex; justify-content: center; gap: .9cqw; margin-top: 1.6cqw; }
.ws-chips span { white-space: nowrap; font-size: 1.2cqw; letter-spacing: .06em; padding: .45cqw 1.1cqw; background: #c0c0c0; border: .2cqw solid; border-color: #fff #565656 #565656 #fff; }
.ws-go { display: inline-block; margin-top: 2cqw; padding: .8cqw 3cqw; font-size: 2.3cqw; letter-spacing: .12em; font-weight: bold; background: #1f4fd8; color: #fff; border: .3cqw double #fff; animation: ws-bl 1s steps(1) infinite; }
.ws-task { position: absolute; left: 0; right: 0; bottom: 0; height: 3.4cqw; display: flex; align-items: center; gap: .8cqw; padding: 0 .7cqw; background: #c0c0c0; border-top: .2cqw solid #fff; font-size: 1.4cqw; }
.ws-task > span { border: .18cqw solid; border-color: #fff #565656 #565656 #fff; padding: .3cqw 1.1cqw; }
.ws-task .ws-it { border-color: #565656 #fff #fff #565656; background: #d4d0c8; font-weight: bold; }
.ws-task .ws-gap { flex: 1; border: none; }
@keyframes ws-in { from { opacity: 0; transform: translateY(1.5cqw); } to { opacity: 1; transform: none; } }
@keyframes ws-bl { 50% { opacity: .35; } }
@media (prefers-reduced-motion: reduce) { .ws-win, .ws-go { animation: none; } }
</style>
