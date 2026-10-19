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
    var dial = function (deg, kn) {
      var ticks = '';
      for (var i = 0; i < 72; i++) { var long = i % 18 === 0; ticks += '<line x1="80" y1="' + (long ? 10 : 13) + '" x2="80" y2="19" transform="rotate(' + (i * 5) + ' 80 80)" stroke="' + (long ? '#C9D8E3' : 'rgba(201,216,227,.25)') + '" stroke-width="' + (long ? 2 : 1) + '"/>'; }
      var card = T.dir.filter(function (_, i) { return i % 2 === 0; });
      var lab = '<text x="80" y="34" text-anchor="middle">' + card[0] + '</text><text x="128" y="84" text-anchor="middle">' + card[1] + '</text><text x="80" y="134" text-anchor="middle">' + card[2] + '</text><text x="32" y="84" text-anchor="middle">' + card[3] + '</text>';
      return '<svg class="mt-dial lv-' + lvl(kn) + '" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="74" fill="#081A2C" stroke="rgba(34,184,240,.25)"/>' + ticks + '<g class="mt-card">' + lab + '</g>' +
        '<g transform="rotate(' + ((deg + 180) % 360) + ' 80 80)"><path d="M80 22l9 20h-6v22h-6V42h-6z" class="mt-needle"/><path d="M80 138l-5-14h10z" fill="rgba(201,216,227,.45)"/></g>' +
        '<circle cx="80" cy="80" r="30" fill="#0B2A44"/><text x="80" y="84" text-anchor="middle" class="mt-dial-n">' + Math.round(kn) + '</text><text x="80" y="100" text-anchor="middle" class="mt-dial-u">kn</text></svg>';
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
      var waveBar = wave != null ? Math.min(100, Math.round(wave / 4 * 100)) : 0;
      var now =
        '<div class="mt-head"><h3>' + T.now + '</h3><span>' + (time ? T.upd + ' ' + time : '') + '</span></div>' +
        '<div class="mt-now">' +
          '<div class="mt-wind lv-' + lvl(kn) + '">' + dial(c.wind_direction_10m, kn) +
            '<div class="mt-wind-txt"><div class="m-label">' + T.wind + '</div>' +
            '<div class="mt-big">' + T.force + ' ' + b + '</div>' +
            '<div class="mt-sub">' + esc(T.bf[b]) + '</div>' +
            '<div class="mt-chips"><span>' + T.from + ' ' + dir(c.wind_direction_10m) + '</span><span>' + T.gusts + ' ' + Math.round(c.wind_gusts_10m) + ' kn</span></div></div>' +
          '</div>' +
          '<div class="mt-side">' +
            '<div class="mt-tile"><div class="m-label">' + T.sea + '</div><div class="mt-val">' + (wave != null ? num(wave, 1) + '<small> m</small>' : '—') + '</div>' +
              '<div class="mt-sub">' + (wave != null ? esc(stato(wave)) : '') + '</div><div class="mt-bar"><i style="width:' + waveBar + '%"></i></div></div>' +
            '<div class="mt-tile mt-row"><div><div class="m-label">' + T.air + '</div><div class="mt-val">' + Math.round(c.temperature_2m) + '°</div><div class="mt-sub">' + esc(T.wx[wg(c.weather_code)]) + '</div></div>' + wicon(c.weather_code, 54) + '</div>' +
            '<div class="mt-tile"><div class="m-label">' + T.water + '</div><div class="mt-val">' + (sst != null ? Math.round(sst) + '°' : '—') + '</div></div>' +
          '</div>' +
        '</div>';
      var days = '';
      (w.daily.time || []).forEach(function (d, i) {
        var dt = new Date(d + 'T12:00:00');
        var wv = m && m.daily ? m.daily.wave_height_max[i] : null;
        var dk = w.daily.wind_speed_10m_max[i];
        days += '<div class="mt-day">' +
          '<b>' + (i === 0 ? T.today : T.days[dt.getDay()] + ' ' + dt.getDate()) + '</b>' +
          wicon(w.daily.weather_code[i], 40) +
          '<div class="mt-temp">' + Math.round(w.daily.temperature_2m_max[i]) + '° <span>' + Math.round(w.daily.temperature_2m_min[i]) + '°</span></div>' +
          '<div class="mt-pill lv-' + lvl(dk) + '">' + arrow(w.daily.wind_direction_10m_dominant[i], 14) + Math.round(dk) + ' kn</div>' +
          '<div class="m-note">' + T.gusts + ' ' + Math.round(w.daily.wind_gusts_10m_max[i]) + (wv != null ? '<br>' + T.sea + ' ' + num(wv, 1) + ' m' : '') + '</div>' +
        '</div>';
      });
      box.innerHTML = now + '<div class="mt-head"><h3>' + T.next + '</h3></div><div class="mt-days">' + days + '</div>';
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
