import { useEffect, useRef, useState } from "react";
import { A, A_RGB, SANS, BG } from "../theme.js";
import { bookmarkletUrl } from "./bookmarkletUrl.js";

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
html, body { overflow-x: hidden; max-width: 100vw; }
.bm-btn, .bm-panel { transition: box-shadow .2s ease, border-color .2s ease; }
.bm-btn:hover { box-shadow: 0 0 0 1px ${A}, 0 0 16px rgba(${A_RGB},.55); border-color: ${A}; }
.bm-code {
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
.bm-code:focus { border-color: ${A}; box-shadow: 0 0 0 1px ${A}, 0 0 12px rgba(${A_RGB},.40); }
`;

const eyebrow = { fontFamily:SANS, fontWeight:500, fontSize:11, letterSpacing:3, color:"rgba(255,255,255,.45)", textTransform:"uppercase" };
const panel = { background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"22px 24px", marginBottom:18 };
const h2 = { fontFamily:SANS, fontWeight:600, fontSize:22, color:"#f0f0f0", marginBottom:14, letterSpacing:0.2 };
const body = { fontFamily:SANS, fontWeight:400, fontSize:14.5, lineHeight:1.65, color:"rgba(255,255,255,.78)" };

export default function BookmarkletPage({ onBack }) {
  const [copied, setCopied] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const gesture = useRef({ pinching:false, panning:false, startDist:0, startScale:1, startX:0, startY:0, startTx:0, startTy:0 });

  useEffect(() => {
    if (!zoomOpen) { setScale(1); setTx(0); setTy(0); return; }
    const onKey = (e) => { if (e.key === "Escape") setZoomOpen(false); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomOpen]);

  const distBetween = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  const onImgTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      gesture.current.pinching = true;
      gesture.current.panning = false;
      gesture.current.startDist = distBetween(e.touches[0], e.touches[1]);
      gesture.current.startScale = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      gesture.current.panning = true;
      gesture.current.startX = e.touches[0].clientX;
      gesture.current.startY = e.touches[0].clientY;
      gesture.current.startTx = tx;
      gesture.current.startTy = ty;
    }
  };

  const onImgTouchMove = (e) => {
    if (gesture.current.pinching && e.touches.length === 2) {
      e.preventDefault();
      const d = distBetween(e.touches[0], e.touches[1]);
      const next = Math.max(1, Math.min(4, gesture.current.startScale * (d / gesture.current.startDist)));
      setScale(next);
      if (next <= 1.001) { setTx(0); setTy(0); }
    } else if (gesture.current.panning && e.touches.length === 1) {
      e.preventDefault();
      setTx(gesture.current.startTx + (e.touches[0].clientX - gesture.current.startX));
      setTy(gesture.current.startTy + (e.touches[0].clientY - gesture.current.startY));
    }
  };

  const onImgTouchEnd = (e) => {
    if (e.touches.length < 2) gesture.current.pinching = false;
    if (e.touches.length === 0) gesture.current.panning = false;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.getElementById("bm-code-textarea");
      if (ta) { ta.select(); document.execCommand("copy"); setCopied(true); setTimeout(()=>setCopied(false),2000); }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:SANS, color:"#fff", padding:"22px 18px 60px" }}>
      <style>{PAGE_CSS}</style>
      <div style={{ maxWidth:780, margin:"0 auto" }}>

        {/* Top bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:26 }}>
          <button className="bm-btn"
            style={{ background:"transparent", border:"2px solid rgba(255,255,255,.14)", color:"rgba(255,255,255,.55)", padding:"8px 16px", fontFamily:SANS, fontSize:13, fontWeight:500, cursor:"pointer", borderRadius:8 }}
            onClick={onBack}>← Back to hub</button>
          <span style={eyebrow}>JetInsight Shift Filter</span>
        </div>

        {/* Intro */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", fontFamily:SANS, fontWeight:700, fontSize:10, letterSpacing:2.4, color:A, background:`rgba(${A_RGB},.12)`, border:`1px solid rgba(${A_RGB},.45)`, padding:"5px 11px", borderRadius:999, marginBottom:18 }}>
            ONE-TIME SETUP · 60 SECONDS
          </div>
          <h1 style={{ fontFamily:SANS, fontWeight:700, fontSize:30, color:"#fff", margin:"0 0 14px", letterSpacing:0.2 }}>JetInsight Shift Filter</h1>
          <p style={body}>
            JetInsight shows every flight, every plane, every station across the entire fleet. That's a lot of noise when all you need is your planes, your station, during your shift.
          </p>
          <p style={{ ...body, marginTop:12 }}>
            This bookmark script is a small piece of JavaScript you install once. After that, one click while JetInsight is open instantly filters the schedule down to exactly what you need.
          </p>
        </div>

        {/* What it does */}
        <div style={panel}>
          <div style={{ ...eyebrow, color:A, marginBottom:12 }}>What it actually shows</div>
          <ul style={{ ...body, paddingLeft:18, margin:0 }}>
            <li>Your station only — flights not arriving or departing your station are stripped out</li>
            <li>Your shift window — flights outside it still listed as FYI</li>
            <li>Crew swaps removed, station-critical departure/arrival times highlighted</li>
            <li>Open MEL cards per aircraft (collapsible) — category, item #, expiry, pilot notes, sign-off status</li>
            <li>CAMP compliance flags — warnings and expired items only</li>
            <li>MX block summary at the bottom with full notes</li>
          </ul>
        </div>

        {/* Example output */}
        <div style={panel}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
            <div style={{ ...eyebrow, color:A }}>Example — what you'll see after clicking the bookmark</div>
          </div>
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label="Enlarge example screenshot"
            style={{ width:"100%", background:"rgba(0,0,0,.35)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, padding:14, display:"flex", justifyContent:"center", cursor:"zoom-in", appearance:"none", font:"inherit", color:"inherit" }}>
            <img src="/bookmarklet-example.png" alt="Example of the MX Report overlay — flight schedule, MEL cards, CAMP flags"
              style={{ maxWidth:"100%", height:"auto", borderRadius:6, display:"block", pointerEvents:"none" }}/>
          </button>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:10, fontStyle:"italic", textAlign:"center" }}>
            Tap the image to enlarge · Illustrative — actual tails, MELs, and times will reflect your real schedule.
          </div>
        </div>

        {/* Bookmarklet code */}
        <div style={panel}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:10 }}>
            <div>
              <div style={{ ...eyebrow, color:A, marginBottom:4 }}>Bookmarklet code</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:"rgba(255,255,255,.45)" }}>Step 1: copy this, then follow the steps below</div>
            </div>
            <button className="bm-btn"
              style={{ background:copied?"rgba(74,222,128,.15)":A, border:`2px solid ${copied?"#4ade80":A}`, color:copied?"#4ade80":"#0d1018", padding:"9px 20px", fontFamily:SANS, fontSize:13, fontWeight:700, letterSpacing:0.4, cursor:"pointer", borderRadius:8, minWidth:130 }}
              onClick={copy}>
              {copied ? "✓ Copied!" : "Copy Code"}
            </button>
          </div>
          <textarea id="bm-code-textarea" className="bm-code" readOnly spellCheck={false} rows={6} value={bookmarkletUrl}/>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.32)", marginTop:8, fontFamily:SANS }}>
            URL length: {bookmarkletUrl.length.toLocaleString()} characters
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
            Give it a short name you'll recognize — something like <b>✈ Shift Filter</b> or <b>JetInsight</b>. Then click into the URL field, select all (Ctrl+A), and paste your copied code. Click Save.
          </Step>
          <Step n={5} title="Navigate to JetInsight and log in normally">
            Go to your normal JetInsight URL (<code style={cd}>portal.jetinsight.com</code>) and sign in as usual. Navigate to the schedule or calendar view — you don't need to do anything special on the page.
          </Step>
          <Step n={6} title="Click your new bookmark — done" last>
            With JetInsight open, click the bookmark in your bar. A day-picker overlay appears (Today / Tomorrow / Day after). Pick one, the report loads in ~10 seconds. Every time you log in, just click it once.
          </Step>
        </div>

        {/* Tips & notes */}
        <div style={{ ...panel, borderLeft:`3px solid ${A}` }}>
          <div style={{ ...eyebrow, color:A, marginBottom:12 }}>Tips & notes</div>
          <ul style={{ ...body, paddingLeft:18, margin:0 }}>
            <li>The bookmark only runs on JetInsight — clicking it anywhere else won't do anything.</li>
            <li>You only set this up once per browser. It'll survive browser restarts and updates.</li>
            <li>If JetInsight updates their page layout, the filter may need an update — check with the tool maintainer.</li>
            <li>Keyboard shortcuts for the bookmarks bar: <b>Ctrl+Shift+B</b> on Windows/Linux, <b>Cmd+Shift+B</b> on Mac.</li>
            <li>Need to update the filter later? Right-click the bookmark → Edit → paste new code into the URL field.</li>
            <li>To edit the bookmarklet source, modify <code style={cd}>mx-report/bookmarklet.js</code> and rebuild — this page picks up the new code automatically.</li>
          </ul>
        </div>

        <div style={{ textAlign:"center", marginTop:30, fontFamily:SANS, fontSize:10, letterSpacing:2.2, color:"rgba(255,255,255,.22)" }}>
          ADVANCED AIR, LLC · INTERNAL USE ONLY
        </div>
      </div>

      {zoomOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setZoomOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged example screenshot"
          style={{
            position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:9999,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"16px", overflow:"hidden", touchAction:"none",
          }}>
          <img src="/bookmarklet-example.png" alt="Example of the MX Report overlay (enlarged)"
            onTouchStart={onImgTouchStart}
            onTouchMove={onImgTouchMove}
            onTouchEnd={onImgTouchEnd}
            onDoubleClick={() => { if (scale === 1) { setScale(2); } else { setScale(1); setTx(0); setTy(0); } }}
            style={{
              display:"block",
              maxWidth:"100%", maxHeight:"100%", width:"auto", height:"auto",
              borderRadius:6, boxShadow:"0 8px 40px rgba(0,0,0,.6)",
              transform:`translate(${tx}px, ${ty}px) scale(${scale})`,
              transformOrigin:"center center",
              transition: gesture.current.pinching || gesture.current.panning ? "none" : "transform .15s ease",
              touchAction:"none",
              userSelect:"none",
              WebkitUserSelect:"none",
            }}/>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setZoomOpen(false); }}
            aria-label="Close enlarged image"
            style={{ position:"fixed", top:14, right:14, width:42, height:42, borderRadius:"50%", border:"1px solid rgba(255,255,255,.25)", background:"rgba(0,0,0,.55)", color:"#fff", fontSize:22, lineHeight:1, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000 }}>
            ×
          </button>
          <div style={{ position:"fixed", bottom:18, left:0, right:0, textAlign:"center", fontFamily:SANS, fontSize:11, letterSpacing:1.6, color:"rgba(255,255,255,.5)", textTransform:"uppercase", pointerEvents:"none" }}>
            {scale > 1 ? "Drag to pan · Pinch to zoom" : "Pinch to zoom · Tap outside to close"}
          </div>
        </div>
      )}
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
