const session = require('express-session');
const PgStore = require('connect-pg-simple')(session);
const crypto = require('crypto');
const { pool, one } = require('./db');
const { t, fill, fmtDate, isoDate, LANGS, LANG_NAMES, SITE_HOME, PRIVACY_URL, pickLang } = require('./i18n');
const { COLORS } = require('./status');

function sessionMiddleware() {
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
    console.error('Manca SESSION_SECRET: impostala nelle variabili di Railway.');
    process.exit(1);
  }
  return session({
    store: new PgStore({ pool, createTableIfMissing: true }),
    name: 'anf.sid',
    secret: process.env.SESSION_SECRET || 'solo-sviluppo-locale',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 giorni
    },
  });
}

// Blocca i POST che arrivano da altri siti (protezione CSRF)
function sameOrigin(req, res, next) {
  if (req.method !== 'POST') return next();
  const origin = req.get('origin') || req.get('referer');
  if (!origin) return next();
  try {
    if (new URL(origin).host === req.get('host')) return next();
  } catch (_) { /* origine non valida */ }
  res.status(403).send('Richiesta non consentita');
}

// Carica l'utente e prepara le variabili per le pagine
async function loadUser(req, res, next) {
  res.locals.user = null;
  if (req.session.uid) {
    const u = await one('SELECT id, email, name, phone, role, lang, active, must_change_password FROM users WHERE id=$1', [req.session.uid]);
    if (u && u.active) res.locals.user = u;
    else req.session.uid = null;
  }
  if (LANGS.includes(req.query.lang)) req.session.lang = req.query.lang;
  res.locals.lang = pickLang(res.locals.user ? res.locals.user.lang : req.session.lang);
  res.locals.LANGS = LANGS;
  res.locals.LANG_NAMES = LANG_NAMES;
  res.locals.SITE_HOME = SITE_HOME;
  res.locals.PRIVACY_URL = PRIVACY_URL;
  res.locals.fill = fill;
  res.locals.tr = t;
  res.locals.L = t(res.locals.lang);
  res.locals.fmtDate = (d) => fmtDate(d, res.locals.lang);
  res.locals.isoDate = isoDate;
  res.locals.COLORS = COLORS;
  res.locals.path = req.path;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
}

function flash(req, type, msg) { req.session.flash = { type, msg }; }

function requireUser(req, res, next) {
  if (!res.locals.user) return res.redirect('/area/login');
  if (res.locals.user.must_change_password && !/^\/(profilo|logout)/.test(req.path)) {
    return res.redirect('/area/profilo');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!res.locals.user) return res.redirect('/area/login');
  if (res.locals.user.role !== 'admin') return res.status(403).render('error', { code: 403, message: 'Accesso riservato ad Anfibiasub.' });
  next();
}

const token = (n = 24) => crypto.randomBytes(n).toString('base64url');

// Password temporanea leggibile (niente caratteri ambigui)
function tempPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (const b of crypto.randomBytes(10)) s += chars[b % chars.length];
  return s;
}

module.exports = { sessionMiddleware, sameOrigin, loadUser, requireUser, requireAdmin, flash, token, tempPassword };
