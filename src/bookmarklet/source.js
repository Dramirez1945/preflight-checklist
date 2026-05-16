/**
 * MX Report — Bookmarklet Source
 * Advanced Air LLC · Universal Maintenance Shift Briefing
 *
 * Run this on portal.jetinsight.com while logged in.
 * To build the installable bookmark URL, open build.html in your browser.
 *
 * Configurable on launch (last values remembered via localStorage):
 *   - Station         (default PHX; e.g. HHR, etc.)
 *   - Shift window    (default 06:00–17:00 in station-local time)
 *   - Date            (Today / Tomorrow / Day after, or a custom calendar pick)
 *
 * Crew swaps are stripped. Flights outside the shift window appear as FYI only.
 */

(async function MXReport() {

  // ─── Stations and defaults ────────────────────────────────────────────────

  var TZ_BY_STATION = {
    PHX: 'America/Phoenix',
    HHR: 'America/Los_Angeles'
  };
  var FALLBACK_TZ = 'America/Phoenix';
  var DEFAULT_STATION = 'PHX';
  var DEFAULT_START_MIN = 360;   // 06:00
  var DEFAULT_END_MIN = 1020;    // 17:00
  var STORAGE_KEY = '__mx_report_config_v1';

  var tzFor = function (station) {
    return TZ_BY_STATION[station] || FALLBACK_TZ;
  };

  // ─── Time / date utilities (tz-parameterized) ─────────────────────────────

  var hhmmInTz = function (iso, tz) {
    var p = new Date(new Date(iso).toLocaleString('en-US', { timeZone: tz }));
    return String(p.getHours()).padStart(2, '0') + ':' + String(p.getMinutes()).padStart(2, '0');
  };

  var ymdInTz = function (d, tz) {
    return new Date(d).toLocaleDateString('en-CA', { timeZone: tz });
  };

  var minutesInTz = function (iso, tz) {
    var p = new Date(new Date(iso).toLocaleString('en-US', { timeZone: tz }));
    return p.getHours() * 60 + p.getMinutes();
  };

  var minToHHMM = function (m) {
    return String(Math.floor(m / 60)).padStart(2, '0') + String(m % 60).padStart(2, '0');
  };

  var minToTimeInput = function (m) {
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  };

  var timeInputToMin = function (s) {
    if (!s) return null;
    var parts = s.split(':');
    if (parts.length !== 2) return null;
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  var tzAbbrev = function (tz, date) {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(date || new Date());
      var p = parts.find(function (x) { return x.type === 'timeZoneName'; });
      return p ? p.value : '';
    } catch (e) { return ''; }
  };

  var addDays = function (d, n) {
    return new Date(d.getTime() + n * 86400000);
  };

  var escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var now = new Date();

  // ─── Load saved config (station + shift window) from localStorage ─────────

  var loadConfig = function () {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return null;
      var station = typeof obj.station === 'string' && obj.station.trim()
        ? obj.station.trim().toUpperCase().slice(0, 4)
        : DEFAULT_STATION;
      var startMin = typeof obj.startMin === 'number' && obj.startMin >= 0 && obj.startMin < 1440
        ? obj.startMin : DEFAULT_START_MIN;
      var endMin = typeof obj.endMin === 'number' && obj.endMin > 0 && obj.endMin <= 1440
        ? obj.endMin : DEFAULT_END_MIN;
      return { station: station, startMin: startMin, endMin: endMin };
    } catch (e) { return null; }
  };

  var saveConfig = function (cfg) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (e) {}
  };

  var initial = loadConfig() || {
    station: DEFAULT_STATION,
    startMin: DEFAULT_START_MIN,
    endMin: DEFAULT_END_MIN
  };

  // ─── Build overlay + card shell ───────────────────────────────────────────

  var ov = document.createElement('div');
  ov.id = '__phxov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:2147483647;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';

  var card = document.createElement('div');
  card.style.cssText = 'background:#0a0e17;color:#d4dce8;width:min(880px,96vw);max-height:92vh;overflow-y:auto;border-radius:10px;padding:32px;font-family:ui-monospace,Menlo,monospace;box-shadow:0 32px 100px #000,inset 0 1px 0 rgba(255,255,255,.05);border:1px solid #1e2a3a';

  ov.appendChild(card);
  document.body.appendChild(ov);
  ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });

  // Delegated click handler — close, day buttons, custom-date run, accordions
  card.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) { ov.remove(); return; }

    var rb = e.target.closest('[data-run]');
    if (rb) { runFromForm(rb.dataset.run); return; }

    var rc = e.target.closest('[data-run-custom]');
    if (rc) {
      var di = document.getElementById('__phxcustom');
      if (di && di.value) { runFromForm(di.value); }
      else { showFormError('Pick a date first.'); }
      return;
    }

    var tb = e.target.closest('[data-toggle]');
    if (tb) {
      e.stopPropagation();
      var id = tb.dataset.toggle;
      var body = document.getElementById(id);
      if (body) {
        var hidden = body.style.display === 'none';
        body.style.display = hidden ? 'block' : 'none';
        var arr = tb.querySelector('.phxarr');
        if (arr) arr.textContent = hidden ? '▾' : '▸';
      }
    }
  });

  // ─── Inline-error helper for config card ──────────────────────────────────

  var showFormError = function (msg) {
    var el = document.getElementById('__phxerr');
    if (el) el.textContent = msg;
  };

  var clearFormError = function () {
    var el = document.getElementById('__phxerr');
    if (el) el.textContent = '';
  };

  // ─── Config-card render ───────────────────────────────────────────────────

  var renderConfigCard = function () {
    var previewTz = tzFor(initial.station);

    var opts = [0, 1, 2].map(function (n) {
      var d = addDays(now, n);
      var label = n === 0 ? 'Today'
        : n === 1 ? 'Tomorrow'
        : d.toLocaleDateString('en-US', { timeZone: previewTz, weekday: 'long' });
      var sub = d.toLocaleDateString('en-US', { timeZone: previewTz, month: 'short', day: 'numeric' });
      return { label: label, sub: sub, ymd: ymdInTz(d, previewTz) };
    });

    var todayYmd = ymdInTz(now, previewTz);

    card.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;padding-bottom:14px;border-bottom:1px solid #1e2a3a">' +
      '<div style="color:#4db8ff;font-size:15px;font-weight:700;letter-spacing:.07em">✈ <span id="__phxhdr">' + escapeHtml(initial.station) + '</span> MX SHIFT BRIEFING</div>' +
      '<button data-close style="background:none;border:1px solid #1e2a3a;color:#3a4a5e;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:11px;font-family:inherit">✕</button>' +
      '</div>' +

      '<div style="color:#3a4a5e;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Station</div>' +
      '<input id="__phxstation" type="text" maxlength="4" value="' + escapeHtml(initial.station) + '" style="width:140px;background:#0d1420;border:1px solid #1e2a3a;border-radius:6px;color:#e2eaf4;font-family:inherit;font-size:14px;padding:10px 12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:18px;outline:none">' +

      '<div style="color:#3a4a5e;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Shift Window</div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">' +
      '<input id="__phxstart" type="time" value="' + minToTimeInput(initial.startMin) + '" style="background:#0d1420;border:1px solid #1e2a3a;border-radius:6px;color:#e2eaf4;font-family:inherit;font-size:14px;padding:10px 12px;outline:none">' +
      '<span style="color:#3a4a5e;font-size:12px">to</span>' +
      '<input id="__phxend" type="time" value="' + minToTimeInput(initial.endMin) + '" style="background:#0d1420;border:1px solid #1e2a3a;border-radius:6px;color:#e2eaf4;font-family:inherit;font-size:14px;padding:10px 12px;outline:none">' +
      '</div>' +

      '<div style="color:#3a4a5e;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Select Date</div>' +
      '<div style="display:flex;gap:10px;margin-bottom:14px">' +
      opts.map(function (o) {
        return '<button data-run="' + o.ymd + '" style="flex:1;background:#0d1420;border:1px solid #1e2a3a;color:#94a3b8;padding:16px 10px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:14px;transition:border-color .15s" onmouseover="this.style.borderColor=\'#4db8ff\';this.style.color=\'#e2eaf4\'" onmouseout="this.style.borderColor=\'#1e2a3a\';this.style.color=\'#94a3b8\'">' +
          '<div style="font-weight:700">' + o.label + '</div>' +
          '<div style="font-size:11px;margin-top:3px;color:#3a4a5e">' + o.sub + '</div>' +
          '</button>';
      }).join('') +
      '</div>' +

      '<div style="color:#3a4a5e;font-size:11px;text-align:center;margin-bottom:8px">— or pick a custom date —</div>' +
      '<div style="display:flex;gap:10px;align-items:center">' +
      '<input id="__phxcustom" type="date" value="' + todayYmd + '" style="flex:1;background:#0d1420;border:1px solid #1e2a3a;border-radius:6px;color:#e2eaf4;font-family:inherit;font-size:14px;padding:10px 12px;outline:none">' +
      '<button data-run-custom style="background:#0f3460;border:1px solid #4db8ff;color:#4db8ff;padding:10px 22px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;letter-spacing:.06em">Run Report</button>' +
      '</div>' +

      '<div id="__phxerr" style="color:#ef4444;font-size:12px;margin-top:12px;min-height:16px"></div>';

    // Live header update + auto-uppercase station as user types
    var stationInput = document.getElementById('__phxstation');
    var headerSpan = document.getElementById('__phxhdr');
    stationInput.addEventListener('input', function () {
      var v = stationInput.value.toUpperCase();
      if (v !== stationInput.value) stationInput.value = v;
      headerSpan.textContent = v || DEFAULT_STATION;
      clearFormError();
    });
  };

  // ─── Form → state, validation, dispatch to runReport ──────────────────────

  var runFromForm = function (selDate) {
    var stationRaw = (document.getElementById('__phxstation').value || '').trim().toUpperCase();
    var station = stationRaw || DEFAULT_STATION;
    var startMin = timeInputToMin(document.getElementById('__phxstart').value);
    var endMin = timeInputToMin(document.getElementById('__phxend').value);

    if (startMin === null || endMin === null) {
      showFormError('Shift window times look invalid.');
      return;
    }
    if (endMin <= startMin) {
      showFormError('End time must be after start time.');
      return;
    }
    if (!selDate) {
      showFormError('Pick a date.');
      return;
    }

    saveConfig({ station: station, startMin: startMin, endMin: endMin });

    var state = {
      station: station,
      tz: tzFor(station),
      startMin: startMin,
      endMin: endMin
    };

    runReport(selDate, state);
  };

  // ─── Main report runner ───────────────────────────────────────────────────

  var runReport = async function (selDate, state) {

    var nextDate = ymdInTz(addDays(new Date(selDate + 'T12:00:00'), 1), state.tz);
    var dispDate = new Date(selDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    var shiftLabel = minToHHMM(state.startMin) + '–' + minToHHMM(state.endMin) + ' ' + tzAbbrev(state.tz, new Date(selDate + 'T12:00:00'));

    card.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #1e2a3a">' +
      '<div><div style="color:#4db8ff;font-size:15px;font-weight:700;letter-spacing:.07em">✈ ' + escapeHtml(state.station) + ' MX SHIFT BRIEFING</div>' +
      '<div style="color:#3a4a5e;font-size:11px;margin-top:3px">' + dispDate + ' &nbsp;│&nbsp; ' + shiftLabel + '</div></div>' +
      '<button data-close style="background:none;border:1px solid #1e2a3a;color:#3a4a5e;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:11px;font-family:inherit">✕</button></div>' +
      '<div id="__phxstatus" style="font-size:11px;color:#3a4a5e;line-height:2;margin-bottom:4px"></div>' +
      '<div id="__phxbody"></div>';

    var log = function (msg) { var el = document.getElementById('__phxstatus'); if (el) el.innerHTML += '<div>▸ ' + msg + '</div>'; };

    // Get field value from JetInsight's div-based layout (label div → sibling div)
    var getField = function (doc, label) {
      var v = '';
      doc.querySelectorAll('div').forEach(function (d) {
        if (d.children.length === 0 && d.textContent.trim() === label) {
          var ns = d.nextElementSibling;
          v = ns ? ns.textContent.trim() : '';
        }
      });
      return v;
    };

    var FT = new Set(['Scheduled flight', 'Positioning flight', 'Customer flight', 'Maintenance']);
    var SKIP = ['CREW SWAP', 'SIC SWAP', 'FA SWAP', '@ K'];

    var isAtStation = function (e) {
      var o = ((e.extendedProps && e.extendedProps.origin_short) || '').toUpperCase();
      var d = ((e.extendedProps && e.extendedProps.destination_short) || '').toUpperCase();
      var t = (e.title || '').toUpperCase();
      return o === state.station || d === state.station || t.includes(state.station);
    };

    var inShift = function (iso) {
      var m = minutesInTz(iso, state.tz);
      return m >= state.startMin && m < state.endMin;
    };

    try {

      // ── Schedule ──────────────────────────────────────────────────────────

      log('Fetching schedule...');
      var sched = await fetch('/schedule/aircraft.json?start=' + selDate + '&end=' + nextDate + '&time_zone=' + encodeURIComponent(state.tz)).then(function (r) { return r.json(); });

      var shiftEvents = sched.filter(function (e) {
        if (!isAtStation(e)) return false;
        if (ymdInTz(new Date(e.start), state.tz) !== selDate) return false;
        var tp = (e.extendedProps && e.extendedProps.event_type_name) || '';
        if (FT.has(tp)) return inShift(e.start);
        return true;
      }).sort(function (a, b) { return new Date(a.start) - new Date(b.start); });

      var afterShift = sched.filter(function (e) {
        if (!isAtStation(e)) return false;
        if (ymdInTz(new Date(e.start), state.tz) !== selDate) return false;
        var tp = (e.extendedProps && e.extendedProps.event_type_name) || '';
        if (!FT.has(tp)) return false;
        return minutesInTz(e.start, state.tz) >= state.endMin;
      });

      var fleet = [...new Set(
        shiftEvents
          .filter(function (e) { return FT.has((e.extendedProps && e.extendedProps.event_type_name) || ''); })
          .map(function (e) { return e.extendedProps && e.extendedProps.aircraft; })
          .filter(Boolean)
      )];

      if (!fleet.length) {
        document.getElementById('__phxstatus').remove();
        document.getElementById('__phxbody').innerHTML = '<div style="color:#f87171">No ' + escapeHtml(state.station) + ' aircraft found for this shift window.</div>';
        return;
      }

      // ── Compliance + MELs ─────────────────────────────────────────────────

      log('Checking fleet status...');
      await fetch('/compliance/aircraft_readiness').catch(function () {});

      var acData = {};
      var parser = new DOMParser();
      var allMX = [];
      var idx = 0;

      for (var aci = 0; aci < fleet.length; aci++) {
        var ac = fleet[aci];

        // Discrepancies
        log('Scanning ' + ac + '...');
        var disHtml = await fetch('/compliance/discrepancies/index_discrepancies_by_aircraft?aircraft=' + ac + '&per_page=500').then(function (r) { return r.text(); }).catch(function () { return ''; });
        var disDoc = parser.parseFromString(disHtml, 'text/html');
        var deferrals = [];
        disDoc.querySelectorAll('tbody tr').forEach(function (row) {
          var tds = [...row.querySelectorAll('td')];
          if (!tds.length) return;
          if (tds[tds.length - 1].textContent.trim() === 'Deferred') {
            var a = row.querySelector('a');
            if (a) deferrals.push({ href: a.href || (window.location.origin + a.getAttribute('href')), id: a.textContent.trim() });
          }
        });

        var defs = [];
        for (var di = 0; di < deferrals.length; di++) {
          var def = deferrals[di];
          log('Fetching ' + def.id + '...');
          var dh = await fetch(def.href).then(function (r) { return r.text(); }).catch(function () { return ''; });
          var dd = parser.parseFromString(dh, 'text/html');

          // Title: first .panel-heading that isn't a widget / section header
          var hs = [...dd.querySelectorAll('.panel-heading')];
          var SH = ['looking for', 'photos', 'maintenance sign', 'mel - category'];
          var tEl = hs.find(function (h) { return !SH.some(function (s) { return h.textContent.toLowerCase().includes(s); }); });
          var title = tEl ? tEl.textContent.trim() : def.id;

          // MEL category from its own panel heading
          var mH = hs.find(function (h) { return h.textContent.toLowerCase().includes('mel - category'); });
          var melCatM = mH ? mH.textContent.match(/Category\s+(\w)/i) : null;
          var melCat = melCatM ? melCatM[1].toUpperCase() : '';

          defs.push({
            id: def.id,
            title: title,
            details: getField(dd, 'Details'),
            melCat: melCat,
            melItem: getField(dd, 'Item number'),
            melExpiry: getField(dd, 'Deferral expiration date'),
            melLim: getField(dd, 'Operational limitation'),
            foundBy: getField(dd, 'Found by'),
            signoff: (dd.body ? dd.body.innerText : '').includes('Waiting for external sign off')
          });
        }

        // CAMP checks
        log('Fetching ' + ac + ' checks...');
        var chkHtml = await fetch('/compliance/aircraft_checks/' + ac).then(function (r) { return r.text(); }).catch(function () { return ''; });
        var chkTxt = parser.parseFromString(chkHtml, 'text/html').body ? parser.parseFromString(chkHtml, 'text/html').body.innerText : '';
        var cS = chkTxt.indexOf('Next due items');
        var cE = chkTxt.indexOf('Aircraft insurance');
        var camp = cS >= 0 ? chkTxt.substring(cS, cE > 0 ? cE : cS + 8000) : '';

        // Note: do NOT use \bWarning\b — JetInsight innerText concatenates "ZWarning" with no space
        var hasWarn = camp.includes('Warning');
        var hasExp = camp.includes('Expired');
        var warnItems = [];

        if (hasWarn || hasExp) {
          var parts = camp.split('Effective:');
          parts.forEach(function (part, i) {
            if (i === 0) return;
            var textBefore = parts.slice(0, i).join('Effective:');
            var allSt = textBefore.match(/(Warning|Expired|OK)/g) || [];
            var st = allSt.length ? allSt[allSt.length - 1] : '';
            if (st !== 'Warning' && st !== 'Expired') return;

            var dateRe = /Date\s*\n*\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*\n+\s*([A-Z][^\n]{4,80})/g;
            var dm;
            while ((dm = dateRe.exec(part)) !== null) {
              var desc = dm[2].trim();
              if (!warnItems.some(function (w) { return w.desc === desc; })) warnItems.push({ exp: dm[1].trim(), desc: desc, st: st });
            }

            var tolRe = /With tolerance\s*\n[\s\d\/]+\n+([A-Z][^\n]{4,80})/g;
            var pdm = part.match(/Date\s*\n*\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/);
            var pd = pdm ? pdm[1] : '';
            var tm;
            while ((tm = tolRe.exec(part)) !== null) {
              var desc2 = tm[1].trim();
              if (pd && !warnItems.some(function (w) { return w.desc === desc2; })) warnItems.push({ exp: pd, desc: desc2, st: st });
            }
          });
        }

        // Collect MX blocks for this aircraft
        shiftEvents
          .filter(function (e) { return e.extendedProps && e.extendedProps.aircraft === ac && (e.extendedProps.event_type_name === 'Maintenance' || (e.title || '').toUpperCase().includes('MX')); })
          .forEach(function (e) {
            allMX.push({
              ac: ac,
              t0: hhmmInTz(e.start, state.tz),
              t1: hhmmInTz(e.end, state.tz),
              title: e.title || '',
              notes: ((e.extendedProps && e.extendedProps.notes) || '').trim().replace(/\n/g, ' ')
            });
          });

        acData[ac] = { defs: defs, warnItems: warnItems, hasFlags: warnItems.length > 0 };
      }

      // ── Build report HTML ─────────────────────────────────────────────────

      var phxTS = 'color:#22c55e;font-weight:700;text-decoration:underline;text-underline-offset:3px;';
      var dimTS = 'color:#3a4a5e;';

      var html = '';

      // Legend
      html +=
        '<div style="display:flex;gap:16px;flex-wrap:wrap;background:#0d1420;border:1px solid #1e2a3a;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:12px;line-height:1.8">' +
        '<span><span style="' + phxTS + 'font-weight:700">08:00</span>&nbsp;<span style="color:#3a4a5e">' + escapeHtml(state.station) + ' dep/arr time</span></span>' +
        '<span><span style="color:#ef4444;font-size:10px">●</span>&nbsp;<span style="color:#3a4a5e">MX / Open MEL</span>&nbsp;<span style="color:#1e2a3a;font-size:10px">(tap to expand)</span></span>' +
        '<span><span style="color:#f59e0b;font-size:10px">●</span>&nbsp;<span style="color:#3a4a5e">CAMP flag</span>&nbsp;<span style="color:#1e2a3a;font-size:10px">(tap to expand)</span></span>' +
        '<span><span style="color:#22c55e">✓</span>&nbsp;<span style="color:#3a4a5e">Clean</span></span>' +
        '</div>';

      // Aircraft sections
      for (var ai = 0; ai < fleet.length; ai++) {
        var ac2 = fleet[ai];
        var evts = shiftEvents.filter(function (e) { return e.extendedProps && e.extendedProps.aircraft === ac2; });
        var data = acData[ac2];

        html += '<div style="margin-bottom:28px">';
        html += '<div style="font-size:16px;font-weight:700;color:#e2eaf4;letter-spacing:.04em;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #1e2a3a">' + ac2 + '</div>';

        // Flight table
        html += '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px"><thead><tr style="color:#3a4a5e;font-size:10px;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #1e2a3a"><th style="text-align:left;padding:3px 12px 3px 0;font-weight:400">' + escapeHtml(state.station) + ' Time</th><th style="text-align:left;padding:3px 12px 3px 0;font-weight:400">Route / Event</th><th style="text-align:left;padding:3px 0;font-weight:400">Pilots</th></tr></thead><tbody>';

        evts.forEach(function (e) {
          var tp = (e.extendedProps && e.extendedProps.event_type_name) || '';
          var title = e.title || '';
          if (tp === 'Aircraft away from home base') return;
          if (SKIP.some(function (k) { return title.toUpperCase().includes(k); })) return;

          var o = ((e.extendedProps && e.extendedProps.origin_short) || '').toUpperCase();
          var d = ((e.extendedProps && e.extendedProps.destination_short) || '').toUpperCase();
          var crew = ((e.extendedProps && e.extendedProps.crew_last_names) || []).join(' / ') || '—';
          var t0 = hhmmInTz(e.start, state.tz), t1 = hhmmInTz(e.end, state.tz);
          var notes = ((e.extendedProps && e.extendedProps.notes) || '').trim().replace(/\n/g, ' ');

          if (tp === 'Maintenance' || (title.toUpperCase().includes('MX') && tp !== 'Other')) {
            html += '<tr style="border-bottom:1px solid #0f1620"><td style="padding:5px 12px 5px 0;color:#ef4444;font-weight:700">' + t0 + '–' + t1 + '</td><td style="padding:5px 12px 5px 0;color:#ef4444">🔴 ' + title + (notes ? ' <span style="color:#7f3030;font-size:12px">— ' + notes + '</span>' : '') + '</td><td style="color:#3a4a5e">—</td></tr>';
          } else if (tp.toLowerCase().includes('flight')) {
            var dep = o === state.station;
            var tStr = dep
              ? '<span style="' + phxTS + '">' + t0 + '</span> <span style="' + dimTS + '">dep → ' + t1 + '</span>'
              : '<span style="' + dimTS + '">' + t0 + ' → </span><span style="' + phxTS + '">' + t1 + '</span> <span style="' + dimTS + '">arr</span>';
            html += '<tr style="border-bottom:1px solid #0f1620"><td style="padding:5px 12px 5px 0">' + tStr + '</td><td style="padding:5px 12px 5px 0;color:#8899aa">' + o + ' → ' + d + '</td><td style="color:#556677">' + crew + '</td></tr>';
          }
        });
        html += '</tbody></table>';

        // MEL accordion cards
        if (data.defs.length) {
          data.defs.forEach(function (def) {
            var tid = 'mel_' + (idx++);
            html +=
              '<div data-toggle="' + tid + '" style="cursor:pointer;background:#0d1420;border-left:3px solid #ef4444;border-radius:0 6px 6px 0;padding:11px 14px;margin-bottom:8px;font-size:13px;user-select:none">' +
              '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px">' +
              '<div style="color:#f87171;font-weight:700">' + def.id + ' │ ' + def.title + '</div>' +
              '<span class="phxarr" style="color:#3a4a5e;margin-left:10px;flex-shrink:0">▸</span></div>';
            if (def.melCat) html += '<div style="color:#3a4a5e;font-size:11px">MEL Cat. ' + def.melCat + (def.melItem ? ' │ Item ' + def.melItem : '') + (def.melExpiry ? ' │ Exp: ' + def.melExpiry : '') + (def.foundBy ? ' │ ' + def.foundBy : '') + '</div>';
            html += '<div id="' + tid + '" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid #1e2a3a">';
            if (def.details) html += '<div style="color:#c8d8e8;font-style:italic;margin-bottom:5px">"' + def.details + '"</div>';
            if (def.melLim) html += '<div style="color:#3a4a5e;font-size:11px;line-height:1.5">' + def.melLim + '</div>';
            if (def.signoff) html += '<div style="color:#f59e0b;font-size:11px;margin-top:5px">⚠ Awaiting external MX sign-off</div>';
            html += '</div></div>';
          });
        } else {
          html += '<div style="color:#22c55e;font-size:13px;margin-bottom:8px">✓ No open discrepancies</div>';
        }

        // CAMP flags accordion
        if (data.hasFlags) {
          var cid = 'camp_' + ac2;
          html +=
            '<div data-toggle="' + cid + '" style="cursor:pointer;background:#0d1420;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;padding:11px 14px;margin-bottom:8px;font-size:13px;user-select:none">' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<span style="color:#fbbf24;font-weight:700">⚠ CAMP Flags (' + data.warnItems.length + ')</span>' +
            '<span class="phxarr" style="color:#3a4a5e">▸</span></div>' +
            '<div id="' + cid + '" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid #1e2a3a">';
          data.warnItems.forEach(function (w) {
            var c = w.st === 'Expired' ? '#ef4444' : '#94a3b8';
            html += '<div style="margin-bottom:5px;color:' + c + '">• ' + w.desc + ' <span style="color:#3a4a5e">— exp ' + w.exp + '</span></div>';
          });
          html += '</div></div>';
        }

        html += '</div>';
      }

      // MX Blocks summary section
      if (allMX.length) {
        html += '<div style="border-top:1px solid #1e2a3a;padding-top:14px;margin-bottom:14px">';
        html += '<div style="font-size:13px;font-weight:700;color:#ef4444;letter-spacing:.06em;margin-bottom:10px">🔴 MX BLOCKS @ ' + escapeHtml(state.station) + '</div>';
        allMX.forEach(function (mx) {
          html += '<div style="margin-bottom:8px;font-size:13px"><span style="color:#e2eaf4;font-weight:700">' + mx.ac + '</span> <span style="color:#3a4a5e">│</span> <span style="color:#f87171;font-weight:700">' + mx.t0 + '–' + mx.t1 + '</span> <span style="color:#3a4a5e">│</span> <span style="color:#94a3b8">' + mx.title + '</span><br><span style="color:#64748b;font-size:11px">' + (mx.notes || 'No notes recorded') + '</span></div>';
        });
        html += '</div>';
      }

      // After hours
      if (afterShift.length) {
        html += '<div style="border-top:1px solid #1e2a3a;padding-top:10px;font-size:12px;color:#3a4a5e"><span style="color:#2a3a4e">After hours FYI: </span>' +
          afterShift.map(function (e) {
            var a = (e.extendedProps && e.extendedProps.aircraft) || '';
            var o = ((e.extendedProps && e.extendedProps.origin_short) || '').toUpperCase();
            var d2 = ((e.extendedProps && e.extendedProps.destination_short) || '').toUpperCase();
            return a + ' ' + o + '→' + d2 + ' dep ' + hhmmInTz(e.start, state.tz) + ' / arr ' + hhmmInTz(e.end, state.tz);
          }).join(' &nbsp;│&nbsp; ') + '</div>';
      }

      html += '<div style="text-align:center;margin-top:20px;color:#1e2a3a;font-size:10px;letter-spacing:.08em">ADVANCED AIR · ' + escapeHtml(state.station) + ' MX REPORT · ' + new Date().toLocaleTimeString('en-US', { timeZone: state.tz, hour: '2-digit', minute: '2-digit' }) + ' ' + tzAbbrev(state.tz, new Date()) + '</div>';

      // Clear loading log, render report
      var statusEl = document.getElementById('__phxstatus');
      if (statusEl) statusEl.remove();
      var bodyEl = document.getElementById('__phxbody');
      if (bodyEl) bodyEl.innerHTML = html;

    } catch (err) {
      var statusEl2 = document.getElementById('__phxstatus');
      if (statusEl2) statusEl2.remove();
      var bodyEl2 = document.getElementById('__phxbody');
      if (bodyEl2) bodyEl2.innerHTML = '<div style="color:#ef4444;font-size:13px">❌ ' + err.message + '</div>';
    }
  };

  // ─── Kick off: render the config card ─────────────────────────────────────

  renderConfigCard();

})();
