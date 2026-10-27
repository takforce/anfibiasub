// Sondaggio di fine partita del gioco ABYSS: "Voglio un'altra missione".
// POST /api/abyss/voto  { altra: true|false, voto: 1-5, commento: "..." }
// Salva nel database e manda un'email (quando Brevo è attivo) all'indirizzo in
// ABYSS_EMAIL, oppure a quello delle Impostazioni (admin_email). Nessun dato personale.
const express = require('express');
const rateLimit = require('express-rate-limit');
const { q, one } = require('./db');
const mail = require('./mail');

const router = express.Router();
// il gioco può stare su www.anfibiasub.it (HostGator) e chiamare clienti.anfibiasub.it
const ORIGINS = new Set(['https://www.anfibiasub.it', 'https://anfibiasub.it']);
router.use((req, res, next) => {
  const o = req.get('origin');
  if (o && ORIGINS.has(o)) { res.set('Access-Control-Allow-Origin', o); res.set('Vary', 'Origin'); }
  if (req.method === 'OPTIONS') { res.set('Access-Control-Allow-Methods', 'POST'); res.set('Access-Control-Allow-Headers', 'content-type'); return res.sendStatus(204); }
  next();
});
const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

router.post('/voto', limiter, express.json({ limit: '4kb' }), async (req, res) => {
  const o = req.get('origin');
  let same = true; try { same = !o || ORIGINS.has(o) || new URL(o).host === req.get('host'); } catch (_) { same = false; }
  if (!same) return res.status(403).json({ ok: false });
  const b = req.body || {};
  const altra = b.altra === true;
  const voto = Math.max(0, Math.min(5, parseInt(b.voto, 10) || 0));
  const commento = String(b.commento || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 500);
  try {
    await q('INSERT INTO abyss_feedback(altra, voto, commento, ua) VALUES ($1,$2,$3,$4)', [altra, voto, commento, String(req.get('user-agent') || '').slice(0, 200)]);
    const tot = await one('SELECT count(*)::int AS n, count(*) FILTER (WHERE altra)::int AS si FROM abyss_feedback');
    const to = process.env.ABYSS_EMAIL || (await one("SELECT value FROM settings WHERE key='admin_email'") || {}).value;
    const stelle = voto ? '★'.repeat(voto) + '☆'.repeat(5 - voto) : 'nessun voto';
    mail.send(to, altra ? 'ABYSS: qualcuno vuole un\'altra missione!' : 'ABYSS: nuova risposta al sondaggio',
      mail.layout('Sondaggio ABYSS', [
        `<b>Un'altra missione?</b> ${altra ? 'Sì' : 'No'}`,
        `<b>Voto:</b> ${stelle}`,
        commento ? `<b>Commento:</b> ${mail.esc(commento)}` : 'Nessun commento.',
        `Totale risposte: ${tot.n}, di cui ${tot.si} vogliono un'altra missione.`,
      ])).catch(() => {});
    res.json({ ok: true });
  } catch (e) {
    console.error('abyss voto', e.message);
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
