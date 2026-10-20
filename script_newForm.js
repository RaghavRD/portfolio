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
   Reveal & Skill bars (GSAP)
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

        // Animate Skill Bars
        const cards = sec.querySelectorAll('.skill-card');
        if (cards.length > 0) {
            cards.forEach(card => {
                const pct = card.getAttribute('data-skill');
                const bar = card.querySelector('.skill-bar > span');
                if (bar) {
                    gsap.fromTo(bar,
                        { width: '0%' },
                        {
                            scrollTrigger: {
                                trigger: sec,
                                start: "top 85%",
                            },
                            width: pct + '%',
                            duration: 1.5,
                            ease: "power3.out",
                            delay: 0.2
                        }
                    );
                }
            });
        }
    });
}

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
   Experience journey tabs
   ========================== */
const journeyCards = document.querySelectorAll('.journey-card');
const expItems = document.querySelectorAll('.tl-item[id^="exp-"]');

function setActiveJourney(card) {
    journeyCards.forEach(c => {
        c.classList.remove('journey-active');
        c.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('journey-active');
    card.setAttribute('aria-pressed', 'true');

    const targetId = 'exp-' + card.dataset.exp;
    expItems.forEach(item => item.classList.toggle('tl-visible', item.id === targetId));
}

journeyCards.forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => setActiveJourney(card));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActiveJourney(card);
        }
    });
});

const defaultJourneyCard = document.querySelector('.journey-card[data-default="true"]') || journeyCards[journeyCards.length - 1];
if (defaultJourneyCard) setActiveJourney(defaultJourneyCard);

/* ==========================
   Career Uptime (live, ticks every second)
   ========================== */
const CAREER_START = new Date('2024-04-01T00:00:00');
const heroUptime = document.getElementById('heroUptime');

function updateCareerUptime() {
    if (!heroUptime) return;
    const diffMs = Date.now() - CAREER_START.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalDays = Math.floor(totalSeconds / 86400);
    const years = Math.floor(totalDays / 365.25);
    const weeks = Math.floor(totalDays / 7);

    heroUptime.textContent = `${years}years ${weeks}weeks & ${totalDays}days`;
}

if (heroUptime) {
    updateCareerUptime();
    setInterval(updateCareerUptime, 1000);
}

/* ==========================
   Misc
   ========================== */
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
