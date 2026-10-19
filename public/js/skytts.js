/* ════════════════════════════════════════════════════════════════════════
   SkyTTS — lettura ad alta voce condivisa da tutte le pagine di SkyApp
   ────────────────────────────────────────────────────────────────────────
   1) Voce principale: Microsoft Edge TTS generata dal server (GET /api/speak),
      riprodotta come normale audio MP3. Voci neurali (Elsa, Sonia...), identiche
      su PC, iPhone e Android, e niente blocchi del motore vocale di Android.
   2) Ripiego automatico: Web Speech API del browser, se il server non risponde,
      se si è offline o se l'audio non parte. Su Android il testo è spezzato in
      blocchi corti con un watchdog che interviene SOLO se il motore si ferma
      senza avvisare (mai durante una lettura regolare).

   Uso:
     SkyTTS.speak(testo, { voice:'elsa', lang:'it-IT', rate:0.95,
                           browserVoice, pitch, onstart, onend, onerror })
     SkyTTS.speakSequence([{text, voice, lang, browserVoice, rate, pitch}, ...], {onstart, onend, onerror})
     SkyTTS.stop()
   onerror riceve 'blocked' se il browser ha impedito l'avvio (autoplay senza tocco).
   Voci server: elsa, isabella, diego (italiano) · sonia, ryan (inglese UK).
   ════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (window.SkyTTS) return;

  var API_URL = '/api/speak';
  var MAX_API_CHARS = 480;          // il server accetta max 500 caratteri per richiesta
  var MAX_BROWSER_CHARS_ANDROID = 180;
  var FETCH_TIMEOUT_MS = 12000;
  var IS_ANDROID = /Android/i.test((navigator && navigator.userAgent) || '');
  var HAS_WEBSPEECH = ('speechSynthesis' in window) && ('SpeechSynthesisUtterance' in window);

  var session = 0;                  // ogni nuova lettura/stop invalida quelle precedenti
  var audioEl = null;
  var unlocked = false;
  var apiDownUntil = 0;             // dopo un errore del server si usa il browser per un po'
  var urlCache = new Map();         // chiave -> Promise<objectURL>
  var URL_CACHE_MAX = 40;
  var keepUtterance = null;         // riferimento globale: evita il garbage collect su Chrome/Android

  /* ── utilità ─────────────────────────────────────────────── */
  function silentWavUrl(){
    function u32(n){ return String.fromCharCode(n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255); }
    function u16(n){ return String.fromCharCode(n & 255, (n >> 8) & 255); }
    var n = 800;
    var s = 'RIFF' + u32(36 + n) + 'WAVEfmt ' + u32(16) + u16(1) + u16(1) + u32(8000) + u32(8000) +
            u16(1) + u16(8) + 'data' + u32(n) + new Array(n + 1).join('\x80');
    return 'data:audio/wav;base64,' + btoa(s);
  }

  function getAudio(){
    if (!audioEl){ audioEl = new Audio(); audioEl.preload = 'auto'; }
    return audioEl;
  }

  // Sblocca l'elemento audio dentro il tocco dell'utente (serve a iPhone/Safari per poter
  // poi riprodurre l'MP3 che arriva dal server qualche centinaio di millisecondi dopo).
  function unlock(){
    if (unlocked || typeof Audio === 'undefined') return;
    try {
      var a = getAudio();
      a.src = silentWavUrl();
      var p = a.play();
      if (p && p.then) p.then(function(){ unlocked = true; }).catch(function(){});
    } catch(e){}
  }

  function cleanText(t){
    return String(t == null ? '' : t).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Spezza il testo per frase, poi per virgola, poi per parole, restando sotto maxLen.
  function splitText(text, maxLen){
    maxLen = maxLen || MAX_API_CHARS;
    if (text.length <= maxLen) return [text];
    var sentences = text.match(/[^.!?;]+[.!?;]*/g) || [text];
    var chunks = [];
    var buf = '';
    function pushBuf(){ if (buf.trim()) chunks.push(buf.trim()); buf = ''; }
    sentences.forEach(function(raw){
      var sent = raw.trim();
      if (!sent) return;
      if (sent.length <= maxLen){
        if ((buf + ' ' + sent).trim().length <= maxLen) buf = (buf + ' ' + sent).trim();
        else { pushBuf(); buf = sent; }
        return;
      }
      pushBuf();
      var bits = sent.split(',');
      bits.forEach(function(bit, i){
        var piece = bit.trim() + (i < bits.length - 1 ? ',' : '');
        if (!piece || piece === ',') return;
        if ((buf + ' ' + piece).trim().length <= maxLen){ buf = (buf + ' ' + piece).trim(); return; }
        pushBuf();
        if (piece.length <= maxLen){ buf = piece; return; }
        piece.split(' ').forEach(function(word){
          if ((buf + ' ' + word).trim().length <= maxLen) buf = (buf + ' ' + word).trim();
          else { pushBuf(); buf = word; }
        });
      });
      pushBuf();
    });
    pushBuf();
    return chunks.filter(Boolean);
  }

  function rateToPct(rate){
    if (!rate || rate === 1) return 0;
    return Math.max(-30, Math.min(30, Math.round((rate - 1) * 100)));
  }

  function apiAvailable(){
    if (typeof fetch !== 'function' || typeof Audio === 'undefined' || !window.URL || !URL.createObjectURL) return false;
    if (navigator && navigator.onLine === false) return false;
    return Date.now() >= apiDownUntil;
  }

  function fetchAudioUrl(item){
    var key = item.voice + '|' + item.pct + '|' + item.text;
    if (urlCache.has(key)){
      var hit = urlCache.get(key);
      urlCache.delete(key); urlCache.set(key, hit);
      return hit;
    }
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = setTimeout(function(){ if (ctrl) ctrl.abort(); }, item.timeoutMs || FETCH_TIMEOUT_MS);
    var qs = 'text=' + encodeURIComponent(item.text) + '&voice=' + encodeURIComponent(item.voice) +
             (item.pct ? '&rate=' + item.pct : '');
    var p = fetch(API_URL + '?' + qs, { credentials: 'same-origin', signal: ctrl ? ctrl.signal : undefined })
      .then(function(r){
        clearTimeout(timer);
        if (!r.ok){ var e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
        return r.blob();
      })
      .then(function(b){
        if (!b || b.size < 200) throw new Error('audio vuoto');
        return URL.createObjectURL(b);
      });
    p.catch(function(err){
      clearTimeout(timer);
      urlCache.delete(key);
      var st = err && err.status;
      // server senza TTS / non loggato: inutile riprovare a ogni frase
      apiDownUntil = Date.now() + ((st === 401 || st === 404 || st === 503) ? 5 * 60 * 1000 : 60 * 1000);
    });
    urlCache.set(key, p);
    while (urlCache.size > URL_CACHE_MAX){
      var oldKey = urlCache.keys().next().value;
      var old = urlCache.get(oldKey);
      urlCache.delete(oldKey);
      old.then(function(u){ setTimeout(function(){ try { URL.revokeObjectURL(u); } catch(e){} }, 60000); }).catch(function(){});
    }
    return p;
  }

  /* ── ripiego: voce del browser ───────────────────────────── */
  // done(result): true = letto (o saltato), 'blocked' = il browser non ha mai fatto partire la voce
  function browserSpeak(item, my, onStarted, done){
    if (!HAS_WEBSPEECH){ done(true); return; }
    var parts = IS_ANDROID ? splitText(item.text, MAX_BROWSER_CHARS_ANDROID) : [item.text];
    var k = 0, errors = 0, anyStarted = false, everBusy = false, timer = null;

    function next(){
      clearTimeout(timer);
      if (my !== session) return;
      if (k >= parts.length){ done(true); return; }
      var txt = parts[k];
      var u = new SpeechSynthesisUtterance(txt);
      u.lang = item.lang;
      if (item.browserVoice) u.voice = item.browserVoice;
      u.rate = item.rate || 1;
      u.pitch = item.pitch || 1;
      var settled = false;
      function go(ok){
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (my !== session) return;
        if (ok) errors = 0; else errors++;
        if (errors > 5){ done(anyStarted ? true : 'blocked'); return; }
        k++; next();
      }
      u.onstart = function(){ everBusy = true; if (!anyStarted){ anyStarted = true; onStarted(); } };
      u.onend = function(){ go(true); };
      u.onerror = function(){ go(false); };
      keepUtterance = u;
      try { speechSynthesis.speak(u); } catch(e){ go(false); return; }

      // Watchdog: controlla ogni secondo lo stato reale del motore. Interviene solo se
      // il motore è fermo senza aver chiuso il blocco (bug Android) o se il blocco supera
      // un tetto largo proporzionale alla lunghezza. Mai durante una lettura regolare.
      var startedAt = Date.now();
      var maxMs = 4000 + txt.length * 150;
      var idle = 0;
      function tick(){
        if (settled || my !== session) return;
        var busy = speechSynthesis.speaking || speechSynthesis.pending;
        if (busy) everBusy = true;
        idle = busy ? 0 : idle + 1;
        var tooLong = (Date.now() - startedAt) >= maxMs;
        if (idle < 2 && !tooLong){ timer = setTimeout(tick, 1000); return; }
        if (k === 0 && !anyStarted && !everBusy){
          // la voce non è mai partita: il browser ha bloccato l'avvio (serve un tocco)
          settled = true;
          try { speechSynthesis.cancel(); } catch(e){}
          done('blocked');
          return;
        }
        try { speechSynthesis.cancel(); } catch(e){}
        go(false);
      }
      timer = setTimeout(tick, 1000);
    }
    if (IS_ANDROID){ try { speechSynthesis.resume(); } catch(e){} }
    next();
  }

  /* ── API pubblica ────────────────────────────────────────── */
  function stop(){
    session++;
    if (audioEl){
      audioEl.onended = null; audioEl.onerror = null;
      try { audioEl.pause(); } catch(e){}
    }
    if (HAS_WEBSPEECH){ try { speechSynthesis.cancel(); } catch(e){} }
  }

  function langOfVoice(v){ return (v === 'sonia' || v === 'ryan') ? 'en-GB' : 'it-IT'; }

  function speakSequence(segments, opts){
    opts = opts || {};
    stop();
    var my = session;
    var queue = [];
    (segments || []).forEach(function(s){
      var text = cleanText(s.text);
      if (!text) return;
      var voice = s.voice || opts.voice || 'elsa';
      var rate = s.rate || opts.rate || 1;
      splitText(text, MAX_API_CHARS).forEach(function(t){
        queue.push({
          text: t, voice: voice,
          lang: s.lang || opts.lang || langOfVoice(voice),
          browserVoice: s.browserVoice || opts.browserVoice || null,
          rate: rate, pitch: s.pitch || opts.pitch || 1,
          pct: rateToPct(rate),
          timeoutMs: opts.timeoutMs || FETCH_TIMEOUT_MS
        });
      });
    });

    var finished = false, started = false;
    function finish(err){
      if (finished || my !== session) return;
      finished = true;
      if (err){ if (opts.onerror) opts.onerror(err); }
      else if (opts.onend) opts.onend();
    }
    function fireStart(){
      if (started || my !== session) return;
      started = true;
      if (opts.onstart) opts.onstart();
    }
    if (!queue.length){ setTimeout(function(){ finish(null); }, 0); return my; }

    unlock();

    function viaBrowser(i){
      browserSpeak(queue[i], my, fireStart, function(r){
        if (my !== session) return;
        if (r === 'blocked'){ finish('blocked'); return; }
        playAt(i + 1);
      });
    }

    function playAt(i){
      if (my !== session) return;
      if (i >= queue.length){ finish(null); return; }
      if (!apiAvailable()){ viaBrowser(i); return; }
      fetchAudioUrl(queue[i]).then(function(url){
        if (my !== session) return;
        // mentre suona questo blocco, prepara già il successivo (niente pause tra i blocchi)
        if (i + 1 < queue.length && apiAvailable()) fetchAudioUrl(queue[i + 1]).catch(function(){});
        var a = getAudio();
        var handled = false;
        function fallback(){
          if (handled || my !== session) return;
          handled = true;
          a.onended = null; a.onerror = null;
          viaBrowser(i);
        }
        a.onended = function(){ if (handled || my !== session) return; handled = true; a.onended = null; a.onerror = null; playAt(i + 1); };
        a.onerror = fallback;
        a.src = url;
        var p;
        try { p = a.play(); } catch(e){ fallback(); return; }
        if (p && p.then){
          p.then(function(){ fireStart(); }).catch(function(err){
            if (handled || my !== session) return;
            if (err && err.name === 'NotAllowedError'){
              handled = true; a.onended = null; a.onerror = null;
              finish('blocked');
              return;
            }
            fallback();
          });
        } else {
          fireStart();
        }
      }).catch(function(){
        if (my !== session) return;
        viaBrowser(i);
      });
    }
    playAt(0);
    return my;
  }

  function speak(text, opts){
    opts = opts || {};
    return speakSequence([{ text: text }], opts);
  }

  window.SkyTTS = {
    speak: speak,
    speakSequence: speakSequence,
    stop: stop,
    unlock: unlock,
    splitText: splitText
  };
})();
