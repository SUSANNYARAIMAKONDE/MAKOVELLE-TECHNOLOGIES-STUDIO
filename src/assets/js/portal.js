/* Maconte Academy parent portal — interactive demonstration.
 * Fictional data, held in memory only. Nothing is sent or stored. */
(() => {
  'use strict';

  /* ---------------- fictional data ---------------- */
  const SUBJECTS_F2 = ['English Language', 'Mathematics', 'Combined Science', 'History', 'Geography', 'Shona', 'Computer Science'];
  const SUBJECTS_F4 = ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Accounting', 'Geography'];
  const COMMENTS = {
    A: ['Excellent work and consistent effort.', 'Outstanding understanding of the material.', 'A pleasure to teach; keep it up.'],
    B: ['Good progress this term.', 'Solid work; aim for more depth in answers.', 'Steady effort and good participation.'],
    C: ['Satisfactory; more revision will help.', 'Capable of more with regular practice.', 'Needs to complete homework consistently.'],
    D: ['Must seek extra help to improve.', 'Needs focused revision before exams.', 'More effort required in class.'],
  };
  const grade = (m) => (m >= 75 ? 'A' : m >= 65 ? 'B' : m >= 50 ? 'C' : m >= 40 ? 'D' : 'E');

  const children = [
    {
      id: 'tariro', first: 'Tariro', name: 'Tariro Moyo', adm: 'MA-2311', form: 'Form 2B', teacher: 'Mr T. Chirwa', fee: 720,
      ledger: [
        ['2026-01-06', 'Term 1 tuition fees', 720, 0], ['2026-01-09', 'Payment · Bank transfer', 0, 240, 'RC-0118'], ['2026-01-18', 'Payment · Bank transfer', 0, 480, 'RC-0140'],
        ['2026-05-05', 'Term 2 tuition fees', 720, 0], ['2026-05-12', 'Payment · Mobile money', 0, 720, 'RC-0388'],
        ['2026-09-08', 'Term 3 tuition fees', 720, 0], ['2026-09-10', 'Payment · Bank transfer', 0, 720, 'RC-0611'],
      ],
      absent: ['2026-09-23', '2026-10-15'], late: ['2026-10-02'],
      reports: {
        'Term 2 2026': { marks: [72, 81, 77, 68, 70, 79, 86], position: '6 of 32', note: 'Tariro is a diligent and cheerful learner who contributes well in class. Her Computer Science and Mathematics results are excellent. Keep reading widely to strengthen English.' },
        'Term 1 2026': { marks: [69, 78, 74, 64, 71, 76, 82], position: '8 of 32', note: 'A good start to the year. Tariro settles quickly into tasks and works well with others. More attention to detail in History will lift her results.' },
      },
      subjects: SUBJECTS_F2,
    },
    {
      id: 'tinotenda', first: 'Tinotenda', name: 'Tinotenda Moyo', adm: 'MA-2110', form: 'Form 4A', teacher: 'Mrs S. Banda', fee: 760,
      ledger: [
        ['2026-01-06', 'Term 1 tuition fees', 760, 0], ['2026-01-20', 'Payment · Cash', 0, 760, 'RC-0152'],
        ['2026-05-05', 'Term 2 tuition fees', 760, 0], ['2026-05-19', 'Payment · Bank transfer', 0, 760, 'RC-0402'],
        ['2026-09-08', 'Term 3 tuition fees', 760, 0], ['2026-09-15', 'Payment · Mobile money', 0, 300, 'RC-0642'], ['2026-10-14', 'Payment · Mobile money', 0, 200, 'RC-0705'],
      ],
      absent: ['2026-09-11', '2026-09-29', '2026-10-20', '2026-10-21'], late: ['2026-09-17', '2026-10-08', '2026-11-03'],
      reports: {
        'Term 2 2026': { marks: [66, 58, 63, 55, 71, 77, 62], position: '14 of 30', note: 'Tinotenda is capable and well liked. With O Level examinations approaching, a consistent revision timetable is essential, particularly for Mathematics and Chemistry.' },
        'Term 1 2026': { marks: [64, 52, 60, 49, 68, 74, 65], position: '17 of 30', note: 'Encouraging progress in Biology and Accounting. Punctuality has improved. Tinotenda should make use of the Wednesday Mathematics clinic.' },
      },
      subjects: SUBJECTS_F4,
    },
  ];

  const notices = [
    { id: 1, date: '2026-11-06', from: 'Head of School', title: 'Prize-giving ceremony: 27 November', body: ['Parents and guardians are warmly invited to our annual prize-giving ceremony on Friday 27 November at 10:00 in the school hall.', 'Learners should wear full formal uniform.'], read: false },
    { id: 2, date: '2026-11-02', from: 'Academic Office', title: 'Form 4 mock examination timetable', body: ['The Form 4 mock examinations begin on Monday 16 November. The full timetable has been shared with learners in class.', 'Please ensure your child arrives by 07:30 each day.'], read: false, only: 'tinotenda' },
    { id: 3, date: '2026-10-28', from: 'Sports Department', title: 'Inter-house athletics results', body: ['Thank you to all the families who came to support our inter-house athletics day. Full results are posted on the sports notice board.'], read: true },
    { id: 4, date: '2026-10-19', from: 'Bursary', title: 'Term 3 fees reminder', body: ['A reminder that Term 3 fees were due by 30 September. If you have an outstanding balance, please settle it or contact the bursary to discuss a payment plan.'], read: true },
    { id: 5, date: '2026-10-05', from: 'Form 2 Year Head', title: 'Form 2 science excursion', body: ['Form 2 learners will visit a science and technology exhibition on 22 October. Consent forms must be returned by 15 October.'], read: true, only: 'tariro' },
  ];

  const events = [['2026-11-16', 'Form 4 mock exams begin', '07:30 · Exam hall', 'tinotenda'], ['2026-11-21', 'Open morning', '08:30 – 12:00 · Main campus'], ['2026-11-27', 'Prize-giving ceremony', '10:00 · School hall'], ['2026-12-04', 'Term 3 ends', 'Learners dismissed at 12:00']];

  /* ---------------- helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const h = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') n.className = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k in n && k !== 'style') n[k] = v;
      else n.setAttribute(k, v);
    }
    kids.flat().forEach((c) => c != null && c !== false && n.append(c));
    return n;
  };
  const money = (n) => 'US$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const d = (iso) => new Date(iso + 'T12:00:00');
  const fmt = (iso, o = { day: 'numeric', month: 'short', year: 'numeric' }) => d(iso).toLocaleDateString('en-GB', o);
  const TERM_START = '2026-09-08', TODAY = '2026-11-06'; // fixed "today" so the demo always looks the same

  const balance = (c) => c.ledger.reduce((a, [, , debit, credit]) => a + debit - credit, 0);
  const schoolDays = () => {
    const days = [];
    for (let t = d(TERM_START); t <= d(TODAY); t.setDate(t.getDate() + 1)) {
      const wd = t.getDay();
      if (wd > 0 && wd < 6) days.push(t.toISOString().slice(0, 10));
    }
    return days;
  };
  const attendance = (c) => {
    const days = schoolDays();
    const absent = c.absent.length, late = c.late.length;
    return { days, total: days.length, present: days.length - absent, absent, late, rate: ((days.length - absent) / days.length) * 100 };
  };
  const visibleNotices = (c) => notices.filter((n) => !n.only || n.only === c.id);
  const report = (c, term) => {
    const r = c.reports[term];
    const rows = c.subjects.map((s, i) => ({ subject: s, mark: r.marks[i], grade: grade(r.marks[i]), comment: COMMENTS[grade(r.marks[i])]?.[i % 3] || COMMENTS.D[0] }));
    return { ...r, rows, avg: r.marks.reduce((a, b) => a + b, 0) / r.marks.length };
  };

  /* ---------------- state & chrome ---------------- */
  let child = children[0];
  let reportTerm = 'Term 2 2026';
  const view = $('[data-view]');
  const dialog = $('#pt-dialog');
  const dialogBody = $('[data-dialog-body]');
  const printBtn = $('[data-dialog-print]');

  function renderChildren() {
    $('[data-children]').replaceChildren(...children.map((c) => h('button', {
      type: 'button', class: 'pt-child', role: 'radio', 'aria-checked': String(c === child),
      onclick: () => { child = c; renderChildren(); render(); },
    }, h('span', { 'aria-hidden': 'true' }, c.first[0] + 'M'), h('span', {}, h('strong', {}, c.name), h('small', {}, `${c.form} · ${c.adm}`)))));
  }
  function renderBadge() {
    const n = visibleNotices(child).filter((x) => !x.read).length;
    const b = $('[data-unread]');
    b.hidden = !n; b.textContent = n; b.setAttribute('aria-label', `${n} unread`);
  }
  const currentTab = () => {
    const t = location.hash.slice(1);
    return ['overview', 'fees', 'attendance', 'reports', 'notices'].includes(t) ? t : 'overview';
  };

  /* ---------------- views ---------------- */
  const views = {
    overview() {
      const bal = balance(child), att = attendance(child), rep = report(child, 'Term 2 2026');
      const unread = visibleNotices(child).filter((n) => !n.read);
      return [
        h('h1', { class: 'pt-h1' }, `${child.first}'s overview`),
        h('p', {}, `${child.form} · Class teacher: ${child.teacher}`),
        h('div', { class: 'pt-grid pt-grid--4' },
          stat('Fee balance', money(bal), bal > 0 ? h('span', { class: 'pt-warn' }, 'Term 3 balance outstanding') : h('span', { class: 'pt-ok' }, 'Fully paid · thank you')),
          stat('Attendance this term', att.rate.toFixed(1) + '%', `${att.absent} absent · ${att.late} late`, att.rate),
          stat('Latest report average', rep.avg.toFixed(0) + '%', `Term 2 · Position ${rep.position}`),
          stat('Unread notices', String(unread.length), unread.length ? 'Tap Notices to read' : 'All caught up')),
        h('div', { class: 'pt-grid pt-grid--2' },
          h('section', { class: 'pt-card', 'aria-labelledby': 'ov-n' }, h('h2', { id: 'ov-n' }, 'Recent notices', h('a', { href: '#notices' }, 'View all')),
            h('ul', { class: 'pt-list' }, visibleNotices(child).slice(0, 3).map((n) => h('li', {}, dateBox(n.date), h('div', {}, h('strong', {}, n.title), h('span', {}, n.from)))))),
          h('section', { class: 'pt-card', 'aria-labelledby': 'ov-e' }, h('h2', { id: 'ov-e' }, 'Upcoming events'),
            h('ul', { class: 'pt-list' }, events.filter((e) => !e[3] || e[3] === child.id).map(([date, t, s]) => h('li', {}, dateBox(date), h('div', {}, h('strong', {}, t), h('span', {}, s))))))),
      ];
    },

    fees() {
      let run = 0;
      const bal = balance(child);
      const rows = child.ledger.map(([date, desc, debit, credit, rc]) => {
        run += debit - credit;
        return h('tr', {},
          h('td', {}, fmt(date)), h('td', {}, desc),
          h('td', { class: 'num' }, debit ? money(debit) : '—'), h('td', { class: 'num' }, credit ? money(credit) : '—'),
          h('td', { class: 'num' }, money(run)),
          h('td', {}, rc ? h('button', { type: 'button', class: 'pt-linkbtn', onclick: () => showReceipt(date, desc, credit, rc), 'aria-label': `View receipt ${rc}` }, rc) : ''));
      });
      return [
        h('div', { class: 'pt-toolbar' },
          h('div', {}, h('h1', { class: 'pt-h1' }, 'Fees & receipts'), h('p', { class: 'pt-muted', style: 'margin:.3rem 0 0' }, `${child.name} · 2026 statement`)),
          h('button', { type: 'button', class: 'sc-btn sc-btn--navy', onclick: showPay, disabled: bal <= 0 }, bal > 0 ? `Pay ${money(bal)}` : 'Nothing to pay')),
        h('div', { class: 'pt-grid pt-grid--4' },
          stat('Current balance', money(bal), bal > 0 ? h('span', { class: 'pt-warn' }, 'Due now') : h('span', { class: 'pt-ok' }, 'Fully paid')),
          stat('Term 3 fees', money(child.fee), 'Invoiced 8 Sep 2026'),
          stat('Paid this year', money(child.ledger.reduce((a, r) => a + r[3], 0)), `${child.ledger.filter((r) => r[3]).length} payments`)),
        h('section', { class: 'pt-card', 'aria-labelledby': 'st-h' }, h('h2', { id: 'st-h' }, 'Statement of account'),
          h('div', { class: 'pt-table-wrap' }, h('table', { class: 'pt-table' },
            h('thead', {}, h('tr', {}, ...['Date', 'Description', 'Charged', 'Paid', 'Balance', 'Receipt'].map((t, i) => h('th', { scope: 'col', class: i > 1 && i < 5 ? 'num' : '' }, t)))),
            h('tbody', {}, rows),
            h('tfoot', {}, h('tr', {}, h('td', { colSpan: 4 }, 'Balance due'), h('td', { class: 'num' }, money(bal)), h('td', {})))))),
      ];
    },

    attendance() {
      const att = attendance(child);
      const months = [['2026-09', 'September 2026'], ['2026-10', 'October 2026'], ['2026-11', 'November 2026']];
      const status = (iso) => (child.absent.includes(iso) ? 'absent' : child.late.includes(iso) ? 'late' : att.days.includes(iso) ? 'present' : 'none');
      const LABEL = { absent: 'Absent', late: 'Late', present: 'Present', none: 'No record' };
      const month = ([ym, label]) => {
        const [y, m] = ym.split('-').map(Number);
        const cells = [];
        const first = new Date(y, m - 1, 1);
        let lead = (first.getDay() + 6) % 7; // Monday = 0
        if (lead > 4) lead = 0;
        for (let i = 0; i < lead; i++) cells.push(h('span', { class: 'pt-cal__day pt-cal__day--blank', 'aria-hidden': 'true' }));
        for (let t = new Date(first); t.getMonth() === m - 1; t.setDate(t.getDate() + 1)) {
          const wd = t.getDay();
          if (wd === 0 || wd === 6) continue;
          const iso = `${y}-${String(m).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
          const st = status(iso);
          cells.push(h('span', { class: `pt-cal__day pt-cal__day--${st}`, title: `${fmt(iso)}: ${LABEL[st]}`, 'aria-label': `${fmt(iso, { day: 'numeric', month: 'long' })}: ${LABEL[st]}` }, String(t.getDate())));
        }
        return h('div', { class: 'pt-month' }, h('h3', {}, label),
          h('div', { class: 'pt-cal' }, ...['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((x) => h('span', { class: 'pt-cal__dow', 'aria-hidden': 'true' }, x)), ...cells));
      };
      return [
        h('h1', { class: 'pt-h1' }, 'Attendance'),
        h('p', {}, `${child.name} · Term 3, 2026 (to ${fmt(TODAY)})`),
        h('div', { class: 'pt-grid pt-grid--4' },
          stat('Attendance rate', att.rate.toFixed(1) + '%', `${att.present} of ${att.total} school days`, att.rate),
          stat('Days absent', String(att.absent), att.absent > 3 ? h('span', { class: 'pt-warn' }, 'Above school average') : 'Within expected range'),
          stat('Late arrivals', String(att.late), 'Registration closes at 07:30')),
        h('section', { class: 'pt-card', 'aria-labelledby': 'cal-h' }, h('h2', { id: 'cal-h' }, 'Daily register'),
          h('div', { class: 'pt-months' }, months.map(month)),
          h('p', { class: 'pt-legend', style: 'margin:1.25rem 0 0' }, h('span', { class: 'p' }, 'Present'), h('span', { class: 'a' }, 'Absent'), h('span', { class: 'l' }, 'Late'))),
      ];
    },

    reports() {
      const rep = report(child, reportTerm);
      const sel = h('select', { class: 'pt-select', id: 'rep-term', onchange: (e) => { reportTerm = e.target.value; render(); $('#rep-term')?.focus(); } },
        ...Object.keys(child.reports).map((t) => h('option', { value: t, selected: t === reportTerm }, t)));
      return [
        h('div', { class: 'pt-toolbar' },
          h('div', {}, h('h1', { class: 'pt-h1' }, 'School reports'), h('p', { class: 'pt-muted', style: 'margin:.3rem 0 0' }, `${child.name} · ${child.form}`)),
          h('div', { class: 'pt-row', style: 'display:flex;gap:.6rem;align-items:center;flex-wrap:wrap' }, h('label', { for: 'rep-term', class: 'visually-hidden' }, 'Choose term'), sel,
            h('button', { type: 'button', class: 'sc-btn sc-btn--ghost', onclick: () => window.print() }, 'Print report'))),
        h('div', { class: 'pt-grid pt-grid--4' },
          stat('Average', rep.avg.toFixed(1) + '%', reportTerm),
          stat('Class position', rep.position, child.form),
          stat('Best subject', rep.rows.reduce((a, b) => (b.mark > a.mark ? b : a)).subject, `${Math.max(...rep.marks)}%`)),
        h('section', { class: 'pt-card', 'aria-labelledby': 'rp-h' }, h('h2', { id: 'rp-h' }, `${reportTerm} results`),
          h('div', { class: 'pt-table-wrap' }, h('table', { class: 'pt-table' },
            h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Subject'), h('th', { scope: 'col', class: 'num' }, 'Mark'), h('th', { scope: 'col' }, 'Grade'), h('th', { scope: 'col' }, "Teacher's comment"))),
            h('tbody', {}, rep.rows.map((r) => h('tr', {}, h('td', {}, r.subject), h('td', { class: 'num' }, r.mark + '%'), h('td', {}, h('span', { class: 'pt-grade' }, r.grade)), h('td', { class: 'wrap' }, r.comment))))))),
        h('section', { class: 'pt-card', 'aria-labelledby': 'ct-h' }, h('h2', { id: 'ct-h' }, `Class teacher's comment · ${child.teacher}`), h('p', { class: 'pt-muted', style: 'margin:0' }, rep.note)),
      ];
    },

    notices() {
      const list = visibleNotices(child);
      return [
        h('div', { class: 'pt-toolbar' },
          h('div', {}, h('h1', { class: 'pt-h1' }, 'Notices'), h('p', { class: 'pt-muted', style: 'margin:.3rem 0 0' }, 'Messages from the school')),
          h('button', { type: 'button', class: 'sc-btn sc-btn--ghost', onclick: () => { list.forEach((n) => (n.read = true)); renderBadge(); render(); } }, 'Mark all as read')),
        h('section', { class: 'pt-card', 'aria-label': 'Notice list' },
          h('ul', { class: 'pt-notices' }, list.map((n) => {
            const body = h('div', { class: 'pt-notice__body', id: `nb-${n.id}`, hidden: true }, n.body.map((p) => h('p', {}, p)));
            const li = h('li', { class: 'pt-notice' + (n.read ? '' : ' pt-notice--unread') });
            const btn = h('button', { type: 'button', 'aria-expanded': 'false', 'aria-controls': `nb-${n.id}`, onclick: () => {
              const open = btn.getAttribute('aria-expanded') !== 'true';
              btn.setAttribute('aria-expanded', String(open)); body.hidden = !open;
              if (open && !n.read) { n.read = true; li.classList.remove('pt-notice--unread'); renderBadge(); }
            } }, h('span', { class: 'pt-dot', 'aria-hidden': 'true' }), h('span', {}, h('strong', {}, n.title + (n.read ? '' : ' (unread)')), h('small', {}, n.from)), h('span', { class: 'pt-notice__date' }, fmt(n.date, { day: 'numeric', month: 'short' })));
            li.append(btn, body);
            return li;
          }))),
      ];
    },
  };

  function stat(label, value, note, bar) {
    return h('div', { class: 'pt-card' }, h('span', { class: 'pt-stat__label' }, label), h('strong', { class: 'pt-stat__value' }, value),
      h('span', { class: 'pt-stat__note' }, note), bar != null ? h('div', { class: 'pt-bar' }, h('i', { style: `width:${bar}%` })) : null);
  }
  function dateBox(iso) {
    return h('span', { class: 'pt-date', 'aria-hidden': 'true' }, h('b', {}, fmt(iso, { day: '2-digit' })), fmt(iso, { month: 'short' }));
  }

  /* ---------------- dialogs ---------------- */
  function openDialog(nodes, printable) {
    dialogBody.replaceChildren(...nodes);
    printBtn.hidden = !printable;
    dialog.showModal();
    (printable ? printBtn : $('[data-dialog-close]')).focus();
  }
  function showReceipt(date, desc, amount, rc) {
    const row = (k, v) => h('div', { class: 'pt-rc__row' }, h('span', {}, k), h('b', {}, v));
    openDialog([
      h('div', { class: 'pt-rc__head' }, h('div', {}, h('strong', { id: 'pt-dialog-h' }, 'Maconte Academy'), h('div', { class: 'pt-muted', style: 'font-size:.8rem' }, 'Official receipt · Demonstration only')),
        h('div', { style: 'text-align:right;font-size:.85rem' }, h('b', {}, rc), h('div', { class: 'pt-muted' }, fmt(date)))),
      row('Received from', `${child.name} (${child.adm})`), row('Class', child.form), row('Method', desc.replace('Payment · ', '')), row('For', 'Tuition fees'),
      h('div', { class: 'pt-rc__total' }, h('span', {}, 'Amount paid'), h('span', {}, money(amount))),
      h('p', { class: 'pt-rc__note' }, 'Fictional data from the Makovelle parent portal demo. Not a valid receipt.'),
    ], true);
  }
  function showPay() {
    openDialog([
      h('h2', { id: 'pt-dialog-h' }, 'Pay school fees'),
      h('p', {}, `Outstanding balance for ${child.name}: `, h('strong', {}, money(balance(child)))),
      h('p', { class: 'pt-muted' }, "In a live portal, this screen would show the school's bank details and reference number, or connect to an approved payment option such as card or mobile money. Payments would then appear on the statement automatically."),
      h('p', { class: 'pt-login__note' }, 'This is a demonstration: no payment can be made here.'),
    ], false);
  }
  $('[data-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  printBtn.addEventListener('click', () => { document.body.classList.add('pt-printing'); window.print(); setTimeout(() => document.body.classList.remove('pt-printing'), 300); });

  /* ---------------- render & routing ---------------- */
  function render() {
    const tab = currentTab();
    document.querySelectorAll('[data-tab]').forEach((a) => (a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    view.replaceChildren(...views[tab]());
    renderBadge();
  }
  window.addEventListener('hashchange', () => { render(); view.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); });

  /* ---------------- sign in / out ---------------- */
  const login = $('[data-login-view]'), app = $('[data-app]');
  $('[data-login-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    login.hidden = true; app.hidden = false;
    if (!location.hash) history.replaceState(null, '', '#overview');
    renderChildren(); render();
    view.focus();
  });
  $('[data-signout]').addEventListener('click', () => {
    app.hidden = true; login.hidden = false;
    history.replaceState(null, '', location.pathname);
    $('[data-login-form] button').focus();
  });
})();
