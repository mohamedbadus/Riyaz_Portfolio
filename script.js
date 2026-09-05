(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  /* ---------------- theme ---------------- */

  var KEY = 'mr-theme';

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var btn = document.getElementById('theme');
    if (btn) btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved !== 'light' && saved !== 'dark') {
    saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(saved);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('#theme');
    if (!btn) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(KEY, next); } catch (err) {}
  });

  /* ---------------- the blueprint miniature ----------------
     A small, honest copy of the planning step TestCraft runs
     before it asks Gemini for anything: the parts, the counts
     and the marks are decided here, then filled in.
  ---------------------------------------------------------- */

  var SUBJECTS = [
    { id: 'tamil',   en: 'Tamil',          ta: 'தமிழ்', lock: 'ta',
      note: 'The long-answer part holds a slot back for composition — a letter, an essay or an appreciation.' },
    { id: 'english', en: 'English',        ta: 'ஆங்கிலம்', lock: 'en',
      note: 'Grammar and comprehension are drawn from the prose and poetry units you have ticked, not from a general bank.' },
    { id: 'maths',   en: 'Mathematics',    ta: 'கணிதம்', lock: null,
      note: 'Sums are spread across the ticked chapters, with a construction or graph question reserved for the last part.' },
    { id: 'science', en: 'Science',        ta: 'அறிவியல்', lock: null,
      note: 'Physics, chemistry, biology and computer science are balanced by marks allotted, not by question count.' },
    { id: 'social',  en: 'Social Science', ta: 'சமூக அறிவியல்', lock: null,
      note: 'One five-mark map-marking question is reserved in the long-answer part.' }
  ];

  var PAPERS = [
    { id: 'mcq',  en: 'MCQ only', ta: 'பலவுள் தெரிவுத் தேர்வு',
      timeEn: '45 minutes', timeTa: '45 நிமிடங்கள்',
      parts: [{ n: 25, m: 1 }] },
    { id: 'slip', en: 'Slip test', ta: 'சீட்டுத் தேர்வு',
      timeEn: '30 minutes', timeTa: '30 நிமிடங்கள்',
      parts: [{ n: 5, m: 1 }, { n: 5, m: 2 }, { n: 1, m: 5 }] },
    { id: 'unit', en: 'Unit test', ta: 'அலகுத் தேர்வு',
      timeEn: '1½ hours', timeTa: '1½ மணி நேரம்',
      parts: [{ n: 10, m: 1 }, { n: 5, m: 2 }, { n: 4, m: 5 }, { n: 1, m: 10 }] },
    { id: 'quarterly', en: 'Quarterly exam', ta: 'காலாண்டுத் தேர்வு',
      timeEn: '3 hours', timeTa: '3 மணி நேரம்',
      parts: [{ n: 14, m: 1 }, { n: 8, m: 2 }, { n: 6, m: 5 }, { n: 4, m: 10 }] }
  ];

  var MEDIA = [
    { id: 'en', label: 'English' },
    { id: 'ta', label: 'Tamil' },
    { id: 'both', label: 'Bilingual' }
  ];

  var PART_EN = ['Part I', 'Part II', 'Part III', 'Part IV'];
  var PART_TA = ['பகுதி I', 'பகுதி II', 'பகுதி III', 'பகுதி IV'];
  var DESC_EN = ['Choose the correct answer', 'Answer briefly', 'Answer in detail', 'Answer in full'];
  var DESC_TA = [
    'சரியான விடையைத் தேர்ந்தெடுக்கவும்',
    'சுருக்கமாக விடையளிக்கவும்',
    'விரிவாக விடையளிக்கவும்',
    'முழுமையாக விடையளிக்கவும்'
  ];
  var TOTAL_TA = 'மொத்த மதிப்பெண்கள்';
  var TIME_TA  = 'நேரம்';

  var state = { subject: 'science', paper: 'unit', medium: 'en' };
  var painted = false;

  var elSubject = document.getElementById('c-subject');
  var elPaper   = document.getElementById('c-paper');
  var elMedium  = document.getElementById('c-medium');

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }

  function chipsInto(host, items, group) {
    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += '<button class="chip" type="button" data-group="' + group + '" data-id="' + items[i].id + '" aria-pressed="false">' +
              (items[i].label || items[i].en) + '</button>';
    }
    host.innerHTML = html;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function render() {
    var sub = find(SUBJECTS, state.subject);
    var pap = find(PAPERS, state.paper);

    /* a language paper is set in its own language — the medium is not a choice */
    if (sub.lock) state.medium = sub.lock;
    var med = state.medium;
    var showEn = med === 'en' || med === 'both';
    var showTa = med === 'ta' || med === 'both';

    /* chips */
    var all = document.querySelectorAll('.chip');
    for (var i = 0; i < all.length; i++) {
      var c = all[i], g = c.getAttribute('data-group');
      c.setAttribute('aria-pressed', state[g] === c.getAttribute('data-id') ? 'true' : 'false');
      if (g === 'medium') c.disabled = !!sub.lock;
    }
    document.getElementById('lockmsg').textContent = sub.lock
      ? (sub.lock === 'ta' ? 'A Tamil paper is set in Tamil.' : 'An English paper is set in English.')
      : '';

    /* header */
    var titleEn = pap.en + ' — ' + sub.en;
    var titleTa = pap.ta + ' — ' + sub.ta;
    var title = showEn ? esc(titleEn) : '';
    if (showTa) title += (title ? '<br><span class="tam">' : '<span class="tam">') + esc(titleTa) + '</span>';
    document.getElementById('p-title').innerHTML = title;

    document.getElementById('p-time').innerHTML = showEn
      ? 'Time: ' + esc(pap.timeEn)
      : '<span class="tam">' + esc(TIME_TA + ': ' + pap.timeTa) + '</span>';

    document.getElementById('p-medium').innerHTML =
      med === 'both' ? 'Bilingual'
      : med === 'ta' ? '<span class="tam">தமிழ் வழி</span>'
      : 'English medium';

    /* rows */
    var rows = '', total = 0;
    for (var p = 0; p < pap.parts.length; p++) {
      var part = pap.parts[p], sub_total = part.n * part.m;
      total += sub_total;

      var name = showEn ? esc(PART_EN[p]) : '';
      if (showTa) name += (name ? '<br>' : '') + '<span class="tam">' + esc(PART_TA[p]) + '</span>';

      var desc = showEn ? esc(DESC_EN[p]) : '';
      if (showTa) desc += (desc ? '<br>' : '') + '<span class="tam">' + esc(DESC_TA[p]) + '</span>';

      rows += '<li><span class="r-part">' + name + '</span>' +
              '<span class="r-desc">' + desc +
              '<small>' + part.n + ' question' + (part.n === 1 ? '' : 's') +
              ' × ' + part.m + ' mark' + (part.m === 1 ? '' : 's') + '</small></span>' +
              '<span class="r-marks">' + sub_total + '</span></li>';
    }

    var out = document.getElementById('p-rows');
    out.innerHTML = rows;
    document.getElementById('p-total').textContent = total;
    document.getElementById('p-totlabel').innerHTML = showEn
      ? 'Total marks'
      : '<span class="tam">' + esc(TOTAL_TA) + '</span>';
    document.getElementById('p-note').textContent = sub.note;

    if (painted && !reduced) {
      var box = out.parentNode;
      box.classList.remove('swap');
      void box.offsetWidth;
      box.classList.add('swap');
    }
    painted = true;
  }

  if (elSubject && elPaper && elMedium) {
    chipsInto(elSubject, SUBJECTS, 'subject');
    chipsInto(elPaper, PAPERS, 'paper');
    chipsInto(elMedium, MEDIA, 'medium');

    document.addEventListener('click', function (e) {
      var chip = e.target.closest && e.target.closest('.chip');
      if (!chip || chip.disabled) return;
      state[chip.getAttribute('data-group')] = chip.getAttribute('data-id');
      render();
    });

    render();
  }

  /* ---------------- one page-load reveal ---------------- */

  var hero = document.getElementById('hero');
  if (hero) {
    var risers = hero.querySelectorAll('.rise');
    for (var r = 0; r < risers.length; r++) risers[r].style.setProperty('--d', r * 90 + 'ms');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('lit'); });
    });
  }

  /* ---------------- top bar hairline on scroll ---------------- */

  var bar = document.getElementById('topbar');
  if (bar) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        tick = false;
        bar.classList.toggle('stuck', window.scrollY > 8);
      });
    }, { passive: true });
  }

  /* ---------------- mark the section you are in ---------------- */

  var links = document.querySelectorAll('.nav a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    Array.prototype.forEach.call(links, function (a) {
      var sec = document.querySelector(a.getAttribute('href'));
      if (sec) map[sec.id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = map[entry.target.id];
        if (a) a.classList.toggle('here', entry.isIntersecting);
      });
    }, { rootMargin: '-42% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
