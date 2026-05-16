import { A, A_RGB, SANS, BG } from "../theme.js";

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
html, body { overflow-x: hidden; max-width: 100vw; }
.inst-btn { transition: box-shadow .2s ease, border-color .2s ease; }
.inst-btn:hover { box-shadow: 0 0 0 1px ${A}, 0 0 18px rgba(${A_RGB},.55); border-color: ${A}; }
`;

const eyebrow = { fontFamily:SANS, fontWeight:500, fontSize:11, letterSpacing:3, color:"rgba(255,255,255,.45)", textTransform:"uppercase" };
const panel = { background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"22px 24px", marginBottom:18 };
const body = { fontFamily:SANS, fontWeight:400, fontSize:14.5, lineHeight:1.65, color:"rgba(255,255,255,.78)" };

export default function InstallPage({ onBack }) {
  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:SANS, color:"#fff", padding:"22px 18px 60px" }}>
      <style>{PAGE_CSS}</style>
      <div style={{ maxWidth:780, margin:"0 auto" }}>

        {/* Top bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:26 }}>
          <button className="inst-btn"
            style={{ background:"transparent", border:"2px solid rgba(255,255,255,.14)", color:"rgba(255,255,255,.55)", padding:"8px 16px", fontFamily:SANS, fontSize:13, fontWeight:500, cursor:"pointer", borderRadius:8 }}
            onClick={onBack}>← Back to hub</button>
          <span style={eyebrow}>Add to Home Screen</span>
        </div>

        {/* Intro */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", fontFamily:SANS, fontWeight:700, fontSize:10, letterSpacing:2.4, color:A, background:`rgba(${A_RGB},.12)`, border:`1px solid rgba(${A_RGB},.45)`, padding:"5px 11px", borderRadius:999, marginBottom:18 }}>
            ONE-TIME SETUP · 30 SECONDS
          </div>
          <h1 style={{ fontFamily:SANS, fontWeight:700, fontSize:30, color:"#fff", margin:"0 0 14px", letterSpacing:0.2 }}>Add to Home Screen</h1>
          <p style={body}>
            Instead of opening a browser and typing an address every time, install this portal as an icon on your phone's home screen. It opens full-screen — no address bar, no browser tabs, no noise. Works on iPhone and Android.
          </p>
        </div>

        {/* iPhone section */}
        <div style={panel}>
          <div style={{ ...eyebrow, color:A, marginBottom:6 }}>iPhone · Safari</div>
          <p style={{ fontFamily:SANS, fontSize:13, color:"rgba(255,255,255,.45)", margin:"0 0 18px" }}>
            Safari is required on iPhone — "Add to Home Screen" is only available in Safari, not Chrome or other browsers.
          </p>
          <Step n={1} title="Open Safari and go to the app">
            Navigate to <code style={cd}>preflight-checklist-beta.vercel.app</code>. If you're currently viewing this in Chrome or another browser, copy that address and paste it into Safari's address bar.
          </Step>
          <Step n={2} title="Tap the Share button">
            Look for the box-with-arrow icon (⬆) at the bottom center of the screen — it's in Safari's bottom toolbar. Tap it.
          </Step>
          <Step n={3} title='Tap "Add to Home Screen"'>
            Scroll down the share sheet that slides up. Find and tap <b>Add to Home Screen</b>.
          </Step>
          <Step n={4} title="Name it and tap Add">
            The name shows under the icon on your home screen, so keep it short. We recommend <b>MX Tools</b> or <b>AA MX Tools</b>. Tap <b>Add</b> in the top-right corner.
          </Step>
          <Step n={5} title="Done — tap the icon any time" last>
            The icon appears on your home screen just like a native app. Tap it to open the portal full-screen with no browser bars.
          </Step>
        </div>

        {/* Android section */}
        <div style={panel}>
          <div style={{ ...eyebrow, color:A, marginBottom:6 }}>Android · Chrome</div>
          <p style={{ fontFamily:SANS, fontSize:13, color:"rgba(255,255,255,.45)", margin:"0 0 18px" }}>
            Chrome works best on Android. Samsung Internet or Firefox may not show the install option.
          </p>
          <Step n={1} title="Open Chrome and go to the app">
            Navigate to <code style={cd}>preflight-checklist-beta.vercel.app</code>.
          </Step>
          <Step n={2} title="Tap the three-dot menu">
            Tap the <b>⋮</b> icon in the top-right corner of Chrome.
          </Step>
          <Step n={3} title='"Add to Home Screen" or "Install app"'>
            Look for <b>Add to Home Screen</b> or <b>Install app</b> in the menu — the wording varies slightly by Android version. Both do the same thing.
          </Step>
          <Step n={4} title="Name it and confirm">
            Keep the name short so it fits under the icon. Suggested: <b>MX Tools</b> or <b>AA MX Tools</b>. Tap <b>Add</b> or <b>Install</b>.
          </Step>
          <Step n={5} title="Done — tap the icon any time" last>
            The icon appears on your home screen. Tap it to open the portal full-screen, no browser bars.
          </Step>
        </div>

        {/* Tips */}
        <div style={{ ...panel, borderLeft:`3px solid ${A}` }}>
          <div style={{ ...eyebrow, color:A, marginBottom:12 }}>Tips & notes</div>
          <ul style={{ ...body, paddingLeft:18, margin:0 }}>
            <li>You only do this once — the icon stays on your home screen permanently unless you delete it.</li>
            <li>The app still requires an internet connection; it is not a fully offline app.</li>
            <li>If the option doesn't appear on Android, confirm you're using Chrome (not Samsung Internet or Firefox).</li>
            <li>To remove it later, long-press the icon on your home screen and delete it like any other app.</li>
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
    <div style={{ display:"flex", gap:16, marginBottom:last?0:18 }}>
      <div style={{ flexShrink:0, width:30, height:30, borderRadius:"50%", border:`2px solid ${A}`, background:`rgba(${A_RGB},.12)`, color:A, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:SANS, fontWeight:700, fontSize:13 }}>{n}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:SANS, fontWeight:600, fontSize:15, color:"#f0f0f0", marginBottom:5 }}>{title}</div>
        <div style={{ fontFamily:SANS, fontSize:13.5, lineHeight:1.6, color:"rgba(255,255,255,.7)" }}>{children}</div>
      </div>
    </div>
  );
}
