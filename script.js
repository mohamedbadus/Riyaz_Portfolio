(function () {
  'use strict';

  var root = document.documentElement;
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
