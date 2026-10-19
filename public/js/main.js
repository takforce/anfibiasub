// Menu principale e menu a tendina (si aprono cliccando sul nome)
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (!nav) return;
  var mobile = function () { return window.matchMedia('(max-width: 1240px)').matches; };

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
