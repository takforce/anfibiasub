// Promemoria automatici: controllo ogni ora, ogni avviso parte una sola volta.
const { q, all, settings } = require('./db');
const { send, layout, esc, enabled } = require('./mail');
const { t, fmtDate } = require('./i18n');
const { todayStr } = require('./status');

const appUrl = () => (process.env.APP_URL || '').replace(/\/$/, '');

async function run() {
  // Senza Brevo non segniamo nulla come inviato: gli avvisi partiranno appena le email sono attive
  if (!enabled()) return;
  const s = await settings();
  const today = todayStr();

  // Anodi con data di avviso raggiunta
  const anodes = await all(`SELECT a.*, b.nome AS barca, u.email, u.lang, u.name FROM anodes a
    JOIN boats b ON b.id=a.boat_id JOIN users u ON u.id=b.owner_id
    WHERE a.data_alert IS NOT NULL AND a.data_alert <= $1 AND NOT a.alert_sent AND u.active`, [today]);
  for (const a of anodes) {
    const L = t(a.lang);
    const subj = a.lang === 'en' ? `Anode check: ${a.barca}` : `Controllo anodi: ${a.barca}`;
    const body = a.lang === 'en'
      ? [`Hello ${esc(a.name)},`, `the reminder you set for the anode <b>${esc(a.posizione || a.codice)}</b> on <b>${esc(a.barca)}</b> is due today.`, 'Do you want us to check it? Reply on WhatsApp or from your customer area.']
      : [`Ciao ${esc(a.name)},`, `è arrivata la data di avviso per l'anodo <b>${esc(a.posizione || a.codice)}</b> di <b>${esc(a.barca)}</b>.`, 'Vuoi che lo controlliamo noi? Scrivici su WhatsApp o dall\'area clienti.'];
    await send(a.email, subj, layout(L.anodes, body, { label: L.area, url: appUrl() + '/area/manutenzione' }));
    await send(s.admin_email, `[Promemoria anodi] ${a.barca}`, layout('Promemoria anodi', [`Cliente: ${esc(a.name)} (${esc(a.email)})`, `Barca: ${esc(a.barca)}`, `Anodo: ${esc(a.posizione)} ${esc(a.codice)}, avviso del ${fmtDate(a.data_alert)}`]));
    await q('UPDATE anodes SET alert_sent=true WHERE id=$1', [a.id]);
  }

  // Prossima pulizia impostata dal cliente
  const boats = await all(`SELECT b.*, u.email, u.lang, u.name FROM boats b JOIN users u ON u.id=b.owner_id
    WHERE b.prox_pulizia IS NOT NULL AND b.prox_pulizia <= $1 AND NOT b.prox_pulizia_sent AND u.active`, [today]);
  for (const b of boats) {
    const L = t(b.lang);
    const subj = b.lang === 'en' ? `Hull cleaning reminder: ${b.nome}` : `Promemoria pulizia: ${b.nome}`;
    const body = b.lang === 'en'
      ? [`Hello ${esc(b.name)},`, `today is the date you chose for the next underwater cleaning of <b>${esc(b.nome)}</b>.`, 'Message us on WhatsApp to book it.']
      : [`Ciao ${esc(b.name)},`, `oggi è la data che avevi scelto per la prossima pulizia subacquea di <b>${esc(b.nome)}</b>.`, 'Scrivici su WhatsApp per fissare l\'intervento.'];
    await send(b.email, subj, layout(L.cleaning, body, { label: L.request_wa, url: `https://wa.me/${s.whatsapp}?text=${encodeURIComponent((b.lang === 'en' ? 'Hello, I would like to book a cleaning for ' : 'Ciao, vorrei fissare una pulizia per ') + b.nome)}` }));
    await send(s.admin_email, `[Promemoria pulizia] ${b.nome}`, layout('Promemoria pulizia', [`Cliente: ${esc(b.name)} (${esc(b.email)})`, `Barca: ${esc(b.nome)}`, `Data scelta dal cliente: ${fmtDate(b.prox_pulizia)}`]));
    await q('UPDATE boats SET prox_pulizia_sent=true WHERE id=$1', [b.id]);
  }

  // Assicurazione in scadenza entro 30 giorni
  const limit = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const ins = await all(`SELECT b.*, u.email, u.lang, u.name FROM boats b JOIN users u ON u.id=b.owner_id
    WHERE b.scad_assicurazione IS NOT NULL AND b.scad_assicurazione <= $1 AND b.scad_assicurazione >= $2 AND NOT b.assic_alert_sent AND u.active`, [limit, today]);
  for (const b of ins) {
    const L = t(b.lang);
    const subj = b.lang === 'en' ? `Insurance expiring: ${b.nome}` : `Assicurazione in scadenza: ${b.nome}`;
    const body = b.lang === 'en'
      ? [`Hello ${esc(b.name)},`, `the insurance of <b>${esc(b.nome)}</b> expires on <b>${fmtDate(b.scad_assicurazione)}</b>.`]
      : [`Ciao ${esc(b.name)},`, `l'assicurazione di <b>${esc(b.nome)}</b> scade il <b>${fmtDate(b.scad_assicurazione)}</b>.`];
    await send(b.email, subj, layout(L.insurance, body, { label: L.area, url: appUrl() + '/area/scheda' }));
    await q('UPDATE boats SET assic_alert_sent=true WHERE id=$1', [b.id]);
  }
}

function start() {
  const tick = () => run().catch((e) => console.error('Promemoria:', e.message));
  setTimeout(tick, 15 * 1000);
  setInterval(tick, 60 * 60 * 1000);
}

module.exports = { start, run };
