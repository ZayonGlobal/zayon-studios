// Zayon motion layer: smooth momentum scrolling, scroll-driven scenes, word reveals,
// magnetic buttons and page-to-page curtain transitions.
// Built on Lenis (smooth scroll) and GSAP + ScrollTrigger, loaded from /vendor/.
// Respects the MOTION ON/OFF button and prefers-reduced-motion: when motion is off,
// every effect is reverted and the page falls back to its static layout.

const g = window.gsap, ST = window.ScrollTrigger, Lenis = window.Lenis;
const root = document.documentElement, body = document.body, main = document.querySelector('main');
const calm = () => body.classList.contains('quiet');
const fine = matchMedia('(hover:hover) and (pointer:fine)');
const outside = el => !el.closest('.cat-view,.work-hub'); // the Work views keep their own 3D transitions
let lenis = null, mm = null, on = false, tick = null, refreshTimer = 0;

/* ---------- Text splitting: each word sits in a mask so it can rise into view ---------- */
function split(el) {
  if (!el) return [];
  if (!el.dataset.split) {
    el.dataset.split = '1';
    el._orig = el.innerHTML;
    const walk = node => [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
          const w = document.createElement('span'), wi = document.createElement('span');
          w.className = 'w'; wi.className = 'wi'; wi.textContent = part; w.append(wi); frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.classList.contains('w')) walk(child);
    });
    walk(el);
  }
  return [...el.querySelectorAll('.wi')];
}
function unsplit() {
  document.querySelectorAll('[data-split]').forEach(el => { if (el._orig != null) el.innerHTML = el._orig; delete el.dataset.split; });
}

/* ---------- Navigation links: text rolls up on hover ---------- */
function rolls() {
  document.querySelectorAll('header nav a').forEach(a => {
    if (a.querySelector('.roll')) return;
    const t = a.textContent.trim(), roll = document.createElement('span'), s1 = document.createElement('span'), s2 = document.createElement('span');
    roll.className = 'roll'; s1.textContent = t; s2.textContent = t; s2.setAttribute('aria-hidden', 'true');
    roll.append(s1, s2); a.textContent = ''; a.append(roll);
  });
}

/* ---------- Magnetic buttons (mouse only) ---------- */
const MAG = '.round-link,.primary,.load,.hub-go,.reel-cap em,.k-tags span,#motion';
function magnets() {
  if (!fine.matches) return;
  let cur = null;
  const release = el => g.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.35)', overwrite: 'auto' });
  document.addEventListener('pointerover', e => {
    const m = e.target.closest ? e.target.closest(MAG) : null;
    if (m !== cur) { if (cur) release(cur); cur = m; }
  });
  document.addEventListener('pointermove', e => {
    if (!cur || !on) return;
    const r = cur.getBoundingClientRect(), k = Math.min(1, 160 / r.width);
    g.to(cur, { x: (e.clientX - (r.left + r.width / 2)) * .3 * k, y: (e.clientY - (r.top + r.height / 2)) * .4, duration: .6, ease: 'power3.out', overwrite: 'auto' });
  });
  document.addEventListener('pointerleave', () => { if (cur) { release(cur); cur = null; } });
}

/* ---------- Page transitions: a curtain covers the page, the next page lifts it ---------- */
function curtain() {
  let c = document.getElementById('curtain');
  if (!c) {
    c = document.createElement('div'); c.id = 'curtain'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<i class="c1"></i><i class="c2"><b>zayon<small>STUDIOS®</small></b></i>';
    body.append(c);
    if (g) g.set(c.querySelectorAll('i'), { y: 0, yPercent: 101 }); // GSAP owns the offset from here on
  }
  return c;
}
function enter() {
  if (!root.classList.contains('zt-in')) return;
  const c = curtain(), panels = c.querySelectorAll('i'), mark = c.querySelector('b');
  if (calm() || !g) { root.classList.remove('zt-in'); return; }
  g.set(panels, { y: 0, yPercent: 0 }); g.set(mark, { opacity: 1, y: 0 });
  root.classList.remove('zt-in');
  g.timeline()
    .to(mark, { opacity: 0, y: -24, duration: .35, ease: 'power2.in' })
    .to(panels, { yPercent: -101, duration: 1, ease: 'expo.inOut', stagger: -.09 }, .1)
    .set(panels, { yPercent: 101 });
}
function leave(href) {
  try { sessionStorage.setItem('zayon-t', '1'); } catch {}
  lenis?.stop();
  const c = curtain(), panels = c.querySelectorAll('i'), mark = c.querySelector('b');
  g.set(mark, { opacity: 0, y: 24 });
  g.timeline({ onComplete: () => { location.href = href; } })
    .fromTo(panels, { y: 0, yPercent: 101 }, { yPercent: 0, duration: .8, ease: 'expo.inOut', stagger: .09 })
    .to(mark, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, '-=.3');
}
function hookLinks() {
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
    if (u.pathname === location.pathname && u.search === location.search) return; // same page / hash links
    if (!on || calm()) return; // motion off: normal navigation
    e.preventDefault(); leave(u.href);
  });
  addEventListener('pageshow', e => {
    if (!e.persisted) return; // returning via the back button: lift the curtain again
    if (g) g.set(curtain().querySelectorAll('i'), { y: 0, yPercent: 101 });
    lenis?.start();
  });
}

/* ---------- Scroll scenes ---------- */
function scenes(ctx) {
  const { desk } = ctx.conditions, undo = [];
  const rise = (words, extra = {}) => g.from(words, { yPercent: 118, rotate: 5, transformOrigin: '0% 100%', duration: 1.2, ease: 'expo.out', stagger: .06, ...extra });

  // Hero: headline words rise in, then the copy and buttons; the headline drifts as you scroll away.
  const hero = main.querySelector('.hero');
  if (hero) {
    const h1 = hero.querySelector('h1');
    g.timeline({ delay: root.dataset.entered ? .1 : .35 })
      .add(rise(split(h1), { duration: 1.4, stagger: .08 }))
      .from(hero.querySelectorAll('.hero-bottom > *'), { y: 34, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1 }, '-=1')
      .from(hero.querySelectorAll('.cat-buttons a'), { y: 26, opacity: 0, duration: .8, ease: 'power3.out', stagger: .06 }, '-=.8');
    g.to(h1, { yPercent: -22, opacity: .25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  // Page headlines (About, Contact, project pages).
  main.querySelectorAll('.page-head h1').forEach(h => { if (outside(h)) rise(split(h), { delay: .2 }); });

  // Showreel: an inset card grows to fill the screen, then steps through selected work.
  const reel = main.querySelector('.reel');
  if (reel) {
    const frame = reel.querySelector('.reel-frame'), slides = [...reel.querySelectorAll('.reel-slide')], imgs = slides.map(s => s.querySelector('img'));
    const inset = desk ? '12vh 6vw' : '16vh 5vw', rad = desk ? '24px' : '16px';
    const show = i => slides.forEach((s, k) => { s.classList.toggle('is-on', k === i); if (k === i) s.removeAttribute('tabindex'); else s.setAttribute('tabindex', '-1'); });
    g.fromTo(frame, { scale: .9 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: reel, start: 'top bottom', end: 'top top', scrub: true } });
    g.timeline({ scrollTrigger: { trigger: reel, start: 'top top', end: () => '+=' + innerHeight * (desk ? 2.4 : 1.8), pin: true, scrub: 1,
      onUpdate: self => { const p = self.progress; show(p < .4 ? 0 : Math.min(slides.length - 1, 1 + Math.floor((p - .4) / .6 * (slides.length - 1)))); } } })
      .fromTo(frame, { clipPath: `inset(${inset} round ${rad})` }, { clipPath: 'inset(0vh 0vw round 0px)', ease: 'none', duration: .4 })
      .fromTo(imgs, { scale: 1.2 }, { scale: 1, ease: 'none', duration: 1 }, 0);
    undo.push(() => show(0));
  }

  // What we do: the heading stays put while each discipline card slides over the last.
  const stack = main.querySelector('.stack');
  if (stack) {
    const cards = [...stack.querySelectorAll('.stack-card')];
    if (desk && cards.length > 1) {
      stack.classList.add('is-stacked'); undo.push(() => stack.classList.remove('is-stacked'));
      g.set(cards.slice(1), { yPercent: 125, rotate: 6 });
      const tl = g.timeline({ scrollTrigger: { trigger: stack, start: 'top top', end: () => '+=' + innerHeight * (cards.length - 1) * .85, pin: true, scrub: 1 } });
      cards.slice(1).forEach((c, i) => {
        tl.to(c, { yPercent: 0, rotate: 0, ease: 'none', duration: 1 }, i)
          .to(cards[i], { scale: .9, yPercent: -6, opacity: .3, ease: 'none', duration: 1 }, i);
      });
      g.from(cards[0], { yPercent: 30, opacity: 0, rotate: 4, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: stack, start: 'top 70%' } });
    } else {
      cards.forEach(c => {
        g.from(c, { y: 70, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 90%' } });
        g.fromTo(c.querySelector('img'), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }
  }

  // WE CREATE wall: tilted rows slide in opposite directions with the scroll; the tags pop in.
  const wall = main.querySelector('.kinetic');
  if (wall) {
    wall.querySelectorAll('.k-row').forEach((r, i) => g.fromTo(r, { xPercent: i % 2 ? -32 : -6 }, { xPercent: i % 2 ? -6 : -32, ease: 'none', scrollTrigger: { trigger: wall, start: 'top bottom', end: 'bottom top', scrub: .6 } }));
    g.from(wall.querySelectorAll('.k-tags span'), { scale: .3, opacity: 0, y: 50, rotate: i => (i % 2 ? 10 : -10), duration: .9, ease: 'back.out(1.8)', stagger: .12, scrollTrigger: { trigger: wall, start: 'top 45%' } });
  }

  // Statement: words light up one by one as you scroll through them.
  main.querySelectorAll('.home-about h2').forEach(h => g.fromTo(split(h), { opacity: .13 }, { opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: h, start: 'top 85%', end: 'bottom 40%', scrub: true } }));

  // Section headings rise into view.
  [...main.querySelectorAll('.intro h2,.stack-intro h2,.next a,.soon-card h3,.project-story h2'), ...document.querySelectorAll('.footer-top > a')]
    .filter(outside).forEach(h => rise(split(h), { duration: 1.1, stagger: .05, scrollTrigger: { trigger: h, start: 'top 88%' } }));

  // Copy, lists and cards fade up in small groups.
  const fades = [...main.querySelectorAll('.page-head > :not(h1),.ha-head .eyebrow,.ha-copy > *,.stack-intro .eyebrow,.stack-intro p,.intro .eyebrow,.intro p,.services details,.how > .eyebrow,.how-card,.project-story p,.gallery figcaption,.contact-links > *,#brief > *'),
    ...document.querySelectorAll('.footer-top p,.footer-bottom > *')].filter(outside);
  if (fades.length) {
    g.set(fades, { y: 40, opacity: 0 });
    ST.batch(fades, { start: 'top 94%', once: true, onEnter: b => g.to(b, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: .08, overwrite: true }) });
  }

  // Images unveil from the bottom, settling from a slight zoom.
  main.querySelectorAll('.project-hero,.gallery figure button,.portrait').forEach(el => {
    if (!outside(el)) return;
    const img = el.tagName === 'IMG' ? null : el.querySelector('img'), st = { trigger: el, start: 'top 90%' };
    g.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath', scrollTrigger: st });
    if (img) g.from(img, { scale: 1.3, duration: 1.8, ease: 'expo.out', scrollTrigger: st });
  });

  return () => { undo.forEach(f => f()); unsplit(); };
}

/* ---------- On / off ---------- */
function enable() {
  if (on || !g || !ST || !Lenis) return;
  on = true;
  lenis = new Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: 1 });
  lenis.on('scroll', ST.update);
  tick = t => lenis.raf(t * 1000);
  g.ticker.add(tick); g.ticker.lagSmoothing(0);
  mm = g.matchMedia();
  mm.add({ desk: '(min-width:901px)', mob: '(max-width:900px)' }, scenes);
  root.classList.remove('m-pre');
  enter();
  root.dataset.entered = '1';
  if (document.querySelector('dialog[open]')) lenis.stop();
  requestAnimationFrame(() => ST.refresh());
}
function disable() {
  if (!on) return;
  on = false;
  mm?.revert(); mm = null; unsplit();
  g.ticker.remove(tick); lenis?.destroy(); lenis = null;
  g.set(document.querySelectorAll(MAG), { x: 0, y: 0 });
}
const refresh = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => on && ST.refresh(), 160); };

function watch() {
  // MOTION ON/OFF button toggles the quiet class on body.
  new MutationObserver(() => (calm() ? disable() : enable())).observe(body, { attributes: true, attributeFilter: ['class'] });
  // The Work views re-render main; layout heights change, so re-measure the scroll scenes.
  new MutationObserver(refresh).observe(main, { childList: true, subtree: true });
  document.addEventListener('load', e => { if (e.target.tagName === 'IMG') refresh(); }, true);
  addEventListener('load', refresh);
  // Pause smooth scrolling while the image viewer is open.
  const dialog = document.querySelector('dialog');
  if (dialog) new MutationObserver(() => (dialog.open ? lenis?.stop() : lenis?.start())).observe(dialog, { attributes: true, attributeFilter: ['open'] });
}

export function start() {
  window.zayonMotion = { top: () => lenis?.scrollTo(0, { immediate: true, force: true }) };
  rolls(); curtain(); hookLinks(); watch();
  if (!g || !ST || !Lenis) { root.classList.remove('zt-in', 'm-pre'); return; }
  g.registerPlugin(ST);
  magnets();
  if (calm()) { root.classList.remove('m-pre'); enter(); return; }
  enable();
}
