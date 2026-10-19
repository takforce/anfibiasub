// Campi della scheda imbarcazione (bozza del cliente, foglio 2)
const GROUPS = [
  { key: 'g_ident', fields: [
    ['nome', 'text'], ['targa', 'text'], ['matricola', 'text'], ['codice_scafo', 'text'],
    ['bandiera', 'text'], ['ufficio_reg', 'text'], ['lunghezza', 'text'],
  ], choice: ['utilizzo', ['privato', 'charter', 'commerciale'], 'u_'] },
  { key: 'g_build', fields: [['cantiere_modello', 'text'], ['anno', 'text']], choice: ['materiale', ['vetroresina', 'alluminio', 'legno', 'acciaio', 'altro'], 'm_'] },
  { key: 'g_engine', fields: [['motore_modello', 'text'], ['motore_serie', 'text'], ['potenza', 'text'], ['carburante', 'text'], ['serbatoi', 'text']] },
  { key: 'g_owner', fields: [['armatore_nome', 'text'], ['armatore_cell', 'tel'], ['armatore_email', 'email']] },
  { key: 'g_safety', fields: [['scad_assicurazione', 'date'], ['licenza_rtf', 'text'], ['mmsi', 'text'], ['call_sign', 'text']] },
  { key: 'g_berth', fields: [['porto', 'text'], ['posto_barca', 'text']] },
];

const TIPI = ['vela', 'motore', 'catamarano'];

const TEXT_FIELDS = GROUPS.flatMap((g) => g.fields.filter(([, ty]) => ty !== 'date').map(([k]) => k))
  .concat(GROUPS.filter((g) => g.choice).map((g) => g.choice[0]));

// Valori puliti dal form
function fromBody(body) {
  const out = {};
  for (const k of TEXT_FIELDS) out[k] = String(body[k] ?? '').trim().slice(0, 200);
  out.tipo = TIPI.includes(body.tipo) ? body.tipo : 'motore';
  out.scad_assicurazione = /^\d{4}-\d{2}-\d{2}$/.test(body.scad_assicurazione || '') ? body.scad_assicurazione : null;
  return out;
}

// Percentuale di campi compilati
function completeness(b) {
  const keys = GROUPS.flatMap((g) => g.fields.map(([k]) => k)).concat(['utilizzo', 'materiale']);
  const filled = keys.filter((k) => b[k] != null && String(b[k]).trim() !== '').length;
  return Math.round((filled / keys.length) * 100);
}

module.exports = { GROUPS, TIPI, fromBody, completeness, TEXT_FIELDS };
