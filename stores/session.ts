import { defineStore } from 'pinia'
import { hasAttackerSlide } from '~/utils/attackerSlides'

export type LoggedEvent = {
  id: number
  t: number          // scenario-relative seconds
  type: string       // EMAIL_OPENED, LINK_CLICKED, ...
  detail?: string
  verdict: 'neutral' | 'safe' | 'risky'
}

export type ScenarioDef = {
  id: string
  title: string
  codename: string
  intro: string
  brief: string
  quick: boolean      // usable in quick-challenge mode
  entryApp: 'mail' | 'browser' | 'chat'
}

export type CoachLine = {
  nudge?: string
  hint?: string
}

// the per-scenario slice of session state that follows the visitor between scenarios
const SNAP_KEYS = [
  'events', 'eventId', 'flags', 'attackTimeline', 'hintsUsed', 'clipboard', 'deviceCode',
  'inspectedFile', 'payloadRunning', 'c2Active', 'c2State', 'c2Lines', 'outcomeReady', 'scenarioStartedAt',
] as const
const BLANK = (): Record<string, any> => ({
  events: [], eventId: 0, flags: {}, attackTimeline: [], hintsUsed: 0, clipboard: '', deviceCode: '',
  inspectedFile: null, payloadRunning: false, c2Active: false, c2State: 'listening', c2Lines: [],
  outcomeReady: false, scenarioStartedAt: Date.now(),
})

export const useSessionStore = defineStore('session', {
  state: () => ({
    // booth flow
    phase: 'entry' as 'entry' | 'live' | 'consequence' | 'debrief',
    // after a compromise the visitor can see the attacker's side first, then the debrief
    slide: 'debrief' as 'attacker' | 'debrief',
    mode: 'full' as 'quick' | 'full',
    // continuous desktop: every scenario email lives in one mailbox
    activeScenarios: [] as string[],
    completedScenarios: [] as string[],
    // the colleague's WhatsApp chat has been opened (clears the unread badge)
    chatRead: false,
    // how each handled email ended, for the technique labels in the mailbox
    outcomes: {} as Record<string, 'compromised' | 'resisted'>,
    // the scenario the user is currently inside (set by engaging its email)
    scenarioId: '' as string,
    // bumped on every engagement so scenario pages remount with fresh state
    scenarioEpoch: 0,
    // per-scenario page epoch: a scenario's page remounts only when that scenario restarts
    epochs: {} as Record<string, number>,
    // progress of scenarios the visitor has stepped away from
    saved: {} as Record<string, Record<string, any>>,
    // bumped when a visitor's session ends or restarts: timers from the old run must not fire
    runId: 0,
    scenarioStartedAt: 0,
    scenarioElapsed: 0,
    // play the doors95 boot animation when a visitor starts from the entry screen
    bootPending: false,

    // identity for personalization
    userName: WORLD.visitorFirst,

    // event log (behavior evidence)
    events: [] as LoggedEvent[],
    eventId: 0,

    // per-scenario flags: e.g. compromised, verified, inspected_url, ...
    flags: {} as Record<string, boolean>,

    // coach (assistant)
    coachVisible: true,
    coachText: '',
    hintsUsed: 0,

    // simulated OS clipboard (ClickFix hijacks this)
    clipboard: '' as string,

    // rotating authenticator (TOTP) code for the Authenticator app
    authyCode: '',
    authyTtl: 30,

    // the attacker's device code (generated on the lure page, redeemed on the
    // genuine-looking Microsoft device-login tab)
    deviceCode: '',

    // a file opened in Notepad to read it without running it (zoom-docs)
    inspectedFile: null as null | { name: string; content: string },

    // an outcome (compromise / resisted) is reached but the debrief is not
    // shown automatically — Skippy offers a button instead
    outcomeReady: false,

    // clickfix payload theatre: fake Cloudflare form + C2 side explanation
    payloadRunning: false,
    c2Active: false,
    c2State: 'listening' as 'listening' | 'connecting' | 'connected',
    c2Lines: [] as { text: string; cls: string; soc?: string; stop?: string; tag?: string }[],

    // timeline for debrief
    attackTimeline: [] as { t: string; label: string; critical?: boolean }[],
  }),

  getters: {
    scenario(state): ScenarioDef | undefined {
      const reg = useScenarioRegistry()
      return reg.byId(state.scenarioId)
    },
    compromised: (state) => !!state.flags.compromised,
    // Skippy's debrief button: always after a resisted outcome, but a clickfix
    // compromise must first be handled — scan + disinfect by the user
    debriefAvailable(state): boolean {
      if (!state.outcomeReady) return false
      if (state.flags.compromised && state.scenarioId === 'clickfix') {
        return !!state.flags.disinfected
      }
      return true
    },
    // NOTE: not a reactive getter — Date.now() freezes inside a computed.
    // Use elapsedNow() whenever a fresh value matters (timelines, scoring).
    elapsed(state): number {
      return state.scenarioStartedAt ? (Date.now() - state.scenarioStartedAt) / 1000 : 0
    },
  },

  actions: {
    // ---------- booth flow: one desktop, every email is a scenario ----------
    startFull() {
      const reg = useScenarioRegistry()
      this.mode = 'full'
      this.bootPending = true
      this.activeScenarios = reg.order.slice()
      this.enterDesktop()
    },
    startQuick() {
      const reg = useScenarioRegistry()
      this.mode = 'quick'
      this.bootPending = true
      this.activeScenarios = [reg.quickDefault]
      this.enterDesktop()
    },
    // operator/testing entry: desktop focused on a single scenario
    startScenario(id: string) {
      const reg = useScenarioRegistry()
      if (!reg.byId(id)) return
      this.activeScenarios = [id]
      this.enterDesktop()
    },

    enterDesktop() {
      this.$patch((state) => {
        state.events = []
        state.eventId = 0
        state.flags = {}
        state.attackTimeline = []
        state.hintsUsed = 0
        state.coachText = ''
        state.clipboard = ''
        state.deviceCode = ''
        state.inspectedFile = null
        state.payloadRunning = false
        state.c2Active = false
        state.c2State = 'listening'
        state.c2Lines = []
        state.completedScenarios = []
        state.outcomes = {}
        state.chatRead = false
        state.runId++
        state.saved = {}
        for (const id of Object.keys(state.epochs)) state.epochs[id]++
        state.scenarioId = ''
        state.outcomeReady = false
        state.scenarioEpoch++
        state.scenarioStartedAt = Date.now()
      })
      this.phase = 'live'
      this.log('SCENARIO_LIVE', undefined, 'neutral')
      const n = this.activeScenarios.length
      this.coach(`09:41 — shift start. ${n} unread message${n === 1 ? '' : 's'} waiting in your mailbox.`)
      this.startAuthy()
      // fresh session: no lingering payloads from a previous visitor
      usePayloadsStore().antRunner = false
      useOpenWindowsStore().closeAllWindows()
    },

    // A delayed outcome that belongs to one scenario. It is dropped if the visitor's
    // session restarted or that scenario was redone in the meantime, and otherwise
    // runs with its own scenario back in focus.
    later(id: string, ms: number, fn: () => void) {
      const run = this.runId
      const epoch = this.epochs[id] ?? 0
      let tries = 0
      const fire = () => {
        if (this.runId !== run || (this.epochs[id] ?? 0) !== epoch) return
        // not on the live desktop right now (a debrief or console is up): try again shortly
        if (this.phase !== 'live' && tries++ < 3) { t = setTimeout(fire, 500); return }
        this.focusScenario(id)
        if (this.scenarioId !== id) return
        fn()
      }
      let t = setTimeout(fire, ms)
      return t
    },

    // ---------- moving between scenarios ----------
    // Each scenario keeps its own progress (flags, log, timeline, outcome) so
    // the visitor can move between emails, browser tabs, terminal and desktop
    // in any order. `focusScenario` switches without losing anything;
    // `engageScenario` is a fresh start (replay / redo).
    _stash() {
      if (!this.scenarioId) return
      const snap: Record<string, any> = {}
      for (const k of SNAP_KEYS) snap[k] = JSON.parse(JSON.stringify((this as any)[k] ?? null))
      this.saved[this.scenarioId] = snap
    },
    flagsOf(id: string): Record<string, boolean> {
      return id === this.scenarioId ? this.flags : (this.saved[id]?.flags ?? {})
    },
    focusScenario(id: string) {
      const reg = useScenarioRegistry()
      if (!reg.byId(id) || id === this.scenarioId || this.phase !== 'live') return
      const stored = this.saved[id]
      // a finished scenario without a pending debrief is only re-entered by redoing it
      if (!stored && this.completedScenarios.includes(id)) return
      this._stash()
      this.$patch((state) => {
        const snap = stored ?? BLANK()
        for (const k of SNAP_KEYS) (state as any)[k] = JSON.parse(JSON.stringify(snap[k] ?? null))
        if (!stored) state.scenarioStartedAt = Date.now()
        state.scenarioId = id
        state.coachText = ''
      })
      delete this.saved[id]
    },

    // user opened/clicked/reported a scenario email → they are inside that attack now
    engageScenario(id: string, fresh = false) {
      const reg = useScenarioRegistry()
      if (!reg.byId(id)) return
      if (this.scenarioId && this.scenarioId !== id) this._stash()
      delete this.saved[id]
      delete this.outcomes[id]
      this.epochs[id] = (this.epochs[id] ?? 0) + 1
      this.$patch((state) => {
        state.events = []
        state.eventId = 0
        state.flags = {}
        state.attackTimeline = []
        state.hintsUsed = 0
        state.coachText = ''
        state.clipboard = ''
        state.deviceCode = ''
        state.inspectedFile = null
        state.payloadRunning = false
        state.c2Active = false
        state.c2State = 'listening'
        state.c2Lines = []
        state.scenarioId = id
        state.outcomeReady = false
        state.scenarioEpoch++
        state.scenarioStartedAt = Date.now()
        // re-doing a scenario un-marks it as handled
        state.completedScenarios = state.completedScenarios.filter((s) => s !== id)
      })
      this.phase = 'live'
      if (fresh) useOpenWindowsStore().closeAllWindows()
    },

    // leaving a scenario debrief — back to the same desktop, email marked handled
    scenarioDone() {
      if (this.scenarioId && !this.completedScenarios.includes(this.scenarioId)) {
        this.completedScenarios.push(this.scenarioId)
      }
      delete this.saved[this.scenarioId]
      this.scenarioId = ''
      this.$patch((state) => {
        state.payloadRunning = false
        state.c2Active = false
        state.c2State = 'listening'
        state.outcomeReady = false
      })
      this.phase = 'live'
      const left = this.activeScenarios.filter((id) => !this.completedScenarios.includes(id)).length
      this.coach(left
        ? `${left} message${left === 1 ? '' : 's'} still need triage. The desktop is yours.`
        : 'Mailbox clear. Nice shift.')
    },

    allDone(): boolean {
      return this.activeScenarios.length > 0
        && this.activeScenarios.every((id) => this.completedScenarios.includes(id))
    },

    quitToEntry() {
      this.runId++
      this.bootPending = false
      this.phase = 'entry'
      useOpenWindowsStore().closeAllWindows()
    },

    // ---------- behavior logging ----------
    log(type: string, detail?: string, verdict: LoggedEvent['verdict'] = 'neutral') {
      this.events.push({
        id: ++this.eventId,
        t: this.scenarioStartedAt ? (Date.now() - this.scenarioStartedAt) / 1000 : 0,
        type,
        detail,
        verdict,
      })
      const reg = useScenarioRegistry()
      reg.onEvent(this.scenarioId, type, detail)
    },
    flag(name: string, value = true) {
      this.flags[name] = value
    },

    // ---------- consequences ----------
    elapsedNow(): number {
      return this.scenarioStartedAt ? (Date.now() - this.scenarioStartedAt) / 1000 : 0
    },

    timelineStep(label: string, critical = false) {
      const secs = Math.floor(this.elapsedNow())
      this.attackTimeline.push({ t: `+${String(secs).padStart(2, '0')}s`, label, critical })
    },

    // console = true → the full-screen attacker workstation plays (bitb / device-code)
    // console = false → stay on the desktop, Skippy offers the debrief button
    compromise(reason: string, console = false) {
      if (this.flags.compromised) return
      this.flag('compromised')
      if (this.scenarioId) this.outcomes[this.scenarioId] = 'compromised'
      this.timelineStep(`SESSION COMPROMISED — ${reason}`, true)
      // reaching the outcome = this email is handled
      if (this.scenarioId && !this.completedScenarios.includes(this.scenarioId)) {
        this.completedScenarios.push(this.scenarioId)
      }
      if (console) {
        this.phase = 'consequence'
      } else {
        this.outcomeReady = true
        this.phase = 'live'
        // clickfix leaves a live implant: the ants payload crawls the desktop
        // and Skippy guides the user to scan + disinfect BY THEMSELVES
        if (this.scenarioId === 'clickfix') {
          usePayloadsStore().antRunner = true
          this.coach('Something is very wrong with your workstation. Open the Antivirus and run a scan.')
        } else {
          this.coach('That did not end well. Want to see what just happened?')
        }
      }
    },

    // called when user survives the engaged scenario without compromise —
    // the debrief is offered by Skippy, not forced
    survive() {
      if (this.phase !== 'live' || !this.scenarioId || this.outcomeReady) return
      if (!this.completedScenarios.includes(this.scenarioId)) {
        this.completedScenarios.push(this.scenarioId)
      }
      this.outcomes[this.scenarioId] = 'resisted'
      this.outcomeReady = true
      this.c2Log('[attacker] the visitor stopped here. Nothing was captured.', 'text-slate-400')
      this.coach('You caught that one. Want to see how to spot it, and what would have fired in the SOC?')
    },
    goToDebrief() {
      this.outcomeReady = false
      this.slide = this.flags.compromised && hasAttackerSlide(this.scenarioId) ? 'attacker' : 'debrief'
      this.phase = 'debrief'
    },
    showSlide(which: 'attacker' | 'debrief') {
      this.slide = which
    },

    // ---------- authenticator (TOTP) ----------
    // rotates every 30s so the app feels real; login flows verify against it
    startAuthy() {
      if (authyTimer) return
      const roll = () => {
        this.authyCode = String(Math.floor(100000 + Math.random() * 900000))
        this.authyTtl = 30
      }
      roll()
      authyTimer = setInterval(() => {
        if (this.authyTtl > 1) this.authyTtl--
        else roll()
      }, 1000)
    },

    // ---------- coach ----------
    coach(text: string) {
      this.coachText = text
    },
    // a line that gives the trap away: the presenter says it themselves in demo mode
    spoiler(text: string) {
      if (useBooth().demo.value) return
      this.coachText = text
    },

    // ---------- C2 side explanation (clickfix payload theatre) ----------
    c2Start() {
      if (this.c2Active) return
      this.c2Active = true
      this.c2Lines = []
      this.c2State = 'listening'
    },
    // soc = what a defender's logs would show at this exact moment
    // stop = the control that breaks this step; tag = the card label (otherwise taken from the [bracket] in the text)
    c2Log(text: string, cls = 'text-emerald-300', soc?: string, stop?: string, tag?: string) {
      if (!this.c2Active) return
      this.c2Lines.push({ text, cls, soc, stop, tag })
    },
    c2SetState(state: 'listening' | 'connecting' | 'connected') {
      this.c2State = state
    },
    useHint(kind: 'nudge' | 'explain') {
      this.hintsUsed++
      const reg = useScenarioRegistry()
      const line = reg.hint(this.scenarioId, kind, this.flags)
      if (line) this.coach(line)
      this.log(kind === 'nudge' ? 'HINT_NUDGE' : 'HINT_EXPLAIN', undefined, 'neutral')
    },

    // ---------- scoring ----------
    score() {
      const types = new Set(this.events.map((e) => e.type))
      const f = this.flags
      return {
        // did they verify identity / source?
        trust: this._clamp(
          (f.inspected_url ? 40 : 0) +
          (f.verified_sender ? 30 : 0) +
          (f.checked_certificate ? 30 : 0) -
          (f.entered_credentials ? 60 : 0) - (f.approved_request ? 60 : 0)
        ),
        // did they consider context?
        context: this._clamp(
          (types.has('EMAIL_OPENED') ? 30 : 0) +
          (f.read_security_notice ? 35 : 0) +
          (f.inspected_url ? 35 : 0)
        ),
        // independent channel / recovery
        verification: this._clamp(
          (f.used_independent_channel ? 60 : 0) +
          (f.reported_phishing ? 40 : 0) +
          (f.closed_attacker_page ? 20 : 0)
        ),
        // resisted urgency?
        resistance: this._clamp(
          70 - (this.elapsedNow() < 20 && (f.entered_credentials || f.approved_request || f.ran_command) ? 60 : 0) +
          (f.reported_phishing ? 30 : 0)
        ),
        investigation: this._clamp(
          (types.has('URL_INSPECTED') ? 30 : 0) +
          (types.has('DIRECTORY_SEARCHED') ? 25 : 0) +
          (types.has('SECURITY_OPENED') ? 25 : 0) +
          (types.has('HOVERED_LINK') ? 20 : 0)
        ),
        recovery: this._clamp(
          (f.closed_attacker_page ? 60 : 0) + (f.reported_phishing ? 40 : 0) -
          (f.entered_credentials || f.approved_request || f.ran_command ? 40 : 0)
        ),
        compromised: this.compromised,
        hints: this.hintsUsed,
        seconds: Math.floor(this.elapsedNow()),
      }
    },
    _clamp(v: number) {
      return Math.max(0, Math.min(100, Math.round(v)))
    },
  },
})

// late-bound to avoid circular import issues at module eval time
import { useScenarioRegistry } from './scenarios'
import { useOpenWindowsStore } from './windows'
import { usePayloadsStore } from './payloads'

// authenticator rotation timer (module-level, not reactive state)
let authyTimer: ReturnType<typeof setInterval> | null = null
