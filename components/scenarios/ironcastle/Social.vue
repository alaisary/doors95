<template>
  <!-- THE DISCOVERY: a LinkedIn clone. Nothing here is phishing — a viral post
       with enough social proof that the deal feels already validated. -->
  <div class="li-root">
    <header class="li-top">
      <div class="li-top-inner">
        <span class="li-logo" aria-label="LinkedIn">in</span>
        <div class="li-search">Search</div>
        <nav class="li-nav">
          <button v-for="n in nav" :key="n.label" class="li-nav-item" :class="{ on: n.on }">
            <span class="li-ico" v-html="n.svg"></span>
            <span>{{ n.label }}</span>
          </button>
          <button class="li-nav-item li-me">
            <img class="li-avatar xs" src="/avatars/salim.jpg" alt="Salim Al Harthi">
            <span>Me</span>
          </button>
        </nav>
      </div>
    </header>

    <div class="li-layout">
      <aside class="li-left">
        <div class="li-card li-profile">
          <div class="li-cover"></div>
          <img class="li-avatar lg" src="/avatars/salim.jpg" alt="Salim Al Harthi">
          <div class="li-profile-name">Salim Al Harthi</div>
          <div class="li-profile-role">Operations Coordinator at Wadi Gate Logistics</div>
          <div class="li-profile-loc">Muscat, Oman</div>
          <div class="li-profile-stat"><span>Profile viewers</span><b>43</b></div>
          <div class="li-profile-stat"><span>Connections</span><b>482</b></div>
        </div>
        <div class="li-card li-links">
          <span v-for="l in ['Groups', 'Events', 'Followed Hashtags', 'Saved items']" :key="l">{{ l }}</span>
        </div>
      </aside>

      <main class="li-feed">
        <div class="li-card li-compose">
          <img class="li-avatar" src="/avatars/salim.jpg" alt="Salim Al Harthi">
          <div class="li-compose-input">Start a post</div>
        </div>

        <article class="li-card li-post">
          <div class="li-post-head">
            <img class="li-avatar md" src="/avatars/priya.jpg" alt="Priya Nair">
            <div class="li-post-who">
              <div class="li-post-name">Priya Nair <span class="li-muted">· 2nd</span></div>
              <div class="li-post-headline">Senior Platform Engineer · infra &amp; developer tooling</div>
              <div class="li-post-time">3h, visible to anyone
                <svg class="li-globe" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="8" cy="8" r="6.4" /><path d="M1.6 8h12.8M8 1.6c2 2 2 10.8 0 12.8M8 1.6c-2 2-2 10.8 0 12.8" /></svg>
              </div>
            </div>
            <button class="li-follow">+ Follow</button>
          </div>

          <div class="li-post-body">
            <p>This might be the best AI deal I've seen all year.</p>
            <p>Frontier models for <b>$10/month</b>.<br>
              <b>$80</b> of equivalent usage at peak, <b>$120</b> off-peak.</p>
            <p>I've been hammering the API all morning and haven't hit a wall yet.
              If you're building with AI, this is worth checking out.</p>
          </div>

          <button class="li-link-card" @click="visitSite">
            <span class="li-link-thumb"><img class="li-link-mark" src="/ironcastle-logo.svg" alt="IronCastle"></span>
            <span class="li-link-info">
              <span class="li-link-domain">ironcastle.ai</span>
              <span class="li-link-title">IronCastle AI: frontier intelligence, developer pricing</span>
              <span class="li-link-desc">Unified API for Iron-Reasoner, Iron-Code, Iron-Vision and Iron-Flash. $10/month, no enterprise contract.</span>
            </span>
          </button>

          <div class="li-reactions">
            <span class="li-r-icons" aria-hidden="true"><i style="background:#378fe9"></i><i style="background:#df704d"></i><i style="background:#6dae4f"></i></span>
            <span class="li-r-count">1,284</span>
            <span class="li-r-right">197 comments, 342 reposts</span>
          </div>

          <div class="li-actions">
            <button v-for="a in ['Like', 'Comment', 'Repost', 'Send']" :key="a" class="li-action">{{ a }}</button>
          </div>

          <div class="li-comments">
            <div v-for="c in comments" :key="c.name" class="li-comment">
              <img v-if="c.img" class="li-avatar sm" :src="c.img" :alt="c.name">
              <span v-else class="li-avatar sm li-initials" :style="{ background: c.tint }">{{ c.initials }}</span>
              <div class="li-comment-body">
                <div class="li-comment-bubble">
                  <div class="li-comment-head">
                    <span class="li-comment-name">{{ c.name }}</span>
                    <span v-if="c.badge" class="li-badge">{{ c.badge }}</span>
                    <span class="li-comment-headline">{{ c.headline }}</span>
                  </div>
                  <div class="li-comment-text">{{ c.text }}</div>
                </div>
                <div class="li-comment-meta"><span>Like</span><span>Reply</span><span>{{ c.likes }} likes</span></div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <aside class="li-right">
        <div class="li-card li-news">
          <h4>LinkedIn News</h4>
          <div v-for="t in news" :key="t.title" class="li-news-item">
            <div class="li-news-title">{{ t.title }}</div>
            <div class="li-news-meta">{{ t.meta }}</div>
          </div>
        </div>
        <div class="li-card li-followbox">
          <h4>Add to your feed</h4>
          <div v-for="s in suggestions" :key="s.name" class="li-suggest">
            <img class="li-avatar sm" :class="{ dark: s.logo }" :src="s.img" :alt="s.name">
            <div>
              <div class="li-suggest-name">{{ s.name }}</div>
              <div class="li-suggest-role">{{ s.role }}</div>
              <button class="li-follow sm">+ Follow</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import emitter from '~/components/misc/eventHandler'

const session = useSessionStore()

const nav = [
  { label: 'Home', on: true, svg: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { label: 'My Network', on: false, svg: '<circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M17 8v6M14 11h6" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { label: 'Jobs', on: false, svg: '<rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 7V5h6v2" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { label: 'Messaging', on: false, svg: '<path d="M4 5h16v11H8l-4 4z" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { label: 'Notifications', on: false, svg: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1 2H5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 21h4" stroke="currentColor" stroke-width="2"/>' },
]

const comments = [
  { name: 'Jonas Lindqvist', img: '', initials: 'JL', tint: '#5a6b7d', headline: 'Backend Engineer', badge: '', text: 'how are they making money at $10 a month? genuinely asking, inference is not cheap', likes: 96 },
  { name: 'Sofia Reyes', img: '/avatars/sofia.jpg', headline: 'Full-stack developer', badge: '', text: 'been on it about a week. latency is fine and I have not been throttled once.', likes: 214 },
  { name: 'Devon Park', img: '/avatars/devon.jpg', headline: 'Staff Engineer at Fintrail', badge: '1st', text: 'their docs are actually good. the CLI dropped straight into my editor, setup took 30 seconds.', likes: 341 },
  { name: 'Priya Nair', img: '/avatars/priya.jpg', headline: 'Author', badge: '', text: 'they say they subsidise inference to grow the developer base before raising prices. whatever the model is, it works.', likes: 128 },
  { name: 'Kasia Wójcik', img: '', initials: 'KW', tint: '#7a5c8e', headline: 'ML Engineer', badge: '', text: 'asked my coding assistant how to set it up and it gave me the install command from their docs. worked first try.', likes: 57 },
]

const news = [
  { title: 'Developers are rethinking inference costs', meta: '8h ago, 12,401 readers' },
  { title: 'The rise of the AI-native editor', meta: '1d ago, 6,208 readers' },
  { title: 'Remote teams return to the office two days a week', meta: '2d ago, 9,732 readers' },
  { title: 'Port congestion eases across the Gulf', meta: '3d ago, 4,110 readers' },
]

const suggestions = [
  { name: 'IronCastle AI', img: '/ironcastle-logo.svg', role: 'Software development', logo: true },
  { name: 'Devon Park', img: '/avatars/devon.jpg', role: 'Staff Engineer at Fintrail' },
  { name: 'Priya Nair', img: '/avatars/priya.jpg', role: 'Senior Platform Engineer' },
]

function visitSite() {
  session.log('LINK_CLICKED', 'https://ironcastle.ai (from a LinkedIn post)', 'neutral')
  session.timelineStep('You followed the post to ironcastle.ai')
  emitter.emit('openPage', 'IronCastle')
}
</script>

<style scoped>
.li-root { min-height: 100%; background: #f4f2ee; color: rgba(0,0,0,0.9); font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; }
.li-card { background: #fff; border: 1px solid #e0dfdc; border-radius: 8px; }

.li-top { background: #fff; border-bottom: 1px solid #e0dfdc; position: sticky; top: 0; z-index: 5; }
.li-top-inner { max-width: 1128px; margin: 0 auto; height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 16px; }
.li-logo { width: 34px; height: 34px; border-radius: 4px; background: #0a66c2; color: #fff; font-size: 21px; font-weight: 700; letter-spacing: -1px; display: inline-flex; align-items: center; justify-content: center; }
.li-search { width: 240px; height: 34px; display: flex; align-items: center; padding: 0 10px; background: #edf3f8; border-radius: 4px; color: #666; font-size: 13px; }
.li-nav { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.li-nav-item { background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 12px; color: #666; font-size: 11px; cursor: pointer; border-bottom: 2px solid transparent; font-family: inherit; }
.li-nav-item.on { color: #191919; border-bottom-color: #191919; }
.li-ico { width: 22px; height: 22px; display: block; }
.li-ico :deep(svg) { width: 22px; height: 22px; }
.li-me { flex-direction: column; }

.li-layout { max-width: 1128px; margin: 22px auto; padding: 0 16px; display: grid; grid-template-columns: 225px minmax(0, 555px) 300px; gap: 22px; justify-content: center; }
@media (max-width: 1100px) { .li-layout { grid-template-columns: 225px minmax(0, 555px); } .li-right { display: none; } }
@media (max-width: 820px) { .li-layout { grid-template-columns: minmax(0, 1fr); } .li-left { display: none; } }

.li-left, .li-right { display: flex; flex-direction: column; gap: 12px; }
.li-profile { overflow: hidden; text-align: center; padding-bottom: 14px; }
.li-cover { height: 56px; background: linear-gradient(120deg, #1b4b7a, #0a66c2); }
.li-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; display: block; background: #e7e9ec; }
.li-avatar.xs { width: 24px; height: 24px; }
.li-avatar.sm { width: 32px; height: 32px; }
.li-avatar.md { width: 48px; height: 48px; }
.li-avatar.lg { width: 72px; height: 72px; margin: -36px auto 8px; border: 2px solid #fff; }
.li-avatar.dark { background: #0b0d12; padding: 5px; }
.li-profile-name { font-size: 16px; font-weight: 600; }
.li-profile-role { font-size: 12.5px; color: #666; padding: 4px 16px 0; }
.li-profile-loc { font-size: 12px; color: #999; margin-top: 3px; }
.li-profile-stat { display: flex; justify-content: space-between; padding: 8px 16px 0; font-size: 12px; color: #666; }
.li-profile-stat b { color: #0a66c2; }
.li-links { padding: 6px 0; }
.li-links span { display: block; padding: 7px 14px; font-size: 13px; color: #555; cursor: default; }
.li-links span:hover { background: #f3f2ef; }

.li-feed { display: flex; flex-direction: column; gap: 12px; }
.li-compose { display: flex; align-items: center; gap: 10px; padding: 12px 16px; }
.li-compose-input { flex: 1; border: 1px solid #c9c9c9; border-radius: 24px; padding: 10px 16px; font-size: 14px; color: #666; }

.li-post { padding: 14px 16px; }
.li-post-head { display: flex; align-items: flex-start; gap: 10px; }
.li-post-who { flex: 1; min-width: 0; }
.li-post-name { font-size: 14px; font-weight: 600; }
.li-muted { color: #666; font-weight: 400; font-size: 12.5px; }
.li-post-headline { font-size: 12px; color: #666; }
.li-post-time { font-size: 12px; color: #999; }
.li-globe { display: inline-block; vertical-align: -1px; margin-left: 2px; }
.li-follow { border: none; background: none; color: #0a66c2; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
.li-follow.sm { font-size: 13px; padding: 0; margin-top: 2px; }

.li-post-body { margin: 12px 0 12px 54px; font-size: 14px; }
.li-post-body p { margin: 0 0 10px; line-height: 1.5; }

.li-link-card { display: flex; width: calc(100% - 54px); margin-left: 54px; border: 1px solid #e0dfdc; background: #f9fafb; border-radius: 4px; padding: 0; overflow: hidden; cursor: pointer; text-align: left; font-family: inherit; }
.li-link-card:hover { background: #f3f2ef; }
.li-link-thumb { width: 110px; flex-shrink: 0; background: #0b0d12; display: flex; align-items: center; justify-content: center; }
.li-link-mark { width: 30px; height: 30px; display: block; }
.li-link-info { padding: 12px 14px; display: flex; flex-direction: column; gap: 3px; }
.li-link-domain { font-size: 11px; color: #666; }
.li-link-title { font-size: 13.5px; font-weight: 700; color: #191919; }
.li-link-desc { font-size: 12px; color: #666; line-height: 1.45; }

.li-reactions { display: flex; align-items: center; gap: 8px; margin: 12px 0 8px 54px; font-size: 12px; color: #666; }
.li-r-icons { display: inline-flex; }
.li-r-icons i { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid #fff; margin-right: -4px; }
.li-r-count { margin-left: 4px; }
.li-initials { display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 600; }
.li-r-count { color: #191919; }
.li-r-right { margin-left: auto; }
.li-actions { display: flex; justify-content: space-between; border-top: 1px solid #e8e8e8; padding-top: 6px; margin-left: 54px; }
.li-action { flex: 1; background: none; border: none; padding: 10px 0; font-size: 13.5px; font-weight: 600; color: #666; cursor: pointer; border-radius: 4px; font-family: inherit; }
.li-action:hover { background: #f3f2ef; color: #191919; }

.li-comments { margin: 8px 0 0 54px; display: flex; flex-direction: column; gap: 12px; }
.li-comment { display: flex; gap: 8px; }
.li-comment-body { flex: 1; }
.li-comment-bubble { background: #f3f2ef; border-radius: 8px; padding: 10px 12px; }
.li-comment-head { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.li-comment-name { font-size: 12.5px; font-weight: 600; }
.li-badge { font-size: 10px; color: #666; }
.li-comment-headline { font-size: 11px; color: #666; }
.li-comment-text { font-size: 13px; line-height: 1.45; margin-top: 3px; }
.li-comment-meta { display: flex; gap: 12px; font-size: 11.5px; color: #666; padding: 4px 0 0 10px; }

.li-news, .li-followbox { padding: 12px 14px; }
.li-news h4, .li-followbox h4 { font-size: 13.5px; font-weight: 600; margin: 0 0 10px; }
.li-news-item { margin-bottom: 10px; }
.li-news-title { font-size: 13px; font-weight: 600; color: #191919; }
.li-news-meta { font-size: 11.5px; color: #999; }
.li-suggest { display: flex; gap: 10px; margin-bottom: 12px; }
.li-suggest-name { font-size: 13px; font-weight: 600; }
.li-suggest-role { font-size: 11.5px; color: #666; }
</style>
