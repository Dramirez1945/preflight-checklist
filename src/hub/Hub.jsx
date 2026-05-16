import { A, A_RGB, SANS, BG } from "../theme.js";

// Update this URL after deploying mx-passdown-generator to Vercel
const PASSDOWN_URL = "https://mx-passdown-generator.vercel.app";

const HUB_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
html, body { overflow-x: hidden; max-width: 100vw; }
.hub-card {
  transition: transform .18s ease, border-color .2s ease, box-shadow .25s ease;
}
.hub-card:hover {
  border-color: rgba(${A_RGB},.45) !important;
  box-shadow: 0 0 0 1px rgba(${A_RGB},.25), 0 12px 40px rgba(${A_RGB},.08);
  transform: translateY(-2px);
}
.hub-btn { transition: box-shadow .2s ease, border-color .2s ease; }
.hub-btn:hover { box-shadow: 0 0 0 1px ${A}, 0 0 18px rgba(${A_RGB},.55); border-color: ${A}; }
@media (max-width: 720px) {
  .hub-cards { grid-template-columns: 1fr !important; }
}
`;

const eyebrow = { fontFamily:SANS, fontWeight:500, fontSize:11, letterSpacing:3, color:"rgba(255,255,255,.45)", textTransform:"uppercase" };

export default function Hub({ onSelect }) {
  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:SANS, color:"#fff", padding:"40px 22px 60px", display:"flex", flexDirection:"column" }}>
      <style>{HUB_CSS}</style>
      <div style={{ maxWidth:980, margin:"0 auto", width:"100%", flex:1, display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:42 }}>
          <img src="/logo.png" alt="Advanced Air" style={{ display:"block", margin:"0 auto 24px", width:170, height:"auto", filter:"brightness(0) invert(1)" }}/>
          <div style={{ ...eyebrow, marginBottom:18 }}>MX Tools Portal</div>
          <h1 style={{ fontFamily:SANS, fontWeight:700, fontSize:34, color:"#fff", margin:"0 0 10px", letterSpacing:0.3 }}>Your tools. One place.</h1>
          <p style={{ fontFamily:SANS, fontWeight:400, fontSize:14.5, color:"rgba(255,255,255,.6)", margin:0 }}>
            Built for Advanced Air mechanics. Select a tool below.
          </p>
        </div>

        {/* Cards */}
        <div className="hub-cards" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:22, marginBottom:50 }}>

          {/* Checklist card */}
          <div className="hub-card" style={cardStyle}>
            <div style={{ ...eyebrow, color:A, marginBottom:10 }}>Preflight / Postflight</div>
            <h2 style={cardH2}>Checklist Generator</h2>
            <p style={cardDesc}>
              Auto-fill any of your preflight or postflight checklists — King Air B300, Challenger 604, G450, or Universal — and export a print-ready PDF in under a minute.
            </p>
            <ul style={featureList}>
              <Feature>Four aircraft types, one tap to switch</Feature>
              <Feature>Auto-fills name, cert # &amp; initials</Feature>
              <Feature>Handles tires, O₂, and oil service logging</Feature>
              <Feature>Every field editable before export</Feature>
            </ul>
            <button className="hub-btn"
              style={{ background:A, color:"#0d1018", border:`2px solid ${A}`, padding:"13px 24px", fontFamily:SANS, fontSize:14, fontWeight:700, letterSpacing:0.4, cursor:"pointer", borderRadius:10, width:"100%", marginTop:"auto" }}
              onClick={() => onSelect("checklist")}>
              Open Checklist →
            </button>
          </div>

          {/* Bookmarklet card */}
          <div className="hub-card" style={cardStyle}>
            <div style={{ ...eyebrow, color:A, marginBottom:10 }}>JetInsight</div>
            <h2 style={cardH2}>JetInsight Shift Filter</h2>
            <p style={cardDesc}>
              One-click browser bookmark that strips JetInsight down to only your planes, your station, during your exact shift window.
            </p>
            <ul style={featureList}>
              <Feature>Installs once in 60 seconds — any browser</Feature>
              <Feature>Filters by tail #, station &amp; shift time</Feature>
              <Feature>Works every time you log in — no re-setup</Feature>
              <Feature>No extensions, no logins, no extra tools</Feature>
            </ul>
            <button className="hub-btn"
              style={{ background:"transparent", color:A, border:`2px solid rgba(${A_RGB},.45)`, padding:"13px 24px", fontFamily:SANS, fontSize:14, fontWeight:700, letterSpacing:0.4, cursor:"pointer", borderRadius:10, width:"100%", marginTop:"auto" }}
              onClick={() => onSelect("bookmarklet")}>
              View Setup Guide →
            </button>
          </div>

          {/* Zulu converter card */}
          <div className="hub-card" style={cardStyle}>
            <div style={{ ...eyebrow, color:A, marginBottom:10 }}>Zulu Time</div>
            <h2 style={cardH2}>Zulu Converter</h2>
            <p style={cardDesc}>
              Live side-by-side clocks plus a manual converter — flip any local time to Zulu (or back) in one step.
            </p>
            <ul style={featureList}>
              <Feature>Live local &amp; Zulu clocks — date shown for rollover</Feature>
              <Feature>Manual converter updates without a submit button</Feature>
              <Feature>0415Z format output with one-click copy</Feature>
              <Feature>Timezone selector persists across page refreshes</Feature>
            </ul>
            <button className="hub-btn"
              style={{ background:"transparent", color:A, border:`2px solid rgba(${A_RGB},.45)`, padding:"13px 24px", fontFamily:SANS, fontSize:14, fontWeight:700, letterSpacing:0.4, cursor:"pointer", borderRadius:10, width:"100%", marginTop:"auto" }}
              onClick={() => onSelect("zulu")}>
              Open Converter →
            </button>
          </div>

          {/* Add to Home Screen card */}
          <div className="hub-card" style={cardStyle}>
            <div style={{ ...eyebrow, color:A, marginBottom:10 }}>Mobile App</div>
            <h2 style={cardH2}>Add to Home Screen</h2>
            <p style={cardDesc}>
              Skip the browser — install the MX Tools portal as a full-screen app icon on your phone. Works on iPhone and Android in under a minute.
            </p>
            <ul style={featureList}>
              <Feature>Works on iPhone (Safari) and Android (Chrome)</Feature>
              <Feature>Opens full-screen — no browser bars or address bar</Feature>
              <Feature>Icon lives on your home screen like a native app</Feature>
              <Feature>One-time setup, about 30 seconds</Feature>
            </ul>
            <button className="hub-btn"
              style={{ background:"transparent", color:A, border:`2px solid rgba(${A_RGB},.45)`, padding:"13px 24px", fontFamily:SANS, fontSize:14, fontWeight:700, letterSpacing:0.4, cursor:"pointer", borderRadius:10, width:"100%", marginTop:"auto" }}
              onClick={() => onSelect("install")}>
              View Setup Guide →
            </button>
          </div>

          {/* Passdown Report card */}
          <div className="hub-card" style={cardStyle}>
            <div style={{ ...eyebrow, color:A, marginBottom:10 }}>MX Passdown</div>
            <h2 style={cardH2}>Passdown Report Generator</h2>
            <p style={cardDesc}>
              Pull live JetInsight data — Scheduled MX, open MELs, mechanic absences — into an editable report draft. Review, correct, then copy text for Teams or download a styled PDF.
            </p>
            <ul style={featureList}>
              <Feature>Auto-pulls Scheduled MX, MELs &amp; calendar absences</Feature>
              <Feature>Every field editable — nothing is locked</Feature>
              <Feature>Copy plain text for Teams or download a styled PDF</Feature>
              <Feature>MEL expirations flagged automatically when close</Feature>
            </ul>
            <button className="hub-btn"
              style={{ background:"transparent", color:A, border:`2px solid rgba(${A_RGB},.45)`, padding:"13px 24px", fontFamily:SANS, fontSize:14, fontWeight:700, letterSpacing:0.4, cursor:"pointer", borderRadius:10, width:"100%", marginTop:"auto" }}
              onClick={() => window.open(PASSDOWN_URL, "_blank")}>
              Open Tool →
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop:"auto", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:SANS, fontSize:10, letterSpacing:2.2, color:"rgba(255,255,255,.28)", textTransform:"uppercase", flexWrap:"wrap", gap:10 }}>
          <span>Advanced Air, LLC — Internal Use Only</span>
          <span>MX Tools</span>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background:"rgba(255,255,255,.04)",
  border:"1px solid rgba(255,255,255,.08)",
  borderRadius:16,
  padding:"28px 26px",
  display:"flex",
  flexDirection:"column",
};

const cardH2 = { fontFamily:SANS, fontWeight:700, fontSize:22, color:"#fff", margin:"0 0 10px", letterSpacing:0.2 };
const cardDesc = { fontFamily:SANS, fontSize:13.5, lineHeight:1.6, color:"rgba(255,255,255,.65)", margin:"0 0 18px" };
const featureList = { listStyle:"none", padding:0, margin:"0 0 22px", display:"flex", flexDirection:"column", gap:10 };

function Feature({ children }) {
  return (
    <li style={{ display:"flex", alignItems:"flex-start", gap:10, fontFamily:SANS, fontSize:13, color:"rgba(255,255,255,.78)", lineHeight:1.45 }}>
      <span style={{ flexShrink:0, width:16, height:16, borderRadius:"50%", border:`1.5px solid ${A}`, color:A, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, marginTop:2 }}>✓</span>
      <span>{children}</span>
    </li>
  );
}
