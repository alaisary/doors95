// What the docked attacker screen shows for each scenario: an invented tool banner, live counters,
// and the result card that appears once the visitor is compromised. Everything is invented.
export type AtkCtx = { lines: { text: string; tag?: string }[]; flags: Record<string, any> }
export type AtkBanner = {
  name: string
  sub: string
  stats: (c: AtkCtx) => { label: string; value: number }[]
  payoff: { title: string; rows: string[] }
}

const n = (b: boolean) => (b ? 1 : 0)

export const attackerBanners: Record<string, AtkBanner> = {
  'evilginx-bitb': {
    name: 'RELAYD', sub: 'AiTM reverse proxy v2.1',
    stats: (c) => [
      { label: 'captured', value: c.lines.filter((l) => l.tag === 'CAPTURE').length },
      { label: 'sessions', value: n(!!c.flags.approved_request) },
    ],
    payoff: { title: 'MAILBOX OPEN', rows: ['a.salem, with no password and no MFA prompt', 'forwarding rule added, hidden from the inbox', 'fake "new bank details" mail ready to send'] },
  },
  'device-code': {
    name: 'CODEFLOW', sub: 'device-code toolkit v1.4',
    stats: (c) => [
      { label: 'codes used', value: n(!!c.flags.code_shared) },
      { label: 'tokens', value: n(!!c.flags.approved_request) },
    ],
    payoff: { title: 'MAIL AND FILES OPEN', rows: ['token good for 90 days', 'inbox and Q3 files readable', 'no password was ever needed'] },
  },
  ejada: {
    name: 'MIRRORKIT', sub: 'portal clone panel v0.9',
    stats: (c) => [
      { label: 'visits', value: 1 },
      { label: 'logins', value: n(!!c.flags.entered_credentials) },
    ],
    payoff: { title: 'PORTAL TAKEN OVER', rows: ['logged in as the employer', 'bank details can be changed', 'company documents downloadable'] },
  },
  clickfix: {
    name: 'HIVE', sub: 'operator console v3.0',
    stats: (c) => [
      { label: 'machines', value: n(c.lines.some((l) => /SESSION ESTABLISHED/.test(l.text))) },
      { label: 'events', value: c.lines.length },
    ],
    payoff: { title: 'MACHINE CONTROLLED', rows: ['38 saved passwords, 1,204 cookies', 'startup entry keeps it alive', 'remote control channel open'] },
  },
  'zoom-docs': {
    name: 'HIVE', sub: 'operator console v3.0',
    stats: (c) => [
      { label: 'logs', value: n(!!c.flags.compromised) },
      { label: 'events', value: c.lines.length },
    ],
    payoff: { title: 'LOG STOLEN', rows: ['38 passwords, 1,204 cookies, 52 files', 'uploaded and listed in the panel', 'the victim saw nothing happen'] },
  },
  ironcastle: {
    name: 'HIVE', sub: 'operator console v3.0',
    stats: (c) => [
      { label: 'tokens', value: n(!!c.flags.compromised) },
      { label: 'events', value: c.lines.length },
    ],
    payoff: { title: 'PUBLISH RIGHTS', rows: ['maintainer token works', 'next release can carry the same hook', 'keys and .env files copied'] },
  },
}
