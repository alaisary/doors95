<template>
  <div class="credits-window">
    <div class="window-body">
      <h1 class="title">Honey95</h1>
      <p class="subtitle">Social Engineering Range</p>

      <hr>

      <h2>Author</h2>
      <ul>
        <li>
          <a href="https://www.linkedin.com/in/khalid-al-harthi/" target="_blank" rel="noopener">Khalid Alharthi</a>
        </li>
      </ul>

      <h2>Acknowledgements</h2>
      <p>This is a fork of <a href="https://github.com/darius-it/doors95" target="_blank" rel="noopener">Doors95</a> (Hackaburg 2025).</p>

      <hr>

      <p class="fine">
        All attacks in this range are dramatizations running entirely in your browser.
        No real credentials, networks or payloads are involved.
      </p>
    </div>
  </div>
</template>

<style scoped>
.credits-window {
  width: 100%;
  height: 100%;
  background: #c0c0c0;
  overflow-y: auto;
}

.window-body {
  font-size: 14px;
  padding: 20px 22px;
  color: #111;
  font-family: 'Windows 95', 'MS Sans Serif', Tahoma, sans-serif;
}

.title {
  font-size: 26px;
  margin: 0;
  letter-spacing: 1px;
  color: #000181;
}

.subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  letter-spacing: 0.25em;
  color: #404040;
}

h2 {
  font-size: 15px;
  margin: 14px 0 6px;
  color: #000181;
}

ul {
  margin: 0 0 8px 18px;
  padding: 0;
}

li {
  margin-bottom: 3px;
}

a {
  color: #0000ee;
  text-decoration: underline;
}

hr {
  border: none;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #fff;
  margin: 12px 0;
}

.fine {
  font-size: 10.5px;
  color: #555;
}
</style>
