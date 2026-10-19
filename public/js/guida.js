// Guida con lettura ad alta voce (voce Edge dal server tramite SkyTTS, come in SkyApp)
(function () {
  if (!window.SkyTTS) return;
  var secs = Array.prototype.slice.call(document.querySelectorAll('[data-sec]'));
  var all = document.querySelector('[data-play-all]');
  var stopBtn = document.querySelector('[data-stop]');
  var status = document.querySelector('[data-status]');
  var voiceSel = document.querySelector('[data-voice]');
  var KEY = 'anf-guida-voce';
  try { var saved = localStorage.getItem(KEY); if (saved) voiceSel.value = saved; } catch (e) {}
  voiceSel.addEventListener('change', function () { try { localStorage.setItem(KEY, voiceSel.value); } catch (e) {} });

  var run = 0; // ogni nuova lettura annulla la precedente

  function textsOf(sec) {
    return Array.prototype.map.call(sec.querySelectorAll('[data-say]'), function (el, i) {
      var t = el.textContent.trim();
      return { text: i === 0 ? t + '.' : t };
    });
  }
  function mark(sec) {
    secs.forEach(function (s) { s.classList.toggle('is-reading', s === sec); });
    secs.forEach(function (s) {
      var b = s.querySelector('[data-play] span');
      if (b) b.textContent = s === sec ? 'In ascolto…' : 'Ascolta';
    });
  }
  function idle() {
    mark(null);
    stopBtn.hidden = true;
    all.hidden = false;
    status.textContent = '';
  }
  function play(list, from) {
    var my = ++run;
    stopBtn.hidden = false;
    all.hidden = true;
    (function next(i) {
      if (my !== run) return;
      if (i >= list.length) { idle(); return; }
      var sec = list[i];
      mark(sec);
      status.textContent = 'Caricamento voce…';
      if (from !== undefined || list.length > 1) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      SkyTTS.speakSequence(textsOf(sec), {
        voice: voiceSel.value, lang: 'it-IT', rate: 0.97,
        onstart: function () { if (my === run) status.textContent = ''; },
        onend: function () { next(i + 1); },
        onerror: function (err) {
          if (my !== run) return;
          idle();
          status.textContent = err === 'blocked' ? 'Tocca di nuovo "Ascolta" per avviare l\'audio.' : 'Audio non disponibile in questo momento.';
        },
      });
    })(0);
  }

  all.addEventListener('click', function () { play(secs); });
  stopBtn.addEventListener('click', function () { run++; SkyTTS.stop(); idle(); });
  secs.forEach(function (sec) {
    sec.querySelector('[data-play]').addEventListener('click', function () {
      if (sec.classList.contains('is-reading')) { run++; SkyTTS.stop(); idle(); return; }
      play([sec]);
    });
  });
  window.addEventListener('pagehide', function () { SkyTTS.stop(); });
})();
