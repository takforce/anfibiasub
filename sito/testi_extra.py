# Testi del pulsante SOS (header + finestra di conferma), 4 lingue.
SOS = {
    'it': {
        'btn': 'SOS', 'title': 'SOS – Barca in difficoltà',
        'text': 'Mandiamo la tua posizione GPS su WhatsApp a Francesco o a Simone. Usalo solo se hai davvero bisogno di aiuto.',
        'pos': 'La tua posizione', 'searching': 'Sto cercando la posizione…',
        'nopos': 'Posizione non disponibile: il messaggio partirà senza coordinate. Scrivi tu dove sei.',
        'acc': 'precisione', 'to_f': 'Invia SOS a Francesco', 'to_s': 'Invia SOS a Simone', 'cancel': 'Annulla',
        'emerg': 'Persone in pericolo? Chiama subito la Guardia Costiera',
    },
    'en': {
        'btn': 'SOS', 'title': 'SOS – Boat in trouble',
        'text': 'We send your GPS position on WhatsApp to Francesco or Simone. Use it only if you really need help.',
        'pos': 'Your position', 'searching': 'Finding your position…',
        'nopos': 'Position not available: the message will be sent without coordinates. Please write where you are.',
        'acc': 'accuracy', 'to_f': 'Send SOS to Francesco', 'to_s': 'Send SOS to Simone', 'cancel': 'Cancel',
        'emerg': 'People in danger? Call the Italian Coast Guard now',
    },
    'es': {
        'btn': 'SOS', 'title': 'SOS – Barco en apuros',
        'text': 'Enviamos tu posición GPS por WhatsApp a Francesco o a Simone. Úsalo solo si de verdad necesitas ayuda.',
        'pos': 'Tu posición', 'searching': 'Buscando tu posición…',
        'nopos': 'Posición no disponible: el mensaje saldrá sin coordenadas. Escribe tú dónde estás.',
        'acc': 'precisión', 'to_f': 'Enviar SOS a Francesco', 'to_s': 'Enviar SOS a Simone', 'cancel': 'Cancelar',
        'emerg': '¿Personas en peligro? Llama ya a la Guardia Costera italiana',
    },
    'de': {
        'btn': 'SOS', 'title': 'SOS – Boot in Not',
        'text': 'Wir senden Ihre GPS-Position per WhatsApp an Francesco oder Simone. Nur verwenden, wenn Sie wirklich Hilfe brauchen.',
        'pos': 'Ihre Position', 'searching': 'Position wird gesucht…',
        'nopos': 'Position nicht verfügbar: Die Nachricht wird ohne Koordinaten gesendet. Schreiben Sie, wo Sie sind.',
        'acc': 'Genauigkeit', 'to_f': 'SOS an Francesco senden', 'to_s': 'SOS an Simone senden', 'cancel': 'Abbrechen',
        'emerg': 'Menschen in Gefahr? Sofort die italienische Küstenwache anrufen',
    },
}

# Titolo della sezione "Giorni buoni" (usato come aria-label e titolo nella cornice)
GB_TITLE = {
    'it': 'Previsione interventi',
    'en': 'Job forecast',
    'es': 'Previsión de intervenciones',
    'de': 'Einsatzprognose',
}

# Modulo "Richiedi un preventivo": finestra con campi, invio su WhatsApp con messaggio precompilato.
# Il messaggio arriva sempre in italiano (lo leggono Francesco e Simone); qui solo le etichette a video.
QUOTE = {
    'it': {
        'title': 'Richiedi un preventivo', 'text': 'Compila i campi: si apre WhatsApp con il messaggio già scritto, devi solo premere invio.',
        'name': 'Nome e cognome', 'service': 'Servizio richiesto', 'choose': 'Scegli…', 'other': 'Altro',
        'boat': 'Barca', 'boat_ph': 'Tipo, modello, lunghezza', 'place': 'Porto e posto barca', 'place_ph': 'Es. Marina di Loano, pontile 5',
        'desc': 'Descrizione', 'desc_ph': 'Cosa serve, eventuali problemi', 'date': 'Data preferita',
        'to_f': 'Invia a Francesco', 'to_s': 'Invia a Simone', 'cancel': 'Annulla', 'req': 'obbligatorio',
    },
    'en': {
        'title': 'Request a quote', 'text': 'Fill in the fields: WhatsApp opens with the message ready, you just press send.',
        'name': 'Full name', 'service': 'Service needed', 'choose': 'Choose…', 'other': 'Other',
        'boat': 'Boat', 'boat_ph': 'Type, model, length', 'place': 'Port and berth', 'place_ph': 'E.g. Marina di Loano, pontoon 5',
        'desc': 'Description', 'desc_ph': 'What you need, any problems', 'date': 'Preferred date',
        'to_f': 'Send to Francesco', 'to_s': 'Send to Simone', 'cancel': 'Cancel', 'req': 'required',
    },
    'es': {
        'title': 'Pedir presupuesto', 'text': 'Rellena los campos: se abre WhatsApp con el mensaje ya escrito, solo tienes que enviarlo.',
        'name': 'Nombre y apellidos', 'service': 'Servicio solicitado', 'choose': 'Elige…', 'other': 'Otro',
        'boat': 'Barco', 'boat_ph': 'Tipo, modelo, eslora', 'place': 'Puerto y amarre', 'place_ph': 'Ej. Marina di Loano, pantalán 5',
        'desc': 'Descripción', 'desc_ph': 'Qué necesitas, posibles problemas', 'date': 'Fecha preferida',
        'to_f': 'Enviar a Francesco', 'to_s': 'Enviar a Simone', 'cancel': 'Cancelar', 'req': 'obligatorio',
    },
    'de': {
        'title': 'Angebot anfordern', 'text': 'Felder ausfüllen: WhatsApp öffnet sich mit der fertigen Nachricht, Sie müssen nur noch senden.',
        'name': 'Vor- und Nachname', 'service': 'Gewünschte Leistung', 'choose': 'Auswählen…', 'other': 'Sonstiges',
        'boat': 'Boot', 'boat_ph': 'Typ, Modell, Länge', 'place': 'Hafen und Liegeplatz', 'place_ph': 'z. B. Marina di Loano, Steg 5',
        'desc': 'Beschreibung', 'desc_ph': 'Was benötigt wird, eventuelle Probleme', 'date': 'Wunschtermin',
        'to_f': 'An Francesco senden', 'to_s': 'An Simone senden', 'cancel': 'Abbrechen', 'req': 'Pflichtfeld',
    },
}

# "Chiama ora" da PC: finestra con i numeri (dal cellulare resta la chiamata diretta).
CALL = {
    'it': {'title': 'Chiamaci', 'text': 'Dal computer non si può telefonare: chiama questi numeri dal cellulare oppure scrivici su WhatsApp.', 'wa': 'WhatsApp', 'close': 'Chiudi'},
    'en': {'title': 'Call us', 'text': 'You can\'t make calls from a computer: dial these numbers from your phone or message us on WhatsApp.', 'wa': 'WhatsApp', 'close': 'Close'},
    'es': {'title': 'Llámanos', 'text': 'Desde el ordenador no se puede llamar: marca estos números desde el móvil o escríbenos por WhatsApp.', 'wa': 'WhatsApp', 'close': 'Cerrar'},
    'de': {'title': 'Rufen Sie uns an', 'text': 'Vom Computer aus kann man nicht telefonieren: Wählen Sie diese Nummern mit dem Handy oder schreiben Sie uns auf WhatsApp.', 'wa': 'WhatsApp', 'close': 'Schließen'},
}
