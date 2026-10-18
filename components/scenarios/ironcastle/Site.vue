<template>
  <!-- THE PRODUCT: a polished, credible AI startup. Nothing here looks malicious.
       The attack lives in one line of the docs — and in the package the docs tell
       you to install. -->
  <div class="ic-root" :class="{ 'is-third-party': thirdParty }">
    <header v-if="!thirdParty" class="ic-nav">
      <span class="ic-brand" @click="go('home')"><img class="ic-brand-mark" src="/ironcastle-logo.svg" alt="IronCastle">IronCastle</span>
      <nav class="ic-nav-links">
        <button :class="{ on: section === 'models' }" @click="go('models')">Models</button>
        <button :class="{ on: section === 'pricing' }" @click="go('pricing')">Pricing</button>
        <button :class="{ on: section === 'playground' }" @click="go('playground')">Playground</button>
        <button :class="{ on: section === 'docs' }" @click="go('docs')">Docs</button>
        <button :class="{ on: section === 'github' }" @click="go('github')">GitHub</button>
        <button :class="{ on: section === 'npm' }" @click="go('npm')">npm</button>
      </nav>
      <div class="ic-nav-right">
        <span class="ic-status"><i class="ic-status-dot"></i>All systems operational</span>
        <button class="ic-login">Sign in</button>
      </div>
    </header>

    <!-- ===== HOME ===== -->
    <main v-if="section === 'home'" class="ic-main">
      <section class="ic-hero">
        <div class="ic-hero-eyebrow">Free to try, no credit card</div>
        <h1 class="ic-hero-title">Frontier intelligence.<br>Developer pricing.</h1>
        <p class="ic-hero-sub">
          One API for Iron-Reasoner, Iron-Code, Iron-Vision and Iron-Flash.
          We subsidize inference so independent developers can build with frontier
          models without enterprise contracts.
        </p>
      <div class="ic-hero-cta">
        <button class="ic-btn primary" @click="go('docs')">Try it free</button>
        <button class="ic-btn" @click="go('models')">View models</button>
      </div>

      <!-- the homepage tells you exactly how to install — it looks like help -->
      <div class="ic-hero-install">
        <div class="ic-hero-install-head">
          <span class="ic-hero-install-title">Install the IronCastle CLI</span>
          <span class="ic-hero-install-sub">Up and running in under 30 seconds</span>
        </div>
        <div class="ic-hero-cmd">
          <code>npm i -g ironcastle-code@latest</code>
          <button class="ic-copy" :class="{ done: copied }" @click="copyInstall">
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <div class="ic-hero-install-note">macOS, Linux and Windows. Requires Node.js 20 or later.</div>
      </div>

      <div class="ic-hero-price">
        <b>$10</b><span>/month after your trial</span>
        <em>$80 of equivalent usage at peak, $120 off-peak</em>
      </div>
      </section>

      <section class="ic-stats">
        <div v-for="s in homeStats" :key="s.k" class="ic-stat">
          <div class="ic-stat-v">{{ s.v }}</div>
          <div class="ic-stat-k">{{ s.k }}</div>
        </div>
      </section>

      <section class="ic-logos">
        <span>Trusted by teams building at</span>
        <div class="ic-logos-row">
          <span v-for="l in ['Fintrail', 'Holm', 'Nimbus Labs', 'Vantage', 'Kepler', 'Orbital']" :key="l">{{ l }}</span>
        </div>
      </section>
    </main>

    <!-- ===== MODELS ===== -->
    <main v-else-if="section === 'models'" class="ic-main">
      <h2 class="ic-h2">Models</h2>
      <p class="ic-lead">Frontier checkpoints behind a single OpenAI-compatible endpoint.</p>
      <div class="ic-grid">
        <div v-for="m in models" :key="m.name" class="ic-card model">
          <div class="ic-model-head">
            <span class="ic-model-name">{{ m.name }}</span>
            <span class="ic-model-tag">{{ m.tag }}</span>
          </div>
          <p class="ic-model-desc">{{ m.desc }}</p>
          <div class="ic-model-specs">
            <div><span>Context</span><b>{{ m.ctx }}</b></div>
            <div><span>Throughput</span><b>{{ m.tput }}</b></div>
            <div><span>Rel.</span><b>{{ m.rel }}</b></div>
          </div>
        </div>
      </div>
    </main>

    <!-- ===== PRICING ===== -->
    <main v-else-if="section === 'pricing'" class="ic-main">
      <h2 class="ic-h2">Pricing</h2>
      <p class="ic-lead">Priced for independent developers. Cancel anytime.</p>
      <div class="ic-grid pricing">
        <div v-for="p in plans" :key="p.name" class="ic-card plan" :class="{ featured: p.featured }">
          <div class="ic-plan-name">{{ p.name }}</div>
          <div class="ic-plan-price"><b>{{ p.price }}</b><span>{{ p.per }}</span></div>
          <ul class="ic-plan-list">
            <li v-for="f in p.features" :key="f">{{ f }}</li>
          </ul>
          <button class="ic-btn" :class="{ primary: p.featured }">{{ p.cta }}</button>
        </div>
      </div>
      <p class="ic-fineprint">Fair-use policy applies. Usage is metered across all models at list-equivalent rates.</p>
    </main>

    <!-- ===== PLAYGROUND ===== -->
    <main v-else-if="section === 'playground'" class="ic-main">
      <h2 class="ic-h2">Playground</h2>
      <p class="ic-lead">Try a prompt against Iron-Flash. No key required.</p>
      <div class="ic-play">
        <div class="ic-play-log">
          <div v-for="(m, i) in chat" :key="i" class="ic-msg" :class="m.role">{{ m.text }}</div>
          <div v-if="thinking" class="ic-msg ai ic-thinking">Iron-Flash is thinking…</div>
        </div>
        <div class="ic-play-input">
          <input
            v-model="prompt"
            placeholder="Ask Iron-Flash anything…"
            @keydown.enter.prevent="ask"
          >
          <button class="ic-btn primary" :disabled="thinking" @click="ask">Send</button>
        </div>
      </div>
    </main>

    <!-- ===== DOCS ===== -->
    <main v-else-if="section === 'docs'" class="ic-main">
      <div class="ic-docs">
        <aside class="ic-docs-nav">
          <div class="ic-docs-nav-title">Get started</div>
          <span class="on">Install the CLI</span>
          <span>Authentication</span>
          <span>First request</span>
          <span>Streaming</span>
          <div class="ic-docs-nav-title">Guides</div>
          <span>Model selection</span>
          <span>Rate limits</span>
          <span>Usage &amp; billing</span>
        </aside>

        <article class="ic-docs-body">
          <h2 class="ic-h2">Install the IronCastle CLI</h2>
          <p class="ic-lead">Get started in under 30 seconds.</p>

          <div class="ic-code">
            <div class="ic-code-head">
              <span>shell</span>
              <button class="ic-copy" :class="{ done: copied }" @click="copyInstall">
                {{ copied ? 'Copied' : 'Copy' }}
              </button>
            </div>
            <pre><code>npm i -g ironcastle-code@latest</code></pre>
          </div>

          <p class="ic-note">Requires Node.js 20+. macOS, Linux and Windows supported.</p>

          <h3 class="ic-h3">Run your first request</h3>
          <div class="ic-code">
            <div class="ic-code-head"><span>shell</span></div>
            <pre><code>ironcastle login</code></pre>
          </div>
          <div class="ic-code">
            <div class="ic-code-head"><span>shell</span></div>
            <pre><code>ironcastle ask "Explain this function"</code></pre>
          </div>

          <p class="ic-docs-foot">
            The CLI stores your token in <code>~/.ironcastle/config.json</code>.
            See the <button class="ic-inline-link" @click="go('github')">repository</button> or the
            <button class="ic-inline-link" @click="go('npm')">npm package</button>.
          </p>
        </article>
      </div>
    </main>

    <!-- ===== the code host: a separate, neutral third-party page ===== -->
    <main v-else-if="section === 'github'" class="tp">
      <header class="tp-bar">
        <span class="tp-bar-mark" aria-hidden="true"></span>
        <span class="tp-bar-path"><b>ironcastle</b> / <b>ironcastle-code</b></span>
        <span class="tp-pill">Public</span>
      </header>
      <div class="tp-body tp-cols">
        <section>
          <div class="tp-filehead">
            <span><b>ironcastle-release</b> chore: release 4.8.2</span>
            <span class="tp-dim">3 days ago, <b>4 commits</b></span>
          </div>
          <div class="tp-files">
            <div v-for="f in repoFiles" :key="f.name" class="tp-file">
              <span class="tp-file-name">{{ f.name }}</span>
              <span class="tp-file-msg">{{ f.msg }}</span>
              <span class="tp-dim">{{ f.time }}</span>
            </div>
          </div>
        </section>
        <aside class="tp-side">
          <h3>About</h3>
          <p>The IronCastle command line: frontier models from your terminal.</p>
          <button class="tp-link" @click="go('home')">ironcastle.ai</button>
          <dl class="tp-facts">
            <div><dt>Stars</dt><dd>6.1k</dd></div>
            <div><dt>Forks</dt><dd>412</dd></div>
            <div><dt>Contributors</dt><dd>1</dd></div>
            <div><dt>Created</dt><dd>9 days ago</dd></div>
            <div><dt>Releases</dt><dd>3</dd></div>
            <div><dt>License</dt><dd>MIT</dd></div>
          </dl>
          <h3>Packages</h3>
          <button class="tp-link" @click="go('npm')">ironcastle-code on the package registry</button>
        </aside>
      </div>
    </main>

    <!-- ===== the package registry: a separate, neutral third-party page ===== -->
    <main v-else-if="section === 'npm'" class="tp">
      <header class="tp-bar">
        <span class="tp-bar-mark sq" aria-hidden="true"></span>
        <span class="tp-bar-path">Package registry</span>
      </header>
      <div class="tp-body">
        <div class="tp-pkg-head">
          <h2>ironcastle-code</h2>
          <span class="tp-dim">4.8.2, Public, published 3 days ago</span>
        </div>
        <div class="tp-tabs" role="tablist">
          <button v-for="t in PKG_TABS" :key="t.id" role="tab" :aria-selected="pkgTab === t.id" :class="{ on: pkgTab === t.id }" @click="openPkgTab(t.id)">{{ t.label }}</button>
        </div>

        <div class="tp-cols">
          <section>
            <template v-if="pkgTab === 'readme'">
              <h3 class="tp-h">IronCastle CLI</h3>
              <p>Frontier models from your terminal. One command to install, one to sign in.</p>
              <pre class="tp-pre">npm i -g ironcastle-code@latest
ironcastle login</pre>
              <p class="tp-dim">Documentation and pricing at ironcastle.ai.</p>
            </template>

            <template v-else-if="pkgTab === 'code'">
              <div class="tp-files">
                <div v-for="f in pkgFiles" :key="f.name" class="tp-file">
                  <span class="tp-file-name">{{ f.name }}</span>
                  <span class="tp-file-msg">{{ f.note }}</span>
                  <span class="tp-dim">{{ f.size }}</span>
                </div>
              </div>
              <h3 class="tp-h">package.json</h3>
              <pre class="tp-pre">{{ packageJson }}</pre>
            </template>

            <template v-else-if="pkgTab === 'deps'">
              <div class="tp-files">
                <div v-for="d in ['undici', 'chalk', 'commander']" :key="d" class="tp-file"><span class="tp-file-name">{{ d }}</span></div>
              </div>
            </template>

            <template v-else>
              <div class="tp-files">
                <div v-for="v in pkgVersions" :key="v.v" class="tp-file">
                  <span class="tp-file-name">{{ v.v }}</span>
                  <span class="tp-file-msg">{{ v.dl }} downloads</span>
                  <span class="tp-dim">{{ v.when }}</span>
                </div>
              </div>
              <p class="tp-dim">3 versions. First published 9 days ago.</p>
            </template>
          </section>

          <aside class="tp-side">
            <h3>Install</h3>
            <div class="tp-install">
              <code>npm i -g ironcastle-code</code>
              <button class="tp-link" @click="copyInstall">{{ copied ? 'Copied' : 'Copy' }}</button>
            </div>
            <dl class="tp-facts">
              <div><dt>Weekly downloads</dt><dd>38,421</dd></div>
              <div><dt>Version</dt><dd>4.8.2</dd></div>
              <div><dt>License</dt><dd>MIT</dd></div>
              <div><dt>Unpacked size</dt><dd>1.9 MB</dd></div>
              <div><dt>Total files</dt><dd>5</dd></div>
              <div><dt>Install scripts</dt><dd>postinstall</dd></div>
              <div><dt>Last publish</dt><dd>3 days ago</dd></div>
            </dl>
            <h3>Maintainers</h3>
            <p>ironcastle-release <span class="tp-dim">joined 9 days ago</span></p>
            <h3>Links</h3>
            <button class="tp-link" @click="go('github')">Repository</button>
            <button class="tp-link" @click="go('home')">Homepage</button>
          </aside>
        </div>
      </div>
    </main>

    <footer v-if="!thirdParty" class="ic-footer">
      <span class="ic-footer-brand"><img class="ic-brand-mark sm" src="/ironcastle-logo.svg" alt=""> IronCastle AI</span>
      <span>© 2026 IronCastle AI, Inc.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import emitter from '~/components/misc/eventHandler'

const session = useSessionStore()

type Section = 'home' | 'models' | 'pricing' | 'playground' | 'docs' | 'github' | 'npm'
const section = ref<Section>('home')
const copied = ref(false)

// the repository and registry are other people's sites: they drop the lure's
// own navigation, colours and footer
const thirdParty = computed(() => section.value === 'github' || section.value === 'npm')

const PKG_TABS = [
  { id: 'readme', label: 'Readme' },
  { id: 'code', label: 'Code' },
  { id: 'deps', label: '3 dependencies' },
  { id: 'versions', label: '3 versions' },
] as const
type PkgTab = (typeof PKG_TABS)[number]['id']
const pkgTab = ref<PkgTab>('readme')

const pkgFiles = [
  { name: 'package.json', note: '', size: '412 B' },
  { name: 'bin/cli.js', note: '', size: '6.1 kB' },
  { name: 'scripts/bootstrap.js', note: 'minified, one line', size: '38.2 kB' },
  { name: 'dist/client.js', note: '', size: '1.8 MB' },
  { name: 'README.md', note: '', size: '1.3 kB' },
]
const pkgVersions = [
  { v: '4.8.2', dl: '31,906', when: '3 days ago' },
  { v: '4.8.1', dl: '5,112', when: '6 days ago' },
  { v: '4.8.0', dl: '1,403', when: '9 days ago' },
]

// reading the package contents or its history is the careful thing to do,
// and it ends the play as a stop
function openPkgTab(id: PkgTab) {
  pkgTab.value = id
  if (id === 'code' || id === 'versions') {
    session.log('PACKAGE_INSPECTED', id === 'code' ? 'read package.json on the registry' : 'read the version history on the registry', 'safe')
    session.timelineStep(id === 'code' ? 'You read the package’s install script on the registry' : 'You checked how long the package has existed')
    session.survive()
  }
}

const urls: Record<Section, string> = {
  home: 'https://ironcastle.ai/',
  models: 'https://ironcastle.ai/models',
  pricing: 'https://ironcastle.ai/pricing',
  playground: 'https://ironcastle.ai/playground',
  docs: 'https://ironcastle.ai/docs/quickstart',
  github: 'https://github.com/ironcastle/ironcastle-code',
  npm: 'https://www.npmjs.com/package/ironcastle-code',
}

const homeStats = [
  { v: '2.4B', k: 'tokens served / day' },
  { v: '48ms', k: 'median first token' },
  { v: '99.98%', k: 'uptime (90d)' },
  { v: '31K', k: 'developers' },
]

const models = [
  { name: 'Iron-Reasoner', tag: 'flagship', desc: 'Deep multi-step reasoning for planning, analysis and agentic workflows.', ctx: '256K', tput: '78 tok/s', rel: 'v3.2' },
  { name: 'Iron-Code', tag: 'code', desc: 'Tuned for repository-scale code generation, review and refactoring.', ctx: '512K', tput: '120 tok/s', rel: 'v2.9' },
  { name: 'Iron-Vision', tag: 'multimodal', desc: 'Image, diagram and document understanding with grounded output.', ctx: '128K', tput: '64 tok/s', rel: 'v1.7' },
  { name: 'Iron-Flash', tag: 'fast', desc: 'Low-latency model for chat, classification and high-volume jobs.', ctx: '128K', tput: '340 tok/s', rel: 'v4.1' },
]

const plans = [
  { name: 'Hobby', price: '$0', per: '/month', featured: false, cta: 'Start free', features: ['$5 metered usage', 'Community support', '1 concurrent request'] },
  { name: 'Developer', price: '$10', per: '/month', featured: true, cta: 'Choose Developer', features: ['$80 peak / $120 off-peak equivalent usage', 'All four models', 'CLI + API access', 'Email support'] },
  { name: 'Team', price: '$49', per: '/seat', featured: false, cta: 'Talk to sales', features: ['Pooled usage', 'SSO & audit log', 'Priority routing'] },
]

const repoFiles = [
  { name: 'README.md', msg: 'docs: add CLI quickstart', time: '3 days ago' },
  { name: 'package.json', msg: 'chore: release 4.8.2', time: '3 days ago' },
  { name: 'bin/cli.js', msg: 'feat: interactive login', time: '6 days ago' },
  { name: 'scripts/bootstrap.js', msg: 'chore: minify', time: '3 days ago' },
  { name: 'dist/client.js', msg: 'build', time: '6 days ago' },
  { name: 'LICENSE', msg: 'Initial commit', time: '9 days ago' },
]

const packageJson = `{
  "name": "ironcastle-code",
  "version": "4.8.2",
  "description": "IronCastle command line",
  "bin": { "ironcastle": "./bin/cli.js" },
  "scripts": {
    "postinstall": "node ./scripts/bootstrap.js"
  },
  "dependencies": {
    "undici": "^6.19.2",
    "chalk": "^5.3.0",
    "commander": "^12.1.0"
  },
  "license": "MIT"
}`

// playground
const prompt = ref('')
const chat = ref<{ role: 'you' | 'ai'; text: string }[]>([])
const thinking = ref(false)
const replies = [
  'Here is a concise explanation. The function short-circuits on the first valid match, so the loop exits early — the rest of the array is never evaluated.',
  'You can refactor this into a single reduce call. I have kept the original semantics and side-effect ordering.',
  'That pattern usually indicates a missing await. Add it before the call and the race disappears.',
]
let replyIdx = 0
async function ask() {
  const q = prompt.value.trim()
  if (!q || thinking.value) return
  chat.value.push({ role: 'you', text: q })
  prompt.value = ''
  thinking.value = true
  session.log('PLAYGROUND_USED', 'tried the lure playground', 'neutral')
  await new Promise((r) => setTimeout(r, 700))
  thinking.value = false
  chat.value.push({ role: 'ai', text: replies[replyIdx++ % replies.length] })
}

function go(next: Section) {
  section.value = next
  emitter.emit('setUrl', urls[next])
  if (next === 'npm') pkgTab.value = 'readme'
  if (next === 'github') {
    session.log('REPO_INSPECTED', 'opened the repository and saw who maintains it', 'safe')
    session.timelineStep('You checked who publishes the package')
    session.survive()
  }
}

const INSTALL_CMD = 'npm i -g ironcastle-code@latest'

function copyInstall() {
  session.clipboard = INSTALL_CMD
  copied.value = true
  session.log('DOC_COMMAND_COPIED', INSTALL_CMD, 'risky')
  session.timelineStep('You copied the install command')
  setTimeout(() => (copied.value = false), 2200)
}

onMounted(() => {
  emitter.emit('setUrl', urls.home)
})
</script>

<style scoped>
.ic-root {
  min-height: 100%;
  background: #0b0d12;
  color: #e6e9ef;
  font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

/* nav */
.ic-nav {
  display: flex;
  align-items: center;
  gap: 26px;
  height: 60px;
  padding: 0 30px;
  border-bottom: 1px solid #1c2230;
  background: rgba(11, 13, 18, 0.96);
  position: sticky;
  top: 0;
  z-index: 5;
}
.ic-brand {
  display: flex; align-items: center; gap: 9px;
  font-size: 17px; font-weight: 800; letter-spacing: -0.01em;
  cursor: pointer;
}
.ic-brand-mark { width: 28px; height: 28px; display: block; }
.ic-brand-mark.sm { width: 20px; height: 20px; }
.ic-nav-links { display: flex; gap: 4px; }
.ic-nav-links button {
  background: none; border: none; color: #9aa3b2;
  font-family: inherit; font-size: 13.5px; padding: 8px 12px;
  border-radius: 7px; cursor: pointer;
}
.ic-nav-links button:hover { color: #e6e9ef; background: #161b25; }
.ic-nav-links button.on { color: #ffb020; }
.ic-nav-right { margin-left: auto; display: flex; align-items: center; gap: 16px; }
.ic-status { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #7d8797; }
.ic-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
.ic-login {
  background: #ffb020; color: #0b0d12; border: none; border-radius: 8px;
  padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
}

/* main */
.ic-main { flex: 1; max-width: 1080px; width: 100%; margin: 0 auto; padding: 48px 30px 70px; }
.ic-h2 { font-size: 30px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.02em; }
.ic-h3 { font-size: 16px; font-weight: 700; margin: 30px 0 10px; }
.ic-lead { font-size: 15px; color: #9aa3b2; margin: 0 0 30px; }

/* hero */
.ic-hero { padding: 30px 0 10px; max-width: 720px; }
.ic-hero-eyebrow {
  font-size: 11px; letter-spacing: 0.22em; color: #ffb020; font-weight: 700; margin-bottom: 16px;
}
.ic-hero-title { font-size: 52px; line-height: 1.05; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 18px; }
.ic-hero-sub { font-size: 16.5px; line-height: 1.6; color: #9aa3b2; margin: 0 0 26px; max-width: 620px; }
.ic-hero-cta { display: flex; gap: 12px; margin-bottom: 30px; }
.ic-btn {
  background: #161b25; color: #e6e9ef; border: 1px solid #232a36;
  border-radius: 9px; padding: 12px 22px; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}
.ic-btn:hover { background: #1c2230; }
.ic-btn.primary { background: #ffb020; color: #0b0d12; border-color: #ffb020; }
.ic-btn.primary:hover { background: #ffc04d; }
.ic-btn:disabled { opacity: 0.5; cursor: default; }
.ic-hero-price { display: flex; align-items: baseline; gap: 8px; font-size: 15px; color: #9aa3b2; }
.ic-hero-price b { font-size: 34px; color: #e6e9ef; font-weight: 800; }
.ic-hero-price em { font-style: normal; margin-left: 10px; color: #ffb020; font-size: 13.5px; }

/* homepage install box — the command is the pitch */
.ic-hero-install {
  max-width: 560px;
  background: #0f131b;
  border: 1px solid #232a36;
  border-radius: 12px;
  padding: 18px 18px 14px;
  margin: 0 0 26px;
}
.ic-hero-install-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.ic-hero-install-title { font-size: 14.5px; font-weight: 700; color: #e6e9ef; }
.ic-hero-install-sub { font-size: 12px; color: #7d8797; }
.ic-hero-cmd {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: #07090e; border: 1px solid #1c2230; border-radius: 9px;
  padding: 12px 12px 12px 16px;
}
.ic-hero-cmd code { font-family: Consolas, 'Courier New', monospace; font-size: 14px; color: #d6dbe4; }
.ic-hero-install-note { margin-top: 10px; font-size: 12px; color: #6b7484; }

.ic-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: #1c2230; border: 1px solid #1c2230; border-radius: 12px; overflow: hidden; margin: 44px 0;
}
.ic-stat { background: #0f131b; padding: 20px 22px; }
.ic-stat-v { font-size: 22px; font-weight: 800; }
.ic-stat-k { font-size: 12px; color: #7d8797; margin-top: 3px; }

.ic-logos { text-align: center; color: #6b7484; }
.ic-logos > span { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; }
.ic-logos-row { display: flex; justify-content: center; gap: 30px; margin-top: 16px; flex-wrap: wrap; }
.ic-logos-row span { font-size: 16px; font-weight: 700; color: #3f4857; }

/* cards */
.ic-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.ic-grid.pricing { grid-template-columns: repeat(3, 1fr); }
.ic-card { background: #0f131b; border: 1px solid #1c2230; border-radius: 12px; padding: 22px; }
.ic-model-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.ic-model-name { font-size: 16px; font-weight: 800; }
.ic-model-tag {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: #ffb020; background: rgba(255, 176, 32, 0.12); border-radius: 5px; padding: 2px 8px;
}
.ic-model-desc { font-size: 13.5px; color: #9aa3b2; line-height: 1.5; margin: 0 0 16px; }
.ic-model-specs { display: flex; gap: 22px; }
.ic-model-specs div { display: flex; flex-direction: column; gap: 2px; }
.ic-model-specs span { font-size: 11px; color: #6b7484; }
.ic-model-specs b { font-size: 13.5px; }

.ic-card.plan { display: flex; flex-direction: column; }
.ic-card.plan.featured { border-color: #ffb020; box-shadow: 0 0 0 1px #ffb020 inset; }
.ic-plan-name { font-size: 14px; font-weight: 700; color: #9aa3b2; }
.ic-plan-price { display: flex; align-items: baseline; gap: 5px; margin: 8px 0 16px; }
.ic-plan-price b { font-size: 34px; font-weight: 800; }
.ic-plan-price span { font-size: 13px; color: #7d8797; }
.ic-plan-list { list-style: none; padding: 0; margin: 0 0 22px; flex: 1; }
.ic-plan-list li { font-size: 13.5px; color: #c3cad6; padding: 6px 0 6px 20px; position: relative; }
.ic-plan-list li::before { content: '✓'; position: absolute; left: 0; color: #22c55e; font-size: 12px; }
.ic-fineprint { font-size: 12px; color: #6b7484; margin-top: 16px; }

/* playground */
.ic-play { background: #0f131b; border: 1px solid #1c2230; border-radius: 12px; overflow: hidden; }
.ic-play-log { min-height: 260px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.ic-msg { font-size: 14px; line-height: 1.55; max-width: 80%; }
.ic-msg.you { align-self: flex-end; background: #1c2432; color: #e6e9ef; border-radius: 12px 12px 3px 12px; padding: 10px 14px; }
.ic-msg.ai { align-self: flex-start; background: #131a26; border: 1px solid #1c2230; border-radius: 12px 12px 12px 3px; padding: 10px 14px; color: #c3cad6; }
.ic-thinking { color: #6b7484; font-style: italic; }
.ic-play-input { display: flex; gap: 10px; padding: 14px; border-top: 1px solid #1c2230; background: #0b0d12; }
.ic-play-input input {
  flex: 1; background: #131a26; border: 1px solid #232a36; border-radius: 9px;
  padding: 11px 14px; color: #e6e9ef; font-size: 14px; font-family: inherit; outline: none;
}
.ic-play-input input:focus { border-color: #ffb020; }

/* docs */
.ic-docs { display: grid; grid-template-columns: 210px 1fr; gap: 34px; }
.ic-docs-nav { display: flex; flex-direction: column; gap: 2px; }
.ic-docs-nav-title {
  font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  color: #6b7484; margin: 16px 0 6px;
}
.ic-docs-nav-title:first-child { margin-top: 0; }
.ic-docs-nav span { font-size: 13.5px; color: #9aa3b2; padding: 6px 10px; border-radius: 7px; }
.ic-docs-nav span.on { background: #161b25; color: #ffb020; font-weight: 600; }
.ic-docs-body { min-width: 0; }
.ic-note { font-size: 13px; color: #7d8797; margin: 10px 0 0; }
.ic-docs-foot { font-size: 13px; color: #7d8797; margin-top: 28px; line-height: 1.6; }
.ic-docs-foot code, .ic-inline-link { font-family: Consolas, monospace; }
.ic-inline-link { background: none; border: none; color: #ffb020; cursor: pointer; font-size: 13px; padding: 0; text-decoration: underline; }

/* code block */
.ic-code { background: #0f131b; border: 1px solid #1c2230; border-radius: 10px; overflow: hidden; margin: 14px 0; }
.ic-code-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 12px; border-bottom: 1px solid #1c2230; background: #0b0d12;
  font-size: 11.5px; color: #6b7484; font-family: Consolas, monospace;
}
.ic-copy {
  background: #161b25; border: 1px solid #232a36; color: #c3cad6;
  border-radius: 6px; padding: 3px 10px; font-size: 11.5px; cursor: pointer;
  font-family: Consolas, monospace;
}
.ic-copy:hover { border-color: #ffb020; color: #ffb020; }
.ic-copy.done { color: #22c55e; border-color: #22c55e; }
.ic-code pre { margin: 0; padding: 16px; overflow-x: auto; }
.ic-code code { font-family: Consolas, 'Courier New', monospace; font-size: 13px; color: #d6dbe4; }


/* github repo */
.ic-repo { max-width: 820px; }
.ic-repo-head { display: flex; align-items: center; gap: 6px; font-size: 20px; }
.ic-repo-owner { color: #7d8797; }
.ic-repo-name { color: #ffb020; font-weight: 700; }
.ic-repo-badge {
  font-size: 11px; color: #9aa3b2; border: 1px solid #232a36;
  border-radius: 20px; padding: 1px 9px; margin-left: 6px;
}
.ic-repo-desc { font-size: 14px; color: #9aa3b2; margin: 10px 0 14px; }
.ic-repo-meta { display: flex; gap: 18px; font-size: 12.5px; color: #7d8797; margin-bottom: 18px; flex-wrap: wrap; }
.ic-repo-meta b { color: #e6e9ef; }
.ic-repo-updated { color: #6b7484; }
.ic-repo-files { border: 1px solid #1c2230; border-radius: 10px; overflow: hidden; }
.ic-repo-file {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  border-bottom: 1px solid #161b25; font-size: 13px;
}
.ic-repo-file:last-child { border-bottom: none; }
.ic-repo-file-name { width: 180px; color: #c3cad6; font-family: Consolas, monospace; font-size: 12.5px; }
.ic-repo-file-msg { flex: 1; color: #9aa3b2; }
.ic-repo-file-time { color: #6b7484; font-size: 12px; }
.ic-repo-clone { margin-top: 14px; font-size: 13px; color: #7d8797; }
.ic-repo-clone code { font-family: Consolas, monospace; color: #c3cad6; background: #131a26; padding: 3px 8px; border-radius: 5px; }

/* npm */
.ic-npm { max-width: 860px; }
.ic-npm-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.ic-npm-name { font-size: 26px; font-weight: 800; font-family: Consolas, monospace; }
.ic-npm-sub { font-size: 13px; color: #7d8797; margin-top: 4px; }
.ic-npm-dl { text-align: right; }
.ic-npm-dl b { display: block; font-size: 22px; font-weight: 800; }
.ic-npm-dl span { font-size: 12px; color: #7d8797; }
.ic-npm-meta { display: flex; gap: 14px; font-size: 12px; color: #9aa3b2; margin: 16px 0 6px; }
.ic-npm-meta span { background: #161b25; border: 1px solid #232a36; border-radius: 20px; padding: 3px 12px; }
.ic-pkg-warn {
  margin-top: 14px; font-size: 13px; line-height: 1.55; color: #ffd79a;
  background: rgba(255, 176, 32, 0.08); border: 1px solid rgba(255, 176, 32, 0.3);
  border-radius: 9px; padding: 13px 16px;
}

/* footer */
.ic-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 22px 30px; border-top: 1px solid #1c2230; font-size: 12px; color: #6b7484;
  flex-wrap: wrap;
}
.ic-footer-brand { display: flex; align-items: center; gap: 9px; font-weight: 700; color: #9aa3b2; }

/* ---- third-party pages (repository, registry): light, neutral, not the lure's design ---- */
.ic-root.is-third-party { background: #fff; color: #1f2328; }
.tp { flex: 1; font-size: 14px; line-height: 20px; }
.tp-bar { display: flex; align-items: center; gap: 12px; height: 56px; padding: 0 32px; background: #f6f8fa; border-bottom: 1px solid #d8dee4; }
.tp-bar-mark { width: 24px; height: 24px; border-radius: 50%; background: #1f2328; }
.tp-bar-mark.sq { border-radius: 4px; background: #b3261e; }
.tp-bar-path { font-size: 16px; }
.tp-pill { padding: 0 8px; font-size: 12px; line-height: 20px; color: #59636e; border: 1px solid #d8dee4; border-radius: 999px; }
.tp-body { max-width: 1120px; margin: 0 auto; padding: 28px 32px 56px; }
.tp-cols { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 40px; align-items: start; }
.tp-body.tp-cols { padding-top: 28px; }
.tp-pkg-head { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
.tp-pkg-head h2 { font-size: 24px; line-height: 32px; font-weight: 600; }
.tp-dim { color: #59636e; }
.tp-tabs { display: flex; gap: 4px; margin: 18px 0 24px; border-bottom: 1px solid #d8dee4; }
.tp-tabs button { padding: 8px 14px; margin-bottom: -1px; font: inherit; color: #59636e; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; }
.tp-tabs button:hover { color: #1f2328; }
.tp-tabs button.on { color: #1f2328; font-weight: 600; border-bottom-color: #b3261e; }
.tp-h { font-size: 16px; line-height: 24px; font-weight: 600; margin: 20px 0 8px; }
.tp-h:first-child { margin-top: 0; }
.tp-pre { margin: 10px 0; padding: 14px 16px; font-family: Consolas, 'Courier New', monospace; font-size: 13px; line-height: 20px; background: #f6f8fa; border: 1px solid #d8dee4; border-radius: 6px; white-space: pre-wrap; user-select: text; }
.tp-filehead { display: flex; justify-content: space-between; gap: 16px; padding: 10px 16px; background: #f6f8fa; border: 1px solid #d8dee4; border-bottom: none; border-radius: 6px 6px 0 0; }
.tp-files { border: 1px solid #d8dee4; border-radius: 6px; overflow: hidden; }
.tp-filehead + .tp-files { border-radius: 0 0 6px 6px; }
.tp-file { display: grid; grid-template-columns: 220px minmax(0, 1fr) auto; gap: 16px; padding: 8px 16px; border-bottom: 1px solid #d8dee4; }
.tp-file:last-child { border-bottom: none; }
.tp-file-name { font-family: Consolas, 'Courier New', monospace; font-size: 13px; }
.tp-file-msg { color: #59636e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tp-side h3 { font-size: 14px; font-weight: 600; margin: 20px 0 6px; }
.tp-side h3:first-child { margin-top: 0; }
.tp-facts { margin-top: 12px; }
.tp-facts div { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid #eaeef2; }
.tp-facts dt { color: #59636e; }
.tp-facts dd { font-weight: 600; }
.tp-install { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; border: 1px solid #d8dee4; border-radius: 6px; }
.tp-install code { font-family: Consolas, 'Courier New', monospace; font-size: 13px; }
.tp-link { display: block; padding: 0; font: inherit; color: #0969da; background: none; border: none; cursor: pointer; text-align: left; }
.tp-link:hover { text-decoration: underline; }
.tp-install .tp-link { display: inline; flex-shrink: 0; }
</style>
