<template>
  <div class="sl-scene">
    <div class="sl-tip sl-rv" style="left: 2cqw; top: 1.2cqw; width: 40cqw; --d: 0.2s">
      <b>The attacker is in the victim's mailbox.</b> No password. No MFA prompt.
    </div>
    <div class="sl-tip sl-rv" style="left: 52cqw; top: 1.2cqw; width: 46cqw; --d: 3.4s">
      <div class="sl-seen"><b>DEFENDER SEES</b> MFA passed from a hosting IP the user never uses, then mailbox use from another IP</div>
      <div class="sl-stop"><b>WHAT BREAKS IT</b> Passkeys or FIDO2 keys: bound to the real domain</div>
    </div>

    <SlidesSlWin :x="2" :y="9.2" :w="22" :h="19" title="Victim's browser">
      <div class="sl-sunk dim">app.qabas-ai.com</div>
      <div class="sl-sunk ctr" style="margin-top: 0.6cqw"><b>Welcome back!</b><br><span class="dim">Redirecting to Qabas AI...</span></div>
      <div class="dim ctr" style="margin-top: 0.6cqw">nothing seemed wrong</div>
    </SlidesSlWin>
    <SlidesSlWin :x="38" :y="9.2" :w="24" :h="19" title="Attacker's proxy" kind="atk" :d="0.3">
      <div class="sl-con">
        <div class="sl-ban">RELAYD<small>AiTM reverse proxy v2.1</small></div>
        <div style="margin: 0.7cqw 0 0.5cqw; color: #9fb">phishlet m365-login<br>lure app.qabas-ai.com</div>
        <div class="sl-kpi"><div><b>3</b>captured</div><div><b style="color: #ffb020">1</b>sessions</div></div>
      </div>
    </SlidesSlWin>
    <SlidesSlWin :x="76" :y="9.2" :w="22" :h="19" title="login.microsoftonline.com" kind="real" :d="0.6">
      <div class="sl-sunk grn">padlock on, certificate valid</div>
      <div class="sl-sunk" style="margin-top: 0.6cqw; line-height: 1.5">Sign-in log<br>09:41 from 203.0.113.40 (hosting)<br>09:41 MFA satisfied</div>
    </SlidesSlWin>

    <div class="sl-arr sl-rv" style="left: 24.5cqw; top: 10cqw; width: 12cqw; --d: 0.9s">email + password<i>&#9654;</i></div>
    <div class="sl-arr sl-rv" style="left: 24.5cqw; top: 14.5cqw; width: 12cqw; --d: 1.2s">200 Welcome back<i>&#9664;</i></div>
    <div class="sl-arr sl-rv" style="left: 62.5cqw; top: 10cqw; width: 12cqw; --d: 1.2s">MFA code<i>&#9654;</i></div>
    <div class="sl-arr sl-rv" style="left: 62.5cqw; top: 14.5cqw; width: 12cqw; --d: 1.5s">Set-Cookie<i>&#9664;</i></div>

    <SlidesSlWin :x="2" :y="30.2" :w="26" :h="20.8" title="Session jar" kind="atk" :d="1.8">
      <div class="sl-sunk" style="line-height: 1.5"><b>a.salem@wadigate.om</b><br><span class="dim">ESTSAUTH=0.AXoA3kq9...</span><br><span class="grn">live session</span> &nbsp; <span class="red">MFA bypassed</span></div>
    </SlidesSlWin>
    <SlidesSlWin :x="30" :y="30.2" :w="68" :h="20.8" title="Attacker's browser: outlook.office.com/mail" kind="atk" :d="2.4">
      <div class="sl-rb" style="display: flex; gap: 0.6cqw; margin-bottom: 0.5cqw"><span>New</span><span>Reply</span><span>Delete</span><span class="dim">|</span><span>Send/Recv</span></div>
      <div style="display: grid; grid-template-columns: 8cqw 1fr; gap: 0.6cqw; height: calc(100% - 3cqw)">
        <div class="sl-sunk" style="line-height: 1.7">Inbox (4)<br>Sent<br>Rules</div>
        <div style="display: grid; grid-template-rows: auto 1fr; gap: 0.5cqw; min-height: 0">
          <div class="sl-sunk" style="padding: 0">
            <table class="sl-lv">
              <tr><th>From</th><th>Subject</th><th>Received</th></tr>
              <tr class="sel"><td>h.albusaidi</td><td>Q3 route optimization, final numbers</td><td>09:12</td></tr>
              <tr><td>invoices</td><td>INV-2291 approval needed</td><td>10:07</td></tr>
              <tr><td>f.nasser</td><td>Fleet audit: Friday deadline</td><td>10:31</td></tr>
              <tr><td>payroll</td><td>Payroll run for October</td><td>11:02</td></tr>
            </table>
          </div>
          <div class="sl-sunk" style="line-height: 1.4">
            <b class="red">Rule created:</b> forward every new mail to d.mercer@mailbox.example.<br>
            <b class="red">Sent as a.salem:</b> "Updated bank details for the next payment".
          </div>
        </div>
      </div>
    </SlidesSlWin>
  </div>
</template>
