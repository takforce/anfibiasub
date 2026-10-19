// Pagina Utilità: meteomare Loano (Open-Meteo) e marcatore GPS (OpenStreetMap).
// Tutto avviene nel browser: nessun dato viene salvato.
(function () {
  var LOANO = [44.1286, 8.2589];

  // ---------- METEO ----------
  var box = document.querySelector('[data-meteo]');
  if (box) {
    var lang = box.getAttribute('data-lang') || 'it';
    var TT = {
      it: { now: 'Adesso a Loano', next: 'Prossimi giorni', wind: 'Vento', from: 'da', sea: 'Mare', air: 'Aria', water: 'Acqua', gusts: 'raffiche', force: 'Forza', upd: 'Aggiornato alle', na: 'Dati meteo non disponibili in questo momento.',
            days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'], today: 'Oggi', dir: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
            bf: ['calma', 'bava di vento', 'brezza leggera', 'brezza tesa', 'vento moderato', 'vento teso', 'vento fresco', 'vento forte', 'burrasca', 'burrasca forte', 'tempesta', 'fortunale', 'uragano'],
            wx: ['sereno', 'poco nuvoloso', 'nuvoloso', 'nebbia', 'pioviggine', 'pioggia', 'neve', 'temporale'],
            sea_s: [[0.1, 'calmo'], [0.5, 'quasi calmo'], [1.25, 'poco mosso'], [2.5, 'mosso'], [4, 'molto mosso'], [6, 'agitato'], [99, 'grosso']] },
      en: { now: 'Now in Loano', next: 'Next days', wind: 'Wind', from: 'from', sea: 'Sea', air: 'Air', water: 'Water', gusts: 'gusts', force: 'Force', upd: 'Updated at', na: 'Weather data not available right now.',
            days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], today: 'Today', dir: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
            bf: ['calm', 'light air', 'light breeze', 'gentle breeze', 'moderate breeze', 'fresh breeze', 'strong breeze', 'near gale', 'gale', 'strong gale', 'storm', 'violent storm', 'hurricane'],
            wx: ['clear', 'partly cloudy', 'cloudy', 'fog', 'drizzle', 'rain', 'snow', 'thunderstorm'],
            sea_s: [[0.1, 'calm'], [0.5, 'smooth'], [1.25, 'slight'], [2.5, 'moderate'], [4, 'rough'], [6, 'very rough'], [99, 'high']] },
      es: { now: 'Ahora en Loano', next: 'Próximos días', wind: 'Viento', from: 'del', sea: 'Mar', air: 'Aire', water: 'Agua', gusts: 'rachas', force: 'Fuerza', upd: 'Actualizado a las', na: 'Datos meteorológicos no disponibles en este momento.',
            days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], today: 'Hoy', dir: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
            bf: ['calma', 'ventolina', 'flojito', 'flojo', 'bonancible', 'fresquito', 'fresco', 'frescachón', 'temporal', 'temporal fuerte', 'temporal duro', 'temporal muy duro', 'temporal huracanado'],
            wx: ['despejado', 'poco nuboso', 'nuboso', 'niebla', 'llovizna', 'lluvia', 'nieve', 'tormenta'],
            sea_s: [[0.1, 'calma'], [0.5, 'rizada'], [1.25, 'marejadilla'], [2.5, 'marejada'], [4, 'fuerte marejada'], [6, 'gruesa'], [99, 'muy gruesa']] },
      de: { now: 'Jetzt in Loano', next: 'Nächste Tage', wind: 'Wind', from: 'aus', sea: 'See', air: 'Luft', water: 'Wasser', gusts: 'Böen', force: 'Stärke', upd: 'Aktualisiert um', na: 'Wetterdaten derzeit nicht verfügbar.',
            days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], today: 'Heute', dir: ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'],
            bf: ['Windstille', 'leiser Zug', 'leichte Brise', 'schwache Brise', 'mäßige Brise', 'frische Brise', 'starker Wind', 'steifer Wind', 'stürmischer Wind', 'Sturm', 'schwerer Sturm', 'orkanartiger Sturm', 'Orkan'],
            wx: ['klar', 'leicht bewölkt', 'bewölkt', 'Nebel', 'Niesel', 'Regen', 'Schnee', 'Gewitter'],
            sea_s: [[0.1, 'ruhig'], [0.5, 'schwach bewegt'], [1.25, 'leicht bewegt'], [2.5, 'mäßig bewegt'], [4, 'grob'], [6, 'sehr grob'], [99, 'hoch']] },
    };
    var T = TT[lang] || TT.it;
    var dir = function (d) { return d == null ? '' : T.dir[Math.round(d / 45) % 8]; };
    var num = function (v, n) { var s = v.toFixed(n); return lang === 'en' ? s : s.replace('.', ','); };
    var stato = function (h) { for (var i = 0; i < T.sea_s.length; i++) if (h <= T.sea_s[i][0]) return T.sea_s[i][1]; return ''; };
    var BFK = [1, 4, 7, 11, 17, 22, 28, 34, 41, 48, 56, 64];
    var bft = function (kn) { var i = 0; while (i < BFK.length && kn >= BFK[i]) i++; return i; };
    var lvl = function (kn) { return kn < 12 ? 'ok' : kn < 20 ? 'mid' : kn < 28 ? 'hi' : 'max'; };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

    // gruppo del codice meteo WMO: 0 sereno, 1 poco nuvoloso, 2 nuvoloso, 3 nebbia, 4 pioviggine, 5 pioggia, 6 neve, 7 temporale
    var wg = function (c) { return c === 0 ? 0 : c <= 2 ? 1 : c === 3 ? 2 : c <= 48 ? 3 : c <= 57 ? 4 : c <= 67 || (c >= 80 && c <= 82) ? 5 : c <= 77 || c === 85 || c === 86 ? 6 : 7; };
    var SUN = '<circle cx="12" cy="12" r="4.2" fill="#FFC542" stroke="none"/><g stroke="#FFC542"><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></g>';
    var CLOUD = function (x) { return '<path d="M7 18.5h10a3.8 3.8 0 0 0 .5-7.6A5.5 5.5 0 0 0 7 11.2a3.7 3.7 0 0 0 0 7.3z" fill="' + (x || '#C9D8E3') + '" stroke="none"/>'; };
    var ICONS = [
      SUN,
      '<g transform="translate(-3 -3) scale(.8)">' + SUN + '</g>' + CLOUD(),
      CLOUD('#9FB3C4'),
      CLOUD('#9FB3C4') + '<path d="M4 21h16M6 23h12" stroke="#9FB3C4"/>',
      CLOUD('#9FB3C4') + '<path d="M9 21v1M13 21v1M17 21v1" stroke="#22B8F0"/>',
      CLOUD('#7F95A8') + '<path d="M8 20.5l-1 2.5M12 20.5l-1 2.5M16 20.5l-1 2.5" stroke="#22B8F0"/>',
      CLOUD('#C9D8E3') + '<path d="M8 21.5h.01M12 22.5h.01M16 21.5h.01" stroke="#fff" stroke-width="2.6"/>',
      CLOUD('#5F7487') + '<path d="M12.5 17l-2 4h3l-2 3" stroke="#FFC542" stroke-width="1.8"/>'
    ];
    var wicon = function (c, size) { var g = wg(c); return '<svg class="mt-wx" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" aria-label="' + esc(T.wx[g]) + '" role="img">' + ICONS[g] + '</svg>'; };
    // freccia: la direzione meteo indica da dove arriva il vento, la freccia punta dove soffia
    var arrow = function (deg, size) { return '<svg class="mt-arr" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate(' + ((deg + 180) % 360) + 'deg)"><path d="M12 3l5 9h-3.5v9h-3v-9H7z" fill="currentColor"/></svg>'; };
    // ingranaggio decorativo in ottone
    var gear = function (cx, cy, r, teeth, cls) {
      var pts = [], n = teeth * 2;
      for (var i = 0; i < n * 2; i++) {
        var ang = Math.PI * 2 * i / (n * 2), rr = (Math.floor(i / 2) % 2 === 0) ? r : r * 0.82;
        pts.push((cx + rr * Math.cos(ang)).toFixed(1) + ',' + (cy + rr * Math.sin(ang)).toFixed(1));
      }
      return '<g class="' + cls + '" style="transform-origin:' + cx + 'px ' + cy + 'px"><polygon points="' + pts.join(' ') + '" fill="url(#brass)" stroke="#4a3312" stroke-width="2"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.55) + '" fill="none" stroke="#4a3312" stroke-width="3"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.18) + '" fill="#4a3312"/></g>';
    };
    var GEARS = '<svg class="mt-gears" viewBox="0 0 300 300" aria-hidden="true"><defs><linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9C77B"/><stop offset=".5" stop-color="#A27A35"/><stop offset="1" stop-color="#5E4119"/></linearGradient></defs>' +
      gear(110, 110, 92, 14, 'g1') + gear(232, 70, 48, 9, 'g2') + gear(70, 240, 54, 10, 'g3') + '</svg>';
    var TENT = '<svg class="mt-tent" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true">' +
      ['M60 0 C 40 50, 90 90, 60 160', 'M120 0 C 140 60, 90 100, 125 160', 'M200 0 C 185 55, 225 105, 200 160', 'M280 0 C 260 60, 310 100, 275 160', 'M340 0 C 360 50, 310 90, 345 160']
        .map(function (d, i) { return '<path d="' + d + '" class="t' + i + '"/>'; }).join('') + '</svg>';
    var BUOY = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E9C77B" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 2v3M9 9l3-4 3 4M8 15l1.5-6h5L16 15z"/><path d="M3 19c2 0 2-1.5 4.5-1.5S10 19 12 19s2.5-1.5 4.5-1.5S19 19 21 19"/></svg>';
    var THERMO = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E9C77B" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><circle cx="12" cy="17" r="1.6" fill="#FF7A59" stroke="none"/></svg>';
    var bubble = function (cls, icon, main, sub, label, fill) {
      return '<div class="mt-bub ' + cls + '">' + (fill != null ? '<i class="mt-fill" style="height:' + fill + '%"></i>' : '') +
        '<div class="mt-bub-in">' + icon + '<div class="mt-bub-v">' + main + '</div>' + (sub ? '<div class="mt-bub-s">' + sub + '</div>' : '') + '<div class="mt-bub-l">' + label + '</div></div></div>';
    };

    var W = 'https://api.open-meteo.com/v1/forecast?latitude=44.1286&longitude=8.2589&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=kn&timezone=Europe%2FRome&forecast_days=5';
    var M = 'https://marine-api.open-meteo.com/v1/marine?latitude=44.11&longitude=8.29&current=wave_height,sea_surface_temperature&daily=wave_height_max&timezone=Europe%2FRome&forecast_days=5';
    var get = function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };

    Promise.all([get(W), get(M).catch(function () { return null; })]).then(function (res) {
      var w = res[0], m = res[1], c = w.current;
      var wave = m && m.current ? m.current.wave_height : null;
      var sst = m && m.current ? m.current.sea_surface_temperature : null;
      var kn = c.wind_speed_10m, b = bft(kn);
      var time = (c.time || '').slice(11, 16);
      var title = box.getAttribute('data-title') || '';
      var bubbles =
        bubble('b-wind lv-' + lvl(kn), arrow(c.wind_direction_10m, 30), Math.round(kn) + '<small> kn ' + dir(c.wind_direction_10m) + '</small>',
          T.gusts + ' ' + Math.round(c.wind_gusts_10m) + ' kn<br>' + T.force + ' ' + b + ' · ' + esc(T.bf[b]), T.wind) +
        bubble('b-sea', BUOY, wave != null ? num(wave, 1) + '<small> m</small>' : '—', wave != null ? esc(stato(wave)) : '', T.sea, wave != null ? 22 + Math.min(40, Math.round(wave * 12)) : 25) +
        bubble('b-air', wicon(c.weather_code, 34), Math.round(c.temperature_2m) + '°', esc(T.wx[wg(c.weather_code)]), T.air) +
        bubble('b-water', THERMO, sst != null ? Math.round(sst) + '°' : '—', '', T.water, 48);
      var stones = '';
      (w.daily.time || []).forEach(function (d, i) {
        var dt = new Date(d + 'T12:00:00');
        var wv = m && m.daily ? m.daily.wave_height_max[i] : null;
        var dk = w.daily.wind_speed_10m_max[i];
        stones += '<div class="mt-st">' +
          '<div class="mt-st-ic">' + wicon(w.daily.weather_code[i], 34) + '</div>' +
          '<div class="mt-stone">' +
            '<b>' + (i === 0 ? T.today : T.days[dt.getDay()] + ' ' + dt.getDate()) + '</b>' +
            '<span class="mt-st-t">' + Math.round(w.daily.temperature_2m_max[i]) + '° <em>' + Math.round(w.daily.temperature_2m_min[i]) + '°</em></span>' +
            '<span class="mt-st-w lv-' + lvl(dk) + '">' + arrow(w.daily.wind_direction_10m_dominant[i], 13) + Math.round(dk) + ' kn ' + dir(w.daily.wind_direction_10m_dominant[i]) + '</span>' +
            '<span class="mt-st-n">' + T.gusts + ' ' + Math.round(w.daily.wind_gusts_10m_max[i]) + (wv != null ? ' · ' + num(wv, 1) + ' m' : '') + '</span>' +
          '</div></div>';
      });
      box.innerHTML =
        '<div class="mt-scene">' +
          '<div class="mt-rays" aria-hidden="true"></div>' +
          (title ? '<div class="mt-plaque"><span>' + esc(title) + '</span></div>' : '') +
          '<div class="mt-stage">' +
            '<div class="mt-jelly"><div class="mt-dome" aria-hidden="true"></div>' + GEARS + '<div class="mt-bubbles">' + bubbles + '</div>' + TENT + '</div>' +
            '<div class="mt-fc"><div class="mt-fc-h">' + T.next + '</div><div class="mt-rail">' + stones + '</div></div>' +
          '</div>' +
          (time ? '<p class="mt-upd">' + T.now + ' · ' + T.upd + ' ' + time + '</p>' : '') +
        '</div>';
    }).catch(function () { box.innerHTML = '<p class="hint">' + esc(T.na) + '</p>'; });
  }

  // ---------- MARCATORE GPS ----------
  var el = document.querySelector('[data-gps]');
  if (el && window.L) {
    var l2 = el.getAttribute('data-lang') || 'it';
    var MYPOS = { it: 'La mia posizione: ', en: 'My position: ', es: 'Mi posición: ', de: 'Meine Position: ' }[l2];
    var map = L.map(el, { scrollWheelZoom: false }).setView(LOANO, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
    var icon = L.divIcon({ className: '', html: '<svg width="36" height="36" viewBox="0 0 24 24" fill="#FF8A3D" stroke="#050E1A" stroke-width="1"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>', iconSize: [36, 36], iconAnchor: [18, 34] });
    var marker = null, cur = null;
    var coords = document.querySelector('[data-gps-coords]');
    var links = document.querySelectorAll('[data-gps-link]');
    var copy = document.querySelector('[data-gps-copy]');

    function fmt(v, pos, neg) {
      var a = Math.abs(v), d = Math.floor(a), mm = (a - d) * 60;
      return d + '° ' + mm.toFixed(3) + "' " + (v >= 0 ? pos : neg);
    }
    function set(p) {
      cur = p;
      if (marker) marker.setLatLng(p); else marker = L.marker(p, { icon: icon, draggable: true }).addTo(map).on('dragend', function () { set(marker.getLatLng()); });
      var lat = p.lat.toFixed(6), lng = p.lng.toFixed(6);
      coords.textContent = lat + ', ' + lng + '   ·   ' + fmt(p.lat, 'N', 'S') + '  ' + fmt(p.lng, 'E', 'W');
      var g = 'https://www.google.com/maps?q=' + lat + ',' + lng;
      links.forEach(function (a) {
        var k = a.getAttribute('data-gps-link');
        a.href = k === 'gmaps' ? g : k === 'gearth' ? 'https://earth.google.com/web/search/' + lat + ',' + lng : 'https://wa.me/?text=' + encodeURIComponent(MYPOS + g);
        a.classList.remove('is-off');
      });
      copy.classList.remove('is-off');
    }
    map.on('click', function (e) { set(e.latlng); });

    var loc = document.querySelector('[data-gps-locate]');
    loc.addEventListener('click', function () {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(function (pos) {
        var p = L.latLng(pos.coords.latitude, pos.coords.longitude);
        map.setView(p, 17); set(p);
      }, function (err) { coords.textContent = err.message; }, { enableHighAccuracy: true, timeout: 15000 });
    });

    copy.addEventListener('click', function () {
      if (!cur) return;
      var t = cur.lat.toFixed(6) + ', ' + cur.lng.toFixed(6), old = copy.textContent;
      var done = function () { copy.textContent = copy.getAttribute('data-done'); setTimeout(function () { copy.textContent = old; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { prompt('', t); }); else prompt('', t);
    });
  }
})();
