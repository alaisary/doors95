<template>
  <!-- The invitation as it actually arrives: a flat, full-bleed HTML email in
       email-safe Arial. Zoom's real template structure — banner, content,
       social row, legal footer. The only lie is where the button points. -->
  <div class="ze">
    <!-- zoom banner -->
    <div class="ze-banner">
      <span class="ze-wordmark">zoom</span>
    </div>

    <!-- content -->
    <div class="ze-content">

        <div class="ze-app">
          <span class="ze-app-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path fill="#0b5cff" d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path fill="#fff" d="M7 8h10v1.8H7zm0 3.1h10v1.8H7zm0 3.1h6V16H7z"/></svg>
          </span>
          <span class="ze-app-name">Zoom Docs</span>
        </div>

        <h1 class="ze-title">You are invited to "Contract Bid Proposal"</h1>

        <p class="ze-date">Shared today at 14:16</p>

        <p class="ze-line">
          <strong>WADI GATE TENDERS</strong>
          <span class="ze-ext">External</span>
          invited you to view:
        </p>

        <div class="ze-doc">
          <span class="ze-doc-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path fill="#0b5cff" d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path fill="#fff" d="M7 8h10v1.8H7zm0 3.1h10v1.8H7zm0 3.1h6V16H7z"/></svg>
          </span>
          <span class="ze-doc-name">Contract Bid Proposal</span>
        </div>

        <div class="ze-cta">
          <button class="ze-btn" @click="emit('open')">Open doc</button>
        </div>

        <p class="ze-note">
          You're receiving this email because WADI GATE TENDERS invited you to view a doc in Zoom Docs.<br>
          Don't want to receive notifications from Zoom Docs?
          <a href="#" @click.prevent>Click here to unsubscribe</a>
        </p>
    </div>

    <!-- social row -->
    <div class="ze-social">
      <a href="#" @click.prevent aria-label="X">
        <svg viewBox="0 0 24 24"><path fill="#23263b" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a href="#" @click.prevent aria-label="LinkedIn">
        <svg viewBox="0 0 24 24"><path fill="#0a66c2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a href="#" @click.prevent aria-label="YouTube">
        <svg viewBox="0 0 24 24"><path fill="#f00" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.819a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </a>
    </div>

    <!-- legal footer -->
    <div class="ze-legal">
      <p>Copyright ©2026 Zoom Video Communications, Inc. All rights reserved.</p>
      <p>55 Almaden Boulevard, 6th Floor, San Jose, CA 95113</p>
      <p>
        <a href="#" @click.prevent>Privacy</a>
        <a href="#" @click.prevent>Terms</a>
        <a href="#" @click.prevent>Trust Center</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ mail: { date: string } }>()
const emit = defineEmits(['open'])
</script>

<style scoped>
/* flat HTML email: no card, no radius, no shadows, email-safe Arial */
.ze {
  background: #fff;
  font-family: Arial, Helvetica, sans-serif;
  color: #23263b;
  -webkit-font-smoothing: antialiased;
}

/* banner — zoom wordmark on brand blue */
.ze-banner {
  height: 88px;
  background: #0b5cff;
}
.ze-wordmark {
  display: inline-block;
  margin: 21px 0 0 40px;
  color: #fff;
  font-family: 'Almaden Sans', 'Arial Rounded MT Bold', 'Helvetica Rounded', Arial, sans-serif;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1;
}

/* centered content column (real emails center a fixed-width block) */
.ze-content {
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 24px 8px;
  text-align: center;
}

.ze-app {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-bottom: 26px;
}
.ze-app-icon { width: 28px; height: 28px; }
.ze-app-icon svg { width: 100%; height: 100%; display: block; }
.ze-app-name { font-size: 15px; font-weight: 700; color: #3a4256; }

.ze-title {
  font-size: 25px;
  line-height: 1.3;
  font-weight: 700;
  color: #23263b;
  margin: 0 0 8px;
}
.ze-date { font-size: 13px; color: #74748f; margin: 0 0 24px; }

.ze-line { font-size: 15px; color: #23263b; margin: 0 0 16px; }
.ze-ext {
  font-size: 11px;
  font-weight: 700;
  color: #5f6368;
  border: 1px solid #dadce0;
  border-radius: 3px;
  padding: 1px 7px;
  margin: 0 7px;
  vertical-align: 1px;
  white-space: nowrap;
}

.ze-doc {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e0e5ee;
  padding: 11px 20px 11px 14px;
  margin-bottom: 34px;
  background: #fff;
}
.ze-doc-icon { width: 24px; height: 24px; }
.ze-doc-icon svg { width: 100%; height: 100%; display: block; }
.ze-doc-name { font-size: 14px; font-weight: 700; color: #23263b; }

/* CTA — the pill button from the real template, no glow */
.ze-cta { margin-bottom: 38px; }
.ze-btn {
  background: #0b5cff;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 14px 64px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.ze-btn:hover { background: #0a4fd8; }

.ze-note {
  font-size: 12px;
  color: #9aa0a6;
  line-height: 1.7;
  margin: 0 0 34px;
}
.ze-note a { color: #74748f; text-decoration: underline; }

/* social row */
.ze-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 0 0 30px;
}
.ze-social a {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ze-social svg { width: 19px; height: 19px; display: block; }

/* legal footer */
.ze-legal {
  border-top: 1px solid #f0f1f4;
  text-align: center;
  font-size: 11px;
  color: #9aa0a6;
  line-height: 1.9;
  padding: 22px 24px 30px;
}
.ze-legal p { margin: 0; }
.ze-legal a { color: #74748f; text-decoration: underline; margin: 0 8px; }
</style>
