/* ═══════════════════════════════════════════════════════════════
   SUMANT RAJ – PORTFOLIO SCRIPT
   Vanilla JS — no frameworks, no dependencies
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── UTILITY ─────────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── BOOT: wait for DOM + Lucide before running everything ────────── */
function boot() {

  /* ════════════════════════════════════════════════════════════════
     1. LUCIDE ICONS — init first so icons render before anything else
  ════════════════════════════════════════════════════════════════ */
  function initIcons(cb) {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
      cb();
    } else {
      setTimeout(() => initIcons(cb), 50);
    }
  }

  initIcons(function afterIconsReady() {

    /* ══════════════════════════════════════════════════════════════
       2. SCROLL REVEAL — fix: no negative rootMargin so elements
          already in viewport at page-load are caught immediately
    ══════════════════════════════════════════════════════════════ */
    (function initReveal() {
      const els = qsa('.reveal-up, .reveal-right');

      if (prefersReducedMotion()) {
        els.forEach(el => el.classList.add('visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const delay = parseInt(entry.target.dataset.delay || 0, 10);
            setTimeout(() => entry.target.classList.add('visible'), delay);
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px 0px 0px'   // ← no negative margin
        }
      );

      els.forEach(el => observer.observe(el));

      /*
       * FIX: elements that start inside the viewport on load are NOT
       * fired by IntersectionObserver in some browsers unless we give
       * them a forced first-trigger. We re-check after a paint frame.
       */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          els.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const delay = parseInt(el.dataset.delay || 0, 10);
              setTimeout(() => el.classList.add('visible'), delay);
              observer.unobserve(el);
            }
          });
        });
      });
    })();

    /* ══════════════════════════════════════════════════════════════
       3. SKILL BARS
    ══════════════════════════════════════════════════════════════ */
    (function initSkillBars() {
      const fills = qsa('.bar-fill');
      if (!fills.length) return;

      if (prefersReducedMotion()) {
        fills.forEach(f => { f.style.width = f.dataset.width + '%'; });
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            setTimeout(() => {
              entry.target.style.width = entry.target.dataset.width + '%';
            }, 200);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.3 }
      );

      fills.forEach(f => observer.observe(f));
    })();

    /* ══════════════════════════════════════════════════════════════
       4. TYPEWRITER
    ══════════════════════════════════════════════════════════════ */
    (function initTypewriter() {
      const el = qs('#typewriter');
      if (!el) return;

      const phrases = [
        'Frontend Developer',
        'UI/UX Enthusiast',
        'JavaScript Learner',
        'Problem Solver',
        'Web Designer',
      ];

      if (prefersReducedMotion()) {
        el.textContent = phrases[0];
        return;
      }

      let phraseIdx = 0, charIdx = 0, deleting = false;
      const TYPING   = 80;
      const DELETING = 45;
      const PAUSE_END = 2000;
      const PAUSE_DEL = 400;

      function tick() {
        const word = phrases[phraseIdx];
        if (!deleting) {
          charIdx++;
          el.textContent = word.slice(0, charIdx);
          if (charIdx === word.length) {
            deleting = true;
            setTimeout(tick, PAUSE_END);
          } else {
            setTimeout(tick, TYPING);
          }
        } else {
          charIdx--;
          el.textContent = word.slice(0, charIdx);
          if (charIdx === 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            setTimeout(tick, PAUSE_DEL);
          } else {
            setTimeout(tick, DELETING);
          }
        }
      }
      setTimeout(tick, 800);
    })();

    /* ══════════════════════════════════════════════════════════════
       5. NAVIGATION — sticky + scroll-spy + mobile menu
    ══════════════════════════════════════════════════════════════ */
    (function initNav() {
      const header      = qs('#navHeader');
      const toggle      = qs('#navToggle');
      const mobileMenu  = qs('#mobileMenu');
      const navLinks    = qsa('.nav-link');
      const mobileLinks = qsa('.mobile-link');
      if (!header) return;

      /* Sticky */
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 20);
        updateActiveLink();
      }, { passive: true });
      header.classList.toggle('scrolled', window.scrollY > 20);

      /* Scroll-spy */
      const sections = qsa('section[id]');
      function updateActiveLink() {
        let current = '';
        sections.forEach(sec => {
          if (window.scrollY >= sec.offsetTop - header.offsetHeight - 20) {
            current = sec.id;
          }
        });
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === current);
        });
      }
      updateActiveLink();

      /* Mobile menu */
      function openMenu() {
        toggle.classList.add('active');
        mobileMenu.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
      function closeMenu() {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      toggle && toggle.addEventListener('click', () => {
        toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
      });
      mobileLinks.forEach(l => l.addEventListener('click', closeMenu));
      document.addEventListener('click', e => {
        if (mobileMenu.classList.contains('open') &&
            !mobileMenu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
      });
    })();

    /* ══════════════════════════════════════════════════════════════
       6. SMOOTH SCROLL
    ══════════════════════════════════════════════════════════════ */
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /* ══════════════════════════════════════════════════════════════
       7. CONTACT FORM
    ══════════════════════════════════════════════════════════════ */
    (function initForm() {
      const form = qs('#contactForm');
      if (!form) return;

      const fields = {
        name:    { el: qs('#name',    form), err: qs('#nameError',    form) },
        email:   { el: qs('#email',   form), err: qs('#emailError',   form) },
        subject: { el: qs('#subject', form), err: qs('#subjectError', form) },
        message: { el: qs('#message', form), err: qs('#messageError', form) },
      };
      const submitBtn  = qs('.form-submit', form);
      const successMsg = qs('#formSuccess', form);

      const validators = {
        name:    v => !v.trim() ? 'Name is required.' : v.trim().length < 2 ? 'At least 2 characters.' : '',
        email:   v => !v.trim() ? 'Email is required.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email.' : '',
        subject: v => !v.trim() ? 'Subject is required.' : v.trim().length < 3 ? 'At least 3 characters.' : '',
        message: v => !v.trim() ? 'Message is required.' : v.trim().length < 20 ? 'At least 20 characters.' : '',
      };

      function setError(key, msg) {
        const { el, err } = fields[key];
        el.classList.toggle('error', !!msg);
        err.textContent = msg;
        return !msg;
      }

      Object.entries(fields).forEach(([key, { el }]) => {
        el.addEventListener('blur', () => setError(key, validators[key](el.value)));
        el.addEventListener('input', () => { if (el.classList.contains('error')) setError(key, validators[key](el.value)); });
      });

      form.addEventListener('submit', e => {
        e.preventDefault();
        let valid = true;
        Object.entries(fields).forEach(([key, { el }]) => {
          if (!setError(key, validators[key](el.value))) valid = false;
        });
        if (!valid) {
          const first = Object.values(fields).find(f => f.el.classList.contains('error'));
          if (first) first.el.focus();
          return;
        }
        submitBtn.classList.add('loading');
        setTimeout(() => {
          submitBtn.classList.remove('loading');
          form.reset();
          successMsg.classList.add('visible');
          setTimeout(() => successMsg.classList.remove('visible'), 5000);
        }, 1400);
      });
    })();

    /* ══════════════════════════════════════════════════════════════
       8. FOOTER YEAR
    ══════════════════════════════════════════════════════════════ */
    const yearEl = qs('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ══════════════════════════════════════════════════════════════
       9. READING PROGRESS BAR
    ══════════════════════════════════════════════════════════════ */
    const bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    bar.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'height:2px', 'width:0%',
      'background:linear-gradient(90deg,#1d4ed8,#3b82f6,#22d3ee)',
      'z-index:200', 'transition:width 0.1s linear', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? clamp((window.scrollY / h) * 100, 0, 100) : 0) + '%';
    }, { passive: true });

    /* ══════════════════════════════════════════════════════════════
       10. CUSTOM CURSOR (pointer devices only)
    ══════════════════════════════════════════════════════════════ */
    (function initCursor() {
      const cursor   = qs('#cursor');
      const follower = qs('#cursorFollower');
      if (!cursor || !follower) return;
      if (!window.matchMedia('(hover: hover)').matches) return;

      let mx = 0, my = 0, fx = 0, fy = 0;

      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cursor.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      });

      (function animFollower() {
        fx += (mx - fx) * 0.12;
        fy += (my - fy) * 0.12;
        follower.style.transform = `translate(${fx}px,${fy}px) translate(-50%,-50%)`;
        requestAnimationFrame(animFollower);
      })();

      const hov = 'a,button,[role="button"],input,textarea,.project-card,.cert-card,.stat-block';
      document.addEventListener('mouseover',  e => { if (e.target.closest(hov)) document.body.classList.add('cursor-hover'); });
      document.addEventListener('mouseout',   e => { if (e.target.closest(hov)) document.body.classList.remove('cursor-hover'); });
      document.addEventListener('mouseleave', ()  => { cursor.style.opacity='0'; follower.style.opacity='0'; });
      document.addEventListener('mouseenter', ()  => { cursor.style.opacity='1'; follower.style.opacity='1'; });
    })();

    /* ══════════════════════════════════════════════════════════════
       11. PREMIUM PROJECT CARDS — tilt, cursor glow, stagger reveal
    ══════════════════════════════════════════════════════════════ */
    (function initProjectCards() {
      const cards = qsa('.pcard');
      if (!cards.length) return;

      const isPointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
      const noMotion  = prefersReducedMotion();

      /* ── Staggered scroll-reveal (separate from the generic reveal-up) ── */
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const card  = entry.target;
            const delay = parseInt(card.dataset.delay || 0, 10);
            setTimeout(() => {
              card.classList.add('pcard-visible');
              /* stagger each tag by its index */
              qsa('.pcard-tag', card).forEach((tag, i) => {
                tag.style.setProperty('--tag-i', i);
              });
            }, noMotion ? 0 : delay);
            revealObserver.unobserve(card);
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px 0px 0px' }
      );

      cards.forEach(card => {
        revealObserver.observe(card);
        /* also handle cards already in viewport at load */
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            const delay = parseInt(card.dataset.delay || 0, 10);
            setTimeout(() => {
              card.classList.add('pcard-visible');
              qsa('.pcard-tag', card).forEach((tag, i) => {
                tag.style.setProperty('--tag-i', i);
              });
            }, noMotion ? 0 : delay);
            revealObserver.unobserve(card);
          }
        }));
      });

      /* ── 3-D tilt + cursor glow (pointer devices, no reduced-motion) ── */
      if (!isPointer || noMotion) return;

      let rafPending = false;

      cards.forEach(card => {
        const glowEl  = qs('.pcard-cursor-glow', card);
        const glowRgb = card.dataset.glow || '124,58,237';
        if (glowEl) glowEl.style.setProperty('--glow-rgb', glowRgb);

        /* Cache rect on mouseenter for perf (avoids layout thrash per frame) */
        let rect;
        card.addEventListener('mouseenter', () => {
          rect = card.getBoundingClientRect();
          /* outer glow */
          card.style.boxShadow = [
            `0 20px 60px rgba(0,0,0,0.55)`,
            `0 0 0 1px rgba(${glowRgb},0.15)`,
            `0 0 48px rgba(${glowRgb},0.18)`,
          ].join(', ');
        }, { passive: true });

        card.addEventListener('mousemove', (e) => {
          if (!rect) rect = card.getBoundingClientRect();
          if (rafPending) return;
          rafPending = true;

          requestAnimationFrame(() => {
            rafPending = false;

            const cx = rect.left + rect.width  / 2;
            const cy = rect.top  + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width  / 2);   /* -1 … 1 */
            const dy = (e.clientY - cy) / (rect.height / 2);   /* -1 … 1 */

            /* 3-D tilt — max ±7° */
            const tX = clamp(dy * -7, -7, 7);
            const tY = clamp(dx *  7, -7, 7);
            card.style.transform = `perspective(900px) rotateX(${tX}deg) rotateY(${tY}deg) translateY(-6px) scale(1.01)`;

            /* cursor-follow glow position */
            if (glowEl) {
              const gx = ((e.clientX - rect.left) / rect.width)  * 100;
              const gy = ((e.clientY - rect.top)  / rect.height) * 100;
              glowEl.style.setProperty('--glow-x', gx + '%');
              glowEl.style.setProperty('--glow-y', gy + '%');
            }
          });
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
          rect = null;
          card.style.transform = '';
          card.style.boxShadow = '';
          /* cursor glow resets via CSS opacity transition */
        }, { passive: true });

        /* Smooth reset on focus (keyboard) */
        card.addEventListener('focusin',  () => { card.style.transform = 'translateY(-4px)'; });
        card.addEventListener('focusout', () => { card.style.transform = ''; });
      });
    })();

    /* ══════════════════════════════════════════════════════════════
       12. HERO PARALLAX (desktop only)
    ══════════════════════════════════════════════════════════════ */
    if (!prefersReducedMotion() && window.matchMedia('(hover:hover)').matches) {
      const blobs = qsa('.blob');
      const photo = qs('.hero-photo');
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        blobs.forEach((b, i) => { b.style.transform = `translateY(${y * (i === 0 ? 0.12 : 0.07)}px)`; });
        if (photo) photo.style.transform = `translateY(${y * 0.04}px)`;
      }, { passive: true });
    }

    /* ══════════════════════════════════════════════════════════════
       13. KEYBOARD FOCUS TRAP — mobile menu
    ══════════════════════════════════════════════════════════════ */
    (function initFocusTrap() {
      const menu   = qs('#mobileMenu');
      if (!menu) return;
      document.addEventListener('keydown', e => {
        if (!menu.classList.contains('open') || e.key !== 'Tab') return;
        const sel = 'a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])';
        const focusable = qsa(sel, menu);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    })();

    /* ══════════════════════════════════════════════════════════════
       14. CONSOLE EASTER EGG
    ══════════════════════════════════════════════════════════════ */
    console.log('%c👋 Hey there, fellow developer!', 'color:#60a5fa;font-size:18px;font-weight:bold;font-family:monospace');
    console.log('%cHandcrafted with HTML5, CSS3 & Vanilla JS — Sumant Raj', 'color:#94a3b8;font-size:13px;font-family:monospace');

  }); // end afterIconsReady
} // end boot

/* ── Start when DOM is ready ────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
