// Meteomare Loano da Open-Meteo (gratuito, senza chiave). Cache di 30 minuti.
const LAND = { lat: 44.1286, lng: 8.2589 };   // Loano
const SEA = { lat: 44.11, lng: 8.29 };        // poco al largo, per i dati sul moto ondoso

let cache = { at: 0, data: null };

const DIRS_IT = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
const DIRS_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const dir = (deg, lang) => (deg == null ? '' : (lang === 'en' ? DIRS_EN : DIRS_IT)[Math.round(deg / 45) % 8]);

function seaState(h, lang) {
  if (h == null) return '';
  const it = [[0.1, 'calmo'], [0.5, 'quasi calmo'], [1.25, 'poco mosso'], [2.5, 'mosso'], [4, 'molto mosso'], [6, 'agitato'], [99, 'grosso']];
  const en = [[0.1, 'calm'], [0.5, 'smooth'], [1.25, 'slight'], [2.5, 'moderate'], [4, 'rough'], [6, 'very rough'], [99, 'high']];
  return ((lang === 'en' ? en : it).find(([max]) => h <= max) || [0, ''])[1];
}

async function getJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

async function fetchMeteo() {
  if (cache.data && Date.now() - cache.at < 30 * 60 * 1000) return cache.data;
  try {
    const w = await getJson(`https://api.open-meteo.com/v1/forecast?latitude=${LAND.lat}&longitude=${LAND.lng}` +
      '&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m' +
      '&daily=wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,temperature_2m_max' +
      '&wind_speed_unit=kn&timezone=Europe%2FRome&forecast_days=4');
    let m = null;
    try {
      m = await getJson(`https://marine-api.open-meteo.com/v1/marine?latitude=${SEA.lat}&longitude=${SEA.lng}` +
        '&current=wave_height,sea_surface_temperature&daily=wave_height_max&timezone=Europe%2FRome&forecast_days=4');
    } catch (_) { /* i dati mare sono un di più */ }
    const days = (w.daily?.time || []).map((d, i) => ({
      date: d,
      wind: Math.round(w.daily.wind_speed_10m_max[i]),
      gust: Math.round(w.daily.wind_gusts_10m_max[i]),
      deg: w.daily.wind_direction_10m_dominant[i],
      temp: Math.round(w.daily.temperature_2m_max[i]),
      wave: m?.daily?.wave_height_max?.[i] ?? null,
    }));
    cache = {
      at: Date.now(),
      data: {
        wind: Math.round(w.current.wind_speed_10m),
        gust: Math.round(w.current.wind_gusts_10m),
        deg: w.current.wind_direction_10m,
        air: Math.round(w.current.temperature_2m),
        wave: m?.current?.wave_height ?? null,
        water: m?.current?.sea_surface_temperature != null ? Math.round(m.current.sea_surface_temperature) : null,
        days,
      },
    };
    return cache.data;
  } catch (e) {
    console.error('Meteo non disponibile:', e.message);
    return cache.data; // l'ultimo dato buono, se c'è
  }
}

module.exports = { fetchMeteo, dir, seaState };
