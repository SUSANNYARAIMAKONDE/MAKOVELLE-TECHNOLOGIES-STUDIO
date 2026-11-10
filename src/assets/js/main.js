/* Makovelle — site interactions. Progressive enhancement: everything works without JS. */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header: solid background once the page scrolls */
  const header = document.querySelector('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu: aria-expanded, Escape to close, focus kept inside while open */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    const label = toggle.querySelector('.visually-hidden');
    const focusables = () => [toggle, ...menu.querySelectorAll('a[href], button:not([disabled])')];
    let closeTimer;

    const open = () => {
      clearTimeout(closeTimer);
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      toggle.setAttribute('aria-expanded', 'true');
      label.textContent = 'Close menu';
      document.body.classList.add('menu-open');
      menu.querySelector('a')?.focus();
    };
    const close = (returnFocus = true) => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      label.textContent = 'Open menu';
      document.body.classList.remove('menu-open');
      closeTimer = setTimeout(() => { menu.hidden = true; }, reduceMotion ? 0 : 350);
      if (returnFocus) toggle.focus();
    };
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', () => (isOpen() ? close() : open()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', (e) => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') {
        const items = focusables();
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (mq) => { if (mq.matches && isOpen()) close(false); });
  }

  /* Reveal-on-scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* "Back to top" should move focus as well as scroll */
  document.querySelectorAll('a[href="#main"]').forEach((a) => a.addEventListener('click', () => {
    setTimeout(() => document.getElementById('main')?.focus({ preventScroll: true }), 0);
  }));
})();
