# Anfibiasub: sito + area clienti

Un solo progetto per tre cose:

| Parte | Indirizzo in prova (Railway) | Indirizzo finale |
|---|---|---|
| Sito pubblico IT/EN | `https://<tuo-progetto>.up.railway.app/` | `https://www.anfibiasub.it` (HostGator) |
| Area clienti | `.../area/login` | `https://clienti.anfibiasub.it/area/login` |
| Gestione Anfibiasub | `.../admin` | `https://clienti.anfibiasub.it/admin` |

Tecnologia: Node.js 20+, Express, PostgreSQL. Le foto vengono compresse e salvate nel database.

---

## 1. Messa in prova su Railway

### 1.1 GitHub
1. Su github.com crea un repository **privato** chiamato `anfibiasub`.
2. Carica il contenuto di questa cartella (con GitHub Desktop: *Add existing repository* → *Publish*).
   La cartella `node_modules` non va caricata: è già esclusa da `.gitignore`.

### 1.2 Railway
1. railway.app → **New Project** → **Deploy from GitHub repo** → scegli `anfibiasub`.
2. Nello stesso progetto: **+ New** → **Database** → **PostgreSQL**.
3. Apri il servizio `anfibiasub` → **Variables** e aggiungi:

| Variabile | Valore |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway la suggerisce da solo) |
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | una frase lunga a caso, almeno 32 caratteri |
| `ADMIN_EMAIL` | l'email con cui entrerà Anfibiasub nella gestione |
| `ADMIN_PASSWORD` | una password di almeno 8 caratteri (cambiabile dopo) |
| `TZ` | `Europe/Rome` |

4. **Settings** → **Region**: scegli una regione europea (es. *EU West*). I dati dei clienti restano in Europa.
5. **Settings** → **Networking** → **Generate Domain**. Questo è il link di prova da mandare al cliente.

Al primo avvio il database si crea da solo, e viene creato l'amministratore con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### 1.3 Email automatiche (Brevo, gratis fino a 300 email al giorno)
Senza questo passaggio tutto funziona, ma le email non partono (credenziali, nuovi interventi, promemoria anodi, pulizie e assicurazione). I promemoria restano in attesa e partono appena le email sono attive.

1. Crea un account su brevo.com.
2. **Senders & IP** → aggiungi e verifica il mittente (es. `info@anfibiasub.it` o l'email di Cuvato).
3. **SMTP & API** → **API Keys** → genera una chiave.
4. Su Railway aggiungi le variabili:

| Variabile | Valore |
|---|---|
| `BREVO_API_KEY` | la chiave appena creata |
| `MAIL_FROM` | il mittente verificato |
| `MAIL_FROM_NAME` | `Anfibiasub` |
| `APP_URL` | il link Railway, poi `https://clienti.anfibiasub.it` |

5. In **Gestione → Impostazioni** usa *Manda un'email di prova a me*.

---

## 2. Uso quotidiano (Anfibiasub)

1. **Nuovo cliente**: nome, email, cellulare, nome della barca. Viene generata una password provvisoria da mandare via email o WhatsApp. Al primo accesso il cliente sceglie la sua.
2. **Barca → Pulizie e foto**: data, tipo, foto direttamente dal telefono (anche 30 insieme), note. Con "Avvisa il cliente" parte l'email.
3. **Barca → Anodi**: il registro lo gestisce il cliente, ma Anfibiasub può aggiungere e correggere.
4. **Impostazioni**: link della webcam di Loano, numero WhatsApp, email per i promemoria, mesi dei semafori.

Semafori (modificabili): pulizia verde fino a 6 mesi, giallo fino a 12, poi rosso. Anodi verde fino a 10 mesi dal montaggio, giallo fino a 12, poi rosso; diventano gialli anche quando arriva la data di avviso scelta dal cliente.

---

## 3. Messa online su anfibiasub.it

Il dominio è registrato con DominioFaiDaTe, ma DNS, sito ed email stanno su **HostGator** (nameserver `ns445/ns446.websitewelcome.com`). Si lavora nel cPanel di HostGator.

### 3.1 Sito pubblico su HostGator
1. Backup del vecchio Joomla: File Manager → `public_html` → seleziona tutto → *Compress* → scarica lo zip. Poi *Backup* → scarica il database MySQL.
2. Sposta tutto il contenuto di `public_html` in una cartella `backup-joomla` **fuori** da `public_html`.
3. Carica in `public_html` il contenuto di `dist-hostgator/` (zip → *Upload* → *Extract*). `index.html` e `.htaccess` devono stare direttamente in `public_html`.
   Il file `.htaccess` è nascosto: in File Manager attiva *Settings → Show Hidden Files*.
4. Prima, controlla in cPanel → *SSL/TLS Status* che `www.anfibiasub.it` abbia il certificato (AutoSSL). Il `.htaccess` porta tutti su `https://www.`.
5. Le email non si toccano: stanno nel server, non in `public_html`.

`dist-hostgator` contiene già i reindirizzamenti dai vecchi indirizzi Joomla (`/it/servizi-marittimi/...` ecc.), `sitemap.xml` e `robots.txt`.
Per rigenerarla dopo una modifica ai testi: `python3 sito/build.py --prod`.

### 3.2 Area clienti su clienti.anfibiasub.it
1. Railway → servizio → **Settings → Networking → Custom Domain** → `clienti.anfibiasub.it`. Railway mostra i record DNS da creare.
2. cPanel HostGator → **Zone Editor** → `anfibiasub.it` → aggiungi i record indicati da Railway (un **CNAME** `clienti` e, se lo chiede, un **TXT** di verifica). Non toccare i record **MX**.
3. Su Railway imposta `SERVE_SITE=off` (la radice porta all'area clienti) e `APP_URL=https://clienti.anfibiasub.it`.

---

## 4. Modificare i testi del sito
Il sito è in 4 lingue (italiano, inglese, spagnolo, tedesco), con la tendina delle lingue nel menu.

| Cosa | File |
|---|---|
| Servizi, lavori, squadra, mezzi, tabelle (IT/EN) | `sito/contenuti.py` |
| Gli stessi contenuti in ES/DE | `sito/contenuti_es_de.py` |
| Titoli e frasi fisse delle pagine (4 lingue) | `sito/testi_pagine.py` |
| Area clienti ed email (4 lingue) | `src/i18n.js` |
| Link della webcam di Loano | `WEBCAM_URL` in `sito/contenuti.py` |

Dopo una modifica:

```
python3 sito/build.py          # aggiorna public/ (versione servita da Railway)
python3 sito/build.py --prod   # aggiorna dist-hostgator/ (versione per HostGator)
```

## 5. Sviluppo locale
```
npm install
DATABASE_URL=postgresql://utente:password@localhost/anfibiasub SESSION_SECRET=prova ADMIN_EMAIL=io@test.it ADMIN_PASSWORD=prova1234 npm start
```
Altro amministratore da riga di comando: `npm run crea-admin -- email@esempio.it "Nome"`.
