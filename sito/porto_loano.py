# Mappa interattiva del porto di Loano (pagina Utilità): punti dei lavori Anfibiasub, 4 lingue.
# Posizioni indicative ricavate dalla descrizione dei lavori sul vecchio sito.
# Per correggerle: apri la pagina Utilità con ?modifica nell'indirizzo (es. /utilita.html?modifica#porto),
# trascina i punti e copia le coordinate che compaiono sotto la mappa.

PORTO_CENTER = [44.1334, 8.2660]

PORTO_TITLE = {
    'it': 'Porto di Loano: i nostri lavori',
    'en': 'Port of Loano: our work',
    'es': 'Puerto de Loano: nuestros trabajos',
    'de': 'Hafen Loano: unsere Arbeiten',
}
PORTO_LEAD = {
    'it': 'Le parti sommerse del porto di Loano le abbiamo costruite noi. Tocca i punti sulla mappa per vedere cosa abbiamo fatto e dove.',
    'en': 'We built the underwater parts of the port of Loano. Tap the points on the map to see what we did and where.',
    'es': 'Las partes sumergidas del puerto de Loano las construimos nosotros. Toca los puntos del mapa para ver qué hicimos y dónde.',
    'de': 'Die Unterwasserteile des Hafens Loano haben wir gebaut. Tippen Sie auf die Punkte der Karte, um zu sehen, was wir wo gemacht haben.',
}
PORTO_MORE = {'it': 'Vedi il lavoro', 'en': 'See the job', 'es': 'Ver el trabajo', 'de': 'Zur Arbeit'}

# (id, [lat, lon], immagine, ancora nella pagina lavori/servizi, testi per lingua: (titolo, descrizione))
PORTO_PUNTI = [
    ('diga', [44.1318, 8.2676], 'porto-loano', ('lavori', 'porto-loano'), {
        'it': ('Diga foranea', 'Spianamento del fondale e posa dei blocchi prefabbricati in cemento che formano la base della diga.'),
        'en': ('Outer breakwater', 'Levelling of the seabed and laying of the precast concrete blocks that form the base of the breakwater.'),
        'es': ('Dique exterior', 'Nivelación del fondo y colocación de los bloques prefabricados de hormigón que forman la base del dique.'),
        'de': ('Außenmole', 'Einebnen des Meeresbodens und Verlegen der Betonfertigteile, die das Fundament der Mole bilden.'),
    }),
    ('pontili', [44.1342, 8.2662], 'catenarie', ('lavori', 'catenarie'), {
        'it': ('Pontili e ormeggi', 'Posa delle catenarie sul fondale con i rispettivi ormeggi per i posti barca.'),
        'en': ('Pontoons and moorings', 'Laying of the ground chains on the seabed with their moorings for the berths.'),
        'es': ('Pantalanes y amarres', 'Colocación de las cadenas madre en el fondo con sus amarres para los puestos de atraque.'),
        'de': ('Stege und Liegeplätze', 'Verlegen der Grundketten auf dem Meeresboden mit den Festmachern für die Liegeplätze.'),
    }),
    ('demolizioni', [44.1326, 8.2634], 'demolizioni', ('lavori', 'demolizioni'), {
        'it': ('Demolizioni sommerse', 'Demolizione di strutture in ferro e cemento sott\'acqua durante la costruzione del porto.'),
        'en': ('Underwater demolition', 'Demolition of iron and concrete structures underwater during the construction of the port.'),
        'es': ('Demoliciones sumergidas', 'Demolición de estructuras de hierro y hormigón bajo el agua durante la construcción del puerto.'),
        'de': ('Unterwasser-Abbruch', 'Abbruch von Eisen- und Betonstrukturen unter Wasser beim Bau des Hafens.'),
    }),
    ('barche', [44.1349, 8.2678], 'pulizia-eliche', ('servizi', 'pulizia-eliche'), {
        'it': ('Assistenza alle barche', 'Pulizia di eliche e carene, sostituzione anodi e ispezioni direttamente al posto barca, senza alaggio.'),
        'en': ('Boat care', 'Propeller and hull cleaning, anode replacement and inspections right at the berth, with no haul-out.'),
        'es': ('Asistencia a los barcos', 'Limpieza de hélices y cascos, cambio de ánodos e inspecciones en el propio amarre, sin varada.'),
        'de': ('Bootsservice', 'Reinigung von Propellern und Rümpfen, Anodenwechsel und Inspektionen direkt am Liegeplatz, ohne Kranen.'),
    }),
    ('base', [44.1336, 8.2643], 'rimorchiatore', ('rimorchiatore', ''), {
        'it': ('Base Anfibiasub e rimorchiatore Elansa', 'Da qui partiamo per lavori, recuperi e assistenza alle imbarcazioni in difficoltà.'),
        'en': ('Anfibiasub base and Elansa tug', 'From here we leave for jobs, recoveries and assistance to boats in trouble.'),
        'es': ('Base Anfibiasub y remolcador Elansa', 'Desde aquí salimos para trabajos, rescates y asistencia a barcos en apuros.'),
        'de': ('Anfibiasub-Basis und Schlepper Elansa', 'Von hier fahren wir zu Arbeiten, Bergungen und zur Hilfe für Boote in Not.'),
    }),
]
