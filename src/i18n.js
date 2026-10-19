// Testi dell'area clienti in italiano e inglese.
const T = {
  it: {
    area: 'Area clienti', login_title: 'Accedi', login_sub: 'Le credenziali te le fornisce Anfibiasub.',
    email: 'Email', password: 'Password', enter: 'Entra', forgot: 'Password dimenticata?',
    no_access: 'Non hai un accesso?', write_wa: 'Scrivici su WhatsApp',
    bad_login: 'Email o password non corretti.', too_many: 'Troppi tentativi. Riprova tra qualche minuto.',
    logout: 'Esci', home: 'Home', boat_sheet: 'Scheda barca', maintenance: 'Manutenzione', position: 'Posizione', profile: 'Profilo',
    hero_area: 'La tua barca,', hero_area2: 'vista da sotto', hero_lead: 'Scheda imbarcazione, pulizie con le foto dei nostri sub, registro anodi e promemoria. Tutto qui.',
    request_wa: 'Richiedi intervento su WhatsApp', open: 'Apri', edit: 'Modifica',
    cleaning: 'Pulizia subacquea', anodes: 'Anodi', last_job: 'Ultimo intervento', next_job: 'Prossimo intervento',
    none_yet: 'Nessun intervento registrato', photos: 'foto', reminder_by_you: 'promemoria impostato da te', no_reminder: 'nessun promemoria',
    st_ok: 'Regolare', st_warn: 'Controllo consigliato', st_bad: 'Intervento necessario', st_none: 'Da verificare',
    insurance: 'Assicurazione', expires: 'scade', completeness: 'Completezza', sheet_hint: 'Dati barca, motore, armatore e documenti, compilati da te.',
    meteo: 'Meteomare Loano', wind: 'Vento', sea: 'Mare', air: 'Aria', water: 'Acqua', gusts: 'raffiche', forecast: 'Prossimi giorni', meteo_na: 'Dati meteo non disponibili in questo momento.', meteo_src: 'Dati Open-Meteo, aggiornati ogni 30 minuti',
    webcam: 'Webcam Loano', webcam_open: 'Apri le webcam di Loano', webcam_hint: 'Guarda il porto e il mare prima di uscire.',
    gps: 'Posizione barca', gps_none: 'Posizione non ancora impostata', set_position: 'Imposta posizione',
    sheet_title: 'Anagrafica imbarcazione', sheet_lead: 'Questi dati li compili e aggiorni tu. Anfibiasub li vede per preparare gli interventi.',
    boat_type: 'Tipo di imbarcazione', vela: 'Vela', motore: 'Motore', catamarano: 'Catamarano',
    g_ident: 'Identificazione', g_build: 'Costruzione', g_engine: 'Motore', g_owner: 'Armatore', g_safety: 'Sicurezza e documentazione', g_berth: 'Ormeggio',
    f_nome: 'Nome imbarcazione', f_targa: 'Targa', f_matricola: 'N° immatricolazione', f_codice_scafo: 'Codice scafo (telaio)', f_bandiera: 'Bandiera / nazionalità',
    f_ufficio_reg: 'Ufficio di registrazione (Capitaneria di porto)', f_lunghezza: 'Lunghezza (m)', f_utilizzo: 'Utilizzo',
    u_privato: 'Diporto privato', u_charter: 'Charter / locazione', u_commerciale: 'Commerciale',
    f_cantiere_modello: 'Cantiere e modello', f_anno: 'Anno di costruzione', f_materiale: 'Materiale scafo',
    m_vetroresina: 'Vetroresina', m_alluminio: 'Alluminio', m_legno: 'Legno', m_acciaio: 'Acciaio', m_altro: 'Altro',
    f_motore_modello: 'Marca e modello motore', f_motore_serie: 'Numero di serie motore', f_potenza: 'Potenza (cv / kW)', f_carburante: 'Tipo di carburante', f_serbatoi: 'Capacità serbatoi (l)',
    f_armatore_nome: 'Nome e cognome o ragione sociale', f_armatore_cell: 'Cellulare', f_armatore_email: 'Email',
    f_scad_assicurazione: 'Scadenza assicurazione', f_licenza_rtf: 'Licenza RTF (VHF)', f_mmsi: 'Codice MMSI', f_call_sign: 'Call sign (nominativo)',
    f_porto: 'Porto', f_posto_barca: 'Pontile / posto barca',
    save: 'Salva', saved: 'Salvato.', cancel: 'Annulla', delete: 'Elimina', confirm_delete: 'Eliminare definitivamente?',
    cleaning_photos: 'Foto dell\'intervento', by_anf: 'caricate da Anfibiasub', share_wa: 'Condividi su WhatsApp', share_link: 'Copia link', copied: 'Link copiato',
    remind_me: 'Avvisami per il prossimo intervento il', save_reminder: 'Salva avviso', remove_reminder: 'Togli avviso', history: 'Storico interventi',
    anodes_lead: 'Registro gestito da te. Anche Anfibiasub può aggiornarlo quando sostituisce un anodo.', add_anode: 'Aggiungi anodo',
    a_posizione: 'Posizione', a_codice: 'Codice anodo', a_dati: 'Dati (materiale, misura)', a_montaggio: 'Data montaggio', a_alert: 'Data avviso', a_note: 'Note', a_foto: 'Foto anodo',
    mounted: 'Montato il', alert_on: 'Avviso il', code: 'Cod.', no_anodes: 'Nessun anodo registrato. Aggiungi il primo.',
    pos_lead: 'Tocca la mappa nel punto dove è ormeggiata la barca, oppure usa la posizione del telefono.', use_my_pos: 'Usa la mia posizione', save_pos: 'Salva posizione',
    open_gmaps: 'Google Maps', open_gearth: 'Google Earth', share: 'Condividi', pos_saved: 'Posizione salvata.', updated: 'aggiornata il',
    profile_title: 'Il tuo profilo', name: 'Nome', phone: 'Telefono', language: 'Lingua', change_pw: 'Cambia password', pw_current: 'Password attuale', pw_new: 'Nuova password (minimo 8 caratteri)', pw_new2: 'Ripeti nuova password',
    pw_changed: 'Password aggiornata.', pw_wrong: 'La password attuale non è corretta.', pw_mismatch: 'Le due password non coincidono.', pw_short: 'La password deve avere almeno 8 caratteri.',
    must_change: 'Primo accesso: scegli una password personale.',
    forgot_title: 'Recupera password', forgot_lead: 'Scrivi la tua email: se è registrata ricevi un link per scegliere una nuova password.', send_link: 'Invia link',
    forgot_sent: 'Se l\'email è registrata, ti abbiamo inviato un link. Controlla anche lo spam.', forgot_nomail: 'Il recupero via email non è ancora attivo: contatta Anfibiasub su WhatsApp.',
    reset_title: 'Nuova password', reset_bad: 'Link non valido o scaduto.', back_login: 'Torna all\'accesso',
    no_boat: 'Non c\'è ancora nessuna barca associata al tuo account. Contatta Anfibiasub.', choose_boat: 'Barca',
    shared_title: 'Intervento subacqueo', shared_by: 'Foto condivise da Anfibiasub, lavori marittimi subacquei · Loano',
    days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'], not_found: 'Pagina non trovata.', error: 'Si è verificato un errore. Riprova.',
    photo_n: 'Foto', months_ago: 'mesi fa', today: 'oggi', site: 'Sito Anfibiasub',
  },
  en: {
    area: 'Customer area', login_title: 'Sign in', login_sub: 'Your login details are provided by Anfibiasub.',
    email: 'Email', password: 'Password', enter: 'Sign in', forgot: 'Forgot your password?',
    no_access: 'No account yet?', write_wa: 'Message us on WhatsApp',
    bad_login: 'Wrong email or password.', too_many: 'Too many attempts. Please try again in a few minutes.',
    logout: 'Sign out', home: 'Home', boat_sheet: 'Boat details', maintenance: 'Maintenance', position: 'Position', profile: 'Profile',
    hero_area: 'Your boat,', hero_area2: 'seen from below', hero_lead: 'Boat details, hull cleanings with photos from our divers, anode log and reminders. All in one place.',
    request_wa: 'Request a job on WhatsApp', open: 'Open', edit: 'Edit',
    cleaning: 'Underwater cleaning', anodes: 'Anodes', last_job: 'Last job', next_job: 'Next job',
    none_yet: 'No jobs recorded yet', photos: 'photos', reminder_by_you: 'reminder set by you', no_reminder: 'no reminder set',
    st_ok: 'Up to date', st_warn: 'Check recommended', st_bad: 'Service needed', st_none: 'To be checked',
    insurance: 'Insurance', expires: 'expires', completeness: 'Completed', sheet_hint: 'Boat, engine, owner and documents, filled in by you.',
    meteo: 'Loano marine weather', wind: 'Wind', sea: 'Sea', air: 'Air', water: 'Water', gusts: 'gusts', forecast: 'Next days', meteo_na: 'Weather data not available right now.', meteo_src: 'Open-Meteo data, updated every 30 minutes',
    webcam: 'Loano webcam', webcam_open: 'Open the Loano webcams', webcam_hint: 'Check the harbour and the sea before going out.',
    gps: 'Boat position', gps_none: 'Position not set yet', set_position: 'Set position',
    sheet_title: 'Boat details', sheet_lead: 'You fill in and update these details. Anfibiasub uses them to prepare each job.',
    boat_type: 'Boat type', vela: 'Sail', motore: 'Motor', catamarano: 'Catamaran',
    g_ident: 'Identification', g_build: 'Construction', g_engine: 'Engine', g_owner: 'Owner', g_safety: 'Safety and documents', g_berth: 'Berth',
    f_nome: 'Boat name', f_targa: 'Registration mark', f_matricola: 'Registration number', f_codice_scafo: 'Hull ID (HIN/CIN)', f_bandiera: 'Flag / nationality',
    f_ufficio_reg: 'Registration office (Harbour Master)', f_lunghezza: 'Length (m)', f_utilizzo: 'Use',
    u_privato: 'Private', u_charter: 'Charter / rental', u_commerciale: 'Commercial',
    f_cantiere_modello: 'Builder and model', f_anno: 'Year built', f_materiale: 'Hull material',
    m_vetroresina: 'Fibreglass', m_alluminio: 'Aluminium', m_legno: 'Wood', m_acciaio: 'Steel', m_altro: 'Other',
    f_motore_modello: 'Engine make and model', f_motore_serie: 'Engine serial number', f_potenza: 'Power (hp / kW)', f_carburante: 'Fuel type', f_serbatoi: 'Tank capacity (l)',
    f_armatore_nome: 'Owner name or company', f_armatore_cell: 'Mobile', f_armatore_email: 'Email',
    f_scad_assicurazione: 'Insurance expiry', f_licenza_rtf: 'Radio licence (VHF)', f_mmsi: 'MMSI number', f_call_sign: 'Call sign',
    f_porto: 'Harbour', f_posto_barca: 'Pontoon / berth',
    save: 'Save', saved: 'Saved.', cancel: 'Cancel', delete: 'Delete', confirm_delete: 'Delete permanently?',
    cleaning_photos: 'Job photos', by_anf: 'uploaded by Anfibiasub', share_wa: 'Share on WhatsApp', share_link: 'Copy link', copied: 'Link copied',
    remind_me: 'Remind me about the next job on', save_reminder: 'Save reminder', remove_reminder: 'Remove reminder', history: 'Job history',
    anodes_lead: 'You manage this log. Anfibiasub can update it too when replacing an anode.', add_anode: 'Add anode',
    a_posizione: 'Position', a_codice: 'Anode code', a_dati: 'Details (material, size)', a_montaggio: 'Fitted on', a_alert: 'Reminder date', a_note: 'Notes', a_foto: 'Anode photo',
    mounted: 'Fitted on', alert_on: 'Reminder on', code: 'Code', no_anodes: 'No anodes recorded. Add the first one.',
    pos_lead: 'Tap the map where the boat is moored, or use your phone\'s location.', use_my_pos: 'Use my location', save_pos: 'Save position',
    open_gmaps: 'Google Maps', open_gearth: 'Google Earth', share: 'Share', pos_saved: 'Position saved.', updated: 'updated on',
    profile_title: 'Your profile', name: 'Name', phone: 'Phone', language: 'Language', change_pw: 'Change password', pw_current: 'Current password', pw_new: 'New password (at least 8 characters)', pw_new2: 'Repeat new password',
    pw_changed: 'Password updated.', pw_wrong: 'The current password is wrong.', pw_mismatch: 'The two passwords do not match.', pw_short: 'The password must be at least 8 characters long.',
    must_change: 'First sign-in: please choose your own password.',
    forgot_title: 'Reset password', forgot_lead: 'Enter your email: if it is registered you will receive a link to choose a new password.', send_link: 'Send link',
    forgot_sent: 'If the email is registered, we have sent you a link. Check your spam folder too.', forgot_nomail: 'Email reset is not active yet: please contact Anfibiasub on WhatsApp.',
    reset_title: 'New password', reset_bad: 'Invalid or expired link.', back_login: 'Back to sign in',
    no_boat: 'No boat is linked to your account yet. Please contact Anfibiasub.', choose_boat: 'Boat',
    shared_title: 'Underwater job', shared_by: 'Photos shared by Anfibiasub, underwater marine works · Loano',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], not_found: 'Page not found.', error: 'Something went wrong. Please try again.',
    photo_n: 'Photo', months_ago: 'months ago', today: 'today', site: 'Anfibiasub website',
  },
};

function t(lang) { return T[lang] || T.it; }

function fmtDate(d, lang) {
  if (!d) return '';
  const x = d instanceof Date ? d : new Date(d);
  if (isNaN(x)) return '';
  const dd = String(x.getUTCDate()).padStart(2, '0');
  const mm = String(x.getUTCMonth() + 1).padStart(2, '0');
  return lang === 'en' ? `${dd}/${mm}/${x.getUTCFullYear()}` : `${dd}/${mm}/${x.getUTCFullYear()}`;
}

// yyyy-mm-dd per i campi <input type="date">
function isoDate(d) {
  if (!d) return '';
  const x = d instanceof Date ? d : new Date(d);
  if (isNaN(x)) return '';
  return x.toISOString().slice(0, 10);
}

module.exports = { T, t, fmtDate, isoDate };
