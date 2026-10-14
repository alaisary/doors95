<template>
  <div class="dse-window">
    <header class="dse-header">
      <div class="dse-title">Honey Security Essentials</div>
      <div class="dse-buttons">
        <button @click="startScan" :disabled="scanning || disinfecting">{{ scanning ? 'Scanning...' : 'Scan' }}</button>
        <button
          v-if="!scanning && !disinfecting && infectionLevel > 5"
          @click="startDisinfect"
          :disabled="disinfecting"
          style="background:#4caf50; color:#fff; border-color:#388e3c;"
        >
          {{ disinfecting ? 'Disinfecting...' : 'Disinfect' }}
        </button>
      </div>
    </header>

    <main class="dse-body">
      <div class="dse-status" :class="statusClass">
        <img :src="statusIcon" :alt="statusText" class="dse-status-icon" />
        <div class="dse-status-text">
          <h2>{{ statusText }}</h2>
          <p v-if="statusDesc">{{ statusDesc }}</p>
        </div>
      </div>

      <div class="dse-progress-bar">
        <div
          class="dse-progress"
          :style="{ width: (disinfecting ? disinfectProgress : progress) + '%' }"
          :class="{ 'bg-green-500': disinfecting }"
        ></div>
      </div>
      <div style="text-align:center; margin-bottom:1.2rem; color:#3a6ea5; font-weight:600;">
        <template v-if="disinfecting">
          Disinfecting... {{ disinfectProgress }}%
        </template>
        <template v-else>
          Scanned {{ scannedFiles }} out of {{ totalFiles }} files ({{ scannedFiles }}/{{ totalFiles }})
        </template>
      </div>

      <div v-if="!scanning && !disinfecting && progress === 100 && warnings.length" class="dse-results">
        <div class="dse-warnings-summary">
          <h3>Scan Report</h3>
          <ul>
            <li v-for="(warn, index) in warnings" :key="index" :class="warn.severity">
              <strong>{{ warn.severity.toUpperCase() }}:</strong> {{ warn.message }}
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const missionInfo = useMissionsStore();
const payloadsState = usePayloadsStore();
const session = useSessionStore();

const scanning = ref(false)
const progress = ref(0)
const warnings = ref([])

const disinfecting = ref(false)
const disinfectProgress = ref(0)

const totalFiles = 24560 // or any number you want
const scannedFiles = computed(() => Math.round((progress.value / 100) * totalFiles))

// a live compromise in the range (clickfix payload) overrides the game's
// mission infection level — the machine is genuinely infected now.
// keyed on the implant itself (antRunner), not session flags: switching to
// another scenario mail resets flags, but the ants keep crawling
const implantLive = computed(() =>
  (session.compromised || payloadsState.antRunner) && !session.flags.disinfected
)
const infectionLevel = computed(() => (implantLive.value ? 90 : missionInfo.infectionLevel))

const statusClass = computed(() => {
  if (disinfecting.value) return 'scanning'
  if (scanning.value) return 'scanning'
  if (infectionLevel.value < 25) return 'safe'
  if (infectionLevel.value < 50) return 'warning'
  return 'infected'
})

const statusText = computed(() => {
  if (disinfecting.value) return 'Disinfecting...'
  if (scanning.value) return 'Scanning...'
  if (infectionLevel.value < 25) return 'You are safe'
  if (infectionLevel.value < 50) return 'There are warnings'
  if (infectionLevel.value < 75) return 'You are infected'
  return 'Severe infection detected'
})

const statusDesc = computed(() => {
  if (disinfecting.value) return 'Attempting to disinfect your system. Please wait...'
  if (scanning.value) return 'Honey Security Essentials is scanning your computer for threats.'
  if (infectionLevel.value < 25) return 'No threats detected. Your computer is protected.'
  if (infectionLevel.value < 50) return 'Some issues were found. Please review the warnings below.'
  if (infectionLevel.value < 75) return 'Threats detected! Immediate action is recommended.'
  return 'Critical threats detected! System at risk.'
})

const statusIcon = computed(() => {
  if (disinfecting.value) return '/images/scanning_icon.png'
  if (scanning.value) return '/images/scanning_icon.png'
  if (infectionLevel.value < 25) return '/images/green_smiley.png'
  if (infectionLevel.value < 50) return '/images/yellow_smiley.png'
  if (infectionLevel.value < 75) return '/images/red_smiley.png'
  return '/images/cursed_smiley.png'
})

// Generate warnings/errors based on the effective infection level
function generateWarnings(level) {
  const issues = []

  // a clickfix compromise reports exactly what the payload left behind —
  // as long as the implant is still live, even if the user switched mails
  if (implantLive.value) {
    return [
      { severity: 'error', message: 'Trojan:Win32/ClickFix — payload "uv.ps1" executed from the Run dialog' },
      { severity: 'error', message: 'Suspicious scheduled task "OneDriveSyncTelemetry" (persistence)' },
      { severity: 'error', message: 'C2 beacon: cdn.wadigate-support-cdn.com → 203.0.113.66:443' },
      { severity: 'warning', message: 'Clipboard hijack: web page replaced the OS clipboard' },
      { severity: 'warning', message: 'PowerShell spawned with "-w hidden -ep bypass"' },
    ]
  }

  // Define some example messages
  const warningMessages = [
    'Suspicious startup program detected',
    'Outdated antivirus definitions',
    'Potentially unwanted program found',
    'Unusual network activity',
    'Temporary files consuming space',
  ]

  const errorMessages = [
    'Malware infection detected',
    'Critical system file corrupted',
    'Unauthorized access attempt',
    'Ransomware signature found',
    'Rootkit detected',
  ]

  // Number of issues depends on missionInfo.infectionLevel range
  let count = 0
  if (level < 25) {
    count = 0
  } else if (level < 50) {
    count = 1 + Math.floor(level / 50 * 2) // 1 or 2 warnings
  } else if (level < 75) {
    count = 2 + Math.floor((level - 50) / 25 * 2) // 2 to 3 warnings/errors
  } else {
    count = 3 + Math.floor((level - 75) / 25 * 2) // 3 to 5 errors
  }

  // Clamp count max 5
  count = Math.min(count, 5)

  for (let i = 0; i < count; i++) {
    if (level < 50) {
      // only warnings
      issues.push({
        severity: 'warning',
        message: warningMessages[i % warningMessages.length],
      })
    } else if (level < 75) {
      // mix warnings and errors
      issues.push({
        severity: i % 2 === 0 ? 'warning' : 'error',
        message: i % 2 === 0 ? warningMessages[i % warningMessages.length] : errorMessages[i % errorMessages.length],
      })
    } else {
      // mostly errors
      issues.push({
        severity: 'error',
        message: errorMessages[i % errorMessages.length],
      })
    }
  }

  return issues
}

function startScan() {
  if (scanning.value || disinfecting.value) return
  scanning.value = true
  progress.value = 0
  warnings.value = []

  // Simulate scan progress with fixed speed
  const interval = setInterval(() => {
    if (progress.value >= 100) {
      clearInterval(interval)
      scanning.value = false
      // Generate warnings/errors after scanning finishes
      warnings.value = generateWarnings(infectionLevel.value)
      // the implant is real: Skippy makes the user act, the app does not
      if (implantLive.value) {
        session.flag('av_scanned')
        session.coach('Scan complete — severe infection. Now disinfect it yourself: hit Disinfect.')
      }
      return
    }
    progress.value += 3
    if (progress.value > 100) progress.value = 100
  }, 100)
}

function resetAndScan() {
  if (disinfecting.value) return
  scanning.value = false
  progress.value = 0
  warnings.value = []
  // Start scan again
  startScan()
}

function startDisinfect() {
  if (disinfecting.value) return
  const wasInfected = implantLive.value
  disinfecting.value = true
  disinfectProgress.value = 0

  // Simulate disinfect progress
  const interval = setInterval(() => {
    if (disinfectProgress.value >= 100) {
      clearInterval(interval)
      disinfecting.value = false

      //Call actual disinfect feature here when implemented
      payloadsState.antRunner = false
      payloadsState.you_are_an_idiot = false
      payloadsState.cube = false
      payloadsState.bobr_kurwa = false
      payloadsState.kirby_paris_hydra = false

      missionInfo.infectionLevel = 0
      warnings.value = []
      progress.value = 100
      // the clickfix infection was cleaned by the user — debrief unlocked
      if (wasInfected) {
        session.flag('disinfected')
        session.coach('Disinfected — the ants are gone, for now. Want to see what actually happened?')
      }
      return
    }
    disinfectProgress.value += 5
    if (disinfectProgress.value > 100) disinfectProgress.value = 100
  }, 100)
}

// Start scanning immediately on page load
onMounted(() => {
  startScan()
})
</script>

<style scoped>
.dse-window {
  width: 100%;
  height: 100%;
  background: #eaf3fa;
  border: none;
  box-shadow: none;
  user-select: none;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.dse-header {
  background: linear-gradient(90deg, #3a6ea5 0%, #5ba4e5 100%);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0.35rem 0.9rem;
  flex-shrink: 0;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border-bottom: 1px solid #2c4e7a;
}

.dse-logo {
  width: 32px;
  height: 32px;
  margin-right: 0.7rem;
}

.dse-title {
  font-weight: bold;
  font-size: 1rem;
  flex: 1;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 0 #2c4e7a;
}

.dse-buttons button {
  background: #eaf3fa;
  border: 1px solid #3a6ea5;
  color: #3a6ea5;
  margin-left: 0.5rem;
  padding: 0.3rem 1.1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s, color 0.2s;
  box-shadow: 1px 1px 0 #fff inset;
}
.dse-buttons button:disabled {
  background: #c7d7ea;
  color: #7a8fa5;
  border-color: #b0c4de;
  cursor: not-allowed;
}
.dse-buttons button:not(:disabled):hover {
  background: #d2e6fa;
  color: #1d3e6e;
}

.dse-body {
  padding: 0.9rem 1.1rem 1.2rem;
}

.dse-status {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #b0c4de;
  border-radius: 6px;
  padding: 0.7rem 1rem;
  margin-bottom: 0.9rem;
  box-shadow: 0 1px 4px #0001;
}
.dse-status-icon {
  width: 36px;
  height: 36px;
  margin-right: 0.9rem;
}
.dse-status-text h2 {
  margin: 0 0 0.15rem 0;
  font-size: 1.1rem;
  font-weight: bold;
}
.dse-status-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #444;
}
.dse-status.safe {
  border-color: #4caf50;
  background: #e8f5e9;
}
.dse-status.safe h2 { color: #388e3c; }
.dse-status.safe .dse-status-icon { filter: none; }
.dse-status.warning {
  border-color: #ffb300;
  background: #fffde7;
}
.dse-status.warning h2 { color: #ff9800; }
.dse-status.warning .dse-status-icon { filter: none; }
.dse-status.infected {
  border-color: #e53935;
  background: #ffebee;
}
.dse-status.infected h2 { color: #c62828; }
.dse-status.infected .dse-status-icon { filter: none; }
.dse-status.scanning {
  border-color: #1976d2;
  background: #e3f2fd;
}
.dse-status.scanning h2 { color: #1976d2; }

.dse-progress-bar {
  width: 100%;
  height: 14px;
  background: #c7d7ea;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: inset 0 0 5px #b0c4de;
  border: 1px solid #b0c4de;
}

.dse-progress {
  height: 100%;
  background: linear-gradient(90deg, #5ba4e5 0%, #3a6ea5 100%);
  transition: width 0.1s linear;
}

.dse-results {
  text-align: left;
}

.dse-warnings-summary {
  font-size: 0.9rem;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #b0c4de;
  border-radius: 6px;
  padding: 0.8rem 1rem;
  box-shadow: 0 1px 4px #0001;
}

.dse-warnings-summary h3 {
  margin-bottom: 0.5rem;
  color: #3a6ea5;
}

.dse-warnings-summary ul {
  list-style: none;
  padding-left: 0;
  margin-top: 0;
}

.dse-warnings-summary li {
  margin-bottom: 0.4rem;
  padding-left: 6px;
  border-left: 4px solid transparent;
  font-weight: 600;
}

.dse-warnings-summary li.warning {
  color: #ff9800;
  border-color: #ffb300;
}

.dse-warnings-summary li.error {
  color: #c62828;
  border-color: #e53935;
}
</style>
