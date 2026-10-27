// Configurazione unica di ABYSS: reperti, indizi, combinazione, mondo.
// Il codice della botola deriva SOLO da qui: ogni reperto porta un simbolo e una cifra,
// le ghiere della botola mostrano gli stessi simboli nello stesso ordine.

export const CFG = {
  seabed: -30,              // profondità media del fondale (m)
  limit: 70,                // raggio esplorabile (m)
  start: { x: 4.6, y: -1.6, z: 21.5, yaw: 0.25, pitch: -0.35 },
  line: { x: 4, z: 20.5, bx: 6.5, bz: 9.5 },   // cima d'ormeggio: boa in superficie -> corpo morto sul fondo
  torch: { angle: 0.42, range: 26, autoOnDepth: 9 },
  swim: { accel: 3.2, fast: 1.9, drag: 1.6, radius: 0.38 },
  interactDist: 3.2,

  // ordine delle ghiere sulla botola = ordine delle cifre del codice
  dials: ['rosa', 'ancora', 'chiave'],

  artifacts: [
    {
      id: 'bussola', name: 'Bussola antica', symbol: 'rosa', digit: 3,
      img: '/img/abyss/bussola.webp',
      found: 'Una bussola navale in ottone, mezza sepolta nella sabbia. Sul quadrante, sotto la rosa dei venti, è incisa una cifra.',
      clue: 'Rosa dei venti → 3',
    },
    {
      id: 'targhetta', name: 'Targhetta del cargo', symbol: 'ancora', digit: 1,
      img: '/img/abyss/targhetta.webp',
      found: 'Una targhetta corrosa dal tempo, rivettata a un pezzo di scafo. Accanto all\'ancora incisa c\'è un numero: potrebbe essere importante.',
      clue: 'Ancora → 1',
    },
    {
      id: 'chiave', name: 'Chiave in ottone', symbol: 'chiave', digit: 4,
      img: '/img/abyss/chiave.webp',
      found: 'Una grossa chiave in ottone, incastrata sotto la catena. Alla chiave è legata una piccola targa con il simbolo della chiave e una cifra.',
      clue: 'Chiave → 4',
    },
  ],

  // Modelli GLB definitivi: quando un file esiste in sito/assets/abyss/models/, scrivere qui il percorso
  // (es. bussola: '/abyss/models/bussola.glb') e sostituirà il modello generato via codice.
  // null = usa il modello generato (nessuna richiesta a file inesistenti).
  models: { bussola: null, targhetta: null, chiave: null, elmo: null },
};

export const CODE = CFG.dials.map((s) => CFG.artifacts.find((a) => a.symbol === s).digit);
