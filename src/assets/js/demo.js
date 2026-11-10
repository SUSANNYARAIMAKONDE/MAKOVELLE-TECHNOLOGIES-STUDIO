/* School Fees Management — interactive demonstration.
 * All data is fictional and held in memory only; reloading the page or "Reset" restores it. */
(() => {
  'use strict';

  const FEES = { 'Form 1': 720, 'Form 2': 720, 'Form 3': 760, 'Form 4': 760, 'Lower 6': 860, 'Upper 6': 860 };
  const SEED = [
    ['MA-2401', 'Rudo Chikore', 'Form 1', 0], ['MA-2402', 'Tafadzwa Mutasa', 'Form 1', 720], ['MA-2403', 'Nyasha Banda', 'Form 1', 360],
    ['MA-2311', 'Tariro Moyo', 'Form 2', 720], ['MA-2312', 'Kudakwashe Sibanda', 'Form 2', 500], ['MA-2313', 'Chiedza Marufu', 'Form 2', 0],
    ['MA-2205', 'Tinashe Dube', 'Form 3', 760], ['MA-2206', 'Ruvimbo Nyoni', 'Form 3', 380],
    ['MA-2107', 'Kudzai Ndlovu', 'Form 4', 520], ['MA-2108', 'Farai Mhlanga', 'Form 4', 760], ['MA-2109', 'Anesu Zhou', 'Form 4', 0],
    ['MA-2014', 'Rumbidzai Phiri', 'Lower 6', 860], ['MA-2015', 'Takudzwa Gumbo', 'Lower 6', 430],
    ['MA-1918', 'Vimbai Mapfumo', 'Upper 6', 600], ['MA-1919', 'Simbarashe Ncube', 'Upper 6', 860],
  ];
  const SEED_RECEIPTS = [
    ['MA-1919', 860, 'Bank transfer', 'FT-88213', '2026-01-19'], ['MA-2108', 400, 'Mobile money', 'MM-55102', '2026-01-18'],
    ['MA-2311', 480, 'Bank transfer', 'FT-88190', '2026-01-18'], ['MA-2402', 720, 'Cash', '', '2026-01-17'],
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const money = (n) => 'US$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const statusOf = (s) => (s.paid >= s.billed ? 'paid' : s.paid > 0 ? 'part' : 'due');
  const STATUS_LABEL = { paid: 'Paid', part: 'Part-paid', due: 'Not paid' };
  const h = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); kids.forEach((k) => n.append(k)); return n; };

  let students, receipts, nextReceipt, lastUpdated;
  const reset = () => {
    students = SEED.map(([id, name, cls, paid]) => ({ id, name, cls, billed: FEES[cls], paid }));
    receipts = SEED_RECEIPTS.map(([sid, amount, method, ref, date], i) => ({ no: 138 + (SEED_RECEIPTS.length - i), sid, amount, method, ref, date }));
    nextReceipt = 143; lastUpdated = null;
  };

  /* ---------- rendering ---------- */
  const statsEl = $('[data-stats]'), rowsEl = $('[data-rows]'), countEl = $('[data-count]'), recEl = $('[data-receipts]');
  const searchEl = $('[data-search]'), classEl = $('[data-filter-class]'), statusEl = $('[data-filter-status]');
  Object.keys(FEES).forEach((c) => classEl.append(h('option', { value: c, textContent: c })));

  function renderStats() {
    const billed = students.reduce((a, s) => a + s.billed, 0);
    const paid = students.reduce((a, s) => a + s.paid, 0);
    const rate = billed ? (paid / billed) * 100 : 0;
    const stat = (label, value, extra, gold) => {
      const el = h('div', { className: 'demo-stat' + (gold ? ' demo-stat--gold' : '') }, h('span', { className: 'demo-stat__label', textContent: label }), h('strong', { className: 'demo-stat__value', textContent: value }));
      if (extra) el.append(extra);
      return el;
    };
    const meter = h('div', { className: 'demo-meter' }, h('i', { style: `width:${rate.toFixed(1)}%` }));
    statsEl.replaceChildren(
      stat('Total billed', money(billed)),
      stat('Collected', money(paid), null, true),
      stat('Outstanding', money(billed - paid)),
      stat('Collection rate', rate.toFixed(1) + '%', meter),
    );
  }

  function renderRows() {
    const q = searchEl.value.trim().toLowerCase(), fc = classEl.value, fs = statusEl.value;
    const list = students.filter((s) => (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) && (!fc || s.cls === fc) && (!fs || statusOf(s) === fs));
    countEl.textContent = `${list.length} of ${students.length} students`;
    if (!list.length) {
      rowsEl.replaceChildren(h('tr', {}, h('td', { colSpan: 7, className: 'demo-empty', textContent: 'No students match these filters.' })));
      return;
    }
    rowsEl.replaceChildren(...list.map((s) => {
      const st = statusOf(s), bal = s.billed - s.paid;
      const btn = h('button', { type: 'button', className: 'demo-btn', textContent: bal > 0 ? 'Record payment' : 'Settled', disabled: bal <= 0 });
      btn.setAttribute('aria-label', bal > 0 ? `Record payment for ${s.name}` : `${s.name}: account settled`);
      btn.addEventListener('click', () => openPayment(s));
      const tr = h('tr', {},
        h('td', { className: 'demo-table__name' }, h('strong', { textContent: s.name }), h('span', { textContent: s.id })),
        h('td', { textContent: s.cls }),
        h('td', { className: 'num', textContent: money(s.billed) }),
        h('td', { className: 'num', textContent: money(s.paid) }),
        h('td', { className: 'num', textContent: money(bal) }),
        h('td', {}, h('span', { className: `pill pill--${st}`, textContent: STATUS_LABEL[st] })),
        h('td', { className: 'num' }, btn));
      if (s.id === lastUpdated) tr.classList.add('is-updated');
      return tr;
    }));
  }

  function renderReceipts() {
    recEl.replaceChildren(...receipts.map((r) => {
      const s = students.find((x) => x.id === r.sid);
      const b = h('button', { type: 'button' },
        h('strong', { textContent: s.name }), h('span', { className: 'amt', textContent: money(r.amount) }),
        h('small', { textContent: `RC-${String(r.no).padStart(4, '0')} · ${r.method}` }), h('small', { textContent: fmtDate(r.date) }));
      b.setAttribute('aria-label', `View receipt RC-${String(r.no).padStart(4, '0')} for ${s.name}, ${money(r.amount)}`);
      b.addEventListener('click', () => { opener = b; showReceipt(r); });
      return h('li', {}, b);
    }));
  }
  const renderAll = () => { renderStats(); renderRows(); renderReceipts(); };

  /* ---------- payment dialog ---------- */
  const payDlg = $('#pay-dialog'), payForm = $('[data-pay-form]'), amountEl = $('#amount'), amountErr = $('#amount-err');
  let current = null, opener = null;

  function openPayment(s) {
    current = s; opener = document.activeElement;
    const bal = s.billed - s.paid;
    $('[data-pay-student]').textContent = `${s.name} · ${s.cls} · Balance ${money(bal)}`;
    payForm.reset();
    amountEl.value = bal.toFixed(2); amountEl.max = bal;
    amountEl.removeAttribute('aria-invalid'); amountErr.textContent = '';
    payDlg.showModal();
    amountEl.select();
  }

  payForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const bal = current.billed - current.paid;
    const amt = Math.round(parseFloat(amountEl.value) * 100) / 100;
    let err = '';
    if (!amt || amt <= 0) err = 'Enter an amount greater than zero.';
    else if (amt > bal) err = `Amount cannot exceed the outstanding balance of ${money(bal)}.`;
    if (err) { amountEl.setAttribute('aria-invalid', 'true'); amountErr.textContent = err; amountEl.focus(); return; }

    current.paid = Math.round((current.paid + amt) * 100) / 100;
    const r = { no: nextReceipt++, sid: current.id, amount: amt, method: $('#method').value, ref: $('#ref').value.trim(), date: todayISO() };
    receipts.unshift(r);
    lastUpdated = current.id;
    payDlg.close();
    renderAll();
    showReceipt(r);
  });

  /* ---------- receipt dialog ---------- */
  const rcDlg = $('#receipt-dialog'), rcEl = $('[data-receipt]');
  function showReceipt(r) {
    const s = students.find((x) => x.id === r.sid);
    const row = (k, v) => h('div', {}, h('span', { textContent: k }), h('b', { textContent: v }));
    rcEl.replaceChildren(
      h('div', { className: 'receipt__head' },
        h('div', { className: 'receipt__school', id: 'rc-h' }, 'Maconte Academy', h('small', { textContent: 'Official receipt · Demonstration only' })),
        h('div', { className: 'receipt__no' }, 'Receipt no.', h('strong', { textContent: 'RC-' + String(r.no).padStart(4, '0') }), fmtDate(r.date))),
      h('div', { className: 'receipt__rows' },
        row('Received from', `${s.name} (${s.id})`), row('Class', s.cls), row('Description', 'Tuition fees, Term 1'),
        row('Payment method', r.method + (r.ref ? ` · ${r.ref}` : '')), row('Balance after payment', money(s.billed - s.paid))),
      h('div', { className: 'receipt__total' }, h('span', { textContent: 'Amount paid' }), h('strong', { textContent: money(r.amount) })),
      h('p', { className: 'receipt__foot', textContent: 'Fictional data generated by the Makovelle School Fees demo. Not a valid receipt.' }));
    if (!rcDlg.open) rcDlg.showModal();
    rcDlg.querySelector('[data-print]').focus();
  }

  /* ---------- wiring ---------- */
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  [payDlg, rcDlg].forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); }); // click on backdrop
    d.addEventListener('close', () => {
      if (d === payDlg && rcDlg.open) return;
      if (opener && document.contains(opener) && !opener.disabled) { opener.focus(); return; }
      const row = rowsEl.querySelector('.is-updated .demo-btn');
      (row && !row.disabled ? row : searchEl).focus();
    });
  });
  $('[data-print]').addEventListener('click', () => {
    document.body.classList.add('printing');
    window.print();
    setTimeout(() => document.body.classList.remove('printing'), 300);
  });
  [searchEl, classEl, statusEl].forEach((el) => el.addEventListener('input', () => { lastUpdated = null; renderRows(); }));
  $('[data-reset]').addEventListener('click', () => {
    reset(); searchEl.value = ''; classEl.value = ''; statusEl.value = ''; renderAll();
    countEl.textContent = 'Demo data reset. ' + countEl.textContent;
  });

  reset();
  renderAll();
})();
