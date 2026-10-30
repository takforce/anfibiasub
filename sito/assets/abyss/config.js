// Configurazione unica di ABYSS: luoghi, reperti, indizi, combinazione.
// Il codice della botola deriva SOLO da qui: ogni reperto porta un simbolo e una cifra,
// le ghiere della botola mostrano gli stessi simboli nello stesso ordine.
// Coordinate in metri: x verso est, z verso sud (il nord è -z), y verso l'alto.

export const CFG = {
  seabed: -30,              // profondità media del fondale (m)
  limit: 92,                // raggio esplorabile (m)
  cliff: 78,                // da qui il fondale precipita verso il blu
  shipScale: 1.7,           // il cargo è lungo circa 43 m
  start: { x: 15, y: -1.6, z: 25, yaw: 0.54, pitch: -0.35 },
  line: { x: 15, z: 23.5, bx: 14, bz: 6 },   // cima d'ormeggio: boa in superficie -> corpo morto sul fondo
  torch: { angle: 0.42, range: 26, autoOnDepth: 9 },
  swim: { accel: 3.4, fast: 2.0, drag: 1.6, radius: 0.38 },
  interactDist: 3.2,

  // luoghi intorno al relitto (lontani 50-60 m)
  places: {
    grotta: { x: -52, z: 18, name: 'la grotta' },
    peschereccio: { x: 34, z: 40, name: 'l\'elicottero affondato' },
    anfore: { x: 6, z: -52, name: 'il campo di anfore' },
    arco: { x: -50, z: 57, name: 'l\'arco di roccia' },
  },

  // presenza di Anfibiasub nel gioco (cantiere, pallone di sollevamento, targa sul relitto)
  ads: { x: 11.5, z: 9.5, rot: 0.35, bx: -3, bz: -12, plaque: [-7.6, 5.6, 0] },

  // statue del palombaro con l'ancora ANFIBIASUB: lungo le rotte verso i luoghi dei reperti, rivolte verso il relitto
  statues: [
    { x: -23.0, z: 4.3, rot: 1.75 }, { x: -36.5, z: 15.8, rot: 1.98 }, { x: 11.6, z: 19.1, rot: -2.59 }, { x: 26.8, z: 26.9, rot: -2.36 },
    { x: 6.0, z: -21.4, rot: -0.27 }, { x: 1.3, z: -37.8, rot: -0.04 }, { x: -23.6, z: 21.6, rot: 2.31 }, { x: -33.7, z: 43.0, rot: 2.48 },
    { x: -24.0, z: -4.0, rot: 1.41 }, { x: 27.0, z: 10.0, rot: -1.93 },
  ],

  // cartelli con i servizi di Anfibiasub, sparsi sul fondale lontano dal relitto (rivolti verso il relitto)
  serviceSigns: [
    { x: 45, z: -20 }, { x: 60, z: 15 }, { x: -30, z: -40 }, { x: -65, z: -10 }, { x: 20, z: 66 },
    { x: -15, z: 66 }, { x: 40, z: -55 }, { x: -62, z: 36 }, { x: 62, z: -32 }, { x: -40, z: -56 },
  ],

  // palloni di sollevamento sparsi (oltre a quello del cantiere): L = lunghezza delle cime
  liftBags: [
    { x: -14, z: -20, L: 4.5 }, { x: 26, z: -22, L: 3 }, { x: -36, z: 30, L: 5 }, { x: 46, z: 2, L: 2.8 }, { x: -44, z: -12, L: 3.6 }, { x: 18, z: 52, L: 4 },
  ],
  // aereo ultraleggero affondato vicino al relitto
  plane: { x: -4, z: 19, rot: 0.9, tiktok: 'tiktok.png' },   // tiktok: nome del file ufficiale del simbolo in abyss/tex/ (es. 'tiktok.png')
  // ponte di sabbia con il cancello della Missione 2, sul bordo del mondo (angolo da est, distanza dal centro)
  gate: { ang: -0.14, r: 74, len: 15 },   // il ponte parte a 74 m dal centro, è lungo 15 m; il cancello è in fondo

  // ordine delle ghiere sulla botola = ordine delle cifre del codice
  dials: ['rosa', 'ancora', 'chiave'],

  artifacts: [
    {
      id: 'bussola', name: 'Bussola antica', symbol: 'rosa', digit: 3, place: 'grotta',
      img: '/img/abyss/bussola.webp',
      found: 'Una bussola navale in ottone, sepolta in fondo alla grotta. Sul quadrante, sotto la rosa dei venti, è incisa una cifra.',
      clue: 'Rosa dei venti → 3',
    },
    {
      id: 'targhetta', name: 'Targhetta di bordo', symbol: 'ancora', digit: 1, place: 'peschereccio',
      img: '/img/abyss/targhetta.webp',
      found: 'Tra i rottami dell\'elicottero affondato, una targhetta del cargo strappata da una paratia. Accanto all\'ancora incisa c\'è un numero.',
      clue: 'Ancora → 1',
    },
    {
      id: 'chiave', name: 'Chiave in ottone', symbol: 'chiave', digit: 4, place: 'anfore',
      img: '/img/abyss/chiave.webp',
      found: 'Tra i cocci delle anfore, una grossa chiave in ottone. Alla chiave è legata una piccola targa con il simbolo della chiave e una cifra.',
      clue: 'Chiave → 4',
    },
  ],

  // seconda missione: dentro la camera nascosta
  logbook: {
    name: 'Giornale di bordo',
    // la rotta e la distanza scritte sulla pagina vengono calcolate dalla posizione vera dell'arco
    from: 'poppa',
  },
  casket: {
    id: 'cofanetto', name: 'Cofanetto del capitano', place: 'arco',
    found: 'Il cofanetto del capitano. Dentro, avvolta in una tela cerata, c\'è una medaglia d\'argento e una lettera: «A chi troverà questo relitto: il mare restituisce solo a chi sa cercare.»',
  },

  // Immagini generate con l'IA (opzionali). Quando un file esiste, scrivere qui il percorso:
  // verrà usato al posto della versione disegnata dal codice. null = disegno generato.
  // pesci: PNG trasparente 1024x512, pesce di profilo rivolto a destra (es. '/img/abyss/pesci/castagnola.png')
  skins: { castagnola: null, sarago: null, cernia: null },
  // texture ripetibili (seamless) 1024x1024 al posto di quelle generate (es. '/img/abyss/tex/sabbia.webp')
  textures: { sabbia: 'sand', roccia: 'rock', ruggine: 'rust', legno: 'wood', terracotta: null },   // file in abyss/tex/: <nome>_c.jpg (colore) e <nome>_n.jpg (rilievo); _m = versione leggera per telefoni
  // Modelli GLB definitivi (opzionali): stesso principio.
  models: { bussola: null, targhetta: null, chiave: null, elmo: null, cofanetto: null },
};

// sul ponte del cancello (sopra l'abisso) lo squalo non attacca: è la strada per la Missione 2
export function onBridge(x, z) {
  const G = CFG.gate, c = Math.cos(G.ang), s = Math.sin(G.ang);
  const along = x * c + z * s, across = -x * s + z * c;
  return along > G.r - 2 && along < G.r + G.len + 1 && Math.abs(across) < 2.6;
}

export const CODE = CFG.dials.map((s) => CFG.artifacts.find((a) => a.symbol === s).digit);

// rotta in gradi (0 = nord, 90 = est) da un punto a un altro
export const bearing = (from, to) => ((Math.atan2(to.x - from.x, -(to.z - from.z)) * 180 / Math.PI) + 360) % 360;
