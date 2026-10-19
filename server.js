// Anfibiasub: sito pubblico + area clienti Boat Care + pannello Anfibiasub
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { migrate } = require('./src/db');
const { sessionMiddleware, sameOrigin, loadUser } = require('./src/auth');
const reminders = require('./src/reminders');

const app = express();
app.set('trust proxy', 1); // Railway sta dietro un proxy HTTPS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
// valori di partenza per le pagine (sovrascritti da loadUser)
// versione dei file CSS/JS: cambia a ogni modifica, così i browser non usano copie vecchie
const ASSET_V = require('crypto').createHash('md5').update(['public/css/style.css', 'public/css/app.css', 'public/js/app.js', 'public/js/guida.js', 'public/js/skytts.js', 'public/js/register.js'].map((f) => require('fs').readFileSync(path.join(__dirname, f))).join('')).digest('hex').slice(0, 8);
Object.assign(app.locals, { ASSET_V, user: null, lang: 'it', L: require('./src/i18n').t('it'), path: '', flash: null });

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://*.tile.openstreetmap.org'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.open-meteo.com', 'https://marine-api.open-meteo.com'],
      mediaSrc: ["'self'", 'blob:'],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  // con 'no-referrer' Chrome manda Origin: null sui form e il controllo anti-CSRF li bloccherebbe
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(compression());
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Sito pubblico (pagine statiche IT/EN). Con SERVE_SITE=off la radice porta all'area clienti
// (serve quando il sito sta su anfibiasub.it e qui resta solo clienti.anfibiasub.it).
const serveSite = process.env.SERVE_SITE !== 'off';
if (!serveSite) app.get('/', (req, res) => res.redirect('/area'));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d', index: serveSite ? 'index.html' : false, extensions: ['html'],
  // le pagine html vanno sempre ricontrollate, così dopo un aggiornamento anche il telefono vede la versione nuova
  setHeaders: (res, file) => { if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache'); },
}));

app.get('/health', (req, res) => res.send('ok'));

app.use(sessionMiddleware());
app.use(sameOrigin);
app.use(loadUser);
app.use('/api', require('./src/tts'));
app.use('/area', require('./src/routes/area'));
app.use('/admin', require('./src/routes/admin'));
app.get('/condividi/:tk', (req, res) => res.redirect(`/area/condividi/${encodeURIComponent(req.params.tk)}`));

app.use((req, res) => res.status(404).render('error', { code: 404, message: res.locals.L ? res.locals.L.not_found : 'Pagina non trovata.' }));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Una foto supera i 25 MB.' : (res.locals.L ? res.locals.L.error : 'Errore.');
  res.status(500).render('error', { code: 500, message: msg });
});

const port = process.env.PORT || 3000;
// Primo avvio: crea l'amministratore da ADMIN_EMAIL / ADMIN_PASSWORD se non ne esiste nessuno
async function firstAdmin() {
  const { one, q } = require('./src/db');
  if (await one("SELECT 1 FROM users WHERE role='admin'")) return;
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const pw = process.env.ADMIN_PASSWORD || '';
  if (!email || pw.length < 8) { console.log('Nessun amministratore: imposta ADMIN_EMAIL e ADMIN_PASSWORD (min 8 caratteri) e riavvia.'); return; }
  const hash = await require('bcryptjs').hash(pw, 12);
  await q("INSERT INTO users(email, password_hash, name, role, must_change_password) VALUES ($1,$2,'Creator','admin',false)", [email, hash]);
  console.log('Amministratore creato:', email);
}

migrate()
  .then(firstAdmin)
  .then(() => {
    app.listen(port, () => console.log(`Anfibiasub in ascolto sulla porta ${port}`));
    reminders.start();
  })
  .catch((e) => { console.error('Database non raggiungibile:', e.message); process.exit(1); });
