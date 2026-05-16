import { useState } from "react";
import { A, A_RGB, SANS, BG } from "../theme.js";
import { passdownUrl } from "./passdownUrl.js";

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
html, body { overflow-x: hidden; max-width: 100vw; }
.pd-btn, .pd-panel { transition: box-shadow .2s ease, border-color .2s ease; }
.pd-btn:hover { box-shadow: 0 0 0 1px ${A}, 0 0 16px rgba(${A_RGB},.55); border-color: ${A}; }
.pd-code {
  width: 100%;
  background: rgba(0,0,0,.45);
  border: 2px solid rgba(${A_RGB},.32);
  color: #cfe8ff;
  font-family: 'Courier New', ui-monospace, monospace;
  font-size: 11px;
  line-height: 1.5;
  padding: 14px 16px;
  border-radius: 10px;
  resize: none;
  outline: none;
  word-break: break-all;
  white-space: pre-wrap;
}
.pd-code:focus { border-color: ${A}; box-shadow: 0 0 0 1px ${A}, 0 0 12px rgba(${A_RGB},.40); }
`;

const eyebrow = { fontFamily:SANS, fontWeight:500, fontSize:11, letterSpacing:3, color:"rgba(255,255,255,.45)", textTransform:"uppercase" };
const panel = { background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"22px 24px", marginBottom:18 };
const h2style = { fontFamily:SANS, fontWeight:600, fontSize:22, color:"#f0f0f0", marginBottom:14, letterSpacing:0.2 };
const bodyText = { fontFamily:SANS, fontWeight:400, fontSize:14.5, lineHeight:1.65, color:"rgba(255,255,255,.78)" };

export default function PassdownSetupPage({ onBack }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(passdownUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.getElementById("pd-code-textarea");
      if (ta) { ta.select(); document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:SANS, color:"#fff", padding:"22px 18px 60px" }}>
      <style>{PAGE_CSS}</style>
      <div style={{ maxWidth:780, margin:"0 auto" }}>

        {/* Top bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:26 }}>
          <button className="pd-btn"
            style={{ background:"transparent", border:"2px solid rgba(255,255,255,.14)", color:"rgba(255,255,255,.55)", padding:"8px 16px", fontFamily:SANS, fontSize:13, fontWeight:500, cursor:"pointer", borderRadius:8 }}
            onClick={onBack}>← Back to hub</button>
          <span style={eyebrow}>MX Passdown</span>
        </div>

        {/* Intro */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", fontFamily:SANS, fontWeight:700, fontSize:10, letterSpacing:2.4, color:A, background:`rgba(${A_RGB},.12)`, border:`1px solid rgba(${A_RGB},.45)`, padding:"5px 11px", borderRadius:999, marginBottom:18 }}>
            ONE-TIME SETUP · UNDER 60 SECONDS
          </div>
          <h1 style={{ fontFamily:SANS, fontWeight:700, fontSize:30, color:"#fff", margin:"0 0 14px", letterSpacing:0.2 }}>Passdown Report Generator</h1>
          <p style={bodyText}>
            A browser bookmark that runs directly on JetInsight using your existing login. One click pulls
            live Scheduled MX, open MELs, and mechanic calendar entries into an editable report draft.
          </p>
          <p style={{ ...bodyText, marginTop:12 }}>
            Review everything before exporting — every field is editable. Nothing is locked. JetInsight data
            is a starting point, not a final output. When you're ready, copy the plain-text version for
            Teams or download a clean, styled PDF.
          </p>
        </div>

        {/* What it pulls */}
        <div style={panel}>
          <div style={{ ...eyebrow, color:A, marginBottom:12 }}>What it auto-populates from JetInsight</div>
          <ul style={{ ...bodyText, paddingLeft:18, margin:0 }}>
            <li><b style={{ color:"#f0f0f0" }}>Scheduled MX</b> — tail numbers, locations, and any MX notes already in JetInsight</li>
            <li><b style={{ color:"#f0f0f0" }}>Open MELs</b> — count per tail and most restrictive expiration date; anything due within 7 days is flagged in red automatically</li>
            <li><b style={{ color:"#f0f0f0" }}>Mechanic calendar</b> — general calendar entries matching your team's names, surfaced as-is for you to review and edit</li>
            <li><b style={{ color:"#f0f0f0" }}>MX Coverage</b> — standard shift schedule is pre-filled; you add pop-up absences and last-minute sick calls manually</li>
          </ul>
        </div>

        {/* Manual-only callout */}
        <div style={{ ...panel, borderLeft:`3px solid rgba(${A_RGB},.6)` }}>
          <div style={{ ...eyebrow, color:A, marginBottom:8 }}>Entered manually each shift</div>
          <ul style={{ ...bodyText, paddingLeft:18, margin:0 }}>
            <li><b style={{ color:"#f0f0f0" }}>AOG aircraft</b> — not available via the API; type these in directly</li>
            <li><b style={{ color:"#f0f0f0" }}>Waiting for Parts</b> — manual entry with tail and part description</li>
            <li><b style={{ color:"#f0f0f0" }}>Pop-up absences</b> — last-minute sick calls not yet in JetInsight; name, dates, and a note</li>
          </ul>
        </div>

        {/* Bookmarklet code */}
        <div style={panel}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:10 }}>
            <div>
              <div style={{ ...eyebrow, color:A, marginBottom:4 }}>Bookmarklet code</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:"rgba(255,255,255,.45)" }}>Step 1: copy this, then follow the steps below</div>
            </div>
            <button className="pd-btn"
              style={{ background:copied?"rgba(74,222,128,.15)":A, border:`2px solid ${copied?"#4ade80":A}`, color:copied?"#4ade80":"#0d1018", padding:"9px 20px", fontFamily:SANS, fontSize:13, fontWeight:700, letterSpacing:0.4, cursor:"pointer", borderRadius:8, minWidth:130 }}
              onClick={copy}>
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
          </div>
          <textarea id="pd-code-textarea" className="pd-code" readOnly spellCheck={false} rows={6} value={passdownUrl}/>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.32)", marginTop:8, fontFamily:SANS }}>
            URL length: {passdownUrl.length.toLocaleString()} characters
          </div>
        </div>

        {/* Install steps */}
        <div style={panel}>
          <div style={{ ...eyebrow, color:A, marginBottom:18 }}>Installation</div>
          <Step n={1} title="Copy the code above">
            Hit the Copy Code button above. The entire <code style={cd}>javascript:(...)</code> block is now on your clipboard. Don't modify it — paste it exactly as-is.
          </Step>
          <Step n={2} title="Make sure your bookmarks bar is visible">
            In Chrome: press <b>Ctrl+Shift+B</b> (Windows/Linux) or <b>Cmd+Shift+B</b> (Mac). The bar should appear just below your address bar. You only need to do this once.
          </Step>
          <Step n={3} title='Right-click the bookmarks bar → "Add page"'>
            Right-click any empty space on your bookmarks bar and choose <b>Add page…</b> or <b>Add new bookmark</b>. A dialog box will appear with Name and URL fields.
          </Step>
          <Step n={4} title="Name it and paste the code into the URL field">
            Give it a short name you'll recognize — something like <b>📋 MX Passdown</b>. Then click into the URL field, select all (Ctrl+A), and paste your copied code. Click Save.
          </Step>
          <Step n={5} title="Navigate to JetInsight and log in normally">
            Go to <code style={cd}>portal.jetinsight.com</code> and sign in as usual. You don't need to navigate to any particular page — the bookmark works anywhere on the site.
          </Step>
          <Step n={6} title="Click your new bookmark — the editor opens" last>
            With JetInsight open, click the bookmark in your bar. A loading overlay appears while data is fetched (~10–15 seconds). Once loaded, review every section, make your edits, then hit <b>Copy Text</b> for Teams or <b>Download PDF</b>.
          </Step>
        </div>

        {/* Tips */}
        <div style={{ ...panel, borderLeft:`3px solid ${A}` }}>
          <div style={{ ...eyebrow, color:A, marginBottom:12 }}>Tips &amp; notes</div>
          <ul style={{ ...bodyText, paddingLeft:18, margin:0 }}>
            <li>The bookmark only runs on JetInsight — clicking it anywhere else won't do anything.</li>
            <li>You only set this up once per browser. It'll survive browser restarts and updates.</li>
            <li>Report date defaults to today. Change it at the top of the editor before generating.</li>
            <li>MEL expirations within 7 days are automatically highlighted red — no manual check needed.</li>
            <li>If JetInsight updates their layout, the bookmark may need an update — check with the tool maintainer.</li>
            <li>To update later: right-click the bookmark → Edit → paste new code into the URL field.</li>
          </ul>
        </div>

        <div style={{ textAlign:"center", marginTop:30, fontFamily:SANS, fontSize:10, letterSpacing:2.2, color:"rgba(255,255,255,.22)" }}>
          ADVANCED AIR, LLC · INTERNAL USE ONLY
        </div>
      </div>
    </div>
  );
}

const cd = { fontFamily:"'Courier New', ui-monospace, monospace", fontSize:12, background:"rgba(255,255,255,.06)", padding:"1px 6px", borderRadius:4, color:"#cfe8ff" };

function Step({ n, title, children, last }) {
  return (
    <div style={{ display:"flex", gap:16, marginBottom:last ? 0 : 18 }}>
      <div style={{ flexShrink:0, width:30, height:30, borderRadius:"50%", border:`2px solid ${A}`, background:`rgba(${A_RGB},.12)`, color:A, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:SANS, fontWeight:700, fontSize:13 }}>{n}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:SANS, fontWeight:600, fontSize:15, color:"#f0f0f0", marginBottom:5 }}>{title}</div>
        <div style={{ fontFamily:SANS, fontSize:13.5, lineHeight:1.6, color:"rgba(255,255,255,.7)" }}>{children}</div>
      </div>
    </div>
  );
}
