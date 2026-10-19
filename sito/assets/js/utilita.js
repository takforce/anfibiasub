// Pagina Utilità: meteomare Loano (Open-Meteo) e marcatore GPS (OpenStreetMap).
// Tutto avviene nel browser: nessun dato viene salvato.
(function () {
  var LOANO = [44.1286, 8.2589];

  // ---------- METEO ----------
  var box = document.querySelector('[data-meteo]');
  if (box) {
    var en = box.getAttribute('data-lang') === 'en';
    var T = en
      ? { wind: 'Wind', sea: 'Sea', air: 'Air', water: 'Water', gusts: 'gusts', na: 'Weather data not available right now.', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }
      : { wind: 'Vento', sea: 'Mare', air: 'Aria', water: 'Acqua', gusts: 'raffiche', na: 'Dati meteo non disponibili in questo momento.', days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'] };
    var DIR = en ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] : ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    var dir = function (d) { return d == null ? '' : DIR[Math.round(d / 45) % 8]; };
    var num = function (v, n) { var s = v.toFixed(n); return en ? s : s.replace('.', ','); };
    var stato = function (h) {
      var it = [[0.1, 'calmo'], [0.5, 'quasi calmo'], [1.25, 'poco mosso'], [2.5, 'mosso'], [4, 'molto mosso'], [6, 'agitato'], [99, 'grosso']];
      var gb = [[0.1, 'calm'], [0.5, 'smooth'], [1.25, 'slight'], [2.5, 'moderate'], [4, 'rough'], [6, 'very rough'], [99, 'high']];
      var l = en ? gb : it;
      for (var i = 0; i < l.length; i++) if (h <= l[i][0]) return l[i][1];
      return '';
    };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

    var W = 'https://api.open-meteo.com/v1/forecast?latitude=44.1286&longitude=8.2589&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=kn&timezone=Europe%2FRome&forecast_days=4';
    var M = 'https://marine-api.open-meteo.com/v1/marine?latitude=44.11&longitude=8.29&current=wave_height,sea_surface_temperature&daily=wave_height_max&timezone=Europe%2FRome&forecast_days=4';
    var get = function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };

    Promise.all([get(W), get(M).catch(function () { return null; })]).then(function (res) {
      var w = res[0], m = res[1], c = w.current;
      var wave = m && m.current ? m.current.wave_height : null;
      var sst = m && m.current ? m.current.sea_surface_temperature : null;
      var html =
        '<div class="m-box"><div class="m-label">' + T.wind + '</div><div class="m-val">' + Math.round(c.wind_speed_10m) + ' <small>kn ' + dir(c.wind_direction_10m) + '</small></div><div class="m-note">' + T.gusts + ' ' + Math.round(c.wind_gusts_10m) + ' kn</div></div>' +
        '<div class="m-box"><div class="m-label">' + T.sea + '</div><div class="m-val">' + (wave != null ? num(wave, 1) + ' <small>m</small>' : '—') + '</div><div class="m-note">' + (wave != null ? stato(wave) : '') + '</div></div>' +
        '<div class="m-box"><div class="m-label">' + T.air + '</div><div class="m-val">' + Math.round(c.temperature_2m) + '°</div></div>' +
        '<div class="m-box"><div class="m-label">' + T.water + '</div><div class="m-val">' + (sst != null ? Math.round(sst) + '°' : '—') + '</div></div>';
      var days = '';
      (w.daily.time || []).forEach(function (d, i) {
        var dt = new Date(d + 'T12:00:00');
        var wv = m && m.daily ? m.daily.wave_height_max[i] : null;
        days += '<div class="m-day"><b>' + T.days[dt.getDay()] + ' ' + dt.getDate() + '</b>' + Math.round(w.daily.wind_speed_10m_max[i]) + ' kn ' + dir(w.daily.wind_direction_10m_dominant[i]) +
          '<br><span class="m-note">' + T.gusts + ' ' + Math.round(w.daily.wind_gusts_10m_max[i]) + (wv != null ? ' · ' + num(wv, 1) + ' m' : '') + '</span></div>';
      });
      box.innerHTML = html + '<div class="m-days">' + days + '</div>';
    }).catch(function () { box.innerHTML = '<p class="hint">' + esc(T.na) + '</p>'; });
  }

  // ---------- MARCATORE GPS ----------
  var el = document.querySelector('[data-gps]');
  if (el && window.L) {
    var en2 = el.getAttribute('data-lang') === 'en';
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
        a.href = k === 'gmaps' ? g : k === 'gearth' ? 'https://earth.google.com/web/search/' + lat + ',' + lng : 'https://wa.me/?text=' + encodeURIComponent((en2 ? 'My position: ' : 'La mia posizione: ') + g);
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
