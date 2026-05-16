import { useState, useRef, useEffect } from "react";
import { AIRCRAFT, DEFAULT_AIRCRAFT_ID, getAircraft } from "./aircraft/index.js";

const PILOT     = "Daniel Ramirez";
const CERT      = "4948003";
const INIT      = "DR";
const A         = "#5eb9ff";
const A_RGB     = "94,185,255";
const NAVY      = "#1a3a6e";
const SANS      = "'Outfit',system-ui,sans-serif";
const STORAGE_KEY = "aa.aircraft";

const GF = `
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
html, body {
  overflow-x: hidden;
  max-width: 100vw;
  overscroll-behavior: none;
}
* { box-sizing: border-box; }
input[type="date"] {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}
input[type="date"]::-webkit-date-and-time-value { text-align: left; }
.app-fixed {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
}
.print-view {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}
@media (min-width: 640px)  { .wiz-wrap { max-width: 560px !important; } }
@media (min-width: 1024px) { .wiz-wrap { max-width: 620px !important; } }
@media (max-width: 900px)  { .doc-page { zoom: 0.88; } }
@media (max-width: 700px)  { .doc-page { zoom: 0.70; } }
@media (max-width: 520px)  { .doc-page { zoom: 0.52; } }
@media (max-width: 400px)  { .doc-page { zoom: 0.44; } .doc-outer { padding-left: 8px !important; padding-right: 8px !important; } }
@media (max-width: 480px) {
  .print-toolbar { flex-direction: column; align-items: stretch !important; }
  .print-toolbar span { text-align: center; }
  .toolbar-btns { justify-content: stretch; }
  .toolbar-btns button { flex: 1; }
}
@media print {
  .aa-input, .aa-field, .aa-textarea { border-color: transparent !important; box-shadow: none !important; }
  .sec-block { break-inside: avoid; page-break-inside: avoid; }
}
`;

const fmtDate = s => { if (!s) return ""; const p=s.split("-"); return `${p[1]}/${p[2]}/${p[0]}`; };

const emptyState = () => ({
  tail:"",
  ok:null,
  inc:new Set(),
  services:{},
  oilType:"",
  qty:"",
  date:new Date().toISOString().split("T")[0],
  name:PILOT,
  cert:CERT,
  init:INIT,
  notes:"",
});

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
export default function ChecklistApp() {
  const [view, setView] = useState("home");
  const [step, setStep] = useState(0);
  const [d, setD]       = useState(emptyState());
  const [aircraftId, setAircraftId] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_AIRCRAFT_ID; }
    catch { return DEFAULT_AIRCRAFT_ID; }
  });
  const aircraft = getAircraft(aircraftId);
  const setAircraft = id => {
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
    setAircraftId(id);
  };

  const flow = (x, a) => {
    const f = ["aircraft","tail","check"];
    if (x.ok === "no") f.push("inc");
    a.serviceBlock.questions.forEach(q => f.push(q.id));
    if (x.services?.oil === "yes") { f.push("oilType","qty"); }
    f.push("date","rev");
    return f;
  };

  const steps = flow(d, aircraft);
  const cur = steps[step];
  const pct = Math.round(((step+1)/steps.length)*100);

  const patch = u => setD(p => ({...p, ...u}));

  const advance = (newD = d) => {
    const f = flow(newD, aircraft);
    if (step+1 < f.length) setStep(step+1);
    else setView("print");
  };

  const go = (u={}) => {
    const nd = {...d, ...u};
    setD(nd);
    advance(nd);
  };

  const goService = (qid, v) => {
    const nd = {...d, services:{...d.services,[qid]:v}};
    setD(nd);
    advance(nd);
  };

  const bk = () => setStep(s => Math.max(0, s-1));
  const tog = id => setD(p => { const s=new Set(p.inc); s.has(id)?s.delete(id):s.add(id); return {...p,inc:s}; });
  const done = id => d.ok==="yes" || !d.inc.has(id);

  const curService = aircraft.serviceBlock.questions.find(q => q.id === cur);

  if (view==="print")    return <PrintOut d={d} done={done} aircraft={aircraft} back={()=>setView("wizard")}/>;
  if (view==="review")   return <ReviewChecklist aircraft={aircraft} onBack={()=>setView("home")} onContinue={()=>{ setStep(0); setD(emptyState()); setView("wizard"); }}/>;
  if (view==="viewPick") return <ViewPickAircraft current={aircraftId} setAircraft={setAircraft} go={()=>setView("review")} home={()=>setView("home")}/>;
  if (view==="home")     return <Home aircraft={aircraft} start={()=>{ setStep(0); setD(emptyState()); setView("wizard"); }} view={()=>setView("viewPick")}/>;

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
        {cur==="aircraft" && <AircraftStep current={aircraftId} setAircraft={setAircraft} go={()=>advance(d)} home={()=>setView("home")}/>}
        {cur==="tail"     && <TailStep aircraft={aircraft} d={d} go={go} bk={bk}/>}
        {cur==="check"    && <CheckStep go={go} bk={bk}/>}
        {cur==="inc"      && <IncStep aircraft={aircraft} d={d} tog={tog} go={go} bk={bk}/>}
        {curService       && <BoolStep q={curService.label} go={v=>goService(curService.id, v)} bk={bk}/>}
        {cur==="oilType"  && <OilTypeStep aircraft={aircraft} d={d} patch={patch} go={()=>advance(d)} bk={bk}/>}
        {cur==="qty"      && <QtyStep d={d} aircraft={aircraft} patch={patch} go={()=>advance(d)} bk={bk}/>}
        {cur==="date"     && <DateStep d={d} patch={patch} go={()=>advance(d)} bk={bk}/>}
        {cur==="rev"      && <RevStep d={d} aircraft={aircraft} patch={patch} go={()=>advance(d)} bk={bk}/>}
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────
function Home({ aircraft, start, view }) {
  return (
    <div className="app-fixed" style={{ background:"#0d1018", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <style>{GF}</style>
      <div style={{ textAlign:"center" }}>
        <AirLogo/>
        <div style={{ fontFamily:SANS, fontWeight:400, fontSize:12, letterSpacing:3.5, color:"rgba(255,255,255,.45)", marginTop:28, marginBottom:18 }}>AIRCRAFT PREFLIGHT / POSTFLIGHT CHECKLIST</div>
        <div style={{ fontFamily:SANS, fontWeight:600, fontSize:12, letterSpacing:1.5, color:A, marginBottom:42 }}>
          Last used: {aircraft.name}
        </div>
        <div style={{ display:"inline-flex", flexDirection:"column", gap:14, alignItems:"stretch" }}>
          <button className="aa-btn" style={{ background:A, color:"#0d1018", border:`2px solid ${A}`, padding:"17px 56px", fontFamily:SANS, fontSize:15, fontWeight:700, letterSpacing:0.5, cursor:"pointer", borderRadius:10 }} onClick={start}>
            Generate Checklist
          </button>
          <button className="aa-btn" style={{ background:"transparent", color:A, border:`2px solid rgba(${A_RGB},.45)`, padding:"17px 56px", fontFamily:SANS, fontSize:15, fontWeight:700, letterSpacing:0.5, cursor:"pointer", borderRadius:10 }} onClick={view}>
            View Checklist
          </button>
        </div>
      </div>
    </div>
  );
}

function AirLogo() {
  return (
    <img src="/logo.png" alt="Advanced Air" style={{ display:"block", margin:"0 auto", width:220, height:"auto", filter:"brightness(0) invert(1)" }}/>
  );
}

// ── View Pick Aircraft (standalone aircraft picker for View Checklist) ───
function ViewPickAircraft({ current, setAircraft, go, home }) {
  return (
    <div className="app-fixed" style={{ background:"#0d1018", padding:"28px 20px", fontFamily:SANS, overflowY:"auto" }}>
      <style>{GF}</style>
      <div className="wiz-wrap" style={{ maxWidth:480, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:30 }}>
          <span style={{ fontFamily:SANS, fontWeight:700, fontSize:13, color:A, letterSpacing:2 }}>ADVANCED AIR</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.35)", fontWeight:500 }}>View checklist</span>
        </div>
        <AircraftStep current={current} setAircraft={setAircraft} go={go} home={home}/>
      </div>
    </div>
  );
}

// ── View Checklist (read-only walkaround reference) ───────────
function ReviewChecklist({ aircraft, onBack, onContinue }) {
  const sections = aircraft.sections;
  const totalItems = sections.reduce((n, sec) => n + sec.items.filter(i => !i.h).length, 0);
  const [checked, setChecked] = useState(() => new Set());
  const toggle = id => setChecked(p => { const s=new Set(p); s.has(id)?s.delete(id):s.add(id); return s; });
  const pct = totalItems > 0 ? Math.round((checked.size / totalItems) * 100) : 0;

  return (
    <div className="app-fixed" style={{ background:"#0d1018", padding:"28px 20px 20px", fontFamily:SANS, overflowY:"auto", display:"flex", flexDirection:"column" }}>
      <style>{GF}</style>
      <div className="wiz-wrap" style={{ maxWidth:480, margin:"0 auto", width:"100%", display:"flex", flexDirection:"column", flex:1, minHeight:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <span style={{ fontFamily:SANS, fontWeight:700, fontSize:13, color:A, letterSpacing:2 }}>ADVANCED AIR · {aircraft.shortName}</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.35)", fontWeight:500 }}>{checked.size} of {totalItems} checked</span>
        </div>
        <div style={{ height:3, background:"rgba(255,255,255,.08)", borderRadius:2, marginBottom:18 }}>
          <div style={{ height:"100%", width:`${pct}%`, background:A, borderRadius:2, transition:"width .35s" }}/>
        </div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginBottom:14 }}>Tap items as you walk the aircraft — nothing is saved</div>
        <div style={{ flex:1, minHeight:0, overflowY:"auto", border:"2px solid rgba(94,185,255,.28)", borderRadius:10, marginBottom:16 }}>
          {sections.map(sec=>(
            <div key={sec.id}>
              <div style={{ background:"rgba(94,185,255,.10)", padding:"7px 14px", fontSize:10, color:A, letterSpacing:2, fontWeight:700, borderBottom:"1px solid rgba(94,185,255,.18)", position:"sticky", top:0 }}>
                {sec.title}
              </div>
              {sec.items.map(item=>{
                if (item.h) return (
                  <div key={item.id} style={{ padding:"6px 14px", fontSize:11, fontStyle:"italic", color:"rgba(255,255,255,.45)", background:"rgba(255,255,255,.02)", borderBottom:"1px solid rgba(255,255,255,.04)", letterSpacing:0.5, fontWeight:600 }}>
                    {item.t}
                  </div>
                );
                const isChk = checked.has(item.id);
                return (
                  <div key={item.id}
                    style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"16px 14px", borderBottom:"1px solid rgba(255,255,255,.04)", cursor:"pointer", background:isChk?"rgba(74,222,128,.06)":"transparent" }}
                    onClick={()=>toggle(item.id)}>
                    <span style={{ color:isChk?"#4ade80":"rgba(255,255,255,.32)", fontWeight:700, fontSize:16, width:18, flexShrink:0, lineHeight:1.2 }}>{isChk?"✓":"○"}</span>
                    <span style={{ fontSize:13, color:isChk?"rgba(255,255,255,.40)":"rgba(255,255,255,.85)", fontWeight:400, lineHeight:1.4, textDecoration:isChk?"line-through":"none" }}>{item.t}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={nvR}>
          <button className="aa-btn" style={bkB} onClick={onBack}>← Back</button>
          <button className="aa-btn" style={nxB} onClick={onContinue}>Continue to Generate →</button>
        </div>
      </div>
    </div>
  );
}

// ── Wizard steps ──────────────────────────────────────────────
function AircraftStep({ current, setAircraft, go, home }) {
  return (
    <div>
      <div style={qSt}>Which aircraft?</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        {AIRCRAFT.map(a => {
          const active = a.id === current;
          return (
            <button key={a.id} className="aa-tile"
              style={{ background:active?A:"rgba(255,255,255,.05)", border:`2px solid ${active?A:"rgba(94,185,255,.28)"}`, color:active?"#0d1018":"#dedede", padding:"22px 12px", fontSize:14, fontFamily:SANS, fontWeight:active?700:500, cursor:"pointer", borderRadius:10, letterSpacing:0.5, lineHeight:1.3, textAlign:"center" }}
              onClick={() => { setAircraft(a.id); go(); }}>
              {a.name}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop:22 }}>
        <button className="aa-btn" style={bkB} onClick={home}>← Home</button>
      </div>
    </div>
  );
}

function TailStep({ aircraft, d, go, bk }) {
  const presets = aircraft.tailPresets || [];
  const [custom, setCustom] = useState(presets.includes(d.tail) ? "" : d.tail);
  const hasCustom = custom.trim().length > 0;
  return (
    <div>
      <div style={qSt}>What is the tail number?</div>
      {presets.length > 0 && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
            {presets.map(t => {
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
        </>
      )}
      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
        <input className="aa-input" value={custom} onChange={e=>setCustom(e.target.value.toUpperCase())}
          placeholder={presets.length > 0 ? "Custom tail #" : "Aircraft tail #"} style={{...inpS, marginBottom:0, flex:1}} autoFocus={presets.length===0}/>
        {hasCustom && (
          <button className="aa-btn" style={{...nxB, marginTop:1, whiteSpace:"nowrap"}} onClick={()=>go({tail:custom.trim()})}>Use →</button>
        )}
      </div>
      <div style={{ marginTop:22 }}>
        <button className="aa-btn" style={bkB} onClick={bk}>← Back</button>
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

function IncStep({ aircraft, d, tog, go, bk }) {
  return (
    <div>
      <div style={qSt}>Which items were NOT completed?</div>
      <div style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginBottom:14 }}>Tap to flag as incomplete — those show blank on the form</div>
      <div style={{ maxHeight:290, overflowY:"auto", border:"2px solid rgba(94,185,255,.28)", borderRadius:10, marginBottom:16 }}>
        {aircraft.sections.map(sec=>(
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

function OilTypeStep({ aircraft, d, patch, go, bk }) {
  const oil = aircraft.serviceBlock.oil;
  const hasOptions = Array.isArray(oil.options) && oil.options.length > 0;
  const [custom, setCustom] = useState(() => {
    if (!d.oilType) return "";
    if (hasOptions && oil.options.includes(d.oilType)) return "";
    return d.oilType;
  });
  const hasCustom = custom.trim().length > 0;

  useEffect(() => {
    if (!d.oilType && oil.default) patch({ oilType: oil.default });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hasOptions) {
    return (
      <div>
        <div style={qSt}>What type of oil was used?</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          {oil.options.map(opt => {
            const active = d.oilType === opt && !hasCustom;
            return (
              <button key={opt} className="aa-tile"
                style={{ background:active?A:"rgba(255,255,255,.05)", border:`2px solid ${active?A:"rgba(94,185,255,.28)"}`, color:active?"#0d1018":"#dedede", padding:"15px 8px", fontSize:14, fontFamily:SANS, fontWeight:active?700:500, cursor:"pointer", borderRadius:8 }}
                onClick={() => { setCustom(""); patch({oilType:opt}); go(); }}>
                {opt}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,.28)", marginBottom:10, fontWeight:600, letterSpacing:2 }}>OR ENTER ANOTHER</div>
        <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
          <input className="aa-input" value={custom} onChange={e=>setCustom(e.target.value)}
            placeholder="Custom oil type" style={{...inpS, marginBottom:0, flex:1}}/>
          {hasCustom && (
            <button className="aa-btn" style={{...nxB, marginTop:1, whiteSpace:"nowrap"}} onClick={()=>{ patch({oilType:custom.trim()}); go(); }}>Use →</button>
          )}
        </div>
        <div style={{ marginTop:22 }}>
          <button className="aa-btn" style={bkB} onClick={bk}>← Back</button>
        </div>
      </div>
    );
  }

  const ok = (d.oilType || "").trim().length > 0;
  return (
    <div>
      <div style={qSt}>What type of oil was used?</div>
      <input className="aa-input" value={d.oilType} onChange={e=>patch({oilType:e.target.value})} placeholder={oil.default || "e.g. BP 2380"} autoFocus style={inpS}/>
      <div style={nvR}>
        <button className="aa-btn" style={bkB} onClick={bk}>← Back</button>
        <button className="aa-btn" style={{...nxB,opacity:ok?1:0.4}} onClick={()=>ok&&go()}>Next →</button>
      </div>
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

function RevStep({ d, aircraft, patch, go, bk }) {
  const services = d.services || {};
  const oilExtra = services.oil === "yes" ? ` — ${d.oilType||"?"} / ${d.qty||"?"}` : "";
  const readOnly = [
    ["AIRCRAFT", aircraft.name],
    ["TAIL", `N${d.tail}`],
    ["CHECKLIST", d.ok==="yes" ? "ALL COMPLETE ✓" : `${d.inc.size} item(s) incomplete`],
    ...aircraft.serviceBlock.questions.map(q => {
      const v = services[q.id];
      const display = (v ? v.toUpperCase() : "—") + (q.id === "oil" ? oilExtra : "");
      return [q.footerLabel.toUpperCase(), display];
    }),
    ["DATE", fmtDate(d.date)],
  ];
  const hasName = aircraft.headerFields.some(f => f.id === "name");
  const hasCert = aircraft.headerFields.some(f => f.id === "cert");

  const rowS = { display:"flex", borderBottom:"1px solid rgba(255,255,255,.04)", padding:"10px 16px", alignItems:"center" };
  const lblS = { fontSize:10, color:A, letterSpacing:1.5, width:130, flexShrink:0, fontWeight:600 };
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
        {hasName && (
          <div style={rowS}>
            <span style={lblS}>NAME</span>
            <input className="aa-input" value={d.name} onChange={e=>patch({name:e.target.value})} style={editInpS}/>
          </div>
        )}
        {hasCert && (
          <div style={rowS}>
            <span style={lblS}>CERT #</span>
            <input className="aa-input" value={d.cert} onChange={e=>patch({cert:e.target.value})} style={editInpS}/>
          </div>
        )}
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
    <svg viewBox="0 0 816 1056" preserveAspectRatio="xMidYMid slice" style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none" }}>
      <g fill="none" stroke="#1a3a6e" strokeWidth="1">
        {rings.map((r,i)=>(
          <ellipse key={i} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} opacity={Math.max(0.06,0.22-i*0.004)}
            transform={`rotate(${r.rot},${r.cx},${r.cy})`}/>
        ))}
      </g>
    </svg>
  );
}

function FieldCell({ label, value, onChange, mono }) {
  return (
    <div style={{ flex:"1 1 140px", minWidth:120 }}>
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
  if (sec.lr) {
    return (
      <div className="sec-block" style={{ marginBottom:2 }}>
        <div style={{ background:"#b5b5b5", padding:"2.5px 5px", fontWeight:700, fontSize:"7pt", fontFamily:"Arial,sans-serif", marginTop:6, display:"flex", alignItems:"center" }}>
          <div style={{ width:34, textAlign:"center", fontSize:"6.5pt", borderRight:"1px solid #999" }}>L</div>
          <div style={{ width:34, textAlign:"center", fontSize:"6.5pt", borderRight:"1px solid #999" }}>R</div>
          <div style={{ flex:1, paddingLeft:6 }}>{sec.title}</div>
        </div>
        {sec.items.map(item =>
          item.h ? (
            <div key={item.id} style={{ padding:"2px 6px", fontSize:"7pt", fontStyle:"italic", background:"#ededed", fontFamily:"Arial,sans-serif", borderBottom:"1px solid #d8d8d8", fontWeight:600, color:"#333" }}>
              {item.t}
            </div>
          ) : (
            <div key={item.id} style={{ display:"flex", alignItems:"center", borderBottom:"1px solid #e0e0e0", padding:"1.5px 0", minHeight:14 }}>
              <input className="aa-field" value={initials[item.id+"_L"]??""} onChange={e=>setInit(item.id+"_L",e.target.value.toUpperCase().slice(0,4))}
                style={{ width:34, textAlign:"center", border:"1px solid transparent", borderRight:"1px solid #ccc", fontSize:"7pt", fontWeight:700, fontFamily:"Arial,sans-serif", outline:"none", background:"transparent", padding:0, color:"#111", borderRadius:3 }}/>
              <input className="aa-field" value={initials[item.id+"_R"]??""} onChange={e=>setInit(item.id+"_R",e.target.value.toUpperCase().slice(0,4))}
                style={{ width:34, textAlign:"center", border:"1px solid transparent", borderRight:"1px solid #ccc", fontSize:"7pt", fontWeight:700, fontFamily:"Arial,sans-serif", outline:"none", background:"transparent", padding:0, color:"#111", borderRadius:3 }}/>
              <span style={{ flex:1, fontSize:"7pt", fontFamily:"Arial,sans-serif", lineHeight:1.2, color:"#111", paddingLeft:6 }}>{item.t}</span>
            </div>
          )
        )}
      </div>
    );
  }
  return (
    <div className="sec-block" style={{ marginBottom:2 }}>
      <div style={{ display:"flex", justifyContent:"space-between", background:"#b5b5b5", padding:"2.5px 5px", fontWeight:700, fontSize:"7pt", fontFamily:"Arial,sans-serif", marginTop:6 }}>
        <span>{sec.title}</span>
        <span style={{ fontWeight:400, fontSize:"6pt" }}>Initial</span>
      </div>
      {sec.items.map(item =>
        item.h ? (
          <div key={item.id} style={{ padding:"2px 6px", fontSize:"7pt", fontStyle:"italic", background:"#ededed", fontFamily:"Arial,sans-serif", borderBottom:"1px solid #d8d8d8", fontWeight:600, color:"#333" }}>
            {item.t}
          </div>
        ) : (
          <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e0e0e0", padding:"1.5px 5px", minHeight:14 }}>
            <span style={{ flex:1, fontSize:"7pt", fontFamily:"Arial,sans-serif", lineHeight:1.2, color:"#111" }}>{item.t}</span>
            <input className="aa-field" value={initials[item.id]??""} onChange={e=>setInit(item.id,e.target.value.toUpperCase().slice(0,4))}
              style={{ width:36, textAlign:"center", border:"1px solid transparent", borderLeft:"1px solid #ccc", fontSize:"7pt", fontWeight:700, fontFamily:"Arial,sans-serif", outline:"none", background:"transparent", padding:0, color:"#111", cursor:"text", borderRadius:3 }}/>
          </div>
        )
      )}
    </div>
  );
}

// Build pages: pack each column independently. When the right column runs out
// before the left, the trailing pages have an empty right column — those get
// a full-length NOTES box filler (handled in PrintOut).
// Section weight ≈ items + 2 (section header overhead). PAGE_BUDGET ≈ Letter content fit.
function buildPages(aircraft) {
  const PAGE_BUDGET  = 70;
  const HEADER_UNITS = 14;

  const getSec = id => aircraft.sections.find(s => s.id === id);
  const weight = sec => (sec?.items?.length ?? 0) + 2;

  const packIntoCols = (ids) => {
    const cols = [[]];
    let used = HEADER_UNITS; // first page has header overhead on both columns
    for (const id of ids) {
      const sec = getSec(id);
      if (!sec) continue;
      const w = weight(sec);
      if (cols[cols.length-1].length > 0 && used + w > PAGE_BUDGET) {
        cols.push([]);
        used = 0;
      }
      cols[cols.length-1].push(id);
      used += w;
    }
    return cols;
  };

  const leftCols  = packIntoCols(aircraft.layout.left);
  const rightCols = packIntoCols(aircraft.layout.right);
  const N = Math.max(1, leftCols.length, rightCols.length);
  while (leftCols.length  < N) leftCols.push([]);
  while (rightCols.length < N) rightCols.push([]);

  return Array.from({length: N}, (_, i) => ({
    isFirst:  i === 0,
    isLast:   i === N - 1,
    leftIds:  leftCols[i]  || [],
    rightIds: rightCols[i] || [],
  }));
}

function PrintOut({ d, done, aircraft, back }) {
  const pageRefs = useRef([]);
  const [busy, setBusy] = useState(false);

  // Field values (header) — prefill from wizard data for fields the wizard collected
  const [fieldValues, setFieldValues] = useState(() => {
    const m = {};
    aircraft.headerFields.forEach(f => {
      if (f.id === "tail")      m[f.id] = d.tail || "";
      else if (f.id === "date") m[f.id] = fmtDate(d.date);
      else if (f.id === "name") m[f.id] = d.name || PILOT;
      else if (f.id === "cert") m[f.id] = d.cert || CERT;
      else                       m[f.id] = "";
    });
    return m;
  });
  const setFieldValue = (id, v) => setFieldValues(p => ({...p, [id]: v}));

  // Service block + oil type + qty + initials editable on the form
  const [services, setServices] = useState(() => ({...(d.services||{})}));
  const setService = (qid, v) => setServices(p => ({...p, [qid]: p[qid] === v ? null : v}));
  const [oilType, setOilType] = useState(d.oilType || "");
  const [qty,     setQty]     = useState(d.qty || "");
  const [eInit,   setEInit]   = useState(d.init || INIT);
  const [notes,   setNotes]   = useState(d.notes || "");

  // Per-section initials
  const [initials, setInitials] = useState(() => {
    const m = {};
    aircraft.sections.forEach(sec => {
      sec.items.forEach(item => {
        if (item.h) return;
        const v = done(item.id) ? (d.init||INIT) : "";
        if (sec.lr) {
          m[item.id + "_L"] = v;
          m[item.id + "_R"] = v;
        } else {
          m[item.id] = v;
        }
      });
    });
    return m;
  });
  const setInit = (id, val) => setInitials(p => ({...p, [id]: val}));

  const pages = buildPages(aircraft);
  const getSec = id => aircraft.sections.find(s => s.id === id);
  const prominentField = aircraft.headerFields.find(f => f.prominent);
  const primaryFields   = aircraft.headerFields.filter(f => !f.prominent && !f.secondary);
  const secondaryFields = aircraft.headerFields.filter(f => !f.prominent &&  f.secondary);
  const oilCfg = aircraft.serviceBlock.oil || {};

  const downloadPDF = async () => {
    setBusy(true);
    try {
      if (!window.html2canvas) await loadLib("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      if (!window.jspdf)       await loadLib("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation:"portrait", unit:"pt", format:"letter" });
      const m = 18;
      const pageW = 612 - m*2;
      const pageH = 792 - m*2;

      for (let i = 0; i < pageRefs.current.length; i++) {
        const doc = pageRefs.current[i];
        if (!doc) continue;

        const prevZoom = doc.style.zoom;
        doc.style.zoom = "1";
        void doc.offsetWidth;
        const prevPR = doc.style.paddingRight;
        doc.style.paddingRight = "36pt";

        const swaps = [];
        doc.querySelectorAll("input, textarea").forEach(el => {
          const rect = el.getBoundingClientRect();
          const cs   = window.getComputedStyle(el);
          const proxy = document.createElement("div");
          proxy.style.cssText   = el.style.cssText;
          const inlineW = el.style.width;
          proxy.style.width     = (inlineW && inlineW.endsWith("%")) ? inlineW : rect.width + "px";
          proxy.style.minHeight = rect.height + "px";
          proxy.style.display   = "block";
          proxy.style.overflow  = "visible";
          proxy.style.whiteSpace = el.tagName === "TEXTAREA" ? "pre-wrap" : "nowrap";
          proxy.style.lineHeight = cs.lineHeight;
          proxy.style.verticalAlign = "middle";
          proxy.style.borderBottomWidth = cs.borderBottomWidth;
          proxy.style.borderBottomStyle = cs.borderBottomStyle;
          proxy.style.borderBottomColor = cs.borderBottomColor;
          proxy.textContent = el.value;
          el.insertAdjacentElement("afterend", proxy);
          el.style.display = "none";
          swaps.push({ el, proxy });
        });

        const canvas = await window.html2canvas(doc, {
          scale: 3, useCORS: true, allowTaint: true,
          backgroundColor: "#fff", logging: false,
          windowWidth: 900, scrollX: 0, scrollY: 0,
        });

        swaps.forEach(({ el, proxy }) => { el.style.display = ""; proxy.remove(); });
        doc.style.zoom = prevZoom;
        doc.style.paddingRight = prevPR;

        const img = canvas.toDataURL("image/png");
        const sc = Math.min(pageW / canvas.width, pageH / canvas.height);
        const w = canvas.width * sc;
        const h = canvas.height * sc;
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "PNG", (612 - w) / 2, m, w, h);
      }

      const eTailRaw = fieldValues.tail || d.tail || "";
      const eDate    = fieldValues.date || fmtDate(d.date);
      pdf.save(`N${eTailRaw}_${aircraft.shortName}_Checklist_${eDate.replace(/\//g,"-")}.pdf`);
    } catch(e) { alert("PDF failed — use Print instead."); console.error(e); }
    finally   { setBusy(false); }
  };

  const headerTitleText = `N${fieldValues.tail || d.tail || ""}`;

  return (
    <div className="print-view">
      <style>{`@media print{.np{display:none!important} .doc-page{margin:0 !important; box-shadow:none !important; page-break-after:always; break-after:page;} .doc-page:last-of-type{page-break-after:auto; break-after:auto;} @page{size:letter;margin:.4in}} ${GF}`}</style>

      {/* Toolbar */}
      <div className="np print-toolbar" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 18px", background:"#0d1018", borderBottom:`2.5px solid ${A}`, gap:10, flexWrap:"wrap" }}>
        <button className="aa-btn" style={{ background:"transparent", border:"2px solid rgba(255,255,255,.14)", color:"rgba(255,255,255,.55)", padding:"8px 16px", fontFamily:SANS, fontSize:13, cursor:"pointer", borderRadius:8, fontWeight:500 }} onClick={back}>← Back</button>
        <span style={{ color:A, fontFamily:SANS, fontWeight:600, fontSize:12, flex:1, textAlign:"center" }}>{aircraft.shortName} · {headerTitleText} · {fieldValues.date || fmtDate(d.date)} — click any field to edit</span>
        <div className="toolbar-btns" style={{ display:"flex", gap:10 }}>
          <button className="aa-btn" style={{ background:"rgba(255,255,255,.07)", color:"rgba(255,255,255,.7)", border:"2px solid rgba(255,255,255,.14)", padding:"8px 16px", fontFamily:SANS, fontSize:13, cursor:"pointer", borderRadius:8, fontWeight:500 }} onClick={()=>window.print()}>🖨 Print</button>
          <button className="aa-btn" style={{ background:busy?`rgba(${A_RGB},.45)`:A, color:"#0d1018", border:`2px solid ${A}`, padding:"8px 18px", fontFamily:SANS, fontSize:13, fontWeight:700, cursor:"pointer", borderRadius:8, minWidth:140 }}
            onClick={downloadPDF} disabled={busy}>{busy?"Generating…":"⬇ Download PDF"}</button>
        </div>
      </div>

      {/* Pages */}
      <div className="doc-outer" style={{ background:"#c0c0c0", padding:"28px 16px 44px", minHeight:"100vh" }}>
        {pages.map((p, pageIdx) => {
          const leftSecs  = p.leftIds .map(getSec).filter(Boolean);
          const rightSecs = p.rightIds.map(getSec).filter(Boolean);
          return (
            <div key={pageIdx}
              ref={el => pageRefs.current[pageIdx] = el}
              className="doc-page"
              style={{ position:"relative", background:"#ffffff", width:816, maxWidth:"100%", minHeight:1056, margin: pageIdx === 0 ? "0 auto" : "20px auto 0", padding:"26pt 30pt 22pt", boxSizing:"border-box", boxShadow:"0 8px 56px rgba(0,0,0,.28)" }}>
              <TopoWatermark/>

              {/* Header — only on first page */}
              {p.isFirst && (
                <div style={{ marginBottom:10, paddingBottom:10, borderBottom:`2.5px solid ${NAVY}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800, fontSize:"13pt", textAlign:"center", letterSpacing:2, fontFamily:"Arial,sans-serif", marginBottom:3, color:NAVY }}>{aircraft.title}</div>
                      {aircraft.subtitle && <div style={{ fontWeight:700, fontSize:"9pt", textAlign:"center", letterSpacing:0.5, fontFamily:"Arial,sans-serif", color:"#333" }}>{aircraft.subtitle}</div>}
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"10px 16px", marginTop:10, padding:"12px 14px 10px", background:"#f6f8fb", border:`1.5px solid ${NAVY}33`, borderRadius:10 }}>
                        {primaryFields.map(f => (
                          <FieldCell key={f.id} label={f.label} value={fieldValues[f.id]||""} onChange={v=>setFieldValue(f.id, v)} mono={f.mono}/>
                        ))}
                      </div>
                    </div>
                    {prominentField && (
                      <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                        <div style={{ fontSize:"5.5pt", fontWeight:700, color:"#666", letterSpacing:1.2, textTransform:"uppercase", fontFamily:"Arial,sans-serif" }}>{prominentField.label}</div>
                        <input className="aa-field"
                          value={`${prominentField.prefix||""}${fieldValues[prominentField.id]||""}`}
                          onChange={e=>{
                            let v = e.target.value;
                            if (prominentField.prefix) v = v.replace(new RegExp(`^${prominentField.prefix}`,"i"),"");
                            setFieldValue(prominentField.id, v.toUpperCase());
                          }}
                          style={{ fontSize:"20pt", fontWeight:800, fontFamily:"'Courier New',monospace", border:`2.5px solid ${NAVY}`, outline:"none", width:140, textAlign:"center", background:"#f6f8fb", padding:"6px 8px", letterSpacing:2, color:NAVY, borderRadius:10, boxSizing:"border-box" }}/>
                      </div>
                    )}
                  </div>
                  {/* Secondary header row */}
                  {secondaryFields.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"10px 16px", marginTop:8, padding:"8px 14px 6px", background:"#fafbfd", border:`1px solid ${NAVY}1f`, borderRadius:8 }}>
                      {secondaryFields.map(f => (
                        <FieldCell key={f.id} label={f.label} value={fieldValues[f.id]||""} onChange={v=>setFieldValue(f.id, v)} mono={f.mono}/>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Two-column checklist */}
              <div style={{ display:"flex", alignItems:"stretch" }}>
                <div style={{ flex:1, paddingRight:8, borderRight:"1px solid #aaa" }}>
                  {leftSecs.map(s=><SecBlock key={s.id} sec={s} initials={initials} setInit={setInit}/>)}
                </div>
                <div style={{ flex:1, paddingLeft:8, display:"flex", flexDirection:"column" }}>
                  {rightSecs.map(s=><SecBlock key={s.id} sec={s} initials={initials} setInit={setInit}/>)}
                  {/* Notes — on last page; full-column if right is empty, otherwise small box at bottom */}
                  {p.isLast && (() => {
                    const fullCol = rightSecs.length === 0;
                    const noteLines = fullCol ? 40 : 7;
                    return (
                      <div style={{ marginTop:8, ...(fullCol ? { flex:1, display:"flex", flexDirection:"column" } : {}) }}>
                        <div style={{ background:"#b5b5b5", padding:"2.5px 5px", fontWeight:700, fontSize:"7pt", fontFamily:"Arial,sans-serif" }}>
                          NOTES
                        </div>
                        <div style={{ position:"relative", border:"1px solid #c0c0c0", borderRadius:4, background:"#fff", ...(fullCol ? { flex:1, minHeight:760 } : { minHeight:126 }) }}>
                          {Array.from({length:noteLines},(_,i)=>(
                            <div key={i} style={{ position:"absolute", left:0, right:0, top:i*18+17, height:1, background:"#d8d8d8", pointerEvents:"none" }}/>
                          ))}
                          <textarea className="aa-field" value={notes} onChange={e=>setNotes(e.target.value)}
                            placeholder="Click to add any pertinent info…"
                            rows={noteLines}
                            style={{ display:"block", width:"100%", ...(fullCol ? { height:"100%" } : {}), border:"none", borderRadius:4, fontSize:"8pt", fontFamily:"Arial,sans-serif", padding:"2px 6px", color:"#111", outline:"none", boxSizing:"border-box", resize:"none", background:"transparent", lineHeight:"18px", position:"relative", zIndex:1 }}/>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Service footer — only on last page */}
              {p.isLast && (
                <div style={{ marginTop:10, borderTop:`2px solid ${NAVY}`, paddingTop:8, display:"flex", flexWrap:"wrap", gap:"8px 22px", alignItems:"center" }}>
                  {aircraft.serviceBlock.questions.map(q => (
                    <SvcBox key={q.id} label={q.footerLabel} val={services[q.id]} onYes={()=>setService(q.id,"yes")} onNo={()=>setService(q.id,"no")}/>
                  ))}
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontWeight:700, fontSize:"7.5pt", fontFamily:"Arial,sans-serif" }}>Oil Type</span>
                    <input className="aa-field" value={oilType} onChange={e=>setOilType(e.target.value)}
                      style={{ border:`1.5px solid ${NAVY}`, width:96, height:18, textAlign:"center", fontSize:"7.5pt", fontWeight:700, fontFamily:"'Courier New',monospace", outline:"none", background:"transparent", padding:"0 4px", color:"#111", borderRadius:3 }}/>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontWeight:700, fontSize:"7.5pt", fontFamily:"Arial,sans-serif" }}>{oilCfg.qtyLabel || "Qty"}</span>
                    <input className="aa-field" value={qty} onChange={e=>setQty(e.target.value)}
                      style={{ border:`1.5px solid ${NAVY}`, width:58, height:18, textAlign:"center", fontSize:"7.5pt", fontWeight:700, fontFamily:"'Courier New',monospace", outline:"none", background:"transparent", padding:"0 2px", color:"#111", borderRadius:3 }}/>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginLeft:"auto" }}>
                    <span style={{ fontWeight:700, fontSize:"7.5pt", fontFamily:"Arial,sans-serif" }}>Initials</span>
                    <input className="aa-field" value={eInit} onChange={e=>setEInit(e.target.value.toUpperCase().slice(0,4))}
                      style={{ border:`1.5px solid ${NAVY}`, width:50, height:18, textAlign:"center", fontSize:"8pt", fontWeight:700, fontFamily:"Arial,sans-serif", outline:"none", background:"transparent", padding:"0 2px", color:"#111", borderRadius:3 }}/>
                  </div>
                </div>
              )}

              {/* Warning footer — on last page only */}
              {p.isLast && aircraft.warning && (
                <div style={{ marginTop:12, padding:"6px 10px", fontSize:"6.5pt", fontStyle:"italic", color:"#555", background:"#f8f6f0", border:"1px solid #e0d8c0", borderRadius:4, fontFamily:"Arial,sans-serif", lineHeight:1.45 }}>
                  WARNING: {aircraft.warning}
                </div>
              )}

              {/* Page number */}
              {pages.length > 1 && (
                <div style={{ marginTop:10, textAlign:"center", fontSize:"7pt", color:"#666", fontFamily:"Arial,sans-serif", fontWeight:600, letterSpacing:1 }}>
                  Page {pageIdx + 1} of {pages.length}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
