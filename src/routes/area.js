// Area clienti: ogni cliente vede e modifica SOLO le proprie barche.
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { q, one, all, settings } = require('../db');
const { requireUser, flash, token } = require('../auth');
const { loadBoat } = require('../boatdata');
const { GROUPS, TIPI, fromBody } = require('../boatfields');
const { upload, saveMany, sendPhoto } = require('../photos');
const { fetchMeteo, dir, seaState } = require('../meteo');
const { send, layout, enabled: mailEnabled } = require('../mail');

const r = express.Router();
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const dateOrNull = (v) => (DATE.test(v || '') ? v : null);
const clip = (v, n = 200) => String(v ?? '').trim().slice(0, n);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  handler: (req, res) => res.status(429).render('app/login', { error: res.locals.L.too_many, email: req.body?.email || '' }),
});

// ---------- accesso ----------
r.get('/', (req, res) => res.redirect(res.locals.user ? (res.locals.user.role === 'admin' ? '/admin' : '/area/home') : '/area/login'));

r.get('/login', (req, res) => {
  if (res.locals.user) return res.redirect('/area');
  res.render('app/login', { error: null, email: '' });
});

r.post('/login', loginLimiter, async (req, res) => {
  const email = clip(req.body.email).toLowerCase();
  const u = await one('SELECT * FROM users WHERE lower(email)=$1 AND active', [email]);
  const ok = u && (await bcrypt.compare(String(req.body.password || ''), u.password_hash));
  if (!ok) return res.status(401).render('app/login', { error: res.locals.L.bad_login, email });
  req.session.regenerate(async (err) => {
    if (err) throw err;
    req.session.uid = u.id;
    await q('UPDATE users SET last_login=now() WHERE id=$1', [u.id]);
    res.redirect(u.role === 'admin' ? '/admin' : '/area/home');
  });
});

r.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/area/login')));

r.get('/password', (req, res) => res.render('app/forgot', { done: false }));
r.post('/password', loginLimiter, async (req, res) => {
  if (!mailEnabled()) return res.render('app/forgot', { done: res.locals.L.forgot_nomail });
  const u = await one('SELECT * FROM users WHERE lower(email)=$1 AND active', [clip(req.body.email).toLowerCase()]);
  if (u) {
    const tk = token();
    await q("UPDATE users SET reset_token=$1, reset_expires=now() + interval '2 hours' WHERE id=$2", [tk, u.id]);
    const base = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const en = u.lang === 'en';
    await send(u.email, en ? 'Reset your password' : 'Nuova password area clienti',
      layout(en ? 'Reset your password' : 'Scegli una nuova password',
        [en ? 'Click the button to choose a new password. The link is valid for 2 hours.' : 'Clicca il pulsante per scegliere una nuova password. Il link vale 2 ore.',
         en ? 'If you did not ask for this, just ignore this email.' : 'Se non l\'hai chiesto tu, ignora questa email.'],
        { label: en ? 'Choose password' : 'Scegli la password', url: `${base}/area/reset/${tk}` }));
  }
  res.render('app/forgot', { done: res.locals.L.forgot_sent });
});

r.get('/reset/:tk', async (req, res) => {
  const u = await one('SELECT id FROM users WHERE reset_token=$1 AND reset_expires > now()', [req.params.tk]);
  res.render('app/reset', { valid: Boolean(u), error: null });
});
r.post('/reset/:tk', async (req, res) => {
  const L = res.locals.L;
  const u = await one('SELECT id FROM users WHERE reset_token=$1 AND reset_expires > now()', [req.params.tk]);
  if (!u) return res.render('app/reset', { valid: false, error: null });
  const p1 = String(req.body.p1 || ''), p2 = String(req.body.p2 || '');
  if (p1.length < 8) return res.render('app/reset', { valid: true, error: L.pw_short });
  if (p1 !== p2) return res.render('app/reset', { valid: true, error: L.pw_mismatch });
  await q('UPDATE users SET password_hash=$1, reset_token=NULL, reset_expires=NULL, must_change_password=false WHERE id=$2', [await bcrypt.hash(p1, 12), u.id]);
  flash(req, 'ok', L.pw_changed);
  res.redirect('/area/login');
});

// Foto condivise via WhatsApp: link pubblico non indovinabile, solo quell'intervento
r.get('/condividi/:tk', async (req, res) => {
  const c = await one('SELECT c.*, b.nome FROM cleanings c JOIN boats b ON b.id=c.boat_id WHERE c.share_token=$1', [req.params.tk]);
  if (!c) return res.status(404).render('error', { code: 404, message: res.locals.L.not_found });
  const photos = await all('SELECT id FROM photos WHERE cleaning_id=$1 ORDER BY id', [c.id]);
  res.render('app/shared', { c, photos });
});
r.get('/condividi/:tk/foto/:id', async (req, res) => {
  const p = await one(`SELECT p.data, p.thumb FROM photos p JOIN cleanings c ON c.id=p.cleaning_id
    WHERE c.share_token=$1 AND p.id=$2`, [req.params.tk, Number(req.params.id) || 0]);
  if (!p) return res.sendStatus(404);
  sendPhoto(res, p, req.query.t === '1' ? 'thumb' : 'big');
});

// ---------- da qui serve l'accesso ----------
r.use(requireUser);

// Barca corrente: sempre tra quelle del cliente loggato
r.use(async (req, res, next) => {
  if (res.locals.user.role === 'admin') return next();
  const boats = await all('SELECT id, nome FROM boats WHERE owner_id=$1 ORDER BY id', [res.locals.user.id]);
  res.locals.boats = boats;
  const want = Number(req.query.barca) || req.session.boatId;
  const cur = boats.find((b) => b.id === want) || boats[0] || null;
  req.session.boatId = cur ? cur.id : null;
  res.locals.boatId = req.session.boatId;
  res.locals.settings = await settings();
  next();
});

function needBoat(req, res, next) {
  if (res.locals.user.role === 'admin') return res.redirect('/admin');
  if (!res.locals.boatId) return res.render('app/noboat');
  next();
}

r.get('/home', needBoat, async (req, res) => {
  const d = await loadBoat(res.locals.boatId);
  const meteo = await Promise.race([fetchMeteo(), new Promise((ok) => setTimeout(() => ok(null), 4000))]);
  res.render('app/home', { d, meteo, dir, seaState });
});

r.get('/scheda', needBoat, async (req, res) => {
  const d = await loadBoat(res.locals.boatId);
  res.render('app/scheda', { d, GROUPS, TIPI, action: '/area/scheda' });
});
r.post('/scheda', needBoat, async (req, res) => {
  const v = fromBody(req.body);
  const cols = Object.keys(v);
  const old = await one('SELECT scad_assicurazione FROM boats WHERE id=$1 AND owner_id=$2', [res.locals.boatId, res.locals.user.id]);
  const resetAss = old && old.scad_assicurazione !== v.scad_assicurazione;
  await q(`UPDATE boats SET ${cols.map((c, i) => `${c}=$${i + 1}`).join(', ')}, updated_at=now()${resetAss ? ', assic_alert_sent=false' : ''}
    WHERE id=$${cols.length + 1} AND owner_id=$${cols.length + 2}`, [...cols.map((c) => v[c]), res.locals.boatId, res.locals.user.id]);
  flash(req, 'ok', res.locals.L.saved);
  res.redirect('/area/scheda');
});

r.get('/manutenzione', needBoat, async (req, res) => {
  const d = await loadBoat(res.locals.boatId);
  res.render('app/manutenzione', { d, base: '/area', canEditCleanings: false });
});

r.post('/promemoria', needBoat, async (req, res) => {
  const v = req.body.remove ? null : dateOrNull(req.body.data);
  await q('UPDATE boats SET prox_pulizia=$1, prox_pulizia_sent=false WHERE id=$2 AND owner_id=$3', [v, res.locals.boatId, res.locals.user.id]);
  flash(req, 'ok', res.locals.L.saved);
  res.redirect('/area/manutenzione#pulizia');
});

// Anodi: gestiti dal cliente
const anodeVals = (b) => [clip(b.posizione), clip(b.codice), clip(b.dati), dateOrNull(b.data_montaggio), dateOrNull(b.data_alert), clip(b.note, 1000)];

r.post('/anodi', needBoat, upload.array('foto', 5), async (req, res) => {
  const a = await one(`INSERT INTO anodes(boat_id, posizione, codice, dati, data_montaggio, data_alert, note, updated_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'client') RETURNING id`, [res.locals.boatId, ...anodeVals(req.body)]);
  await saveMany(req.files, { boatId: res.locals.boatId, anodeId: a.id });
  flash(req, 'ok', res.locals.L.saved);
  res.redirect('/area/manutenzione#anodi');
});

r.post('/anodi/:id', needBoat, upload.array('foto', 5), async (req, res) => {
  const a = await one('SELECT * FROM anodes WHERE id=$1 AND boat_id=$2', [Number(req.params.id) || 0, res.locals.boatId]);
  if (!a) return res.sendStatus(404);
  const v = anodeVals(req.body);
  const alertChanged = (a.data_alert || null) !== v[4];
  await q(`UPDATE anodes SET posizione=$1, codice=$2, dati=$3, data_montaggio=$4, data_alert=$5, note=$6, updated_by='client', updated_at=now()
    ${alertChanged ? ', alert_sent=false' : ''} WHERE id=$7`, [...v, a.id]);
  await saveMany(req.files, { boatId: res.locals.boatId, anodeId: a.id });
  flash(req, 'ok', res.locals.L.saved);
  res.redirect('/area/manutenzione#anodo-' + a.id);
});

r.post('/anodi/:id/elimina', needBoat, async (req, res) => {
  await q('DELETE FROM anodes WHERE id=$1 AND boat_id=$2', [Number(req.params.id) || 0, res.locals.boatId]);
  res.redirect('/area/manutenzione#anodi');
});

r.post('/foto/:id/elimina', needBoat, async (req, res) => {
  // il cliente può togliere solo le foto dei suoi anodi, non quelle degli interventi
  await q('DELETE FROM photos WHERE id=$1 AND boat_id=$2 AND anode_id IS NOT NULL', [Number(req.params.id) || 0, res.locals.boatId]);
  res.redirect('/area/manutenzione#anodi');
});

r.get('/posizione', needBoat, async (req, res) => {
  const d = await loadBoat(res.locals.boatId);
  res.render('app/posizione', { d, action: '/area/posizione' });
});
r.post('/posizione', needBoat, async (req, res) => {
  const lat = Number(req.body.lat), lng = Number(req.body.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    await q('UPDATE boats SET lat=$1, lng=$2, pos_updated=now() WHERE id=$3 AND owner_id=$4', [lat, lng, res.locals.boatId, res.locals.user.id]);
    flash(req, 'ok', res.locals.L.pos_saved);
  }
  res.redirect('/area/posizione');
});

// Richiesta intervento: la registriamo e apriamo WhatsApp
r.get('/richiesta', needBoat, async (req, res) => {
  const b = await one('SELECT nome, targa FROM boats WHERE id=$1', [res.locals.boatId]);
  await q('INSERT INTO requests(boat_id, user_id, motivo) VALUES ($1,$2,$3)', [res.locals.boatId, res.locals.user.id, clip(req.query.motivo || 'intervento')]);
  const txt = res.locals.lang === 'en'
    ? `Hello Anfibiasub, I would like to request a job for ${b.nome}${b.targa ? ' (' + b.targa + ')' : ''}.`
    : `Ciao Anfibiasub, vorrei richiedere un intervento per ${b.nome}${b.targa ? ' (' + b.targa + ')' : ''}.`;
  res.redirect(`https://wa.me/${res.locals.settings.whatsapp}?text=${encodeURIComponent(txt)}`);
});

r.get('/foto/:id', async (req, res) => {
  const p = res.locals.user.role === 'admin'
    ? await one('SELECT data, thumb FROM photos WHERE id=$1', [Number(req.params.id) || 0])
    : await one('SELECT p.data, p.thumb FROM photos p JOIN boats b ON b.id=p.boat_id WHERE p.id=$1 AND b.owner_id=$2', [Number(req.params.id) || 0, res.locals.user.id]);
  if (!p) return res.sendStatus(404);
  sendPhoto(res, p, req.query.t === '1' ? 'thumb' : 'big');
});

r.get('/profilo', (req, res) => res.render('app/profilo', { error: null }));
r.post('/profilo', async (req, res) => {
  const lang = req.body.lang === 'en' ? 'en' : 'it';
  await q('UPDATE users SET name=$1, phone=$2, lang=$3 WHERE id=$4', [clip(req.body.name), clip(req.body.phone), lang, res.locals.user.id]);
  flash(req, 'ok', require('../i18n').t(lang).saved);
  res.redirect('/area/profilo');
});
r.post('/profilo/password', async (req, res) => {
  const L = res.locals.L;
  const u = await one('SELECT password_hash FROM users WHERE id=$1', [res.locals.user.id]);
  const p1 = String(req.body.p1 || ''), p2 = String(req.body.p2 || '');
  let error = null;
  if (!(await bcrypt.compare(String(req.body.current || ''), u.password_hash))) error = L.pw_wrong;
  else if (p1.length < 8) error = L.pw_short;
  else if (p1 !== p2) error = L.pw_mismatch;
  if (error) return res.status(400).render('app/profilo', { error });
  await q('UPDATE users SET password_hash=$1, must_change_password=false WHERE id=$2', [await bcrypt.hash(p1, 12), res.locals.user.id]);
  flash(req, 'ok', L.pw_changed);
  res.redirect(res.locals.user.role === 'admin' ? '/admin' : '/area/home');
});

module.exports = r;
