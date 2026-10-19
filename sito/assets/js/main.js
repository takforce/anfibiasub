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

