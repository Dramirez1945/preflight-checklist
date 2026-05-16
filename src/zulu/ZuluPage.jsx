import { useState, useEffect } from "react";
import { A, A_RGB, BG, SANS } from "../theme.js";

const ZULU_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
html, body { overflow-x: hidden; max-width: 100vw; }
.zulu-clocks { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.zulu-dir-btn { transition: background .15s ease, border-color .15s ease, color .15s ease; }
@media (max-width: 520px) {
  .zulu-clocks { grid-template-columns: 1fr !important; }
}
`;

const TIMEZONES = [
  { label: "Phoenix, AZ",   tz: "America/Phoenix"    },
  { label: "Hawthorne, CA", tz: "America/Los_Angeles" },
  { label: "Eastern (ET)",  tz: "America/New_York"   },
  { label: "Central (CT)",  tz: "America/Chicago"    },
  { label: "Mountain (MT)", tz: "America/Denver"     },
  { label: "Alaska (AKT)",  tz: "America/Anchorage"  },
  { label: "Hawaii (HT)",   tz: "Pacific/Honolulu"   },
];

function wallClockToUTC(year, month, day, hour, minute, tz) {
  const utcMs = Date.UTC(year, month - 1, day, hour, minute);
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: tz, year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", hour12: false,
  }).formatToParts(new Date(utcMs));
  const sY   = +parts.find(p => p.type === "year").value;
  const sMo  = +parts.find(p => p.type === "month").value;
  const sD   = +parts.find(p => p.type === "day").value;
  const sH   = +parts.find(p => p.type === "hour").value % 24;
  const sMin = +parts.find(p => p.type === "minute").value;
  const shownMs = Date.UTC(sY, sMo - 1, sD, sH, sMin);
  return new Date(utcMs - (shownMs - utcMs));
}

function fmtParts(date, tz) {
  const f = opts => new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(date);
  return {
    weekday: f({ weekday: "short" }).toUpperCase(),
    date:    f({ day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
    time:    f({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
  };
}

const eyebrow = {
  fontFamily: SANS, fontWeight: 500, fontSize: 11,
  letterSpacing: 3, color: "rgba(255,255,255,.45)", textTransform: "uppercase",
};

export default function ZuluPage({ onBack }) {
  const today = new Date().toISOString().split("T")[0];
  const [tz,        setTz]      = useState(() => localStorage.getItem("zulu_tz") || "America/Phoenix");
  const [now,       setNow]     = useState(new Date());
  const [manDate,   setManDate] = useState(today);
  const [manTime,   setManTime] = useState("");
  const [direction, setDir]     = useState("local2zulu");
  const [copied,    setCopied]  = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { localStorage.setItem("zulu_tz", tz); }, [tz]);

  const tzLabel = TIMEZONES.find(t => t.tz === tz)?.label ?? tz;
  const local   = fmtParts(now, tz);
  const zulu    = fmtParts(now, "UTC");

  const computeResult = () => {
    if (!manTime || !manDate) return null;
    const [Y, Mo, D] = manDate.split("-").map(Number);
    const [H, Min]   = manTime.split(":").map(Number);
    if (isNaN(Y) || isNaN(H)) return null;

    if (direction === "local2zulu") {
      const utcDate = wallClockToUTC(Y, Mo, D, H, Min, tz);
      const uh = utcDate.getUTCHours().toString().padStart(2, "0");
      const um = utcDate.getUTCMinutes().toString().padStart(2, "0");
      const ud = new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC", day: "2-digit", month: "short", year: "numeric",
      }).format(utcDate).toUpperCase();
      const sameDay = utcDate.toISOString().split("T")[0] === manDate;
      return { text: `${uh}${um}Z`, detail: sameDay ? null : ud };
    } else {
      const utcDate = new Date(`${manDate}T${manTime}:00Z`);
      if (isNaN(utcDate.getTime())) return null;
      const lh = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false,
      }).format(utcDate);
      const ld = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, day: "2-digit", month: "short", year: "numeric",
      }).format(utcDate).toUpperCase();
      const localDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(utcDate);
      const sameDay = localDateStr === manDate;
      return { text: lh, detail: sameDay ? null : ld };
    }
  };

  const result = computeResult();
  const copyText = result ? (result.detail ? `${result.text} · ${result.detail}` : result.text) : "";

  const copy = () => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2800);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = copyText; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
      setCopied(true); setTimeout(() => setCopied(false), 2800);
    });
  };

  const card = {
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 14,
    padding: "20px 18px",
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 8,
    fontFamily: SANS,
    fontSize: 14,
    outline: "none",
    colorScheme: "dark",
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: SANS, color: "#fff", padding: "28px 20px 60px" }}>
      <style>{ZULU_CSS}</style>

      {/* Back + title */}
      <div style={{ maxWidth: 680, margin: "0 auto 28px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{
          background: "transparent", border: "1px solid rgba(255,255,255,.14)",
          color: "rgba(255,255,255,.55)", padding: "6px 14px", borderRadius: 999,
          fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: 2,
          textTransform: "uppercase", cursor: "pointer",
        }}>← Hub</button>
        <div>
          <div style={{ ...eyebrow }}>Zulu Time Converter</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Timezone selector */}
        <div style={card}>
          <div style={{ ...eyebrow, marginBottom: 10 }}>Local Timezone</div>
          <select
            value={tz} onChange={e => setTz(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="America/Phoenix">Phoenix, AZ (UTC-7, no DST)</option>
            <option value="America/Los_Angeles">Hawthorne, CA (America/Los_Angeles, DST)</option>
            <option disabled>──────────────</option>
            <option value="America/New_York">Eastern (ET)</option>
            <option value="America/Chicago">Central (CT)</option>
            <option value="America/Denver">Mountain (MT)</option>
            <option value="America/Anchorage">Alaska (AKT)</option>
            <option value="Pacific/Honolulu">Hawaii (HT)</option>
          </select>
        </div>

        {/* Live clocks */}
        <div>
          <div style={{ ...eyebrow, marginBottom: 12 }}>Live Clocks</div>
          <div className="zulu-clocks">
            {/* Local */}
            <div style={{ ...card, borderColor: `rgba(${A_RGB},.22)` }}>
              <div style={{ ...eyebrow, color: A, marginBottom: 4 }}>Local Time</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 12 }}>{tzLabel}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 600 }}>{local.weekday}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>{local.date}</div>
              <div style={{
                color: A, fontSize: 30, fontWeight: 700,
                fontFamily: "'Courier New',ui-monospace,monospace", letterSpacing: 1,
              }}>{local.time}</div>
            </div>
            {/* Zulu */}
            <div style={{ ...card }}>
              <div style={{ ...eyebrow, marginBottom: 4 }}>Zulu Time (UTC)</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 12 }}>Coordinated Universal Time</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 600 }}>{zulu.weekday}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>{zulu.date}</div>
              <div style={{
                color: "#fff", fontSize: 30, fontWeight: 700,
                fontFamily: "'Courier New',ui-monospace,monospace", letterSpacing: 1,
              }}>
                {zulu.time}<span style={{ fontSize: 18, color: "rgba(255,255,255,.45)", fontWeight: 600 }}>Z</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manual converter */}
        <div>
          <div style={{ ...eyebrow, marginBottom: 12 }}>Manual Converter</div>
          <div style={{ ...card }}>

            {/* Inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ ...eyebrow, marginBottom: 6 }}>Date</div>
                <input
                  type="date" value={manDate} onChange={e => setManDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <div style={{ ...eyebrow, marginBottom: 6 }}>Time</div>
                <input
                  type="time" value={manTime} onChange={e => setManTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Direction toggle */}
            <div style={{ ...eyebrow, marginBottom: 8 }}>Direction</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {[
                { val: "local2zulu", label: "Local → Zulu" },
                { val: "zulu2local", label: "Zulu → Local" },
              ].map(opt => (
                <button
                  key={opt.val}
                  className="zulu-dir-btn"
                  onClick={() => setDir(opt.val)}
                  style={{
                    flex: 1,
                    background: direction === opt.val ? A : "rgba(255,255,255,.06)",
                    color: direction === opt.val ? "#0d1018" : "rgba(255,255,255,.5)",
                    border: `1px solid ${direction === opt.val ? A : "rgba(255,255,255,.12)"}`,
                    padding: "10px 0", borderRadius: 8,
                    fontFamily: SANS, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", letterSpacing: 0.4,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Result */}
            <div style={{
              background: "rgba(255,255,255,.03)",
              border: `1px solid ${result ? `rgba(${A_RGB},.28)` : "rgba(255,255,255,.08)"}`,
              borderRadius: 10, padding: "16px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              flexWrap: "wrap",
            }}>
              <div>
                {result ? (
                  <>
                    <div style={{
                      color: A, fontSize: 34, fontWeight: 700,
                      fontFamily: "'Courier New',ui-monospace,monospace",
                      letterSpacing: 1, lineHeight: 1,
                    }}>{result.text}</div>
                    {result.detail && (
                      <div style={{ color: "rgba(255,255,255,.45)", fontSize: 12, marginTop: 5 }}>
                        {result.detail}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: "rgba(255,255,255,.2)", fontSize: 14 }}>
                    {manTime ? "—" : "Enter a time above"}
                  </div>
                )}
              </div>
              <button onClick={copy} disabled={!result} style={{
                background: copied ? "#22c55e" : (result ? A : "rgba(255,255,255,.06)"),
                color: copied ? "#fff" : (result ? "#0d1018" : "rgba(255,255,255,.2)"),
                border: "none", borderRadius: 8, padding: "10px 20px",
                fontFamily: SANS, fontSize: 12, fontWeight: 700,
                cursor: result ? "pointer" : "default",
                transition: "background .2s ease, color .2s ease",
                whiteSpace: "nowrap",
              }}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>

            <div style={{ marginTop: 8, color: "rgba(255,255,255,.2)", fontSize: 11 }}>
              {direction === "local2zulu"
                ? `${tzLabel} → Zulu (UTC)`
                : `Zulu (UTC) → ${tzLabel}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
