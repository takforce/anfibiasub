// Menu principale e menu a tendina (si aprono cliccando sul nome)
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (!nav) return;
  var mobile = function () { return window.matchMedia('(max-width: 1279px)').matches; };

  if (btn) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  var dds = nav.querySelectorAll('.dd');
  function closeAll(except) {
    dds.forEach(function (d) {
      if (d !== except) { d.classList.remove('open'); d.querySelector('.dd-btn').setAttribute('aria-expanded', 'false'); }
    });
  }
  dds.forEach(function (d) {
    var b = d.querySelector('.dd-btn');
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !d.classList.contains('open');
      closeAll(d);
      d.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // Scelta una voce: chiudo la tendina (e sul telefono anche il menu)
  nav.addEventListener('click', function (e) {
    if (e.target.tagName !== 'A') return;
    closeAll();
    if (mobile() && btn) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });
})();

// Titolo della home: ogni riga resta su una riga sola e si rimpicciolisce fino a stare nella larghezza
(function () {
  var h = document.querySelector('.hero h1');
  if (!h || !h.querySelector('.fit')) return;
  var MAX = 68;
  function fit() {
    h.style.fontSize = '';
    var cs = getComputedStyle(h.parentNode);
    var avail = h.parentNode.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var lines = h.querySelectorAll('.fit'), size = Math.min(MAX, parseFloat(getComputedStyle(h).fontSize) * 3);
    h.style.fontSize = size + 'px';
    var widest = 0;
    lines.forEach(function (l) { l.style.maxWidth = 'none'; widest = Math.max(widest, l.scrollWidth); });
    if (widest > avail) size = Math.floor(size * avail / widest * 0.99);
    h.style.fontSize = Math.min(MAX, size) + 'px';
    lines.forEach(function (l) { l.style.maxWidth = ''; });
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('resize', fit);
})();


// ---------- SOS: finestra di conferma, posizione GPS e messaggio WhatsApp ----------
(function () {
  var dlg = document.getElementById('sos-dlg');
  if (!dlg) return;
  var posEl = dlg.querySelector('[data-sos-pos]');
  var links = dlg.querySelectorAll('[data-sos-to]');
  var run = 0;
  function setMsg(lat, lon, acc) {
    var t = '🆘 SOS - Barca in difficoltà\n';
    t += lat != null ? 'Posizione: https://maps.google.com/?q=' + lat.toFixed(5) + ',' + lon.toFixed(5) + (acc ? ' (precisione ±' + Math.round(acc) + ' m)' : '') + '\n' : 'Posizione GPS non disponibile.\n';
    t += 'Inviato dal sito Anfibiasub';
    Array.prototype.forEach.call(links, function (a) { a.href = 'https://wa.me/' + a.getAttribute('data-sos-to') + '?text=' + encodeURIComponent(t); });
  }
  function open() {
    var my = ++run;
    posEl.textContent = dlg.getAttribute('data-searching');
    posEl.classList.remove('is-off');
    setMsg(null);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    if (!navigator.geolocation) { fail(); return; }
    navigator.geolocation.getCurrentPosition(function (p) {
      if (my !== run) return;
      var c = p.coords;
      posEl.textContent = c.latitude.toFixed(5) + ', ' + c.longitude.toFixed(5) + ' · ' + dlg.getAttribute('data-acc') + ' ±' + Math.round(c.accuracy) + ' m';
      setMsg(c.latitude, c.longitude, c.accuracy);
    }, function () { if (my === run) fail(); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
    function fail() { posEl.textContent = dlg.getAttribute('data-nopos'); posEl.classList.add('is-off'); }
  }
  function close() { run++; if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  Array.prototype.forEach.call(document.querySelectorAll('[data-sos]'), function (b) { b.addEventListener('click', open); });
  dlg.querySelector('[data-sos-close]').addEventListener('click', close);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  Array.prototype.forEach.call(links, function (a) { a.addEventListener('click', function () { setTimeout(close, 300); }); });
})();

// ---------- Sfondo "discesa" da PC: superficie -> relitto, profondimetro 0-50 m ----------
(function () {
  var bg = document.querySelector('.abyss-bg');
  if (!bg || !window.matchMedia) return;
  var mq = window.matchMedia('(min-width:1024px)');
  var l2 = bg.querySelector('.ab2'), l3 = bg.querySelector('.ab3');
  var val = document.querySelector('[data-depth]'), bar = document.querySelector('[data-depth-bar]'), diver = document.querySelector('.diver');
  var MAX = 50, ticking = false;
  function update() {
    ticking = false;
    if (!mq.matches) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    // 0-50%: superficie -> acqua profonda; 50-100%: acqua profonda -> relitto
    l2.style.opacity = Math.min(1, p * 2).toFixed(3);
    l3.style.opacity = Math.max(0, p * 2 - 1).toFixed(3);
    if (val) val.textContent = (p * MAX).toFixed(1);
    if (bar) bar.style.height = (p * 100).toFixed(1) + '%';
    // il sub scende dall'alto (sotto l'header) fino in fondo allo schermo
    if (diver && diver.offsetHeight) {
      var top = 170, room = window.innerHeight - top - diver.offsetHeight - 16;
      diver.style.transform = 'translate(-50%,' + Math.round(top + Math.max(0, room) * p) + 'px)';
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  if (mq.addEventListener) mq.addEventListener('change', req);
  window.addEventListener('load', req);
  update();
})();
