/**
 * PHX MX Report — Bookmarklet Source
 * Advanced Air LLC · PHX Station
 *
 * Run this on portal.jetinsight.com while logged in.
 * To build the installable bookmark URL, open build.html in your browser.
 *
 * Filters:
 *   - PHX flights only (origin or destination = PHX)
 *   - Shift window: 0600–1700 MST
 *   - Crew swaps stripped
 *   - After-hours PHX flights shown as FYI only
 */

(async function PHXReport() {

  // ─── Utilities ────────────────────────────────────────────────────────────

  var phxHHMM = function (iso) {
    var d = new Date(iso);
    var p = new Date(d.toLocaleString('en-US', { timeZone: 'America/Phoenix' }));
    return String(p.getHours()).padStart(2, '0') + ':' + String(p.getMinutes()).padStart(2, '0');
  };

  var phxYMD = function (d) {
    return new Date(d).toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
  };

  var addDays = function (d, n) {
    return new Date(d.getTime() + n * 86400000);
  };

  var now = new Date();

  // ─── Day picker options (Today / Tomorrow / Day after) ────────────────────

  var opts = [0, 1, 2].map(function (n) {
    var d = addDays(now, n);
    var label = n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { timeZone: 'America/Phoenix', weekday: 'long' });
    var sub = d.toLocaleDateString('en-US', { timeZone: 'America/Phoenix', month: 'short', day: 'numeric' });
    return { n: n, label: label, sub: sub, ymd: phxYMD(addDays(now, n)) };
  });

  // ─── Build overlay + card ─────────────────────────────────────────────────

  var ov = document.createElement('div');
  ov.id = '__phxov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:2147483647;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';

  var card = document.createElement('div');
  card.style.cssText = 'background:#0a0e17;color:#d4dce8;width:min(880px,96vw);max-height:92vh;overflow-y:auto;border-radius:10px;padding:32px;font-family:ui-monospace,Menlo,monospace;box-shadow:0 32px 100px #000,inset 0 1px 0 rgba(255,255,255,.05);border:1px solid #1e2a3a';

  ov.appendChild(card);
  document.body.appendChild(ov);
  ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });

  // Single delegated event listener — handles close, day selection, and accordions
  card.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) { ov.remove(); return; }
    var rb = e.target.closest('[data-run]');
    if (rb) { window.__phxRun(rb.dataset.run); return; }
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

  // ─── Day picker HTML ──────────────────────────────────────────────────────

  card.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;padding-bottom:14px;border-bottom:1px solid #1e2a3a">' +
    '<div style="color:#4db8ff;font-size:15px;font-weight:700;letter-spacing:.07em">✈ PHX MX SHIFT BRIEFING</div>' +
    '<button data-close style="background:none;border:1px solid #1e2a3a;color:#3a4a5e;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:11px;font-family:inherit">✕</button></div>' +
    '<div style="color:#3a4a5e;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px">Select shift date</div>' +
    '<div style="display:flex;gap:10px">' +
    opts.map(function (o) {
      return '<button data-run="' + o.ymd + '" style="flex:1;background:#0d1420;border:1px solid #1e2a3a;color:#94a3b8;padding:16px 10px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:14px;transition:border-color .15s" onmouseover="this.style.borderColor=\'#4db8ff\';this.style.color=\'#e2eaf4\'" onmouseout="this.style.borderColor=\'#1e2a3a\';this.style.color=\'#94a3b8\'">' +
        '<div style="font-weight:700">' + o.label + '</div>' +
        '<div style="font-size:11px;margin-top:3px;color:#3a4a5e">' + o.sub + '</div></button>';
    }).join('') +
    '</div>';

  // ─── Main report runner ───────────────────────────────────────────────────

  window.__phxRun = async function (selDate) {

    var nextDate = phxYMD(addDays(new Date(selDate + 'T12:00:00'), 1));
    var dispDate = new Date(selDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    card.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #1e2a3a">' +
      '<div><div style="color:#4db8ff;font-size:15px;font-weight:700;letter-spacing:.07em">✈ PHX MX SHIFT BRIEFING</div>' +
      '<div style="color:#3a4a5e;font-size:11px;margin-top:3px">' + dispDate + ' &nbsp;│&nbsp; 0600–1700 MST</div></div>' +
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

    var isPHX = function (e) {
      var o = ((e.extendedProps && e.extendedProps.origin_short) || '').toUpperCase();
      var d = ((e.extendedProps && e.extendedProps.destination_short) || '').toUpperCase();
      var t = (e.title || '').toUpperCase();
      return o === 'PHX' || d === 'PHX' || t.includes('PHX');
    };

    var inShift = function (iso) {
      var p = new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'America/Phoenix' }));
      var m = p.getHours() * 60 + p.getMinutes();
      return m >= 360 && m < 1020; // 0600–1700
    };

    try {

      // ── Schedule ───────────────────────────────────────────────────────────

      log('Fetching schedule...');
      var sched = await fetch('/schedule/aircraft.json?start=' + selDate + '&end=' + nextDate + '&time_zone=America/Phoenix').then(function (r) { return r.json(); });

      var phxToday = sched.filter(function (e) {
        if (!isPHX(e)) return false;
        if (phxYMD(new Date(e.start)) !== selDate) return false;
        var tp = (e.extendedProps && e.extendedProps.event_type_name) || '';
        if (FT.has(tp)) return inShift(e.start);
        return true;
      }).sort(function (a, b) { return new Date(a.start) - new Date(b.start); });

      var afterPHX = sched.filter(function (e) {
        if (!isPHX(e)) return false;
        if (phxYMD(new Date(e.start)) !== selDate) return false;
        var tp = (e.extendedProps && e.extendedProps.event_type_name) || '';
        if (!FT.has(tp)) return false;
        var p = new Date(new Date(e.start).toLocaleString('en-US', { timeZone: 'America/Phoenix' }));
        return p.getHours() * 60 + p.getMinutes() >= 1020;
      });

      var phxAC = [...new Set(
        phxToday
          .filter(function (e) { return FT.has((e.extendedProps && e.extendedProps.event_type_name) || ''); })
          .map(function (e) { return e.extendedProps && e.extendedProps.aircraft; })
          .filter(Boolean)
      )];

      if (!phxAC.length) {
        document.getElementById('__phxstatus').remove();
        document.getElementById('__phxbody').innerHTML = '<div style="color:#f87171">No PHX aircraft found for this shift window.</div>';
        return;
      }

      // ── Compliance + MELs ─────────────────────────────────────────────────

      log('Checking fleet status...');
      await fetch('/compliance/aircraft_readiness').catch(function () {});

      var acData = {};
      var parser = new DOMParser();
      var allMX = [];
      var idx = 0;

      for (var aci = 0; aci < phxAC.length; aci++) {
        var ac = phxAC[aci];

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
          // Split on 'Effective:' — each block is one CAMP item
          var parts = camp.split('Effective:');
          parts.forEach(function (part, i) {
            if (i === 0) return;
            // Find the last status word before this block
            var textBefore = parts.slice(0, i).join('Effective:');
            var allSt = textBefore.match(/(Warning|Expired|OK)/g) || [];
            var st = allSt.length ? allSt[allSt.length - 1] : '';
            if (st !== 'Warning' && st !== 'Expired') return;

            // Primary date items
            var dateRe = /Date\s*\n*\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*\n+\s*([A-Z][^\n]{4,80})/g;
            var dm;
            while ((dm = dateRe.exec(part)) !== null) {
              var desc = dm[2].trim();
              if (!warnItems.some(function (w) { return w.desc === desc; })) warnItems.push({ exp: dm[1].trim(), desc: desc, st: st });
            }

            // Items appearing after tolerance line
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
        phxToday
          .filter(function (e) { return e.extendedProps && e.extendedProps.aircraft === ac && (e.extendedProps.event_type_name === 'Maintenance' || (e.title || '').toUpperCase().includes('MX')); })
          .forEach(function (e) {
            allMX.push({
              ac: ac,
              t0: phxHHMM(e.start),
              t1: phxHHMM(e.end),
              title: e.title || '',
              notes: ((e.extendedProps && e.extendedProps.notes) || '').trim().replace(/\n/g, ' ')
            });
          });

        acData[ac] = { defs: defs, warnItems: warnItems, hasFlags: warnItems.length > 0 };
      }

      // ── Build report HTML ─────────────────────────────────────────────────

      // PHX-critical time: green + underline. Other time: dimmed.
      var phxTS = 'color:#22c55e;font-weight:700;text-decoration:underline;text-underline-offset:3px;';
      var dimTS = 'color:#3a4a5e;';

      var html = '';

      // Legend
      html +=
        '<div style="display:flex;gap:16px;flex-wrap:wrap;background:#0d1420;border:1px solid #1e2a3a;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:12px;line-height:1.8">' +
        '<span><span style="' + phxTS + 'font-weight:700">08:00</span>&nbsp;<span style="color:#3a4a5e">PHX dep/arr time</span></span>' +
        '<span><span style="color:#ef4444;font-size:10px">●</span>&nbsp;<span style="color:#3a4a5e">MX / Open MEL</span>&nbsp;<span style="color:#1e2a3a;font-size:10px">(tap to expand)</span></span>' +
        '<span><span style="color:#f59e0b;font-size:10px">●</span>&nbsp;<span style="color:#3a4a5e">CAMP flag</span>&nbsp;<span style="color:#1e2a3a;font-size:10px">(tap to expand)</span></span>' +
        '<span><span style="color:#22c55e">✓</span>&nbsp;<span style="color:#3a4a5e">Clean</span></span>' +
        '</div>';

      // Aircraft sections
      for (var ai = 0; ai < phxAC.length; ai++) {
        var ac2 = phxAC[ai];
        var evts = phxToday.filter(function (e) { return e.extendedProps && e.extendedProps.aircraft === ac2; });
        var data = acData[ac2];

        html += '<div style="margin-bottom:28px">';
        html += '<div style="font-size:16px;font-weight:700;color:#e2eaf4;letter-spacing:.04em;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #1e2a3a">' + ac2 + '</div>';

        // Flight table
        html += '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px"><thead><tr style="color:#3a4a5e;font-size:10px;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #1e2a3a"><th style="text-align:left;padding:3px 12px 3px 0;font-weight:400">PHX Time</th><th style="text-align:left;padding:3px 12px 3px 0;font-weight:400">Route / Event</th><th style="text-align:left;padding:3px 0;font-weight:400">Pilots</th></tr></thead><tbody>';

        evts.forEach(function (e) {
          var tp = (e.extendedProps && e.extendedProps.event_type_name) || '';
          var title = e.title || '';
          if (tp === 'Aircraft away from home base') return;
          if (SKIP.some(function (k) { return title.toUpperCase().includes(k); })) return;

          var o = ((e.extendedProps && e.extendedProps.origin_short) || '').toUpperCase();
          var d = ((e.extendedProps && e.extendedProps.destination_short) || '').toUpperCase();
          var crew = ((e.extendedProps && e.extendedProps.crew_last_names) || []).join(' / ') || '—';
          var t0 = phxHHMM(e.start), t1 = phxHHMM(e.end);
          var notes = ((e.extendedProps && e.extendedProps.notes) || '').trim().replace(/\n/g, ' ');

          if (tp === 'Maintenance' || (title.toUpperCase().includes('MX') && tp !== 'Other')) {
            html += '<tr style="border-bottom:1px solid #0f1620"><td style="padding:5px 12px 5px 0;color:#ef4444;font-weight:700">' + t0 + '–' + t1 + '</td><td style="padding:5px 12px 5px 0;color:#ef4444">🔴 ' + title + (notes ? ' <span style="color:#7f3030;font-size:12px">— ' + notes + '</span>' : '') + '</td><td style="color:#3a4a5e">—</td></tr>';
          } else if (tp.toLowerCase().includes('flight')) {
            var dep = o === 'PHX';
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
        html += '<div style="font-size:13px;font-weight:700;color:#ef4444;letter-spacing:.06em;margin-bottom:10px">🔴 MX BLOCKS @ PHX</div>';
        allMX.forEach(function (mx) {
          html += '<div style="margin-bottom:8px;font-size:13px"><span style="color:#e2eaf4;font-weight:700">' + mx.ac + '</span> <span style="color:#3a4a5e">│</span> <span style="color:#f87171;font-weight:700">' + mx.t0 + '–' + mx.t1 + '</span> <span style="color:#3a4a5e">│</span> <span style="color:#94a3b8">' + mx.title + '</span><br><span style="color:#64748b;font-size:11px">' + (mx.notes || 'No notes recorded') + '</span></div>';
        });
        html += '</div>';
      }

      // After hours
      if (afterPHX.length) {
        html += '<div style="border-top:1px solid #1e2a3a;padding-top:10px;font-size:12px;color:#3a4a5e"><span style="color:#2a3a4e">After hours FYI: </span>' +
          afterPHX.map(function (e) {
            var a = (e.extendedProps && e.extendedProps.aircraft) || '';
            var o = ((e.extendedProps && e.extendedProps.origin_short) || '').toUpperCase();
            var d2 = ((e.extendedProps && e.extendedProps.destination_short) || '').toUpperCase();
            return a + ' ' + o + '→' + d2 + ' dep ' + phxHHMM(e.start) + ' / arr ' + phxHHMM(e.end);
          }).join(' &nbsp;│&nbsp; ') + '</div>';
      }

      html += '<div style="text-align:center;margin-top:20px;color:#1e2a3a;font-size:10px;letter-spacing:.08em">ADVANCED AIR · PHX MX REPORT · ' + new Date().toLocaleTimeString('en-US', { timeZone: 'America/Phoenix', hour: '2-digit', minute: '2-digit' }) + ' MST</div>';

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

})();
