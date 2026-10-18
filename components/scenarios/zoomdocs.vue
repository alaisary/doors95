<template>
  <!-- THE LANDING PAGE: a REAL Zoom Docs share (docs.zoom.us). The domain and
       the real interstitial: slim header, external-sender banner, one document
       sender genuinely check out — the trap is the file the doc hands over. -->
  <div class="zd-root">
    <!-- slim app header: this really is docs.zoom.us -->
    <header class="zd-header">
      <span class="zd-wordmark">zoom</span>
      <span class="zd-header-app">Docs</span>
      <span class="zd-header-right">Help</span>
    </header>

    <!-- ===== stage: invitation — one document row, one Open button ===== -->
    <div v-if="stage === 'invite'" class="zd-main">
      <div class="zd-row">
        <span class="zd-row-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path fill="#0b5cff" d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path fill="#fff" d="M7 8h10v1.8H7zm0 3.1h10v1.8H7zm0 3.1h6V16H7z"/></svg>
        </span>
        <span class="zd-row-info">
          <span class="zd-row-name">Contract Bid Proposal</span>
          <span class="zd-row-meta">Shared today by Wadi Gate Tenders. Expires in 7 days.</span>
        </span>
        <button class="zd-open" @click="openDoc">Open</button>
      </div>
    </div>

    <!-- ===== stage: document viewer ===== -->
    <div v-else class="zd-viewer">
      <div class="zd-toolbar">
        <span class="zd-toolbar-file">Contract Bid Proposal</span>
        <span class="zd-toolbar-sub">shared by Wadi Gate Tenders</span>
        <span class="zd-toolbar-share">Shared</span>
      </div>

      <div class="zd-body">
        <div class="zd-page">
          <div class="zd-page-head">CONTRACT BID PROPOSAL</div>
          <div class="zd-page-sub">Wadi Gate Logistics: Q3 Fleet Services Tender</div>
          <div class="zd-page-lines" aria-hidden="true">
            <span v-for="n in 7" :key="n" :style="{ width: [92, 84, 88, 70, 90, 62, 78][n - 1] + '%' }"></span>
          </div>
          <div class="zd-page-cta">
            <div class="zd-page-lock">This attachment requires an additional download.</div>
            <button class="zd-attach" :disabled="stage !== 'viewer'" @click="downloadAttachment">
              Download Secure Attachment
            </button>
            <div class="zd-page-meta" v-if="stage === 'viewer'">Contract_Bid_Proposal.pdf, 2.4 MB</div>

            <div v-if="stage === 'downloading'" class="zd-progress">
              <div class="zd-progress-label">
                <span>Downloading Contract_Bid_Proposal.pdf…</span>
                <span>{{ progress }}%</span>
              </div>
              <div class="zd-progress-track"><div class="zd-progress-fill" :style="{ width: progress + '%' }"></div></div>
            </div>
            <div v-else-if="stage === 'saved'" class="zd-progress">
              <div class="zd-progress-label zd-done">
                <span>Download complete</span><span>100%</span>
              </div>
              <div class="zd-progress-track"><div class="zd-progress-fill zd-done" style="width: 100%"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- the browser's download prompt, drawn as this workstation draws its
           windows: the file is not what the page called it -->
      <div v-if="stage === 'saved'" class="zd-dl" role="status">
        <div class="zd-dl-title">File Download</div>
        <div class="zd-dl-body">
          <svg width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">
            <path d="M6 2h14l6 6v22H6z" fill="#fff" stroke="#000"/><path d="M20 2v6h6" fill="#c0c0c0" stroke="#000"/>
            <rect x="9" y="13" width="14" height="2" fill="#000181"/><rect x="9" y="17" width="14" height="2" fill="#000181"/><rect x="9" y="21" width="9" height="2" fill="#000181"/>
          </svg>
          <div class="zd-dl-info">
            <div class="zd-dl-name">Contract_Bid_Proposal.js</div>
            <div class="zd-dl-sub">JavaScript File, 28 KB. Saved to Desktop.</div>
          </div>
        </div>
        <div class="zd-dl-actions"><button class="zd-dl-open" @click="runFile">Open</button></div>
      </div>
    </div>

    <!-- slim footer -->
    <footer class="zd-footer">
      <span>Copyright ©2026 Zoom Video Communications, Inc. All rights reserved.</span>
      <a href="#" @click.prevent>Privacy</a>
      <a href="#" @click.prevent>Terms</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
const session = useSessionStore()

type Stage = 'invite' | 'viewer' | 'downloading' | 'saved'
const stage = ref<Stage>('invite')
const progress = ref(0)

function openDoc() {
  session.log('EMAIL_LINK_FOLLOWED', 'opened a shared Zoom document on the real docs.zoom.us', 'neutral')
  stage.value = 'viewer'
  session.flag('zoomdoc_viewed')
  session.timelineStep('You opened the shared document page')
}

let progressTimer: ReturnType<typeof setInterval> | null = null

function downloadAttachment() {
  if (stage.value !== 'viewer') return
  stage.value = 'downloading'
  progress.value = 0
  session.flag('zoom_download_started')
  session.log('DOWNLOAD_STARTED', 'Contract_Bid_Proposal.pdf (secure attachment)', 'risky')
  session.timelineStep('You downloaded the “secure attachment”')
  session.c2Start()
  session.c2Log('[host] visitor is downloading "Contract_Bid_Proposal.pdf", delivered as a .js file', 'text-emerald-300', 'A browser download of a script file (.js) from a document-sharing link', 'Mark external shares and warn on script downloads')

  progressTimer = setInterval(() => {
    progress.value = Math.min(100, progress.value + Math.floor(6 + Math.random() * 12))
    if (progress.value >= 100) {
      if (progressTimer) clearInterval(progressTimer)
      progressTimer = null
      finishDownload()
    }
  }, 180)
}

function finishDownload() {
  stage.value = 'saved'
  // the page called it a PDF; what arrived is a Windows script
  session.flag('zoom_js_downloaded')
  session.log('FILE_SAVED', 'Contract_Bid_Proposal.js (JavaScript File)', 'risky')
}

// "Open file" in the downloads flyout asks Windows to open it, which raises
// the security warning (JsExecution.vue); the desktop icon does the same
function runFile() {
  if (session.flags.zoom_js_running || session.flags.compromised || session.outcomeReady) return
  session.flag('zoom_open_prompt')
  session.log('FILE_OPEN_REQUESTED', 'Contract_Bid_Proposal.js from the downloads list', 'neutral')
}

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer)
})
</script>

<style scoped>
.zd-root {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: #fff;
  font-family: 'Noto Sans', 'Segoe UI', Helvetica, Arial, sans-serif;
  color: #00053d;
}

/* ---------- slim header ---------- */
.zd-header {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 28px;
  border-bottom: 1px solid #e8ebf1;
  flex-shrink: 0;
}
.zd-wordmark {
  color: #0b5cff;
  font-family: 'Almaden Sans', 'Arial Rounded MT Bold', 'Helvetica Rounded', Arial, sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
  line-height: 1;
}
.zd-header-app {
  font-size: 13px;
  color: #6b7280;
  border-left: 1px solid #e8ebf1;
  padding-left: 10px;
}
.zd-header-right {
  margin-left: auto;
  font-size: 13px;
  color: #0b5cff;
}

/* ---------- invitation: one document row ---------- */
.zd-main {
  flex: 1;
  background: #f8f9fb;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 72px 24px;
}
.zd-row {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border: 1px solid #e4e8f0;
  border-radius: 8px;
  padding: 24px 26px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.zd-row-icon { width: 40px; height: 40px; flex-shrink: 0; }
.zd-row-icon svg { width: 100%; height: 100%; display: block; }
.zd-row-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.zd-row-name { font-size: 15.5px; font-weight: 700; color: #00053d; }
.zd-row-meta { font-size: 12px; color: #6b7280; }

.zd-open {
  background: #0b5cff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 30px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  flex-shrink: 0;
}
.zd-open:hover { background: #0a4fd8; }

/* ---------- viewer ---------- */
.zd-viewer { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.zd-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 28px;
  background: #fff;
  border-bottom: 1px solid #e8ebf1;
  flex-shrink: 0;
}
.zd-toolbar-file { font-size: 14px; font-weight: 700; }
.zd-toolbar-sub { font-size: 12px; color: #6b7280; }
.zd-toolbar-share {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: #0b5cff;
  background: #e6f0ff;
  border-radius: 4px;
  padding: 3px 9px;
}

.zd-body {
  flex: 1;
  background: #f8f9fb;
  overflow-y: auto;
}
.zd-page {
  width: min(560px, calc(100% - 48px));
  margin: 34px auto 90px;
  background: #fff;
  border: 1px solid #e4e8f0;
  padding: 38px 42px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.zd-page-head { font-size: 18px; font-weight: 800; letter-spacing: 0.08em; }
.zd-page-sub { font-size: 12.5px; color: #6b7280; margin-top: 4px; }
.zd-page-lines {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 26px 0 30px;
}
.zd-page-lines span { height: 8px; background: #eef1f7; border-radius: 2px; }

.zd-page-cta { width: 100%; display: flex; flex-direction: column; align-items: center; }
.zd-page-lock { font-size: 12.5px; color: #6b7280; margin-bottom: 14px; }
.zd-attach {
  background: #0b5cff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 13px 36px;
  font-size: 14.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.zd-attach:hover:not(:disabled) { background: #0a4fd8; }
.zd-attach:disabled { background: #b9c8ee; cursor: default; }
.zd-page-meta { font-size: 11.5px; color: #9aa0ad; margin-top: 10px; }

.zd-progress { width: 100%; margin-top: 20px; }
.zd-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #5b6273;
  margin-bottom: 7px;
}
.zd-progress-label.zd-done { color: #1a8f4a; font-weight: 600; }
.zd-progress-track { height: 6px; background: #eef1f7; overflow: hidden; }
.zd-progress-fill { height: 100%; background: #0b5cff; transition: width 0.18s linear; }
.zd-progress-fill.zd-done { background: #1a8f4a; }

/* ---------- download prompt (Win95 chrome) ---------- */
.zd-viewer { position: relative; }
.zd-dl {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 330px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.35);
  font-family: 'Windows 95', 'MS Sans Serif', Arial, sans-serif;
  color: #000;
  z-index: 3;
}
.zd-dl-title {
  padding: 3px 8px;
  background: linear-gradient(to bottom, #000181 0%, #3a6ea5 100%);
  color: #fff;
  font-size: 13px;
  font-weight: bold;
}
.zd-dl-body { display: flex; gap: 12px; align-items: center; padding: 14px 14px 8px; }
.zd-dl-info { min-width: 0; }
.zd-dl-name { font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.zd-dl-sub { font-size: 11.5px; color: #404040; }
.zd-dl-actions { display: flex; justify-content: flex-end; padding: 6px 14px 12px; }
.zd-dl-open {
  min-width: 80px;
  padding: 3px 12px;
  font-family: inherit;
  font-size: 12.5px;
  color: #000;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #fcfcfc #565656 #565656 #fcfcfc;
  cursor: pointer;
}
.zd-dl-open:active { border-color: #565656 #fcfcfc #fcfcfc #565656; }

.zd-footer {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
  text-align: center;
  padding: 18px;
  border-top: 1px solid #e8ebf1;
  font-size: 11.5px;
  color: #9aa0a6;
}
.zd-footer a { color: #74748f; text-decoration: underline; }
</style>
