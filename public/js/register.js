// Registrazione: la casella si sblocca solo dopo aver aperto e letto i Termini di servizio
(function () {
  var dlg = document.querySelector('[data-terms-dlg]');
  var box = document.querySelector('[data-accept]');
  var need = document.querySelector('[data-need]');
  if (!dlg || !box) return;
  function unlock() { box.disabled = false; if (need) need.hidden = true; }
  document.querySelectorAll('[data-terms]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (dlg.showModal) dlg.showModal(); else { window.open('/area/termini', '_blank'); unlock(); }
    });
  });
  document.querySelector('[data-terms-ok]').addEventListener('click', function () { dlg.close(); unlock(); box.checked = true; box.focus(); });
  dlg.addEventListener('close', unlock);
  // un clic sul testo dell'etichetta quando la casella è bloccata apre i termini
  box.parentNode.addEventListener('click', function (e) {
    if (box.disabled && e.target.tagName !== 'A') { e.preventDefault(); if (dlg.showModal) dlg.showModal(); }
  });
  var f = document.querySelector('[data-reg]');
  f.addEventListener('submit', function (e) {
    if (f.password.value !== f.password2.value) { e.preventDefault(); f.password2.setCustomValidity(' '); f.password2.reportValidity(); }
  });
  f.password2.addEventListener('input', function () { f.password2.setCustomValidity(''); });
})();
