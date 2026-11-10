/* Makovelle — contact form: validation and honest submission.
 *
 * - If data-endpoint is set (e.g. a Formspree URL), the form is POSTed there as FormData with
 *   Accept: application/json. Success is only shown when the service confirms it.
 * - If no endpoint is configured, NOTHING is reported as sent. The visitor is offered WhatsApp
 *   and/or email with their message pre-filled, using the details from site.config.json.
 */
(() => {
  'use strict';
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');
  const submitBtn = form.querySelector('[type="submit"]');
  const submitHTML = submitBtn.innerHTML;
  const { endpoint, whatsapp, email } = form.dataset;

  const SERVICES = Object.fromEntries([...form.service.options].filter((o) => o.value).map((o) => [o.value, o.textContent]));

  /* Pre-select the service from ?service=… links on the Services page */
  const pre = new URLSearchParams(location.search).get('service');
  if (pre && SERVICES[pre]) form.service.value = pre;

  /* ---------- validation ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your full name.' : ''),
    email: (v) => (!v.trim() ? 'Please enter your email address.' : !EMAIL_RE.test(v.trim()) ? 'Please enter a valid email address, e.g. name@company.co.zw.' : ''),
    phone: (v) => (v.trim() && !PHONE_RE.test(v.trim()) ? 'Please enter a valid phone number, e.g. +263 77 123 4567.' : ''),
    service: (v) => (!v ? 'Please choose the service you need.' : ''),
    message: (v) => (v.trim().length < 20 ? 'Please tell us a little more about your project (at least 20 characters).' : ''),
  };

  const validateField = (name) => {
    const field = form.elements[name];
    const msg = rules[name](field.value);
    const err = document.getElementById(`e-${name}`);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg ? '⚠ ' + msg : '';
    return !msg;
  };

  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    // Validate on leaving a field; re-validate live once a field has been flagged
    field.addEventListener('blur', () => { if (field.value || field.getAttribute('aria-invalid')) validateField(name); });
    field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validateField(name); });
    field.addEventListener('change', () => { if (field.getAttribute('aria-invalid') === 'true') validateField(name); });
  });

  /* ---------- status messages (built with DOM, never innerHTML with user input) ---------- */
  const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    children.forEach((c) => node.append(c));
    return node;
  };
  const showStatus = (type, title, text, actions = [], focus = true) => {
    status.className = `form-status form-status--${type}`;
    status.replaceChildren(el('h3', { textContent: title }), el('p', { textContent: text }));
    if (actions.length) status.append(el('div', { className: 'btn-row' }, ...actions));
    status.hidden = false;
    if (!focus) return;
    status.focus({ preventScroll: true });
    status.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  };

  const composeMessage = (d) => [
    'New project enquiry — Makovelle website',
    '',
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    d.phone ? `Phone: ${d.phone}` : null,
    d.organisation ? `Organisation: ${d.organisation}` : null,
    `Service: ${SERVICES[d.service] || d.service}`,
    '',
    d.message,
  ].filter((l) => l !== null).join('\n');

  const fallbackActions = (d) => {
    const text = composeMessage(d);
    const actions = [];
    if (whatsapp) actions.push(el('a', { className: 'btn btn--gold', href: `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, target: '_blank', rel: 'noopener', textContent: 'Send via WhatsApp' }));
    if (email) actions.push(el('a', { className: 'btn btn--ghost', href: `mailto:${email}?subject=${encodeURIComponent('Project enquiry: ' + (SERVICES[d.service] || ''))}&body=${encodeURIComponent(text)}`, textContent: 'Send by email' }));
    return actions;
  };

  const setLoading = (on) => {
    submitBtn.disabled = on;
    submitBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    if (on) submitBtn.replaceChildren(el('span', { className: 'spinner', ariaHidden: 'true' }), ' Sending…');
    else submitBtn.innerHTML = submitHTML;
  };

  /* ---------- submit ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      showStatus('error', 'Please check the highlighted fields', 'A few details need your attention before we can receive your enquiry.', [], false);
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    if (data._gotcha) return; // bot

    if (!endpoint) {
      const actions = fallbackActions(data);
      showStatus('pending', 'Your message has not been sent yet',
        actions.length
          ? 'Our online form is still being connected, so it cannot deliver messages yet. Your details are ready to send. Choose an option below and your message will be pre-filled.'
          : 'Our online form is still being connected and cannot deliver messages yet. Please contact us directly using the details on this page.',
        actions);
      return;
    }

    setLoading(true);
    try {
      const body = new FormData(form);
      body.append('_subject', `Website enquiry: ${SERVICES[data.service] || 'General'} — ${data.name}`);
      const res = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
      showStatus('success', 'Thank you, your enquiry has been sent',
        'We have received your message and will be in touch shortly. If your project is urgent, you are welcome to message us on WhatsApp as well.');
    } catch (err) {
      showStatus('error', 'We couldn\'t send your message',
        'Something went wrong on our side or with your connection. Your details are still in the form. Please try again, or reach us directly.',
        fallbackActions(data));
    } finally {
      setLoading(false);
    }
  });
})();
