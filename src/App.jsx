import { useState, useRef } from "react";

const TAIL_NUMS = ["833CC","352PX","350ES","395AA","395MB","395AV"];
const PILOT     = "Daniel Ramirez";
const CERT      = "4948003";
const INIT      = "DR";
const A         = "#5eb9ff";        // accent (replaces yellow)
const A_RGB     = "94,185,255";
const NAVY      = "#1a3a6e";        // brand navy (logo color)
const SANS      = "'Outfit',system-ui,sans-serif";
const GF        = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
.aa-btn, .aa-tile, .aa-input, .aa-field {
  transition: box-shadow .2s ease, border-color .2s ease;
}
.aa-btn:hover, .aa-tile:hover {
  box-shadow: 0 0 0 1px ${A}, 0 0 16px rgba(${A_RGB},.55);
  border-color: ${A};
}
.aa-input:hover, .aa-input:focus, .aa-field:hover, .aa-field:focus {
  box-shadow: 0 0 0 1px ${A}, 0 0 12px rgba(${A_RGB},.40);
  border-color: ${A};
  outline: none;
}
.aa-yes:hover { box-shadow: 0 0 0 1px #4ade80, 0 0 16px rgba(74,222,128,.45); border-color:#4ade80; }
.aa-no:hover  { box-shadow: 0 0 0 1px #f87171, 0 0 16px rgba(248,113,113,.45); border-color:#f87171; }
.aa-textarea {
  background-image: repeating-linear-gradient(transparent 0, transparent 17px, #d4d4d4 17px, #d4d4d4 18px);
  line-height: 18px;
}
/* ── Global scroll lock ─────────────────────────────────── */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
  overscroll-behavior: none;
}
* { box-sizing: border-box; }
/* iOS date input fix */
input[type="date"] {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}
input[type="date"]::-webkit-date-and-time-value {
  text-align: left;
}
/* Wizard & home: fixed to viewport, no scroll */
.app-fixed {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
}
/* Checklist print view: vertical scroll only */
.print-view {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}
/* ── Responsive ─────────────────────────────────────────── */
/* Wizard: expand comfortably on large screens */
@media (min-width: 640px) {
  .wiz-wrap { max-width: 560px !important; }
}
@media (min-width: 1024px) {
  .wiz-wrap { max-width: 620px !important; }
}
/* Document preview: scale to fit smaller viewports */
@media (max-width: 900px)  { .doc-page { zoom: 0.88; } }
@media (max-width: 700px)  { .doc-page { zoom: 0.70; } }
@media (max-width: 520px)  { .doc-page { zoom: 0.52; } }
@media (max-width: 400px)  { .doc-page { zoom: 0.42; } }
/* Toolbar: stack on very small screens */
@media (max-width: 480px) {
  .print-toolbar { flex-direction: column; align-items: stretch !important; }
  .print-toolbar span { text-align: center; }
  .toolbar-btns { justify-content: stretch; }
  .toolbar-btns button { flex: 1; }
}
@media print {
  .aa-input, .aa-field, .aa-textarea {
    border-color: transparent !important;
    box-shadow: none !important;
  }
}
`;

const LEFT = [
  { id:"nos", title:"NOSE SECTION", items:[
    {id:"n1",  t:"Pitot Heads / TAT Probe Clear"},
    {id:"n2",  t:"Tow Limit/Steering Stop Condition & Security"},
    {id:"n3",  t:"Strut Length"},
    {id:"n4",  t:"Nose Landing Gear Condition"},
    {id:"n5",  t:"Nose Tire Pressure (55-60 PSI)"},
    {id:"n6",  t:"Wheel Well Condition"},
    {id:"n7",  t:"A/C CB Tripped Y / N?"},
    {id:"n8",  t:"Placards"},
  ]},
  { id:"fus", title:"FUSELAGE", items:[
    {id:"fH1", t:"Forward Fuselage", h:true},
    {id:"f1",  t:"Cabin Window Condition"},
    {id:"f2",  t:"Emergency Exits Secure"},
    {id:"f3",  t:"Cabin Door Seal"},
    {id:"f4",  t:"Placards"},
    {id:"fH2", t:"Aft Fuselage", h:true},
    {id:"f5",  t:"O² Pressure"},
    {id:"f6",  t:"RVSM Area / Static Ports Condition"},
    {id:"f7",  t:"Access Doors Secure"},
  ]},
  { id:"wl", title:"WINGS — Center Section (Left)", items:[
    {id:"wl1",  t:"Landing Gear Accum. *750 PSI or 850 PSI"},
    {id:"wl2",  t:"Hydro Fluid Level"},
    {id:"wl3",  t:"Fuel Cap Secure"},
    {id:"wl4",  t:"Fuel Vent Ports Clear"},
    {id:"wl5",  t:"Drain Fuel / Drain Sumps"},
    {id:"wl6",  t:"Boots Condition"},
    {id:"wl7",  t:"Static Wick Condition"},
    {id:"wl8",  t:"Flaps Condition"},
    {id:"wl9",  t:"Landing Gear Strut"},
    {id:"wl10", t:"MLG and Wheel Well Condition"},
    {id:"wl11", t:"Brake Wear"},
    {id:"wl12", t:"Correct Fire Bottle Pressure"},
    {id:"wl13", t:"Placards"},
  ]},
  { id:"wr", title:"WINGS — Center Section (Right)", items:[
    {id:"wr1",  t:"Battery Vents Clear"},
    {id:"wr2",  t:"Fuel Vent Ports Clear"},
    {id:"wr3",  t:"Drain Fuel / Drain Sumps"},
    {id:"wr4",  t:"Boots Condition"},
    {id:"wr5",  t:"Flaps Condition"},
    {id:"wr6",  t:"Landing Gear Strut"},
    {id:"wr7",  t:"MLG Tire Press 90 +/- 2 PSI (B300 ONLY)"},
    {id:"wr8",  t:"MLG and Wheel Well Condition"},
    {id:"wr9",  t:"Brake Wear"},
    {id:"wr10", t:"Fire Bottles Pressure"},
    {id:"wr11", t:"Drain Fuel / Sumps"},
    {id:"wr12", t:"Placards"},
  ]},
];

const RIGHT = [
  { id:"ob", title:"OUTBOARD WINGS", items:[
    {id:"ob1", t:"Static Wick Condition"},
    {id:"ob2", t:"Ailerons and Flaps Condition"},
    {id:"ob3", t:"Fuel Sump Drained"},
    {id:"ob4", t:"Wing Tip Lens Condition"},
    {id:"ob5", t:"Trim Tab Condition (L/H)"},
    {id:"ob6", t:"Wing Lockers Clean"},
  ]},
  { id:"emp", title:"EMPENNAGE", items:[
    {id:"e1", t:"Horizontal Stab Boots Condition"},
    {id:"e2", t:"Static Wicks"},
    {id:"e3", t:"Trim Tabs Condition"},
  ]},
  { id:"eng", title:"ENGINES", items:[
    {id:"eng1",  t:"Inlet Condition / Clear"},
    {id:"eng2",  t:"Exhaust Clear"},
    {id:"eng3",  t:"Gen Cooling Duct Clear"},
    {id:"eng4",  t:"Nacelle Latched and Secure"},
    {id:"eng5",  t:"Oil Level (2 Low)"},
    {id:"eng6",  t:"Oil Cap Secure"},
    {id:"eng7",  t:"Fwd Upper Cowls Properly Secured"},
    {id:"eng8",  t:"Nacelle Fuel Sump Drain"},
    {id:"eng9",  t:"Props Condition"},
    {id:"eng10", t:"Spinners Secure"},
  ]},
  { id:"cpt", title:"COCKPIT / INTERIOR", items:[
    {id:"c1",  t:"Cockpit / Interior Lights"},
    {id:"c2",  t:"Nav Database Current"},
    {id:"c3",  t:"Emergency Light Operation"},
    {id:"c4",  t:"All Exterior Lights Condition / Operation"},
    {id:"c5",  t:"Portable Fire Extinguishers Condition / Secure"},
    {id:"c6",  t:"Lav Serviced / Lav Tank Full"},
    {id:"c7",  t:"Door / Entryway / Cockpit / Cabin Clean"},
    {id:"c8",  t:"Condition of Drawers"},
    {id:"c9",  t:"Seats / Armrests"},
    {id:"c10", t:"Tray Tables"},
    {id:"c11", t:"All Aircraft Placards Legible"},
  ]},
];

const ALL_SECS = [...LEFT,...RIGHT];

const fmtDate = s => { if (!s) return ""; const p=s.split("-"); return `${p[1]}/${p[2]}/${p[0]}`; };
const emptyState = () => ({ tail:"", ok:null, inc:new Set(), tires:null, oxy:null, oil:null, qty:"", date:new Date().toISOString().split("T")[0], name:PILOT, cert:CERT, init:INIT, notes:"" });
const loadLib = src => new Promise((res,rej)=>{ const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); });

// ── Wizard style tokens ───────────────────────────────────────
const qSt  = { fontFamily:SANS, fontSize:20, fontWeight:600, color:"#f0f0f0", marginBottom:26, lineHeight:1.35 };
const ynR  = { display:"flex", gap:14, marginBottom:22 };
const yB   = { flex:1, padding:"17px", background:"rgba(34,197,94,.1)", border:"2px solid rgba(34,197,94,.45)", color:"#4ade80", fontSize:18, fontFamily:SANS, fontWeight:700, cursor:"pointer", borderRadius:10 };
const nB   = { flex:1, padding:"17px", background:"rgba(239,68,68,.08)", border:"2px solid rgba(239,68,68,.38)", color:"#f87171", fontSize:18, fontFamily:SANS, fontWeight:700, cursor:"pointer", borderRadius:10 };
const bkB  = { background:"transparent", border:"2px solid rgba(255,255,255,.14)", color:"rgba(255,255,255,.45)", padding:"10px 20px", fontSize:13, fontFamily:SANS, fontWeight:500, cursor:"pointer", borderRadius:8 };
const nxB  = { background:`rgba(${A_RGB},.13)`, border:`2px solid ${A}`, color:A, padding:"10px 26px", fontSize:13, fontFamily:SANS, fontWeight:600, cursor:"pointer", borderRadius:8 };
const nvR  = { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 };
const inpS = { width:"100%", background:"rgba(255,255,255,.06)", border:`2px solid rgba(${A_RGB},.32)`, color:"#fff", padding:"14px 16px", fontSize:15, fontFamily:SANS, fontWeight:500, borderRadius:10, marginBottom:18, outline:"none", boxSizing:"border-box" };

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home");
  const [step, setStep] = useState(0);
  const [d, setD]       = useState(emptyState());

  const flow = x => { const f=["tail","check"]; if(x.ok==="no") f.push("inc"); f.push("tires","oxy","oil"); if(x.oil==="yes") f.push("qty"); f.push("date","rev"); return f; };
  const steps = flow(d), cur = steps[step], pct = Math.round(((step+1)/steps.length)*100);
  const patch = u => setD(p=>({...p,...u}));
  const go = (u={}) => { const nd={...d,...u}; setD(nd); const nf=flow(nd); if(step+1<nf.length) setStep(step+1); else setView("print"); };
  const bk  = () => setStep(s=>Math.max(0,s-1));
  const tog = id => setD(p=>{ const s=new Set(p.inc); s.has(id)?s.delete(id):s.add(id); return {...p,inc:s}; });
  const done = id => d.ok==="yes" || !d.inc.has(id);

  if (view==="print") return <PrintOut d={d} done={done} back={()=>setView("wizard")}/>;
  if (view==="home")  return <Home start={()=>{ setStep(0); setD(emptyState()); setView("wizard"); }}/>;

  return (
    <div className="app-fixed" style={{ background:"#0d1018", padding:"28px 20px", fontFamily:SANS, overflowY:"auto" }}>
      <style>{GF}</style>
      <div className="wiz-wrap" style={{ maxWidth:480, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontFamily:SANS, fontWeight:700, fontSize:13, color:A, letterSpacing:2 }}>ADVANCED AIR</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.35)", fontWeight:500 }}>{step+1} of {steps.length}</span>
        </div>
        <div style={{ height:3, background:"rgba(255,255,255,.08)", borderRadius:2, marginBottom:34 }}>
          <div style={{ height:"100%", width:`${pct}%`, background:A, borderRadius:2, transition:"width .35s" }}/>
        </div>
        {cur==="tail"  && <TailStep  d={d} go={go}/>}
        {cur==="check" && <CheckStep go={go} bk={bk}/>}
        {cur==="inc"   && <IncStep   d={d} tog={tog} go={go} bk={bk}/>}
        {cur==="tires" && <BoolStep  q="Were tires serviced?"  go={v=>go({tires:v})} bk={bk}/>}
        {cur==="oxy"   && <BoolStep  q="Was oxygen serviced?" go={v=>go({oxy:v})}   bk={bk}/>}
        {cur==="oil"   && <BoolStep  q="Was oil serviced?"    go={v=>go({oil:v})}   bk={bk}/>}
        {cur==="qty"   && <QtyStep   d={d} patch={patch} go={go} bk={bk}/>}
        {cur==="date"  && <DateStep  d={d} patch={patch} go={go} bk={bk}/>}
        {cur==="rev"   && <RevStep   d={d} patch={patch} go={go} bk={bk}/>}
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────
function Home({ start }) {
  return (
    <div className="app-fixed" style={{ background:"#0d1018", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{GF}</style>
      <div style={{ textAlign:"center" }}>
        <AirLogo/>
        <div style={{ fontFamily:SANS, fontWeight:400, fontSize:12, letterSpacing:3.5, color:"rgba(255,255,255,.45)", marginTop:28, marginBottom:50 }}>AIRCRAFT PREFLIGHT / POSTFLIGHT CHECKLIST</div>
        <button className="aa-btn" style={{ background:A, color:"#0d1018", border:`2px solid ${A}`, padding:"17px 56px", fontFamily:SANS, fontSize:15, fontWeight:700, letterSpacing:0.5, cursor:"pointer", borderRadius:10 }} onClick={start}>
          Generate Checklist
        </button>
      </div>
    </div>
  );
}

function AirLogo() {
  return (
    <img src="/logo.png" alt="Advanced Air" style={{ display:"block", margin:"0 auto", width:220, height:"auto", filter:"brightness(0) invert(1)" }}/>
  );
}

// ── Wizard steps ──────────────────────────────────────────────
function TailStep({ d, go }) {
  const [custom, setCustom] = useState(TAIL_NUMS.includes(d.tail) ? "" : d.tail);
  const hasCustom = custom.trim().length > 0;
  return (
    <div>
      <div style={qSt}>What is the tail number?</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
        {TAIL_NUMS.map(t => {
          const active = d.tail===t && !hasCustom;
          return (
            <button key={t} className="aa-tile"
              style={{ background:active?A:"rgba(255,255,255,.05)", border:`2px solid ${active?A:"rgba(94,185,255,.28)"}`, color:active?"#0d1018":"#dedede", padding:"13px 6px", fontSize:14, fontFamily:SANS, fontWeight:active?700:500, cursor:"pointer", borderRadius:8, letterSpacing:1.5 }}
              onClick={() => { setCustom(""); go({tail:t}); }}>
              {t}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize:11, color:"rgba(255,255,255,.28)", marginBottom:10, fontWeight:600, letterSpacing:2 }}>OR ENTER ANOTHER</div>
      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
        <input className="aa-input" value={custom} onChange={e=>setCustom(e.target.value.toUpperCase())}
          placeholder="Custom tail #" style={{...inpS, marginBottom:0, flex:1}}/>
        {hasCustom && (
          <button className="aa-btn" style={{...nxB, marginTop:1, whiteSpace:"nowrap"}} onClick={()=>go({tail:custom.trim()})}>Use →</button>
        )}
      </div>
    </div>
  );
}

function CheckStep({ go, bk }) {
  return (
    <div>
      <div style={qSt}>Is the entire checklist completed?</div>
      <div style={ynR}>
        <button className="aa-yes" style={yB} onClick={()=>go({ok:"yes",inc:new Set()})}>YES</button>
        <button className="aa-no"  style={nB} onClick={()=>go({ok:"no"})}>NO</button>
      </div>
      <button className="aa-btn" style={bkB} onClick={bk}>← Back</button>
    </div>
  );
}

function IncStep({ d, tog, go, bk }) {
  return (
    <div>
      <div style={qSt}>Which items were NOT completed?</div>
      <div style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginBottom:14 }}>Tap to flag as incomplete — those show blank on the form</div>
      <div style={{ maxHeight:290, overflowY:"auto", border:"2px solid rgba(94,185,255,.28)", borderRadius:10, marginBottom:16 }}>
        {ALL_SECS.map(sec=>(
          <div key={sec.id}>
            <div style={{ background:"rgba(94,185,255,.10)", padding:"7px 14px", fontSize:10, color:A, letterSpacing:2, fontWeight:700, borderBottom:"1px solid rgba(94,185,255,.18)", position:"sticky", top:0 }}>
              {sec.title}
            </div>
            {sec.items.filter(i=>!i.h).map(item=>{
              const isInc=d.inc.has(item.id);
              return (
                <div key={item.id}
                  style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"9px 14px", borderBottom:"1px solid rgba(255,255,255,.04)", cursor:"pointer", background:isInc?"rgba(239,68,68,.07)":"transparent" }}
                  onClick={()=>tog(item.id)}>
                  <span style={{ color:isInc?"#f87171":"#4ade80", fontWeight:700, fontSize:14, width:16, flexShrink:0 }}>{isInc?"✗":"✓"}</span>
                  <span style={{ fontSize:13, color:isInc?"rgba(255,255,255,.45)":"rgba(255,255,255,.78)", fontWeight:400, lineHeight:1.4 }}>{item.t}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={nvR}>
        <button className="aa-btn" style={bkB} onClick={bk}>← Back</button>
        <button className="aa-btn" style={nxB} onClick={()=>go()}>Next →</button>
      </div>
    </div>
  );
}

function BoolStep({ q, go, bk }) {
  return (
    <div>
      <div style={qSt}>{q}</div>
      <div style={ynR}>
        <button className="aa-yes" style={yB} onClick={()=>go("yes")}>YES</button>
        <button className="aa-no"  style={nB} onClick={()=>go("no")}>NO</button>
      </div>
      <button className="aa-btn" style={bkB} onClick={bk}>← Back</button>
    </div>
  );
}

function QtyStep({ d, patch, go, bk }) {
  const ok=d.qty.trim().length>0;
  return (
    <div>
      <div style={qSt}>What quantity of oil was serviced?</div>
      <input className="aa-input" value={d.qty} onChange={e=>patch({qty:e.target.value})} placeholder="e.g. 2 qts" autoFocus style={inpS}/>
      <div style={nvR}>
        <button className="aa-btn" style={bkB} onClick={bk}>← Back</button>
        <button className="aa-btn" style={{...nxB,opacity:ok?1:0.4}} onClick={()=>ok&&go()}>Next →</button>
      </div>
    </div>
  );
}

function DateStep({ d, patch, go, bk }) {
  return (
    <div style={{ width:"100%", boxSizing:"border-box" }}>
      <div style={qSt}>What date for this checklist?</div>
      <div style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginBottom:14 }}>Backdate as needed</div>
      <input className="aa-input" type="date" value={d.date} onChange={e=>patch({date:e.target.value})}
        style={{...inpS, colorScheme:"dark", width:"100%", maxWidth:"100%", boxSizing:"border-box", padding:"14px 10px", fontSize:14}}/>
      <div style={nvR}>
        <button className="aa-btn" style={bkB} onClick={bk}>← Back</button>
        <button className="aa-btn" style={nxB} onClick={()=>go()}>Next →</button>
      </div>
    </div>
  );
}

function RevStep({ d, patch, go, bk }) {
  const readOnly=[
    ["AIRCRAFT",`N${d.tail}`],
    ["CHECKLIST",d.ok==="yes"?"ALL COMPLETE ✓":`${d.inc.size} item(s) incomplete`],
    ["TIRES",d.tires?.toUpperCase()||"—"],
    ["OXYGEN",d.oxy?.toUpperCase()||"—"],
    ["OIL",d.oil==="yes"?`YES — ${d.qty}`:(d.oil?.toUpperCase()||"—")],
    ["DATE",fmtDate(d.date)],
  ];
  const rowS = { display:"flex", borderBottom:"1px solid rgba(255,255,255,.04)", padding:"10px 16px", alignItems:"center" };
  const lblS = { fontSize:10, color:A, letterSpacing:1.5, width:100, flexShrink:0, fontWeight:600 };
  const editInpS = { flex:1, background:"rgba(255,255,255,.04)", border:`1px solid rgba(${A_RGB},.28)`, color:"#fff", fontSize:14, fontFamily:SANS, fontWeight:500, padding:"6px 10px", borderRadius:6, outline:"none" };
  return (
    <div>
      <div style={qSt}>Review & generate</div>
      <div style={{ border:`2px solid rgba(${A_RGB},.28)`, borderRadius:10, overflow:"hidden", marginBottom:24 }}>
        {readOnly.map(([k,v])=>(
          <div key={k} style={rowS}>
            <span style={lblS}>{k}</span>
            <span style={{ fontSize:14, color:"#fff", fontWeight:500 }}>{v}</span>
          </div>
        ))}
        <div style={rowS}>
          <span style={lblS}>NAME</span>
          <input className="aa-input" value={d.name} onChange={e=>patch({name:e.target.value})} style={editInpS}/>
        </div>
        <div style={rowS}>
          <span style={lblS}>CERT #</span>
          <input className="aa-input" value={d.cert} onChange={e=>patch({cert:e.target.value})} style={editInpS}/>
        </div>
        <div style={{...rowS, borderBottom:"none"}}>
          <span style={lblS}>INITIALS</span>
          <input className="aa-input" value={d.init} onChange={e=>patch({init:e.target.value.toUpperCase().slice(0,4)})} style={editInpS}/>
        </div>
      </div>
      <div style={nvR}>
        <button className="aa-btn" style={bkB} onClick={bk}>← Back</button>
        <button className="aa-btn" style={{ background:A, color:"#0d1018", border:`2px solid ${A}`, padding:"12px 30px", fontSize:15, fontFamily:SANS, fontWeight:700, cursor:"pointer", borderRadius:10 }} onClick={()=>go()}>Generate ✓</button>
      </div>
    </div>
  );
}

// ── Print components ──────────────────────────────────────────
function TopoWatermark() {
  const make=(cx,cy,n,r0,dr,ry0,dry,rot)=>Array.from({length:n},(_,i)=>({cx,cy,rx:r0+i*dr,ry:ry0+i*dry,rot}));
  const rings=[...make(570,440,22,32,29,20,18,-20),...make(105,155,14,26,20,16,13,15),...make(410,630,9,18,16,12,11,3)];
  return (
    <svg style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none" }}>
      <g fill="none" stroke="#0a2035" strokeWidth="0.6">
        {rings.map((r,i)=>(
          <ellipse key={i} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} opacity={Math.max(0.01,0.052-i*0.001)}
            transform={`rotate(${r.rot},${r.cx},${r.cy})`}/>
        ))}
      </g>
    </svg>
  );
}

function FieldCell({ label, value, onChange, mono }) {
  return (
    <div style={{ flex:1 }}>
      <div style={{ fontSize:"5.5pt", fontWeight:700, color:"#666", letterSpacing:1.2, marginBottom:3, textTransform:"uppercase", fontFamily:"Arial,sans-serif" }}>{label}</div>
      <input className="aa-field" value={value} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", border:"1px solid transparent", borderBottom:`1.5px solid ${NAVY}`, fontSize:mono?"10pt":"9.5pt", fontWeight:700, fontFamily:mono?"'Courier New',monospace":"Arial,sans-serif", outline:"none", background:"transparent", padding:"3px 4px", color:"#111", boxSizing:"border-box", letterSpacing:mono?1:0, borderRadius:4 }}/>
    </div>
  );
}

function SvcBox({ label, val, onYes, onNo }) {
  const boxStyle = active => ({ border:`1.5px solid ${NAVY}`, minWidth:32, height:18, textAlign:"center", lineHeight:"18px", fontSize:"7pt", fontWeight:700, fontFamily:"Arial,sans-serif", padding:"0 4px", cursor:"pointer", userSelect:"none", transition:"all .12s", background:active?NAVY:"#fff", color:active?"#fff":NAVY, borderRadius:3, display:"inline-block" });
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
      <span style={{ fontWeight:700, fontSize:"7.5pt", minWidth:96, fontFamily:"Arial,sans-serif" }}>{label}</span>
      <span className="aa-field" onClick={onYes} style={boxStyle(val==="yes")}>YES</span>
      <span className="aa-field" onClick={onNo}  style={boxStyle(val==="no")}>NO</span>
    </div>
  );
}

function SecBlock({ sec, initials, setInit }) {
  return (
    <div style={{ marginBottom:2 }}>
      <div style={{ display:"flex", justifyContent:"space-between", background:"#b5b5b5", padding:"2.5px 5px", fontWeight:700, fontSize:"7pt", fontFamily:"Arial,sans-serif", marginTop:6 }}>
        <span>{sec.title}</span>
        <span style={{ fontWeight:400, fontSize:"6pt" }}>Initial</span>
      </div>
      {sec.items.map(item=>
        item.h ? (
          <div key={item.id} style={{ padding:"2px 6px", fontSize:"7pt", fontStyle:"italic", background:"#ededed", fontFamily:"Arial,sans-serif", borderBottom:"1px solid #d8d8d8", fontWeight:600, color:"#333" }}>
            {item.t}
          </div>
        ) : (
          <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e0e0e0", padding:"1.5px 5px", minHeight:14 }}>
            <span style={{ flex:1, fontSize:"7pt", fontFamily:"Arial,sans-serif", lineHeight:1.2, color:"#111" }}>{item.t}</span>
            <input className="aa-field" value={initials[item.id]??""} onChange={e=>setInit(item.id,e.target.value.toUpperCase().slice(0,4))}
              style={{ width:30, textAlign:"center", border:"1px solid transparent", borderLeft:"1px solid #ccc", fontSize:"7pt", fontWeight:700, fontFamily:"Arial,sans-serif", outline:"none", background:"transparent", padding:0, color:"#111", cursor:"text", borderRadius:3 }}/>
          </div>
        )
      )}
    </div>
  );
}

function PrintOut({ d, done, back }) {
  const docRef = useRef();
  const [busy, setBusy] = useState(false);

  const [eName, setName] = useState(d.name || PILOT);
  const [eCert, setCert] = useState(d.cert || CERT);
  const [eInit, setEInit] = useState(d.init || INIT);
  const [eDate, setDate] = useState(fmtDate(d.date));
  const [eTail, setTail] = useState(d.tail);
  const [tires, setTires] = useState(d.tires);
  const [oxy,   setOxy]   = useState(d.oxy);
  const [oil,   setOil]   = useState(d.oil);
  const [qty,   setQty]   = useState(d.qty);
  const [notes, setNotes] = useState(d.notes || "");

  const [initials, setInitials] = useState(() => {
    const m={};
    ALL_SECS.forEach(sec=>sec.items.forEach(item=>{ if(!item.h) m[item.id]=done(item.id)?(d.init||INIT):""; }));
    return m;
  });
  const setInit=(id,val)=>setInitials(p=>({...p,[id]:val}));

  const downloadPDF = async () => {
    setBusy(true);
    try {
      if (!window.html2canvas) await loadLib("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      if (!window.jspdf)       await loadLib("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

      const doc = docRef.current;

      // 1. Reset zoom and force a synchronous reflow so getBoundingClientRect
      //    returns unscaled dimensions (fixes mobile truncation from zoom offsets)
      const prevZoom = doc.style.zoom;
      doc.style.zoom = "1";
      void doc.offsetWidth;

      // 2. Slightly extra right padding to prevent tail-# box clipping at edge
      const prevPR = doc.style.paddingRight;
      doc.style.paddingRight = "36pt";

      // 3. Swap every input/textarea → a div whose width matches the
      //    post-zoom-reset rendered size, so text never truncates
      const swaps = [];
      doc.querySelectorAll("input, textarea").forEach(el => {
        const rect = el.getBoundingClientRect();
        const cs   = window.getComputedStyle(el);
        const proxy = document.createElement("div");
        proxy.style.cssText   = el.style.cssText;           // copy inline styles
        proxy.style.width     = rect.width  + "px";         // actual rendered width
        proxy.style.minHeight = rect.height + "px";
        proxy.style.display   = el.tagName === "TEXTAREA" ? "block" : "inline-block";
        proxy.style.overflow  = "visible";
        proxy.style.whiteSpace = el.tagName === "TEXTAREA" ? "pre-wrap" : "nowrap";
        proxy.style.lineHeight = cs.lineHeight;
        proxy.style.verticalAlign = "middle";
        proxy.textContent = el.value;
        el.insertAdjacentElement("afterend", proxy);
        el.style.display = "none";
        swaps.push({ el, proxy });
      });

      // 4. Capture at full resolution
      const canvas = await window.html2canvas(doc, {
        scale: 3, useCORS: true, allowTaint: true,
        backgroundColor: "#fff", logging: false,
        windowWidth: 900, scrollX: 0, scrollY: 0,
      });

      // 5. Restore everything
      swaps.forEach(({ el, proxy }) => { el.style.display = ""; proxy.remove(); });
      doc.style.zoom = prevZoom;
      doc.style.paddingRight = prevPR;

      // 6. Build PDF
      const img = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation:"portrait", unit:"pt", format:"letter" });
      const m = 18, pw = 612-m*2, ph = 792-m*2;
      const sc = Math.min(pw/canvas.width, ph/canvas.height);
      pdf.addImage(img,"PNG",(612-canvas.width*sc)/2, m, canvas.width*sc, canvas.height*sc);
      pdf.save(`N${eTail}_Checklist_${eDate.replace(/\//g,"-")}.pdf`);
    } catch(e){ alert("PDF failed — use Print instead."); console.error(e); }
    finally{ setBusy(false); }
  };

  return (
    <div className="print-view">
      <style>{`@media print{.np{display:none!important} @page{size:letter;margin:.4in}} ${GF}`}</style>

      {/* Toolbar */}
      <div className="np print-toolbar" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 18px", background:"#0d1018", borderBottom:`2.5px solid ${A}`, gap:10, flexWrap:"wrap" }}>
        <button className="aa-btn" style={{ background:"transparent", border:"2px solid rgba(255,255,255,.14)", color:"rgba(255,255,255,.55)", padding:"8px 16px", fontFamily:SANS, fontSize:13, cursor:"pointer", borderRadius:8, fontWeight:500 }} onClick={back}>← Back</button>
        <span style={{ color:A, fontFamily:SANS, fontWeight:600, fontSize:12, flex:1, textAlign:"center" }}>N{eTail} · {eDate} — click any field to edit</span>
        <div className="toolbar-btns" style={{ display:"flex", gap:10 }}>
          <button className="aa-btn" style={{ background:"rgba(255,255,255,.07)", color:"rgba(255,255,255,.7)", border:"2px solid rgba(255,255,255,.14)", padding:"8px 16px", fontFamily:SANS, fontSize:13, cursor:"pointer", borderRadius:8, fontWeight:500 }} onClick={()=>window.print()}>🖨 Print</button>
          <button className="aa-btn" style={{ background:busy?`rgba(${A_RGB},.45)`:A, color:"#0d1018", border:`2px solid ${A}`, padding:"8px 18px", fontFamily:SANS, fontSize:13, fontWeight:700, cursor:"pointer", borderRadius:8, minWidth:140 }}
            onClick={downloadPDF} disabled={busy}>{busy?"Generating…":"⬇ Download PDF"}</button>
        </div>
      </div>

      {/* Page preview */}
      <div style={{ background:"#c0c0c0", padding:"28px 16px 44px", minHeight:"100vh" }}>
        <div ref={docRef} className="doc-page" style={{ position:"relative", background:"#ffffff", maxWidth:816, margin:"0 auto", padding:"26pt 30pt 22pt", boxSizing:"border-box", boxShadow:"0 8px 56px rgba(0,0,0,.28)" }}>
          <TopoWatermark/>

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, paddingBottom:10, borderBottom:`2.5px solid ${NAVY}`, gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:"13pt", textAlign:"center", letterSpacing:2, fontFamily:"Arial,sans-serif", marginBottom:3, color:NAVY }}>ADVANCED AIR, LLC</div>
              <div style={{ fontWeight:700, fontSize:"9pt", textAlign:"center", letterSpacing:0.5, fontFamily:"Arial,sans-serif", color:"#333" }}>AIRCRAFT PREFLIGHT / POSTFLIGHT CHECKLIST</div>
              {/* Prominent info fields */}
              <div style={{ display:"flex", gap:16, marginTop:10, padding:"12px 14px 10px", background:"#f6f8fb", border:`1.5px solid ${NAVY}33`, borderRadius:10 }}>
                <FieldCell label="Name"        value={eName} onChange={setName}/>
                <FieldCell label="Date"        value={eDate} onChange={setDate}/>
                <FieldCell label="Cert. #"     value={eCert} onChange={setCert} mono/>
              </div>
            </div>
            {/* Aircraft tail # — cohesive N{tail} with label */}
            <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ fontSize:"5.5pt", fontWeight:700, color:"#666", letterSpacing:1.2, textTransform:"uppercase", fontFamily:"Arial,sans-serif" }}>Aircraft Tail #</div>
              <input className="aa-field" value={`N${eTail}`} onChange={e=>setTail(e.target.value.replace(/^N/i,"").toUpperCase())}
                style={{ fontSize:"20pt", fontWeight:800, fontFamily:"'Courier New',monospace", border:`2.5px solid ${NAVY}`, outline:"none", width:140, textAlign:"center", background:"#f6f8fb", padding:"6px 8px", letterSpacing:2, color:NAVY, borderRadius:10, boxSizing:"border-box" }}/>
            </div>
          </div>

          {/* Two-column checklist */}
          <div style={{ display:"flex" }}>
            <div style={{ flex:1, paddingRight:8, borderRight:"1px solid #aaa" }}>
              {LEFT.map(s=><SecBlock key={s.id} sec={s} initials={initials} setInit={setInit}/>)}
            </div>
            <div style={{ flex:1, paddingLeft:8 }}>
              {RIGHT.map(s=><SecBlock key={s.id} sec={s} initials={initials} setInit={setInit}/>)}
              {/* Notes — fills empty space under cockpit/interior */}
              <div style={{ marginTop:8 }}>
                <div style={{ background:"#b5b5b5", padding:"2.5px 5px", fontWeight:700, fontSize:"7pt", fontFamily:"Arial,sans-serif" }}>
                  NOTES
                </div>
                <div style={{ position:"relative", border:"1px solid #c0c0c0", borderRadius:4, background:"#fff", minHeight:126 }}>
                  {/* Ruled lines — actual DOM elements, captured by html2canvas */}
                  {Array.from({length:7},(_,i)=>(
                    <div key={i} style={{ position:"absolute", left:0, right:0, top:i*18+17, height:1, background:"#d8d8d8", pointerEvents:"none" }}/>
                  ))}
                  <textarea className="aa-field" value={notes} onChange={e=>setNotes(e.target.value)}
                    placeholder="Click to add any pertinent info…"
                    rows={7}
                    style={{ display:"block", width:"100%", border:"none", borderRadius:4, fontSize:"8pt", fontFamily:"Arial,sans-serif", padding:"2px 6px", color:"#111", outline:"none", boxSizing:"border-box", resize:"none", background:"transparent", lineHeight:"18px", position:"relative", zIndex:1 }}/>
                </div>
              </div>
            </div>
          </div>

          {/* Service footer */}
          <div style={{ marginTop:10, borderTop:`2px solid ${NAVY}`, paddingTop:8, display:"flex", flexWrap:"wrap", gap:"8px 22px", alignItems:"center" }}>
            <SvcBox label="Serviced Tires"  val={tires} onYes={()=>setTires(v=>v==="yes"?null:"yes")} onNo={()=>setTires(v=>v==="no"?null:"no")}/>
            <SvcBox label="Serviced Oxygen" val={oxy}   onYes={()=>setOxy(v=>v==="yes"?null:"yes")}   onNo={()=>setOxy(v=>v==="no"?null:"no")}/>
            <SvcBox label="Serviced Oil"    val={oil}   onYes={()=>setOil(v=>v==="yes"?null:"yes")}   onNo={()=>setOil(v=>v==="no"?null:"no")}/>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontWeight:700, fontSize:"7.5pt", minWidth:78, fontFamily:"Arial,sans-serif" }}>BP 2380 Qty</span>
              <input className="aa-field" value={oil==="yes"?qty:""} onChange={e=>setQty(e.target.value)}
                style={{ border:`1.5px solid ${NAVY}`, width:58, height:18, textAlign:"center", fontSize:"7.5pt", fontWeight:700, fontFamily:"'Courier New',monospace", outline:"none", background:"transparent", padding:"0 2px", color:"#111", borderRadius:3 }}/>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginLeft:"auto" }}>
              <span style={{ fontWeight:700, fontSize:"7.5pt", fontFamily:"Arial,sans-serif" }}>Initials</span>
              <input className="aa-field" value={eInit} onChange={e=>setEInit(e.target.value.toUpperCase().slice(0,4))}
                style={{ border:`1.5px solid ${NAVY}`, width:50, height:18, textAlign:"center", fontSize:"8pt", fontWeight:700, fontFamily:"Arial,sans-serif", outline:"none", background:"transparent", padding:"0 2px", color:"#111", borderRadius:3 }}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
