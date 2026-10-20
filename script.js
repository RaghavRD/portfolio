/* ==========================
   LENIS SMOOTH SCROLL
   ========================== */
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/* ==========================
STARFIELD (Canvas Parallax)
========================== */
const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');
let w, h, dpr; let stars = [];
// faster
// const LAYERS = [
//     { depth: 0.25, count: 120, speed: 0.02 },
//     { depth: 0.6, count: 180, speed: 0.06 },
//     { depth: 1.0, count: 220, speed: 0.12 }
// ];

// slower
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
    'Full-Stack Engineer · AI/LLM Integrations · Azure',
    'Python · FastAPI · Django · Angular · React',
    'Building AI-powered tools with the OpenAI API',
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
lenis.on('scroll', (e) => {
    const p = scrollY / (document.body.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`;
    document.getElementById('toTop').style.display = (scrollY > innerHeight * .6) ? 'block' : 'none';
});

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
   Reveal animations (GSAP)
   ========================== */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
        // Animate elements with .reveal class
        const reveals = sec.querySelectorAll('.reveal');
        if (reveals.length > 0) {
            gsap.fromTo(reveals, 
                { y: 30, autoAlpha: 0 },
                {
                    scrollTrigger: {
                        trigger: sec,
                        start: "top 80%",
                    },
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out"
                }
            );
        }
    });
}

/* ==========================
   Project filters
   ========================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project');
const applyFilter = (tag) => cards.forEach(c => {
    const show = tag === 'all' || (c.dataset.tags || '').split(' ').includes(tag);
    c.style.display = show ? 'block' : 'none';
});
filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
}));
const activeFilter = document.querySelector('.filter-btn.active');
if (activeFilter) applyFilter(activeFilter.dataset.filter);

/* ==========================
   Popups (case studies & skills)
   ========================== */
const openModal = (dialog) => {
    if (!dialog || dialog.open) return;
    dialog.showModal();
    document.body.classList.add('modal-open');
    if (typeof lenis !== 'undefined') lenis.stop();
    const body = dialog.querySelector('.modal-body');
    if (body) body.scrollTop = 0;
};
document.querySelectorAll('dialog.modal').forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => dialog.close()));
    // Click on the dimmed backdrop closes the popup
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
        if (typeof lenis !== 'undefined') lenis.start();
        document.querySelectorAll('.skill-card.active').forEach(c => c.classList.remove('active'));
    });
});

// Case study popups
document.querySelectorAll('[data-case]').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(document.getElementById(btn.dataset.case));
}));

// Project card image sliders
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.slider').forEach(slider => {
    const track = slider.querySelector('.slides');
    const dots = slider.querySelectorAll('.slider-dots button');
    const total = track.children.length;
    let index = 0, timer = null;
    const go = (i) => {
        index = (i + total) % total;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, n) => d.classList.toggle('active', n === index));
    };
    const play = () => {
        if (reduceMotion || total < 2) return;
        clearInterval(timer);
        timer = setInterval(() => go(index + 1), 3500);
    };
    dots.forEach((d, n) => d.addEventListener('click', (e) => { e.stopPropagation(); go(n); play(); }));
    play();
});

// Case study galleries
document.querySelectorAll('.case-gallery').forEach(gallery => {
    const main = gallery.querySelector('.case-main');
    const thumbs = gallery.querySelectorAll('.case-thumbs img');
    thumbs.forEach(t => t.addEventListener('click', () => {
        main.src = t.src;
        main.alt = t.alt;
        thumbs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
    }));
});

// Skill popups
const skillModal = document.getElementById('skillModal');
document.querySelectorAll('.skill-card').forEach(card => {
    const open = () => {
        document.querySelectorAll('.skill-card.active').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        skillModal.querySelector('#skillModalTitle').textContent = card.querySelector('h3').textContent;
        skillModal.querySelector('#skillModalContent').innerHTML = card.querySelector('.skill-detail').innerHTML;
        openModal(skillModal);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
});

/* ==========================
   GitHub contribution graph
   ========================== */
const ghCells = document.getElementById('ghCells');
if (ghCells) {
    const ghCard = ghCells.closest('.gh-activity');
    fetch('https://github-contributions-api.jogruber.de/v4/RaghavRD?y=last')
        .then(res => { if (!res.ok) throw new Error('GitHub data unavailable'); return res.json(); })
        .then(data => {
            const days = data.contributions || [];
            if (!days.length) throw new Error('No contribution data');
            const toDate = (d) => new Date(d + 'T00:00:00');
            const pad = toDate(days[0].date).getDay(); // weeks start on Sunday
            const weeks = Math.ceil((pad + days.length) / 7);
            const frag = document.createDocumentFragment();
            for (let i = 0; i < pad; i++) {
                const cell = document.createElement('span');
                cell.className = 'gh-cell empty';
                frag.appendChild(cell);
            }
            days.forEach(d => {
                const cell = document.createElement('span');
                cell.className = 'gh-cell l' + d.level;
                cell.title = `${d.count} contribution${d.count === 1 ? '' : 's'} on ${toDate(d.date).toDateString()}`;
                frag.appendChild(cell);
            });
            ghCells.appendChild(frag);

            const months = document.getElementById('ghMonths');
            ghCells.style.setProperty('--weeks', weeks);
            months.style.setProperty('--weeks', weeks);
            let prevMonth = -1;
            for (let w = 0; w < weeks; w++) {
                const first = toDate(days[Math.max(0, w * 7 - pad)].date);
                if (first.getMonth() === prevMonth) continue;
                prevMonth = first.getMonth();
                if ((w === 0 && first.getDate() > 21) || w > weeks - 3) continue;
                const label = document.createElement('span');
                label.textContent = first.toLocaleString('en', { month: 'short' });
                label.style.gridColumn = `${w + 1}`;
                months.appendChild(label);
            }
            const total = data.total && data.total.lastYear;
            if (typeof total === 'number') {
                document.getElementById('ghTotal').textContent = `${total} contributions in the last year`;
            }
        })
        .catch(() => { if (ghCard) ghCard.style.display = 'none'; });
}

/* ==========================
   Contact form validation
   ========================== */
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/raghavdesai774@gmail.com';
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();
    let ok = true;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const setErr = (id, msg) => { document.getElementById(id).textContent = msg || ''; if (msg) ok = false; };
    setErr('err-name', name ? '' : 'Name is required');
    setErr('err-email', emailOk ? '' : 'Valid email required');
    setErr('err-subject', subject ? '' : 'Subject is required');
    setErr('err-message', message.length >= 10 ? '' : 'Message should be at least 10 characters');
    if (!ok) { statusEl.textContent = 'Please fix the errors above.'; return; }

    const btn = document.getElementById('sendBtn');
    const prev = btn.textContent; btn.textContent = 'Sending…'; btn.disabled = true;
    statusEl.textContent = '';
    try {
        const res = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                name, email, message,
                _subject: `Portfolio: ${subject}`,
                _replyto: email,
                _template: 'table',
                _captcha: 'false',
                _honey: form._honey.value
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || 'Request failed');
        form.reset();
        statusEl.textContent = "Thanks! Your message has been sent. I'll get back to you soon.";
    } catch (err) {
        statusEl.textContent = 'Sorry, something went wrong. Please email me directly at raghavdesai774@gmail.com.';
    } finally {
        btn.textContent = prev; btn.disabled = false;
    }
});

/* ==========================
   Misc
   ========================== */
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
