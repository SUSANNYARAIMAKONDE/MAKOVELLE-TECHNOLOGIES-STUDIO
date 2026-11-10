/* Maconte Academy demo website — menu and demo-only enquiry form */
(() => {
  'use strict';
  const toggle = document.querySelector('[data-sc-toggle]');
  const menu = document.querySelector('[data-sc-menu]');
  if (toggle && menu) {
    const set = (open) => { toggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open); };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { set(false); toggle.focus(); } });
  }

  const form = document.querySelector('[data-sc-form]');
  if (!form) return;
  const status = form.querySelector('[data-sc-status]');
  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your name.' : ''),
    email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Please enter a valid email address.' : ''),
    child: (v) => (v.trim().length < 2 ? "Please enter your child's name." : ''),
    level: (v) => (!v ? 'Please choose an entry level.' : ''),
  };
  const check = (name) => {
    const el = form.elements[name];
    const msg = rules[name](el.value);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    el.closest('.sc-field').querySelector('.sc-err').textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach((n) => form.elements[n].addEventListener('input', () => { if (form.elements[n].getAttribute('aria-invalid') === 'true') check(n); }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = Object.keys(rules).map(check).every(Boolean);
    if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }
    const strong = document.createElement('strong');
    strong.textContent = 'This is a demonstration: no enquiry was sent.';
    status.replaceChildren(strong, 'On a real school website, this enquiry would be delivered to the admissions office and the parent would receive a confirmation email.');
    status.hidden = false;
    status.focus();
  });
})();
