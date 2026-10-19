// Voce della guida: sintesi Microsoft Edge (voci neurali italiane), come in SkyApp.
// GET /api/speak?text=...&voice=elsa|isabella|diego&rate=-10  -> audio/mpeg
// Solo per utenti collegati. Se la sintesi non è disponibile la pagina usa la voce del browser.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const express = require('express');

let EdgeTTS = null;
try { ({ EdgeTTS } = require('node-edge-tts')); } catch (e) { console.warn('node-edge-tts non disponibile: la guida usa la voce del browser'); }

const VOICES = {
  elsa: { voice: 'it-IT-ElsaNeural', lang: 'it-IT' },
  isabella: { voice: 'it-IT-IsabellaNeural', lang: 'it-IT' },
  diego: { voice: 'it-IT-DiegoNeural', lang: 'it-IT' },
};
const MAX_CHARS = 500;

// frasi già sintetizzate: la guida è sempre la stessa, quindi quasi tutto arriva dalla memoria
const cache = new Map();
let cacheBytes = 0;
const CACHE_MAX = 20 * 1024 * 1024;
function cachePut(key, buf) {
  if (cache.has(key)) return;
  cache.set(key, buf); cacheBytes += buf.length;
  while (cacheBytes > CACHE_MAX && cache.size) {
    const k = cache.keys().next().value;
    cacheBytes -= cache.get(k).length; cache.delete(k);
  }
}

// limite di sintesi nuove per utente
const WINDOW = 10 * 60 * 1000, MAX_REQ = 150;
const hits = new Map();
function rateOk(id) {
  const now = Date.now();
  const e = hits.get(id) || { n: 0, reset: now + WINDOW };
  if (now > e.reset) { e.n = 0; e.reset = now + WINDOW; }
  e.n++; hits.set(id, e);
  return e.n <= MAX_REQ;
}
setInterval(() => { const now = Date.now(); for (const [k, e] of hits) if (now > e.reset) hits.delete(k); }, 30 * 60 * 1000).unref();

const r = express.Router();
r.get('/speak', async (req, res) => {
  if (!res.locals.user) return res.status(401).json({ error: 'Accesso richiesto' });
  if (!EdgeTTS) return res.status(503).json({ error: 'Sintesi vocale non disponibile' });
  let text = String(req.query.text || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return res.status(400).json({ error: 'Testo mancante' });
  if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS);
  const v = VOICES[String(req.query.voice || 'elsa').toLowerCase()] || VOICES.elsa;
  let pct = parseInt(req.query.rate, 10);
  if (!Number.isFinite(pct)) pct = 0;
  pct = Math.max(-30, Math.min(30, pct));
  const rate = pct === 0 ? 'default' : (pct > 0 ? '+' : '') + pct + '%';
  const key = v.voice + '|' + rate + '|' + text;

  const send = (buf) => {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buf.length);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.end(buf);
  };
  const hit = cache.get(key);
  if (hit) { cache.delete(key); cache.set(key, hit); return send(hit); }
  if (!rateOk(String(res.locals.user.id))) return res.status(429).json({ error: 'Troppe richieste, riprova tra qualche minuto' });

  const tmp = path.join(os.tmpdir(), 'tts_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex') + '.mp3');
  try {
    const tts = new EdgeTTS({ voice: v.voice, lang: v.lang, outputFormat: 'audio-24khz-96kbitrate-mono-mp3', rate, timeout: 12000 });
    await tts.ttsPromise(text, tmp);
    const buf = fs.readFileSync(tmp);
    if (!buf.length) throw new Error('audio vuoto');
    cachePut(key, buf);
    send(buf);
  } catch (e) {
    console.warn('Sintesi vocale non riuscita:', e && e.message ? e.message : e);
    if (!res.headersSent) res.status(502).json({ error: 'Sintesi vocale non riuscita' });
  } finally {
    fs.unlink(tmp, () => {});
  }
});

module.exports = r;
