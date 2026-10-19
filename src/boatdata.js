const { one, all, settings } = require('./db');
const { cleaningStatus, anodeStatus, anodesStatus } = require('./status');
const { completeness } = require('./boatfields');

async function loadBoat(boatId) {
  const s = await settings();
  const boat = await one('SELECT * FROM boats WHERE id=$1', [boatId]);
  if (!boat) return null;
  const cleanings = await all('SELECT * FROM cleanings WHERE boat_id=$1 ORDER BY data DESC, id DESC', [boatId]);
  const cphotos = await all('SELECT id, cleaning_id FROM photos WHERE boat_id=$1 AND cleaning_id IS NOT NULL ORDER BY id', [boatId]);
  for (const c of cleanings) c.photos = cphotos.filter((p) => p.cleaning_id === c.id).map((p) => p.id);
  const anodes = await all('SELECT * FROM anodes WHERE boat_id=$1 ORDER BY posizione, id', [boatId]);
  const aphotos = await all('SELECT id, anode_id FROM photos WHERE boat_id=$1 AND anode_id IS NOT NULL ORDER BY id DESC', [boatId]);
  for (const a of anodes) {
    a.photos = aphotos.filter((p) => p.anode_id === a.id).map((p) => p.id);
    a.status = anodeStatus(a, s);
  }
  const last = cleanings[0] || null;
  return {
    s, boat, cleanings, anodes, last,
    cleaningStatus: cleaningStatus(last?.data, s),
    anodesStatus: anodesStatus(anodes, s),
    anodesToCheck: anodes.filter((a) => a.status === 'warn' || a.status === 'bad').length,
    completeness: completeness(boat),
  };
}

module.exports = { loadBoat };
