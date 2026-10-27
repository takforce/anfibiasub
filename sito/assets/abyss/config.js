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
    peschereccio: { x: 34, z: 40, name: 'il peschereccio capovolto' },
    anfore: { x: 6, z: -52, name: 'il campo di anfore' },
    arco: { x: -50, z: 57, name: 'l\'arco di roccia' },
  },

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
      found: 'Sotto lo scafo del peschereccio capovolto, una targhetta del cargo strappata da una paratia. Accanto all\'ancora incisa c\'è un numero.',
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
  textures: { sabbia: null, roccia: null, ruggine: null, legno: null, terracotta: null },
  // Modelli GLB definitivi (opzionali): stesso principio.
  models: { bussola: null, targhetta: null, chiave: null, elmo: null, cofanetto: null },
};

export const CODE = CFG.dials.map((s) => CFG.artifacts.find((a) => a.symbol === s).digit);

// rotta in gradi (0 = nord, 90 = est) da un punto a un altro
export const bearing = (from, to) => ((Math.atan2(to.x - from.x, -(to.z - from.z)) * 180 / Math.PI) + 360) % 360;
