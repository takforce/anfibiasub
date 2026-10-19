// Semafori di manutenzione: verde / giallo / rosso / grigio.

function monthsSince(dateStr, now = new Date()) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00Z');
  return (now - d) / (1000 * 60 * 60 * 24 * 30.44);
}

function todayStr() {
  // Data di oggi in Italia
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
}

// Pulizia: in base alla data dell'ultimo intervento
function cleaningStatus(lastDate, s) {
  const m = monthsSince(lastDate);
  if (m === null) return 'none';
  if (m >= Number(s.pulizia_rosso_mesi)) return 'bad';
  if (m >= Number(s.pulizia_giallo_mesi)) return 'warn';
  return 'ok';
}

// Singolo anodo: mesi dal montaggio, oppure data avviso già passata
function anodeStatus(a, s) {
  const today = todayStr();
  const m = monthsSince(a.data_montaggio);
  let st = 'none';
  if (m !== null) {
    st = m >= Number(s.anodi_rosso_mesi) ? 'bad' : m >= Number(s.anodi_giallo_mesi) ? 'warn' : 'ok';
  }
  if (a.data_alert && a.data_alert <= today && st === 'ok') st = 'warn';
  if (st === 'none' && a.data_alert) st = a.data_alert <= today ? 'warn' : 'ok';
  return st;
}

const RANK = { none: 0, ok: 1, warn: 2, bad: 3 };

// Stato complessivo degli anodi = il peggiore
function anodesStatus(list, s) {
  if (!list.length) return 'none';
  let worst = 'ok';
  for (const a of list) {
    const st = anodeStatus(a, s);
    if (st !== 'none' && RANK[st] > RANK[worst]) worst = st;
  }
  return worst;
}

const COLORS = { ok: '#6EE08F', warn: '#FFC75A', bad: '#FF7A7A', none: '#9DB3C4' };

module.exports = { cleaningStatus, anodeStatus, anodesStatus, COLORS, todayStr, monthsSince };
