/* ==========================
STARFIELD (Canvas Parallax)
========================== */
const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');
let w, h, dpr; let stars = [];
// const LAYERS = [
//     { depth: 0.25, count: 120, speed: 0.02 },
//     { depth: 0.6, count: 180, speed: 0.06 },
//     { depth: 1.0, count: 220, speed: 0.12 }
// ];
const LAYERS = [
  { depth: 0.25, count: 120, speed: 0.01 },  // was 0.02
  { depth: 0.6,  count: 180, speed: 0.03 },  // was 0.06
  { depth: 1.0,  count: 220, speed: 0.06 }   // was 0.12
];

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    createStars();
}
function rand(min, max) { return Math.random() * (max - min) + min; }
function createStars() {
    stars = [];
    LAYERS.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const size = rand(0.6, 2.2) * layer.depth;
            const huePick = Math.random();
            const color = huePick < .7
                ? `hsla(210, 60%, ${rand(80, 98)}%, 1)`
                : huePick < .9
                    ? `hsla(0, 0%, ${rand(88, 100)}%, 1)`
                    : `hsla(${rand(35, 50)}, 90%, ${rand(60, 80)}%, 1)`;
            stars.push({ x: rand(0, w), y: rand(0, h), z: layer.depth, r: size, baseR: size, twinkleOffset: rand(0, Math.PI * 2), speed: layer.speed * rand(.8, 1.2), color });
        }
    });
}
let lastTime = 0; let parallaxY = 0;
function draw(t) {
    const dt = Math.min((t - lastTime) / 16.666, 3); lastTime = t;
    const targetParallax = scrollY * 0.25; parallaxY += (targetParallax - parallaxY) * 0.1;

    ctx.clearRect(0, 0, w, h);
    const grd = ctx.createRadialGradient(w * .5, h * 1.1, h * .1, w * .5, h * .5, h * 1.2);
    grd.addColorStop(0, 'rgba(11,12,26,0.9)'); grd.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
        s.x -= s.speed * dt * 60 * s.z; if (s.x < -4) s.x = w + 4;
        const y = s.y + parallaxY * (1 - s.z);
        const tw = (Math.sin(t / 1000 + s.twinkleOffset) + 1) * 0.5;
        s.r = s.baseR * (0.85 + tw * 0.3);
        ctx.beginPath(); ctx.fillStyle = s.color; ctx.globalAlpha = 0.7 + tw * 0.3; ctx.arc(s.x, y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
}
addEventListener('resize', resize, { passive: true });
resize(); requestAnimationFrame(draw);

/* ==========================
   TYPEWRITER
   ========================== */
const typeTarget = document.getElementById('typewriter');
const words = [
    'Full Stack Developer | Problem Solver | Designer',
    'I design systems people love to use',
    'Clean code. Clear UX. Real impact.'
];
let wi = 0, ci = 0, deleting = false, pause = 0;
function typeLoop() {
    if (pause > 0) { pause--; return requestAnimationFrame(typeLoop); }
    const word = words[wi % words.length];
    if (!deleting) { ci++; typeTarget.textContent = word.slice(0, ci); if (ci === word.length) { deleting = true; pause = 60; } }
    else { ci--; typeTarget.textContent = word.slice(0, ci); if (ci === 0) { deleting = false; wi++; } }
    setTimeout(() => requestAnimationFrame(typeLoop), deleting ? 40 : 65);
}
typeLoop();

/* ==========================
   NAV show-on-scroll, spy
   ========================== */
const siteNav = document.getElementById('site-nav');
let heroDone = false;
const observerHero = new IntersectionObserver(([e]) => {
    siteNav.classList.toggle('visible', !e.isIntersecting || heroDone); heroDone = true;
}, { threshold: 0.01 });
observerHero.observe(document.querySelector('.hero'));

const progress = document.getElementById('progress');
addEventListener('scroll', () => {
    const p = (scrollY) / (document.body.scrollHeight - innerHeight);
    progress.style.width = Math.max(0, Math.min(1, p)) * 100 + '%';
    document.getElementById('toTop').style.display = (scrollY > innerHeight * .6) ? 'block' : 'none';
}, { passive: true });

const spyLinks = [...document.querySelectorAll('[data-spy]')];
const sections = spyLinks.map(a => document.querySelector(a.getAttribute('href')));
const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const i = sections.indexOf(entry.target);
        if (i >= 0 && entry.isIntersecting) { spyLinks.forEach(l => l.classList.remove('active')); spyLinks[i].classList.add('active'); }
    });
}, { threshold: .3 });
sections.forEach(s => s && spy.observe(s));

// Mobile menu
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');
hamburger.addEventListener('click', () => {
    menu.classList.toggle('open'); hamburger.setAttribute('aria-expanded', menu.classList.contains('open'));
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

/* ==========================
   Reveal & Skill bars
   ========================== */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target; el.classList.add('visible');
            if (el.querySelectorAll('.skill-bar > span').length) {
                el.querySelectorAll('.skill-card').forEach((card, i) => {
                    const pct = card.getAttribute('data-skill');
                    const bar = card.querySelector('.skill-bar > span');
                    setTimeout(() => bar.style.width = pct + '%', i * 120);
                });
            }
            io.unobserve(el);
        }
    });
}, { threshold: .25 });
revealEls.forEach(el => io.observe(el));

/* ==========================
   Project filters
   ========================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tag = btn.dataset.filter;
    cards.forEach(c => {
        const show = tag === 'all' || (c.dataset.tags || '').includes(tag);
        c.style.display = show ? 'block' : 'none';
    });
}));

/* ==========================
   Contact form validation
   ========================== */
// const form = document.getElementById('contactForm');
// const statusEl = document.getElementById('formStatus');
// form.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const name = form.name.value.trim();
//     const email = form.email.value.trim();
//     const subject = form.subject.value.trim();
//     const message = form.message.value.trim();
//     let ok = true;
//     const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//     const setErr = (id, msg) => { document.getElementById(id).textContent = msg || ''; if (msg) ok = false; };
//     setErr('err-name', name ? '' : 'Name is required');
//     setErr('err-email', emailOk ? '' : 'Valid email required');
//     setErr('err-subject', subject ? '' : 'Subject is required');
//     setErr('err-message', message.length >= 10 ? '' : 'Message should be at least 10 characters');
//     if (!ok) { statusEl.textContent = 'Please fix the errors above.'; return; }
//     const btn = document.getElementById('sendBtn');
//     const prev = btn.textContent; btn.textContent = 'Sending…'; btn.disabled = true;
//     setTimeout(() => { btn.textContent = prev; btn.disabled = false; form.reset(); statusEl.textContent = 'Thanks! Your message has been queued (demo).'; }, 900);
// });

/* ==========================
   Theme Toggle (Dark default)
   with Icon Swap 🌙/🌞 + Fade Transition
   ========================== */
const THEME_KEY = 'pref-theme';
const root = document.documentElement;
const themeBtn = document.getElementById('themeToggle');

// Apply saved theme OR default = dark
const saved = localStorage.getItem(THEME_KEY);
const initialTheme = saved ? saved : 'dark';
root.setAttribute('data-theme', initialTheme);
updateIcon(initialTheme);

// Click Handler (defensive)
if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const current = root.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        updateIcon(next);
    });
}


/* ==========================
   Misc
   ========================== */
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


/* ==========================
   Fab icon
   ========================== */
function updateIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;

    if (theme === 'light') {
        // ✅ Heroicons 24 Solid — Sun (exact, with 8 rays)
        icon.innerHTML = `
      <path fill="currentColor"
        d="M21.752 15.002A9.718 9.718 0 0 1 12 21.75 9.75 9.75 0 1 1 12 2.25c.684 0 1.353.069 2 .2a7.5 7.5 0 0 0 7.752 12.552z" />`;
    } else {
        // Heroicons 24 Solid — Moon (clean crescent)
        icon.innerHTML = `
      <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
        d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Zm0 15a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM4.469 4.47a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 0 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06Zm13.412 13.412a.75.75 0 0 1 0 1.06l-1.59 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0ZM2.25 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm15.75-.75H20.25a.75.75 0 0 1 0 1.5h-2.25a.75.75 0 0 1 0-1.5ZM6.06 17.88a.75.75 0 0 1 1.06 0l1.59 1.59a.75.75 0 0 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06Zm11.31-11.31a.75.75 0 0 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 1.06-1.06l1.59 1.59Z" />`;
    }
        // correct but misaligned Sun from center
    // icon.innerHTML = `
    //   <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
    //     d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>`;
    // }
  }
