# Genera il sito pubblico statico (italiano + inglese).
#
#   python3 sito/build.py          -> versione di prova in public/ (servita dall'app su Railway)
#   python3 sito/build.py --prod   -> versione per anfibiasub.it in dist-hostgator/ (da caricare su HostGator)
#
import os, sys, shutil, html, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from contenuti import *  # noqa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROD = '--prod' in sys.argv
OUT = os.path.join(ROOT, 'dist-hostgator' if PROD else 'public')
SITE_URL = 'https://www.anfibiasub.it'
# Indirizzo dell'area clienti: in prova sta sullo stesso server, online sul sottodominio
AREA = 'https://clienti.anfibiasub.it/area/login' if PROD else '/area/login'

e = html.escape
import hashlib
_A = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
VER = hashlib.md5(b''.join(open(os.path.join(_A, f), 'rb').read() for f in ('css/style.css', 'js/main.js', 'js/utilita.js'))).hexdigest()[:8]
ARROW = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
LOGO = '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="9" r="5"/><circle cx="12" cy="9" r="2"/><path d="M3 18c2 0 2-1.5 4.5-1.5S9.5 18 12 18s2.5-1.5 4.5-1.5S19 18 21 18"/></svg>'
LOCK = '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
WA_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>'
CHEVRON = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
MENU = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'


def url(key, lang, anchor=''):
    f = PAGES[key][0 if lang == 'it' else 1]
    f = '/' + ('' if f == 'index.html' else 'en/' if f == 'en/index.html' else f)
    return f + (('#' + anchor) if anchor else '')


def header(cur, lang, overlay):
    U = UI[lang]
    it = lang == 'it'
    subs = {
        'servizi': [(s['id'], s[lang]['t']) for s in SERVIZI],
        'lavori': [(l['id'], l[lang]['toc']) for l in LAVORI],
        'utilita': [(a, (b_it if it else b_en)) for a, b_it, b_en in UTIL_SEZIONI],
    }
    tutti = {'servizi': ('Tutti i servizi', 'All services'), 'lavori': ('Tutti i lavori', 'All projects'), 'utilita': ('Tutte le utilità', 'All tools')}
    links = ''
    for k, t in U['nav']:
        cur_attr = ' aria-current="page"' if k == cur else ''
        if k not in subs:
            links += f'<a href="{url(k, lang)}"{cur_attr}>{t}</a>'
            continue
        first = f'<a class="dd-all" href="{url(k, lang)}">{tutti[k][0 if it else 1]}</a>'
        items = first + ''.join(f'<a href="{url(k, lang, a)}">{e(b)}</a>' for a, b in subs[k])
        links += (f'<div class="dd"><button class="dd-btn" type="button" aria-expanded="false" aria-haspopup="true"{cur_attr.replace("page", "true")}>{t}{CHEVRON}</button>'
                  f'<div class="dd-menu">{items}</div></div>')
    other = 'en' if lang == 'it' else 'it'
    return f'''<a class="skip" href="#main">{U["skip"]}</a>
<header class="site-header{'' if overlay else ' solid'}">
<div class="wrap nav-row">
<a class="logo" href="{url('home', lang)}" aria-label="Anfibiasub, home">
<img class="logo-img" src="/img/logo-anfibia-96.png" alt="" width="52" height="52">
<span class="logo-txt"><span class="logo-name">ANFIBIA<span class="hl">SUB</span></span><span class="logo-sub">{U["tagline"]}</span></span>
</a>
<button class="menu-btn" type="button" aria-label="{U["menu_open"]}" aria-expanded="false" aria-controls="nav">{MENU}</button>
<nav class="nav" id="nav" aria-label="Menu">
{links}
<a class="nav-lock" href="{AREA}{'?lang=en' if lang == 'en' else ''}">{LOCK}{U["area"]}</a>
<a href="{url(cur, other)}" lang="{other}" hreflang="{other}" aria-label="{U["lang_other_label"]}">{U["lang_other"]}</a>
<a class="btn" href="{url('contatti', lang)}">{U["quote"]}</a>
</nav>
</div>
</header>'''


def footer(lang):
    U = UI[lang]
    return f'''<footer class="site-footer">
<div class="wrap">
<div class="foot-grid">
<div>
<img src="/img/logo-anfibia-96.png" alt="Anfibiasub" width="72" height="72" style="border-radius:50%;margin-bottom:10px">
<p style="margin-top:6px">{U["foot_about"]}</p>
</div>
<div>
<h3>FRANCESCO</h3>
<p>{U["office"]}: Via Dufour 23, Carcare (SV)</p>
<p><a href="tel:{TEL_F}">347 011 9832</a></p>
<p><a href="mailto:{MAIL}">{MAIL}</a></p>
</div>
<div>
<h3>SIMONE</h3>
<p>{U["office"]}: Via Boraxe 8, Albisola Superiore (SV)</p>
<p><a href="tel:{TEL_S}">347 038 7290</a></p>
</div>
<div>
<h3>{U["site"]}</h3>
<p><a href="{url('servizi', lang)}">{dict(U['nav'])['servizi']}</a></p>
<p><a href="{url('lavori', lang)}">{dict(U['nav'])['lavori']}</a></p>
<p><a href="{url('utilita', lang)}">{dict(U['nav'])['utilita']}</a></p>
<p><a href="{AREA}{'?lang=en' if lang == 'en' else ''}">{U["area"]}</a></p>
<p><a href="{url('privacy', lang)}">{U["privacy"]}</a></p>
</div>
</div>
<div class="foot-bottom"><span>© Anfibiasub · P.I. 01326660097</span><span>{U["no_cookie"]}</span></div>
</div>
</footer>
<a class="wa" href="{WA}" target="_blank" rel="noopener" aria-label="{U["wa"]}">{WA_ICON}</a>
<script src="/js/main.js?v={VER}"></script>'''


def page(key, lang, title, desc, body, overlay=False, og='porto-loano'):
    extra_head = '<link rel="stylesheet" href="/vendor/leaflet/leaflet.css">\n' if key == 'utilita' else ''
    extra_js = f'<script src="/vendor/leaflet/leaflet.js"></script>\n<script src="/js/utilita.js?v={VER}"></script>\n' if key == 'utilita' else ''
    fname = PAGES[key][0 if lang == 'it' else 1]
    alt_it, alt_en = SITE_URL + url(key, 'it'), SITE_URL + url(key, 'en')
    robots = '' if PROD else '<meta name="robots" content="noindex, nofollow">\n'
    doc = f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
{robots}<link rel="canonical" href="{SITE_URL + url(key, lang)}">
<link rel="alternate" hreflang="it" href="{alt_it}">
<link rel="alternate" hreflang="en" href="{alt_en}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{SITE_URL}/img/{og}.webp">
<meta property="og:locale" content="{'it_IT' if lang == 'it' else 'en_GB'}">
<meta name="theme-color" content="#050E1A">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/montserrat-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/style.css?v={VER}">
{extra_head}</head>
<body>
{header(key, lang, overlay)}
<main id="main">
{body}
</main>
{footer(lang)}
{extra_js}</body>
</html>
'''
    path = os.path.join(OUT, fname)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(doc)


# ---------------- blocchi ----------------
def svc_card(s, lang):
    x = s[lang]
    pos = f' style="object-position:{s["pos"]}"' if s.get('pos') else ''
    return f'''<a class="card" href="{url('servizi', lang, s["id"])}">
<img src="/img/{s["img"]}-sm.webp" alt="" width="800" height="533" loading="lazy"{pos}>
<span class="card-body">
<span class="card-title">{e(x["t"]).upper()}</span>
<span class="card-text">{e(x["short"])}</span>
<span class="card-more">{UI[lang]["more"]} {ARROW}</span>
</span>
</a>'''


def job_card(l, lang):
    x = l[lang]
    return f'''<a class="card" href="{url('lavori', lang, l["id"])}">
<img src="/img/{l["img"]}-sm.webp" alt="" width="800" height="533" loading="lazy">
<span class="card-body">
<span class="card-place">{e(x["luogo"])}</span>
<span class="card-title">{e(x["t"])}</span>
<span class="card-text">{e(x["d"])}</span>
</span>
</a>'''


def team_html(lang):
    out = ''
    for p in TEAM:
        x = p[lang]
        lis = ''.join(f'<li>{e(b)}</li>' for b in x['b'])
        out += f'''<div class="person">
<div class="person-head"><span class="avatar" aria-hidden="true">{p["ini"]}</span>
<span style="line-height:1.3"><strong style="color:#fff;font-weight:600;font-size:18px">{e(p["n"])}</strong><br><span style="font-size:13px;color:var(--cyan)">{e(x["r"])}</span></span></div>
<ul>{lis}</ul>
</div>'''
    return out


def mezzi_html(lang):
    return ''.join(f'<div class="tool-col"><h3>{t.upper()}</h3><ul class="list">{"".join(f"<li>{e(v)}</li>" for v in vs)}</ul></div>' for t, vs in MEZZI[lang])


def moduli_html(lang):
    return ''.join(f'<div class="module"><strong>{e(a)}</strong><span>{e(b)}</span></div>' for a, b in MODULI[lang])


def tow_band(lang):
    it = lang == 'it'
    return f'''<section class="tow" aria-labelledby="tow-t">
<img src="/img/rimorchiatore.webp" alt="">
<div class="wrap">
<div class="tow-title">
<p class="eyebrow">{'Rimorchiatore' if it else 'Tug'} Elansa · IMO STCW 95</p>
<h2 class="h2" id="tow-t" style="margin:0">{'Barca in difficoltà?<br><span class="hl">Veniamo noi</span>' if it else 'Boat in trouble?<br><span class="hl">We come to you</span>'}</h2>
</div>
<p class="tow-text">{'Recuperiamo imbarcazioni in difficoltà ed eseguiamo lavorazioni marittime con il nostro rimorchiatore. Per i recuperi sul fondale usiamo palloni di sollevamento o il pontone.' if it else 'We recover boats in difficulty and carry out marine works with our own tug. For recoveries from the seabed we use lift bags or the pontoon.'}</p>
<a class="btn" href="tel:{TEL_F}">{UI[lang]["call_now"]} {ARROW}</a>
</div>
</section>'''


def cta(lang):
    U = UI[lang]
    return f'<section class="section band"><div class="wrap split"><div><h2 class="h2">{U["need"]}</h2><p class="lead">{U["need_lead"]}</p></div><div style="display:flex;flex-wrap:wrap;gap:12px"><a class="btn" href="{WA}" target="_blank" rel="noopener">{U["wa"]}</a><a class="btn btn-ghost" href="tel:{TEL_F}">347 011 9832</a></div></div></section>'


def phero(img, eyebrow, h1, lead):
    return f'''<section class="page-hero">
<img src="/img/{img}.webp" alt="">
<div class="wrap">
<p class="eyebrow">{eyebrow}</p>
<h1>{h1}</h1>
<p class="lead">{lead}</p>
</div>
</section>'''


def detail(item, x, place=None, paras=None):
    pos = f' style="object-position:{item["pos"]}"' if item.get('pos') else ''
    ps = ''.join(f'<p>{e(p)}</p>' for p in (paras or [x['d']]))
    pl = f'<span class="card-place">{e(place)}</span>' if place else ''
    return f'''<article class="detail" id="{item["id"]}">
<div class="detail-img"><img src="/img/{item["img"]}.webp" alt="" width="1536" height="1024" loading="lazy"{pos}></div>
<div>{pl}<h2>{e(x["t"])}</h2>{ps}</div>
</article>'''


BADGES = {
    'it': [('O.T.S. qualificati', 'brevetti IANTD, ANIS, Croce Rossa'), ('In acqua', 'niente cantiere, costi dimezzati'), ('3 porti costruiti', 'Loano, Varazze, Arenzano')],
    'en': [('Qualified divers', 'IANTD, ANIS, Red Cross certified'), ('In the water', 'no haul-out, half the cost'), ('3 marinas built', 'Loano, Varazze, Arenzano')],
}
B_ICONS = [
    '<svg viewBox="0 0 24 24" fill="none" stroke="#3CC6F5" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#3CC6F5" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#3CC6F5" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>',
]


def build_lang(lang):
    it = lang == 'it'
    U = UI[lang]
    N = dict(U['nav'])

    # HOME
    badges = ''.join(f'<div class="badge">{ic}<span><strong>{a}</strong><br><span>{b}</span></span></div>' for ic, (a, b) in zip(B_ICONS, BADGES[lang]))
    home = f'''<section class="hero" aria-label="{'Introduzione' if it else 'Introduction'}">
<img class="hero-img" src="/img/porto-loano.webp" alt="{'Operatore subacqueo guida un blocco di cemento calato dalla gru sul fondale' if it else 'Diver guiding a concrete block lowered by a crane onto the seabed'}" fetchpriority="high">
<div class="wrap hero-body">
<p class="hero-kicker">{'LAVORI MARITTIMI SUBACQUEI · PORTO DI LOANO' if it else 'UNDERWATER MARINE WORKS · LOANO HARBOUR'}</p>
<h1>{'SOTTO LA SUPERFICIE,<br><span class="hl">SENZA ALARE LA BARCA</span>' if it else 'BELOW THE SURFACE,<br><span class="hl">NO HAUL-OUT NEEDED</span>'}</h1>
<p class="hero-lead">{'Operiamo dal porto di Loano: lavori edili e metalmeccanici subacquei, recuperi in mare con il nostro rimorchiatore, pulizia eliche e carene, foto e video sott\'acqua. Serietà, professionalità e competenza.' if it else 'We work out of Loano harbour on the Italian Riviera: underwater civil and metal works, recoveries at sea with our own tug, propeller and hull cleaning, underwater photo and video. Reliable, professional, skilled.'}</p>
<div class="badges">{badges}</div>
<a class="btn" href="#servizi">{'SCOPRI I NOSTRI SERVIZI' if it else 'SEE OUR SERVICES'} {ARROW}</a>
</div>
</section>

<section class="section" id="servizi" aria-labelledby="srv-t">
<div class="wrap">
<div class="sec-head">
<div>
<p class="eyebrow">{'I nostri servizi' if it else 'Our services'}</p>
<h2 class="h2" id="srv-t">{'Soluzioni subacquee<br><span class="hl">per ogni scafo</span>' if it else 'Underwater solutions<br><span class="hl">for every hull</span>'}</h2>
<p class="lead">{'Dalla barca da diporto alla nave, dal pontile al porto intero.' if it else 'From pleasure boats to ships, from a single pontoon to an entire marina.'}</p>
</div>
<a class="btn btn-ghost" href="{url('servizi', lang)}">{U['all_services']} {ARROW}</a>
</div>
<div class="g3">{''.join(svc_card(s, lang) for s in SERVIZI[:6])}</div>
</div>
</section>

<section class="section band" aria-labelledby="chi-t">
<div class="wrap">
<p class="eyebrow">{N['chi']}</p>
<h2 class="h2" id="chi-t">{'Una famiglia<br><span class="hl">che lavora sott\'acqua</span>' if it else 'A family<br><span class="hl">that works underwater</span>'}</h2>
<p class="lead" style="margin-bottom:40px">{'Tre operatori della famiglia Cuvato, con anni di immersioni professionali, brevetti tecnici e di soccorso, ed esperienza a bordo di pescherecci, pontoni e draghe.' if it else 'Three members of the Cuvato family, with years of commercial diving, technical and rescue certifications, and experience on fishing boats, pontoons and dredgers.'}</p>
<div class="g3">{team_html(lang)}</div>
</div>
</section>

<section class="section" aria-labelledby="lav-t">
<div class="wrap">
<div class="sec-head">
<div>
<p class="eyebrow">{N['lavori']}</p>
<h2 class="h2" id="lav-t">{'Opere che stanno<br><span class="hl">sotto il livello del mare</span>' if it else 'Structures that sit<br><span class="hl">below sea level</span>'}</h2>
</div>
<a class="btn btn-ghost" href="{url('lavori', lang)}">{U['all_works'].format(n=len(LAVORI))} {ARROW}</a>
</div>
<div class="g3">{''.join(job_card(l, lang) for l in LAVORI[:6])}</div>

</div>
</section>

<section class="section band" id="area" aria-labelledby="area-t">
<div class="wrap split">
<div>
<p class="eyebrow">{'Novità · Area clienti' if it else 'New · Customer area'}</p>
<h2 class="h2" id="area-t">{'La tua barca,<br><span class="hl">sempre sotto controllo</span>' if it else 'Your boat,<br><span class="hl">always under control</span>'}</h2>
<p class="lead" style="margin-bottom:28px">{'Accedi con la tua password e trovi tutto in un posto: scheda della barca, storico delle pulizie con le foto dei nostri sub, registro anodi e promemoria via email.' if it else 'Sign in with your password and find everything in one place: boat details, cleaning history with photos from our divers, anode log and email reminders.'}</p>
<a class="btn" href="{AREA}{'' if it else '?lang=en'}">{'ACCEDI ALL\'AREA CLIENTI' if it else 'SIGN IN TO THE CUSTOMER AREA'} {ARROW}</a>
</div>
<div class="modules">{moduli_html(lang)}</div>
</div>
</section>

{tow_band(lang)}'''
    page('home', lang, 'Anfibiasub · ' + ('Lavori marittimi subacquei a Loano' if it else 'Underwater marine works in Loano, Italy'),
         'Pulizia eliche e carene, sostituzione anodi, lavori edili e metalmeccanici subacquei, recuperi con rimorchiatore. Porto di Loano (SV).' if it else
         'Propeller and hull cleaning, anode replacement, underwater civil and metal works, salvage with our own tug. Loano harbour, Italian Riviera.', home, overlay=True)

    # SERVIZI
    srv = phero('saldature', N['servizi'], 'Cosa facciamo<br><span class="hl">sott\'acqua</span>' if it else 'What we do<br><span class="hl">underwater</span>',
                'Dieci servizi, un solo interlocutore: dalla pulizia dell\'elica alla costruzione di un porto.' if it else 'Ten services, one contact: from cleaning a propeller to building a marina.')
    srv += '<div class="wrap"><div>'
    srv += ''.join(detail(s, s[lang], paras=s[lang]['body']) for s in SERVIZI) + '</div></div>' + cta(lang)
    page('servizi', lang, N['servizi'] + ' · Anfibiasub',
         'Pulizia eliche, carenaggi, sostituzione anodi, lavori edili e metalmeccanici subacquei, recuperi, alaggi, foto e video, reti anti medusa.' if it else
         'Propeller cleaning, hull cleaning, anode replacement, underwater civil and metal works, salvage, haul-outs, photo and video, anti-jellyfish nets.', srv, og='saldature')

    # LAVORI
    lav = phero('pietra-ligure', N['lavori'], 'Opere che stanno<br><span class="hl">sotto il livello del mare</span>' if it else 'Structures that sit<br><span class="hl">below sea level</span>',
                'Porti turistici, scivoli di varo, condotte, ormeggi. In Liguria, in Francia e all\'estero.' if it else 'Marinas, launching ramps, pipelines, moorings. In Liguria, in France and abroad.')
    lav += '<div class="wrap"><div>'
    lav += ''.join(detail(l, l[lang], l[lang]['luogo']) for l in LAVORI) + '</div></div>' + cta(lang)
    page('lavori', lang, N['lavori'] + ' · Anfibiasub',
         'Porti di Loano, Varazze e Arenzano, scivolo di varo a Pietra Ligure, impianti Azimut, Antibes, condotte sommerse, Malta e Algeria.' if it else
         'Loano, Varazze and Arenzano marinas, launching ramp in Pietra Ligure, Azimut moorings, Antibes, subsea pipelines, Malta and Algeria.', lav, og='pietra-ligure')

    # CHI SIAMO
    chi = phero('spianamenti', N['chi'], 'Una famiglia<br><span class="hl">che lavora sott\'acqua</span>' if it else 'A family<br><span class="hl">that works underwater</span>',
                'La nostra ditta ha sede nel porto di Loano, da cui operiamo principalmente. Ci contraddistinguono serietà, professionalità e competenza.' if it else 'Our company is based in Loano harbour, where most of our work starts. We stand for reliability, professionalism and skill.')
    chi += f'<section class="section"><div class="wrap"><div class="g3">{team_html(lang)}</div></div></section>'
    chi += f'''<section class="section band" id="mezzi"><div class="wrap">
<p class="eyebrow">{'Mezzi e attrezzatura' if it else 'Vessels and equipment'}</p>
<h2 class="h2">{'Attrezzatura propria,<br><span class="hl">adattata a ogni lavoro</span>' if it else 'Our own equipment,<br><span class="hl">adapted to every job</span>'}</h2>
<p class="lead" style="margin-bottom:34px">{'Siamo attrezzati per i lavori in corso e pronti ad adeguare l\'attrezzatura alle esigenze di ogni cantiere.' if it else 'We are equipped for ongoing works and ready to adapt our gear to the needs of each project.'}</p>
<div class="g4">{mezzi_html(lang)}</div>
</div></section>''' + tow_band(lang)
    page('chi', lang, N['chi'] + ' · Anfibiasub',
         'Francesco, Simone e Roberto Cuvato: operatori tecnici subacquei e palombaro. Mezzi e attrezzatura propria, rimorchiatore Elansa.' if it else
         'Francesco, Simone and Roberto Cuvato: commercial divers and hard-hat diver. Our own vessels and equipment, including the tug Elansa.', chi, og='spianamenti')

    # UTILITÀ
    page('utilita', lang, N['utilita'] + ' · Anfibiasub',
         'Meteomare e webcam di Loano, marcatore GPS da condividere, scala Beaufort e carichi di rottura di cime, cavi e catene.' if it else
         'Loano marine weather and webcam, shareable GPS marker, Beaufort scale and breaking loads of ropes, wire and chains.', utilita_html(lang), og='catenarie')

    # CONTATTI
    con = phero('catenarie', N['contatti'], 'Parliamone<br><span class="hl">prima di immergerci</span>' if it else "Let's talk<br><span class=\"hl\">before we dive in</span>",
                'Scrivici su WhatsApp, chiamaci o mandaci una email. Base operativa al porto di Loano.' if it else 'Message us on WhatsApp, call or email us. Operating base in Loano harbour.')
    con += f'''<section class="section"><div class="wrap">
<div class="contact-grid">
<div class="contact"><h2>Francesco Cuvato</h2><p style="color:var(--muted)">{U['office']}: Via Dufour 23, Carcare (SV)</p><a class="big" href="tel:{TEL_F}">{'347 011 9832' if it else '+39 347 011 9832'}</a><a href="mailto:{MAIL}">{MAIL}</a></div>
<div class="contact"><h2>Simone Cuvato</h2><p style="color:var(--muted)">{U['office']}: Via Boraxe 8, Albisola Superiore (SV)</p><a class="big" href="tel:{TEL_S}">{'347 038 7290' if it else '+39 347 038 7290'}</a></div>
<div class="contact"><h2>WhatsApp</h2><p style="color:var(--muted)">{'Il modo più veloce per un preventivo: mandaci una foto e due righe.' if it else 'The fastest way to get a quote: send us a photo and a few words.'}</p><a class="btn" href="{WA}" target="_blank" rel="noopener" style="align-self:flex-start">{'Apri la chat' if it else 'Open the chat'}</a></div>
</div>
<div style="margin-top:40px;display:flex;flex-wrap:wrap;gap:12px;align-items:center">
<p style="color:var(--muted)">{'Ci trovi al porto di Loano (SV).' if it else 'You will find us in Loano harbour (SV), Italy.'}</p>
<a class="btn btn-ghost" href="https://www.google.com/maps/search/?api=1&amp;query=Marina+di+Loano" target="_blank" rel="noopener">{'Apri in Google Maps' if it else 'Open in Google Maps'}</a>
</div>
</div></section>'''
    page('contatti', lang, N['contatti'] + ' · Anfibiasub',
         'Contatta Anfibiasub: Francesco Cuvato 347 011 9832, Simone Cuvato 347 038 7290, WhatsApp. Porto di Loano (SV).' if it else
         'Contact Anfibiasub: Francesco Cuvato +39 347 011 9832, Simone Cuvato +39 347 038 7290, WhatsApp. Loano harbour, Italy.', con, og='catenarie')

    # PRIVACY
    if it:
        pv = '''<h2>Titolare del trattamento</h2><p>Anfibiasub, P.I. 01326660097, Via Dufour 23, Carcare (SV). Email: termoclino@libero.it.</p>
<h2>Sito pubblico</h2><p>Le pagine del sito non usano moduli di contatto, cookie di profilazione o strumenti di statistica. I caratteri tipografici sono ospitati sul nostro server: durante la navigazione nessun dato viene inviato a servizi esterni. Se ci scrivi via email, telefono o WhatsApp usiamo i tuoi dati solo per risponderti e preparare il preventivo.</p>
<h2>Area clienti</h2><p>Per i clienti che ricevono un accesso conserviamo: nome, email, telefono, i dati dell'imbarcazione inseriti dal cliente, gli interventi eseguiti con le relative foto, e il registro anodi. Servono a gestire le manutenzioni e a inviare i promemoria richiesti. L'area usa un solo cookie tecnico, necessario per restare collegati. I dati sono conservati su server nell'Unione Europea e non vengono ceduti a terzi; le email di servizio sono inviate tramite un fornitore europeo.</p>
<p>Le foto di un intervento sono visibili solo al cliente, salvo che sia lui a condividerle con il link apposito.</p>
<h2>Servizi esterni</h2><p>I link a WhatsApp e Google Maps aprono servizi di terze parti, che applicano le proprie informative. Nella pagina Utilità la mappa usa OpenStreetMap e il meteo arriva da Open-Meteo: la posizione che segni sulla mappa resta nel tuo browser e non viene salvata né inviata a noi.</p>
<h2>I tuoi diritti</h2><p>Puoi chiedere in ogni momento accesso, rettifica o cancellazione dei tuoi dati scrivendo all'indirizzo email indicato sopra. Puoi anche presentare reclamo al Garante per la protezione dei dati personali.</p>'''
    else:
        pv = '''<h2>Data controller</h2><p>Anfibiasub, VAT IT01326660097, Via Dufour 23, Carcare (SV), Italy. Email: termoclino@libero.it.</p>
<h2>Public website</h2><p>The website pages use no contact forms, tracking cookies or analytics. Fonts are hosted on our own server: no data is sent to third parties while you browse. If you contact us by email, phone or WhatsApp, we use your details only to reply and prepare a quote.</p>
<h2>Customer area</h2><p>For customers who receive an account we store: name, email, phone, the boat details entered by the customer, the jobs carried out with their photos, and the anode log. We use them to manage maintenance and send the reminders requested. The area uses a single technical cookie, needed to stay signed in. Data is stored on servers in the European Union and is not shared with third parties; service emails are sent through a European provider.</p>
<p>Job photos are visible only to the customer, unless the customer shares them through the dedicated link.</p>
<h2>Third-party services</h2><p>Links to WhatsApp and Google Maps open third-party services with their own privacy policies. On the Tools page the map uses OpenStreetMap and weather data comes from Open-Meteo: the position you mark stays in your browser and is never saved or sent to us.</p>
<h2>Your rights</h2><p>You can ask at any time to access, correct or delete your data by writing to the email address above. You may also lodge a complaint with the Italian Data Protection Authority (Garante).</p>'''
    priv = phero('catenarie', 'Privacy', U['privacy'], 'Come trattiamo i dati di chi visita il sito e dei nostri clienti.' if it else 'How we handle the data of website visitors and customers.')
    priv += f'<section class="section"><div class="wrap prose">{pv}<p style="color:var(--dim)">{"Aggiornata il" if it else "Last updated"} {datetime.date.today().strftime("%d/%m/%Y")}</p></div></section>'
    page('privacy', lang, U['privacy'] + ' · Anfibiasub', 'Informativa privacy e cookie del sito Anfibiasub.' if it else 'Anfibiasub privacy and cookie policy.', priv)


def fmt(n):
    return '—' if n is None else f'{n:,}'.replace(',', '.')


def utilita_html(lang):
    it = lang == 'it'
    h = phero('catenarie', dict(UI[lang]['nav'])['utilita'], 'Strumenti utili<br><span class="hl">per chi va per mare</span>' if it else 'Handy tools<br><span class="hl">for life at sea</span>',
              'Meteo e webcam di Loano, un marcatore GPS da condividere e le tabelle di vento, cime, cavi e catene che usiamo anche noi in cantiere.' if it else 'Loano weather and webcam, a shareable GPS marker, and the wind, rope, wire and chain tables we use on our own jobs.')
    note = '<p class="hint" style="margin-top:12px">' + ('Valori indicativi, riportati dalle tabelle tecniche di riferimento. Per un carico reale chiedi sempre i dati certificati del produttore.' if it else 'Indicative values taken from reference technical tables. For a real load always ask for the manufacturer\'s certified data.') + '</p>'

    def table(head, rows, caption):
        th = ''.join(f'<th scope="col">{x}</th>' for x in head)
        tr = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
        return f'<div class="tbl-scroll"><table class="data"><caption>{caption}</caption><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'

    bf = table(['Forza' if it else 'Force', 'Denominazione' if it else 'Description', 'km/h', ('Nodi' if it else 'Knots'), 'Stato del mare' if it else 'Sea state'],
               [(f'<b>{f}</b>', a if it else b, kmh, kn, s_it if it else s_en) for f, a, b, kmh, kn, s_it, s_en in BEAUFORT],
               'Scala Beaufort: forza del vento ed effetto sul mare' if it else 'Beaufort scale: wind force and effect on the sea')
    cime = table(['Ø mm', 'Manila', 'Canapa' if it else 'Hemp', 'Polipr.' if it else 'Polyprop.', 'Nylon', 'Manila', 'Canapa' if it else 'Hemp', 'Polipr.' if it else 'Polyprop.', 'Nylon'],
                 [(f'<b>{r[0]}</b>',) + tuple(fmt(x) for x in r[1:]) for r in CIME],
                 ('Cime piane a tre legnoli o trecciate a otto legnoli. Colonne 2-5: carico di rottura (kg). Colonne 6-9: carico massimo di lavoro (kg).' if it else
                  'Three-strand laid or eight-strand plaited ropes. Columns 2-5: breaking load (kg). Columns 6-9: maximum working load (kg).'))
    cavi = table(['Ø mm', ('Peso g/m' if it else 'Weight g/m'), ('Carico di rottura kg' if it else 'Breaking load kg')],
                 [(f'<b>{d}</b>', fmt(g), fmt(k)) for d, g, k in CAVI], 'Cavi in acciaio a sei legnoli' if it else 'Six-strand steel wire rope')
    cat = table([('Calibro mm' if it else 'Size mm'), ('Maglia mm' if it else 'Link mm'), ('Peso kg/m' if it else 'Weight kg/m'), ('Rottura t' if it else 'Breaking t'), ('Sicurezza t' if it else 'Safe load t')],
                [(f'<b>{a}</b>', b, c if it else c.replace(',', '.'), d if it else d.replace(',', '.'), x if it else x.replace(',', '.')) for a, b, c, d, x in CATENE],
                'Catene di ferro con traversino: dimensioni medie delle maglie comuni, peso e carichi' if it else 'Stud-link iron chain: average common-link size, weight and loads')
    anc = table(['Ø mm', 'CP 1-1b', 'CR 1-1b', 'CP 2', 'CR 2', 'CP 3', 'CR 3', ('Maniglia d\'unione' if it else 'Joining shackle'), 'Kenter'],
                [(f'<b>{r[0]}</b>',) + tuple(fmt(x) for x in r[1:]) for r in CATENE_ANCORE],
                ('Catene a maglie con traversino per ancore. CP = carico di prova, CR = carico di rottura (kg), per grado 1-1b, 2 e 3. Ultime due colonne: peso minimo di una lunghezza di catena di 27,5 m (kg). Il grado 3 non è previsto sotto i 40 mm.' if it else
                 'Stud-link anchor chain. CP = proof load, CR = breaking load (kg), for grade 1-1b, 2 and 3. Last two columns: minimum weight of one 27.5 m length of chain (kg). Grade 3 is not available below 40 mm.'))
    W = 'Vento' if it else 'Wind'
    live = f'''<section class="tool-sec" id="meteo"><h2 class="h2">{'Meteomare Loano' if it else 'Loano marine weather'}</h2>
<div class="meteo" data-meteo data-lang="{lang}"><p class="hint">{'Caricamento dati meteo…' if it else 'Loading weather data…'}</p></div>
<p class="hint" style="margin-top:12px">{'Dati Open-Meteo per il tratto di mare davanti a Loano. Sono previsioni: prima di uscire controlla sempre il bollettino ufficiale.' if it else 'Open-Meteo data for the sea off Loano. These are forecasts: always check the official bulletin before going out.'}</p>
</section>
<section class="tool-sec" id="webcam"><h2 class="h2">{'Webcam Loano' if it else 'Loano webcam'}</h2>
<a class="cam-card" href="{WEBCAM_URL}" target="_blank" rel="noopener">
<img src="/img/rimorchiatore.webp" alt="" loading="lazy"><span class="cam-live">LIVE</span>
<span class="cam-txt"><strong>{'Guarda il porto e il mare di Loano in diretta' if it else 'See Loano harbour and sea live'}</strong><span>{'Si apre la pagina delle webcam di Loano' if it else 'Opens the Loano webcams page'} →</span></span>
</a>
</section>
<section class="tool-sec" id="gps"><h2 class="h2">{'Marcatore GPS' if it else 'GPS marker'}</h2>
<p class="lead" style="margin-bottom:18px">{'Tocca la mappa per mettere il marcatore, oppure usa la posizione del telefono. Poi condividi il punto. Non salviamo nulla: la posizione resta sul tuo dispositivo.' if it else 'Tap the map to drop the marker, or use your phone location. Then share the point. Nothing is saved: the position stays on your device.'}</p>
<div class="gps-map" data-gps data-lang="{lang}"></div>
<p class="hint gps-coords" data-gps-coords>{'Nessun punto selezionato' if it else 'No point selected'}</p>
<div class="gps-actions">
<button class="btn btn-ghost" type="button" data-gps-locate>{'Usa la mia posizione' if it else 'Use my location'}</button>
<a class="btn btn-ghost is-off" data-gps-link="gmaps" target="_blank" rel="noopener">Google Maps</a>
<a class="btn btn-ghost is-off" data-gps-link="gearth" target="_blank" rel="noopener">Google Earth</a>
<a class="btn is-off" data-gps-link="wa" target="_blank" rel="noopener">{'Condividi su WhatsApp' if it else 'Share on WhatsApp'}</a>
<button class="btn btn-ghost is-off" type="button" data-gps-copy data-done="{'Copiato' if it else 'Copied'}">{'Copia coordinate' if it else 'Copy coordinates'}</button>
</div>
</section>'''
    h += f'''<div class="wrap">
{live}
<section class="tool-sec" id="vento"><h2 class="h2">{'Scala del vento' if it else 'Wind scale'}</h2>{bf}</section>
<section class="tool-sec" id="cime"><h2 class="h2">{'Cime' if it else 'Ropes'}</h2>{cime}{note}</section>
<section class="tool-sec" id="cavi"><h2 class="h2">{'Cavi in acciaio' if it else 'Steel wire rope'}</h2>{cavi}{note}</section>
<section class="tool-sec" id="catene"><h2 class="h2">{'Catene' if it else 'Chains'}</h2>{cat}<div style="height:30px"></div>{anc}{note}</section>
</div>''' + cta(lang)
    return h


# ---------------- generazione ----------------
def copy_assets():
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
    for name in os.listdir(src):
        s, d = os.path.join(src, name), os.path.join(OUT, name)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy2(s, d)


def extras_prod():
    # Reindirizzamenti dai vecchi indirizzi Joomla, così i link salvati e Google non portano a pagine vuote
    old = {
        '/it/': '/', '/it': '/', '/it/chi-siamo': '/chi-siamo.html', '/it/contatti': '/contatti.html',
        '/it/attrezzatura': '/chi-siamo.html#mezzi', '/it/rimorchiatore': '/chi-siamo.html#mezzi',
        '/it/utilita/vento': '/utilita.html#vento', '/it/utilita/cime': '/utilita.html#cime', '/it/utilita/cavi': '/utilita.html#cavi', '/it/utilita/catene': '/utilita.html#catene',
    }
    svc = {'lavori-edili-subacquei': 'edili', 'metalmeccanica-subacquea': 'metalmeccanica', 'recuperi': 'recuperi', 'alaggi-e-vari': 'alaggi',
           'foto-e-videoriprese': 'foto-video', 'carenaggi': 'carenaggi', 'progettazioni': 'progettazioni', 'pulizia-e-rigenerazione-eliche': 'pulizia-eliche', 'reti-anti-medusa': 'reti-anti-medusa'}
    for k, v in svc.items():
        old[f'/it/servizi-marittimi/{k}'] = f'/servizi.html#{v}'
    lav = {'porto-di-loano': 'porto-loano', 'cantieri-navali-pietra-ligure': 'pietra-ligure', 'porto-di-varazze': 'porto-varazze', 'porto-di-arenzano': 'porto-arenzano',
           'saldature': 'saldature', 'azimut': 'azimut', 'antibes': 'antibes', 'reti-anti-medusa': 'reti-anti-medusa', 'alaggi': 'alaggi',
           'posa-e-riparazione-di-tubazioni-sommerse': 'tubazioni-sommerse', 'spianamenti': 'spianamenti', 'demolizioni': 'demolizioni', 'catenarie': 'catenarie',
           'algeria': 'algeria', 'malta': 'malta', 'sostituzione-anodi': 'sostituzione-anodi'}
    for k, v in lav.items():
        old[f'/it/lavori-eseguiti/{k}'] = f'/lavori.html#{v}'
    lines = ['# Anfibiasub - generato da sito/build.py --prod', 'Options -Indexes', 'DirectoryIndex index.html', '',
             '# HTTPS e www', 'RewriteEngine On', 'RewriteCond %{HTTPS} off', 'RewriteRule ^ https://www.anfibiasub.it%{REQUEST_URI} [L,R=301]',
             'RewriteCond %{HTTP_HOST} ^anfibiasub\\.it$ [NC]', 'RewriteRule ^ https://www.anfibiasub.it%{REQUEST_URI} [L,R=301]', '',
             '# Vecchi indirizzi del sito Joomla']
    for a, b in old.items():
        if a in ('/it/', '/en/'):
            lines.append(f'RewriteRule ^{a.strip("/")}/?$ {b} [L,R=301,NE]')
        elif a != '/it':
            lines.append(f'RewriteRule ^{a.lstrip("/")}/?$ {b} [L,R=301,NE]')
    lines += ['# Vecchie pagine inglesi che non esistono più', 'RewriteCond %{REQUEST_FILENAME} !-f', 'RewriteRule ^en/.+$ /en/ [L,R=301]', '', '# Area clienti', 'RewriteRule ^area(/.*)?$ https://clienti.anfibiasub.it/area$1 [L,R=302]', '',
              '# Cache', '<IfModule mod_expires.c>', 'ExpiresActive On', 'ExpiresByType image/webp "access plus 1 month"', 'ExpiresByType font/woff2 "access plus 1 year"',
              'ExpiresByType text/css "access plus 1 week"', 'ExpiresByType application/javascript "access plus 1 week"', '</IfModule>', '',
              'ErrorDocument 404 /index.html']
    with open(os.path.join(OUT, '.htaccess'), 'w') as f:
        f.write('\n'.join(l for l in lines if l is not None) + '\n')
    with open(os.path.join(OUT, 'robots.txt'), 'w') as f:
        f.write(f'User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n')
    today = datetime.date.today().isoformat()
    urls = ''.join(f'<url><loc>{SITE_URL}{url(k, l)}</loc><lastmod>{today}</lastmod></url>' for k in PAGES for l in ('it', 'en'))
    with open(os.path.join(OUT, 'sitemap.xml'), 'w') as f:
        f.write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n')


if __name__ == '__main__':
    if PROD and os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT, exist_ok=True)
    copy_assets()
    for lang in ('it', 'en'):
        build_lang(lang)
    if PROD:
        extras_prod()
    else:
        with open(os.path.join(OUT, 'robots.txt'), 'w') as f:
            f.write('User-agent: *\nDisallow: /\n')
    print(('PRODUZIONE' if PROD else 'PROVA') + ' ->', OUT)
