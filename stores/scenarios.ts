import { defineStore } from 'pinia'

export type DebriefStage = {
  label: string
  text: string
}

export type ScenarioModule = {
  id: string
  title: string
  codename: string
  intro: string       // shown on brief screen
  brief: string       // situation text, no attack labels
  quick: boolean
  entryApp: 'mail' | 'browser' | 'chat'

  // debrief technique card — name, aliases, prevalence, variants
  technique: {
    name: string
    aka: string[]
    prevalence: string
    variants: { label: string; desc: string; visual: string }[]
  }

  // the short, one-screen debrief
  card: {
    chip: string; color: string
    verdict: { win: string; lose: string }
    rule: string; habit: string
    hero: string          // a screenshot id, or icon:<name>
    tell: string          // what the red ring on the picture points at
    slip: { advice: string; answer: string }   // the old advice from the attract loop, and how this attack beat it
    // what the attacker's phone shows after a compromise (all invented, price is illustrative)
    loot: { title: string; stamp: string; price: number; items: { icon: string; count: string; label: string }[] }
  }
  controls: { label: string; detail: string }[]
  // the three layers shown in the debrief: what a person can notice, what blocks it, what a SOC sees
  detection: { human: string; control: string; signal: string }

  // verified impact numbers and where to read about the real thing
  stats: { text: string; source?: string; year?: string }[]
  sources: { title: string; publisher: string; date: string }[]

  // coach lines (3 levels)
  hints: {
    nudge: string
    explain: string
  }

  // attack timeline shown in debrief
  timeline: DebriefStage[]

  debrief: {
    win: string
    lose: string
    lessons: string[]
  }
}

export const useScenarioRegistry = defineStore('scenarios', {
  state: () => ({
    modules: {
      'evilginx-bitb': {
        id: 'evilginx-bitb',
        title: 'Free frontier AI access — activate today',
        codename: 'SC-01',
        quick: false,
        entryApp: 'mail',
        intro: 'A pilot-program invitation just landed in your mailbox. It is 09:41.',
        brief: 'Free tools, pilot programs, early access. Something is asking you to sign in.',
        stats: [
          { text: 'Kits like Evilginx and Tycoon 2FA drive 80% of multi-factor bypasses — they steal the session, not the password.', source: 'Microsoft Digital Defense Report', year: '2025' },
          { text: 'Tycoon 2FA alone was tied to 96,000+ victims before Microsoft and Europol seized it in March 2026.', source: 'Microsoft and Europol', year: '2026' },
          { text: 'Microsoft still blocks more than 10,000 of these sign-in attacks every month.', source: 'Microsoft', year: '2024' },
        ],
        sources: [
          { title: 'Browser In The Browser (BITB) Attack', publisher: 'mr.d0x', date: '15 March 2022' },
          { title: 'From cookie theft to BEC: attackers use AiTM phishing sites as entry point to further financial fraud', publisher: 'Microsoft Security Blog', date: '12 July 2022' },
        ],
        card: {
          chip: 'AiTM',
          color: '#7c3aed',
          verdict: { win: "The fake window gave itself away.", lose: "The login window was fake." },
          rule: 'A login window can be a drawing.',
          habit: 'Try dragging it out of the page.',
          hero: 'evilginx-bitb',
          tell: 'Not a browser window: part of the web page.',
          slip: { advice: 'USE MFA', answer: 'It was passed along, live.' },
          loot: { title: 'New session', stamp: 'SESSION CAPTURED', price: 120, items: [{ icon: 'cookie', count: '1', label: 'session cookie' }, { icon: 'key', count: 'MFA', label: 'bypassed' }, { icon: 'mailbox', count: 'all', label: 'mail + files' }] },
        },
        detection: {
          human: 'Drag the sign-in window to the edge of the page: it stops there. A real browser window can leave the page entirely and has its own taskbar entry. A password manager will also refuse to autofill.',
          control: 'Passkeys or FIDO2 keys, which are bound to the real domain and cannot be relayed. Add compliant-device checks so a stolen session fails.',
          signal: 'A sign-in that passed MFA from a hosting-provider IP the user never uses, followed by session use from a different IP, ASN or user agent within minutes.',
        },
        controls: [
          { label: 'Phishing-resistant MFA', detail: 'Passkeys and FIDO2 keys are bound to the real origin, so a proxy has nothing to relay. It only holds if weaker fallback methods are switched off.' },
          { label: 'Device-bound access', detail: 'Requiring a managed, compliant device stops the proxied sign-in from satisfying policy. Token protection limits replay of a token that was already issued.' },
          { label: 'Session detections', detail: 'Alert on a session token appearing from a new IP or ASN minutes after sign-in, and on sign-ins through known proxy infrastructure.' },
          { label: 'Shorter sessions for risky apps', detail: 'Sign-in frequency and continuous access evaluation limit how long a stolen session is useful.' },
        ],
        technique: {
          name: 'AiTM phishing / Browser-in-the-Browser',
          aka: ['evilginx2', 'Muraena', 'Modlishka', 'BITB'],
          prevalence: 'The standard technique against MFA-protected accounts since 2022 — a staple of ransomware initial access and red-team engagements.',
          variants: [
            { label: 'Reverse proxy', desc: 'The real login, served through the attacker\'s domain (evilginx2 / Muraena)', visual: 'proxy' },
            { label: 'Browser-in-the-Browser', desc: 'The "login window" is HTML inside the page — spoofed URL + certificate', visual: 'bitb' },
            { label: 'OAuth consent phishing', desc: 'A shady app asking for legitimate-looking permissions', visual: 'oauth' },
            { label: 'QR phishing (quishing)', desc: '"Scan to sign in" codes in emails and printouts', visual: 'qr' },
          ],
        },
        hints: {
          nudge: 'That sign-in window is not your browser. Try dragging or resizing it — or check what the real tab says.',
          explain: 'The popup "browser" is a drawing inside the web page. The real tab is on the attacker\'s domain; everything you type is relayed live, including MFA.',
        },
        timeline: [
          { label: 'Lure email delivered ("Qabas AI")' },
          { label: 'Link clicked → attacker proxy domain' },
          { label: 'Fake "Microsoft" browser window rendered inside page' },
          { label: 'Credentials submitted to attacker page', critical: true },
          { label: 'MFA prompt relayed in real time' },
          { label: 'MFA approved → attacker session cookie captured' },
          { label: 'SESSION COMPROMISED — attacker bypasses MFA entirely' },
        ],
        debrief: {
          win: 'You noticed the login was rendered inside the page — not by your browser. The proxy never got a session.',
          lose: 'You just handed the attacker a live, MFA-valid session cookie. The password did not matter. The MFA did not matter. The proxy relayed everything in real time.',
          lessons: [
            'A realistic login window is not proof of a real browser window — check the browser chrome and URL bar, not the window.',
            'Evilginx-style reverse proxies sit between you and the real site: the page is real, the session goes to the attacker.',
            'MFA does not save you if the attacker relays it live. Phishing-resistant MFA (passkeys/FIDO2) breaks this attack.',
          ],
        },
      },

      'clickfix': {
        id: 'clickfix',
        title: 'Verify you are human',
        codename: 'SC-02',
        quick: false,
        entryApp: 'mail',
        intro: 'A routine invoice approval is waiting in the shared finance mailbox. It is 10:07.',
        brief: 'You are covering for a colleague. Their mailbox has work that needs triage.',
        stats: [
          { text: 'Up 517% in six months — one of the fastest-growing attacks of 2025.', source: 'ESET', year: '2025' },
          { text: 'Its usual payload, the Lumma infostealer, copies every password saved in the browser.', source: 'Microsoft', year: '2025' },
        ],
        sources: [
          { title: 'From Clipboard to Compromise: A PowerShell Self-Pwn', publisher: 'Proofpoint', date: '17 June 2024' },
          { title: 'Think before you Click(Fix): analyzing the ClickFix social engineering technique', publisher: 'Microsoft Threat Intelligence', date: '21 August 2025' },
        ],
        card: {
          chip: 'ClickFix',
          color: '#f97316',
          verdict: { win: "The command never ran.", lose: "The pasted command ran." },
          rule: 'Never paste what a website gave you.',
          habit: 'Read it in Notepad first.',
          hero: 'clickfix',
          tell: 'A real check never asks for Win+R.',
          slip: { advice: "DON'T DOWNLOAD FILES", answer: 'No download. You ran it yourself.' },
          loot: { title: 'New bot online', stamp: 'NEW BOT', price: 40, items: [{ icon: 'bot', count: '1', label: 'machine' }, { icon: 'key', count: '38', label: 'passwords' }, { icon: 'folder', count: '52', label: 'files' }] },
        },
        detection: {
          human: 'No website has a reason to ask you to paste something into Run or a terminal. Verification is a click, never a command.',
          control: 'Block Win+R and restrict PowerShell for standard users. Use AppLocker or WDAC so downloaded scripts do not run.',
          signal: 'explorer.exe or a browser spawning powershell.exe with hidden-window, bypass-policy or download-and-execute (iwr | iex) arguments.',
        },
        controls: [
          { label: 'Restrict Run and script hosts', detail: 'Remove the Run dialog for standard users and block powershell.exe, mshta.exe and wscript.exe with application control where the role does not need them.' },
          { label: 'PowerShell logging and language mode', detail: 'Script block logging records the pasted command. Constrained Language Mode, enforced through App Control, blocks most of what the payload does next, though not the download itself.' },
          { label: 'Hunt the artefact', detail: 'Run-dialog commands are written to the RunMRU registry key. Alert on entries containing powershell, mshta, curl or a URL. Variants that use Terminal or the File Explorer address bar do not write it.' },
          { label: 'Process lineage', detail: 'explorer.exe starting a script interpreter that then opens a network connection is the detection.' },
          { label: 'After it runs', detail: 'Isolate the machine, then assume every saved password and signed-in session on it is gone: reset the passwords and revoke the sessions.' },
        ],
        technique: {
          name: 'ClickFix (fake CAPTCHA)',
          aka: ['fake Cloudflare Turnstile', 'CAPTCHA-themed social engineering', 'human verification trick'],
          prevalence: 'One of the top malware delivery chains since late 2024 — the preferred loader delivery for Latrodectus, WarmCookie, Lumma and fake-update campaigns.',
          variants: [
            { label: 'Fake browser update', desc: '"Chrome is out of date" pages with a friendly Update button', visual: 'update' },
            { label: 'Fake Adobe Reader update', desc: 'A get.adobe.com BITB page delivering a rogue ScreenConnect installer', visual: 'docusign' },
            { label: 'Fake document portal', desc: 'DocuSign / DMS lookalikes gating a document behind verification', visual: 'docusign' },
            { label: 'Fake antivirus alert', desc: '"3 threats found" scareware with a Fix-Now button', visual: 'av' },
            { label: 'Cookie-consent gate', desc: 'A normal-looking page whose CAPTCHA only appears after you accept cookies', visual: 'docusign' },
            { label: 'macOS flavor', desc: '"Verification" via Terminal: open -a Calculator', visual: 'terminal' },
          ],
        },
        hints: {
          nudge: 'Verification pages do not usually tell you to run commands. Who benefits if you press Enter?',
          explain: 'The "fix" is a PowerShell command that fetches and runs attacker-hosted code. You — not the browser — were the execution mechanism.',
        },
        timeline: [
          { label: 'Email with invoice link arrives' },
          { label: 'Fake "document portal" serves CAPTCHA loop' },
          { label: 'User completes fake verification' },
          { label: 'Page instructs: Win+R / terminal command', critical: true },
          { label: 'Command pasted and executed → payload fetched' },
          { label: 'Fake Cloudflare "verification" window distracts the user' },
          { label: 'Attacker foothold established on workstation' },
        ],
        debrief: {
          win: 'You refused to run instructions from a web page. The attack chain stopped at the first human decision point.',
          lose: 'You became the execution mechanism. No browser exploit, no zero-day — just you, pressing Enter on someone else\'s command.',
          lessons: [
            'ClickFix works because it hijacks helpfulness: "prove you are human" becomes "run this command".',
            'Legitimate verification never requires a terminal, Win+R, or pasting text into a Run dialog.',
            'If a page tells you exactly how to "fix" your computer, the page is the attacker.',
          ],
        },
      },

      'ejada': {
        id: 'ejada',
        title: 'Annual evaluation — action required',
        codename: 'SC-04',
        quick: false,
        entryApp: 'mail',
        intro: 'A government evaluation reminder just landed in your mailbox. It is 13:02.',
        brief: 'The annual Ejada evaluation is due. The sign-in page looks perfectly official.',
        stats: [
          { text: 'Phishing hosted on free cloud domains rose up to 198% in a single year.', source: 'Fortra', year: '2024' },
          { text: 'A real padlock only means the connection is encrypted — not who owns the page.' },
        ],
        sources: [
          { title: 'Cloudflare’s pages.dev and workers.dev domains increasingly abused for phishing', publisher: 'Fortra', date: 'December 2024' },
          { title: 'Public Suffix List', publisher: 'Mozilla / publicsuffix.org', date: 'living document' },
        ],
        card: {
          chip: 'Look-alike',
          color: '#dc2626',
          verdict: { win: "The address gave it away.", lose: "The look-alike worked." },
          rule: 'Read the domain from the right.',
          habit: 'Open portals from your bookmark.',
          hero: 'ejada',
          tell: 'Everything before .workers.dev is decoration.',
          slip: { advice: 'CHECK THE PADLOCK', answer: 'It was real. So was the scam.' },
          loot: { title: 'New login', stamp: 'CREDS IN', price: 15, items: [{ icon: 'key', count: '1', label: 'login' }, { icon: 'cookie', count: '1', label: 'session' }, { icon: 'folder', count: '1', label: 'gov portal' }] },
        },
        detection: {
          human: 'Read the registrable domain just before the first single slash. Everything to its left was chosen by whoever owns the page.',
          control: 'Block or isolate sign-in pages on free-hosting platforms, hold first-seen domains, and use origin-bound password managers.',
          signal: 'A proxy or DNS hit for a brand keyword inside the hostname of a free-hosting domain, or of a domain first seen in the last days.',
        },
        controls: [
          { label: 'Filter free hosting', detail: 'Treat workers.dev, pages.dev, github.io and similar platforms as their own web category, and block sign-in pages on them.' },
          { label: 'Newly seen hosts', detail: 'Hold or isolate first-seen hosts for a day. The average phishing campaign is over in about 21 hours (Oest et al., USENIX Security 2020).' },
          { label: 'Password managers', detail: 'Origin-bound autofill is a control, not a convenience: it will not fill on a look-alike host.' },
          { label: 'Look-alike monitoring', detail: 'Certificate transparency logs reveal look-alike domains an attacker registers. Free-host subdomains sit under the platform’s wildcard certificate and never appear there, so pair this with URL filtering.' },
        ],
        technique: {
          name: 'Subdomain spoofing (domain confusion)',
          aka: ['free-host phishing', 'workers.dev trick', 'hostname confusion'],
          prevalence: 'Extremely common — attackers host pixel-perfect clones on free platforms (workers.dev, github.io, pages.dev, azurewebsites.net) where they control the entire left-hand side of the hostname.',
          variants: [
            { label: 'Free-host subdomain', desc: 'ejada.gov.om.workers.dev — the real domain is workers.dev', visual: 'domain' },
            { label: 'Homoglyph domains', desc: 'rnicrosoft.com, or a Cyrillic "о" inside gov.om', visual: 'domain' },
            { label: 'Wrong TLD', desc: 'ejada.gov.com instead of ejada.gov.om', visual: 'domain' },
            { label: 'Punycode IDN', desc: 'xn-- encoded international lookalikes', visual: 'domain' },
          ],
        },
        hints: {
          nudge: 'Read the hostname right-to-left: the registrable domain is the last two labels before the first slash.',
          explain: 'ejada.gov.om.workers.dev is a free Cloudflare Workers subdomain — anyone can put "ejada.gov.om" in front of workers.dev. The real portal is ejada.gov.om, nothing else.',
        },
        timeline: [
          { label: 'Ejada evaluation reminder delivered' },
          { label: 'Link clicked → ejada.gov.om.workers.dev' },
          { label: 'Cloned government login rendered' },
          { label: 'User inspects the hostname anatomy' },
          { label: 'Government portal credentials harvested', critical: true },
          { label: 'SESSION COMPROMISED — ministry account takeover' },
        ],
        debrief: {
          win: 'You read the hostname before typing anything. The clone was perfect — the address was not.',
          lose: 'The page was a perfect clone. The address was ejada.gov.om.workers.dev — a free Cloudflare host. Your ministry credentials went to whoever created that worker.',
          lessons: [
            'Read a hostname right-to-left: the registrable domain sits just before the first single slash.',
            'Everything LEFT of the registrable domain is chosen by whoever registered it — on free hosts, that is the attacker.',
            'A padlock means encrypted transport, not a trustworthy host. workers.dev had a valid certificate too.',
            'Reach government services from your own bookmark; verify unfamiliar hosts against the official domain.',
          ],
        },
      },

      'device-code': {
        id: 'device-code',
        title: 'A teammate shared protected documents',
        codename: 'SC-03',
        quick: false,
        entryApp: 'mail',
        intro: 'Three protected PDFs just landed in your mailbox. It is 11:23.',
        brief: 'Review them before Sunday\'s meeting. They just need a quick sign-in.',
        stats: [
          { text: 'It began as a state-backed technique; by 2026 it was sold as a kit called EvilTokens.', source: 'Microsoft and Cloud Security Alliance', year: '2026' },
          { text: 'One EvilTokens campaign took over 340+ organisations across five countries in early 2026 — multi-factor and all.', source: 'Cloud Security Alliance', year: '2026' },
        ],
        sources: [
          { title: 'Storm-2372 conducts device code phishing campaign', publisher: 'Microsoft Threat Intelligence', date: '13 February 2025' },
          { title: 'Access granted: phishing with device code authorization for account takeover', publisher: 'Proofpoint', date: 'December 2025' },
        ],
        card: {
          chip: 'Device code',
          color: '#0d9488',
          verdict: { win: "The code was questioned.", lose: "Their device signed in." },
          rule: 'A code from a web page is theirs.',
          habit: 'Only type codes from your own device.',
          hero: 'device-code',
          tell: 'This code belongs to the attacker\u2019s device.',
          slip: { advice: 'CHECK THE URL', answer: 'It was login.microsoftonline.com. Real.' },
          loot: { title: 'New token', stamp: 'DEVICE ENROLLED', price: 300, items: [{ icon: 'token', count: '90', label: 'day token' }, { icon: 'mailbox', count: 'all', label: 'mail + files' }, { icon: 'key', count: '0', label: 'MFA prompts' }] },
        },
        detection: {
          human: 'Only enter a code you started yourself, on a screen you opened yourself. If a page you did not request hands you a code, stop.',
          control: 'Block the device-code flow in Conditional Access for everyone who does not need it. Require compliant devices for token issuance.',
          signal: 'Sign-ins using the device-code protocol, followed by a new device registration or token use from an unfamiliar location.',
        },
        controls: [
          { label: 'Block the flow', detail: 'Conditional access can block the device code authentication flow for everyone except the few accounts that need it. This is the control that stops the attack.' },
          { label: 'Passkeys do not help here', detail: 'The victim signs in on the genuine origin, so even phishing-resistant MFA completes normally and the attacker still receives the tokens.' },
          { label: 'Hunt in sign-in logs', detail: 'Filter for the device code protocol and review every success: legitimate use is rare and predictable.' },
          { label: 'Revoke, do not just reset', detail: 'A password change does not reliably end the refresh token. Revoke sessions explicitly and remove unknown registered devices.' },
          { label: 'Limit the foothold', detail: 'Sign-in frequency and compliant-device requirements cut how long stolen tokens stay useful.' },
        ],
        technique: {
          name: 'Device code phishing',
          aka: ['OAuth device flow abuse', 'device authorization grant phishing'],
          prevalence: 'Rising since 2024 against MFA-heavy organizations — used by Midnight Blizzard (APT29) and FIN7 to enroll attacker devices with valid tokens.',
          variants: [
            { label: 'QR sign-in lure', desc: '"Scan to authenticate" — the QR starts the attacker\'s device flow', visual: 'qr' },
            { label: 'Adobe PDF Reader lure', desc: 'Blurred files + "sign in with Adobe" — the code belongs to the attacker', visual: 'docusign' },
            { label: 'Meeting recording bait', desc: 'Shared "Teams recording" that needs a quick sign-in', visual: 'video' },
            { label: 'Compliance deadline', desc: 'Training / attestation lures aimed at busy staff', visual: 'docusign' },
          ],
        },
        hints: {
          nudge: 'That sign-in code — who generated it? A device code never shows you whose session it unlocks.',
          explain: 'The code belongs to the attacker\'s device. Signing in with it — even with MFA — issues them a token that outlives your password.',
        },
        timeline: [
          { label: 'Lure email delivered ("protected documents")' },
          { label: 'Link clicked → blurred-files lure page' },
          { label: 'Pop-up: sign in with Microsoft + code' },
          { label: 'Microsoft device-login page opened in a new tab' },
          { label: 'User enters the attacker\'s device code', critical: true },
          { label: 'Signs in on the real Microsoft page (existing session or credentials)' },
          { label: 'Attacker device session authorized (token issued)' },
          { label: 'SESSION COMPROMISED — attacker device enrolled' },
        ],
        debrief: {
          win: 'You questioned who generated that code. Device codes authorize devices — and you never get to see whose.',
          lose: 'The login page was 100% genuine. The code was 100% real. You just authenticated someone else\'s device.',
          lessons: [
            'Device-code phishing uses the real login page — the scam is in the context, not the pixels.',
            'Never type a device code anywhere except the device that generated it — and never one from a web page.',
            'A code + your MFA still hands over a refresh token that outlives your password. Phishing-resistant MFA breaks this.',
          ],
        },
      },

      'zoom-docs': {
        id: 'zoom-docs',
        title: 'You are invited to "Contract Bid Proposal"',
        codename: 'SC-05',
        quick: false,
        entryApp: 'mail',
        intro: 'A document invitation just landed in your mailbox. It is 14:18.',
        brief: 'Procurement is sending a contract bid proposal this afternoon. Tenders close at 16:00, so open it when it lands.',
        stats: [
          { text: 'Abuse of trusted platforms like Zoom and SharePoint rose 67% in 2025 — and these messages pass every email authentication check.', source: 'KnowBe4', year: '2025' },
          { text: 'The “file” is often a real remote-support tool, ScreenConnect, renamed to look like a document.', source: 'Sublime Security', year: '2025' },
        ],
        sources: [
          { title: 'Living off trusted sites: Zoom service abuse to deliver credential phishing', publisher: 'Sublime Security', date: '2025' },
          { title: 'Attackers weaponize Zoom Docs to phish targets', publisher: 'Abnormal AI', date: '2025' },
        ],
        card: {
          chip: 'Trusted share',
          color: '#2563eb',
          verdict: { win: "The file type gave it away.", lose: "Real sender, trapped file." },
          rule: 'Check what a file is.',
          habit: 'Right-click it and read its type.',
          hero: 'zoom-docs',
          tell: 'A contract is never a .js file.',
          slip: { advice: 'VERIFY THE SENDER', answer: 'It really was Zoom.' },
          loot: { title: 'New log', stamp: 'SOLD', price: 75, items: [{ icon: 'key', count: '38', label: 'passwords' }, { icon: 'cookie', count: '1,204', label: 'cookies' }, { icon: 'folder', count: '52', label: 'files' }] },
        },
        detection: {
          human: 'A genuine sender proves nothing about the attachment. Show file extensions: a document never ends in .js, .vbs or .hta.',
          control: 'Open script file types in Notepad by default, enable attack surface reduction rules, and mark external shares clearly.',
          signal: 'wscript.exe or cscript.exe launched from a user Downloads folder, followed by outbound connections to an unfamiliar host.',
        },
        controls: [
          { label: 'Defuse script files', detail: 'Change the default handler for .js, .jse, .wsf, .vbs and .hta to Notepad, or disable Windows Script Host. A double-click then opens text.' },
          { label: 'Attack surface reduction', detail: '“Block execution of potentially obfuscated scripts” is the rule that applies here. “Block JavaScript or VBScript from launching downloaded executable content” only stops a script starting a downloaded executable.' },
          { label: 'Assume session theft', detail: 'After an infostealer, reset passwords and revoke every session. Stolen session cookies outlive the password, which is why device-bound sessions matter.' },
          { label: 'Mark of the Web', detail: 'Patch so Windows carries the download tag into mounted disk images, and use an archiver that propagates it, so the security warning still appears.' },
        ],
        technique: {
          name: 'Trusted-service abuse: a real Zoom share carrying a malicious file',
          aka: ['living off trusted sites', 'trusted-service abuse', 'file-type deception'],
          prevalence: 'Rather than register a look-alike, attackers create a genuine Zoom Doc, so the invite is sent by Zoom from zoom.us with SPF, DKIM and DMARC all passing. Researchers documented this through 2025 delivering fake sign-in pages and renamed remote-access installers.',
          variants: [
            { label: 'Real sender, real domain', desc: 'The invite is a genuine Zoom notification, so the sender and the link both pass every domain check.', visual: 'docusign' },
            { label: 'Payload inside the document', desc: 'The shared doc holds the trap, a "download" or "sign in to view" button, not the content it promises.', visual: 'update' },
            { label: 'Script as document', desc: 'The download is a .js, .lnk or .hta, or an .iso hiding one, not the PDF it claims to be.', visual: 'terminal' },
            { label: 'Any trusted platform', desc: 'The same trick rides DocuSign, Dropbox, Adobe and Canva; their own emails pass authentication too.', visual: 'oauth' },
          ],
        },
        hints: {
          nudge: 'The invite is genuinely from Zoom and the address checks out. So look at what it is actually handing you.',
          explain: 'The attacker shared a real Zoom document, so the email really is from zoom.us. What matters is the file it gives you: it ends in .js, a program Windows runs, not a document it shows.',
        },
        timeline: [
          { label: 'Zoom Docs invitation delivered' },
          { label: 'Shared document opened on docs.zoom.us' },
          { label: '"Secure attachment" downloaded' },
          { label: 'Windows security warning shown' },
          { label: 'You chose Open on the .js file', critical: true },
          { label: 'Script fetched an infostealer' },
          { label: 'Passwords, cookies and files copied to the attacker' },
        ],
        debrief: {
          win: 'You judged the file, not the domain. The invite and the address were genuinely Zoom, which is exactly the cover, but the file it handed you was a program.',
          lose: 'You were never asked for a password. The invite really was from Zoom; none of that vouched for the file, which was a Windows script. One double-click was all it needed.',
          lessons: [
            'Check what a file is, not what it is called. A contract is never a .js, .lnk, .hta or .scr file.',
            'A real sender and a real address do not vouch for an attachment. Right-click it and read its type before opening.',
            'IT: make .js and .hta open in Notepad by default, and after an infostealer revoke every session, not just the password.',
          ],
        },
      },

      'ironcastle': {
        id: 'ironcastle',
        title: 'Frontier AI for $10 a month',
        codename: 'SC-06',
        quick: false,
        entryApp: 'chat',
        intro: 'A WhatsApp message from a colleague just arrived. It is 15:06.',
        brief: 'Dana and you are choosing a coding assistant for the routing prototype. The budget is tiny. She asked you to set it up if it seems fine.',
        stats: [
          { text: 'The self-spreading Shai-Hulud worm hit 500+ code packages in September 2025, then 700+ weeks later.', source: 'CISA and Unit 42', year: '2025' },
          { text: 'It stole around 14,000 secrets across hundreds of organisations.', source: 'Unit 42', year: '2025' },
        ],
        sources: [
          { title: 'Widespread supply chain compromise impacting npm ecosystem', publisher: 'CISA', date: '23 September 2025' },
          { title: 'Mitigating the Axios npm supply chain compromise', publisher: 'Microsoft Threat Intelligence', date: '1 April 2026' },
        ],
        card: {
          chip: 'Supply chain',
          color: '#16a34a',
          verdict: { win: "The publisher check paid off.", lose: "The install ran their script." },
          rule: 'Install means run.',
          habit: 'Read the scripts. Check the publisher.',
          hero: 'ironcastle',
          tell: 'Popular is not the same as safe.',
          slip: { advice: 'TRUST POPULAR PACKAGES', answer: 'Nine days old. Three versions.' },
          loot: { title: 'New access', stamp: 'PUBLISH RIGHTS', price: 200, items: [{ icon: 'token', count: '1', label: 'publish token' }, { icon: 'key', count: '1', label: 'SSH key' }, { icon: 'folder', count: '3', label: '.env files' }] },
        },
        detection: {
          human: 'Check who published the package, how old it is and how many people use it. A name that came from a social post is not provenance.',
          control: 'Install with --ignore-scripts, pull only from an internal allow-list, and keep publish tokens short-lived and scoped.',
          signal: 'A package install followed by reads of ~/.ssh, .env files or cloud credentials by the install process or its child processes.',
        },
        controls: [
          { label: 'Disable install scripts', detail: 'Set ignore-scripts and allow only the packages that need a build step (pnpm onlyBuiltDependencies, npm allowScripts). It does not help once you run the installed tool itself.' },
          { label: 'Release cooldown', detail: 'Refuse versions published in the last few days (pnpm minimumReleaseAge, npm min-release-age). The malicious Axios releases of March 2026 were live for under three hours.' },
          { label: 'Lock and proxy', detail: 'Commit lockfiles, install with a frozen lockfile in CI, and pull through an internal registry proxy.' },
          { label: 'Short-lived secrets', detail: 'Developer machines should hold tokens that expire in hours and are scoped to one project.' },
          { label: 'Detect the behaviour', detail: 'node starting a shell or opening an outbound connection during an install is worth an alert.' },
        ],
        technique: {
          name: 'Malicious npm package with an install-time hook',
          aka: ['supply-chain attack', 'postinstall abuse', 'developer-targeted social engineering'],
          prevalence: 'Among the highest-impact developer attacks of 2025 and 2026. Compromised packages (the Shai-Hulud worm in September 2025, Axios in March 2026) ran attacker code the moment an install finished, stealing credentials or installing a remote-access trojan.',
          variants: [
            { label: 'Install-time hook', desc: 'A postinstall script in package.json runs automatically when the install finishes.', visual: 'terminal' },
            { label: 'Look-alike dependency', desc: 'A trusted package quietly gains a new dependency whose name imitates a well-known one.', visual: 'oauth' },
            { label: 'Manufactured popularity', desc: 'Viral posts, inflated stars and download counts stand in for a track record.', visual: 'video' },
            { label: 'Poisoned update', desc: 'A later version adds the payload to a package people already trust.', visual: 'update' },
          ],
        },
        hints: {
          nudge: 'What do you actually know about this tool, apart from what its own pages say?',
          explain: 'An install command runs the package\u2019s own scripts with your permissions and your tokens. This package has one, and nobody independent vouches for the publisher.',
        },
        timeline: [
          { label: 'Colleague forwards a post about cheap AI access' },
          { label: 'Post followed to the vendor\u2019s site' },
          { label: 'Install command copied from the docs' },
          { label: 'You ran the install command', critical: true },
          { label: 'npm ran the package\u2019s postinstall script without asking' },
          { label: 'Tokens, keys and environment files read from the machine' },
          { label: 'Install reported success while the attacker already had access' },
        ],
        debrief: {
          win: 'You looked at the package and who published it before running anything. A polished website is marketing, not a reference.',
          lose: 'The install finished without an error because nothing went wrong from npm\u2019s point of view. A postinstall script ran with your permissions and sent your developer credentials out. You never opened an attachment or typed a password.',
          lessons: [
            'Install means run. Read a package\u2019s install scripts and publisher, from somewhere other than its own website, before installing.',
            'Viral posts and polished sites are not a track record. Check the repository, the maintainers and the version history.',
            'IT: set ignore-scripts, add a release cooldown, use short-lived tokens, and alert when node spawns a shell during an install.',
          ],
        },
      },
    } as Record<string, ScenarioModule>,

    order: ['clickfix', 'evilginx-bitb', 'device-code', 'ejada', 'zoom-docs', 'ironcastle'] as string[],
    quickDefault: 'clickfix',
  }),

  getters: {
    list(state): ScenarioModule[] {
      return state.order.map((id) => state.modules[id])
    },
  },

  actions: {
    byId(id: string): ScenarioModule | undefined {
      return this.modules[id]
    },
    hint(id: string, kind: 'nudge' | 'explain', flags: Record<string, boolean>): string | undefined {
      const m = this.modules[id]
      if (!m) return undefined
      return kind === 'nudge' ? m.hints.nudge : m.hints.explain
    },
    onEvent(scenarioId: string, type: string, detail?: string) {
      // per-scenario reactions to behavior — driven by session store's coach
      const session = useSessionStore()
      const s = session
      switch (scenarioId) {
        case 'evilginx-bitb':
          if (type === 'LINK_CLICKED' && detail === 'https://app.qabas-ai.com/playground') {
            s.coach('Free frontier models. Right. Nothing on the internet is that generous.')
          }
          if (type === 'URL_INSPECTED') s.flag('inspected_url')
          if (type === 'ENTERED_CREDENTIALS') {
            s.coach('Oh no. That login page was inside the web page — not your browser.')
          }
          break
        case 'clickfix':
          if (type === 'COMMAND_EXECUTED') {
            s.coach('That command just downloaded and ran attacker code. You were the exploit.')
          }
          break
        case 'ejada':
          if (type === 'URL_ANATOMY_OPENED') s.coach('Exactly — workers.dev owns this page. "ejada.gov.om" is just decoration in front of it.')
          break
        case 'zoom-docs':
          if (type === 'FILE_SAVED') s.coach('A "PDF" that downloads as .js. Look at the file type before you open anything.')
          break
        case 'ironcastle':
          if (type === 'DOC_COMMAND_COPIED') s.coach('That command is not documentation. It installs and runs someone else\u2019s code.')
          break
        case 'device-code':
          if (type === 'DEVICE_CODE_ENTERED') {
            s.coach('That code was generated by someone else\'s device. You are holding their house key.')
          }
          if (type === 'MFA_DENIED') s.coach('Good instinct. That request was not yours.')
          break
      }
    },
  },
})

import { useSessionStore } from './session'
