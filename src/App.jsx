import { useState, useEffect } from "react";
import Hub from "./hub/Hub.jsx";
import ChecklistApp from "./checklist/ChecklistApp.jsx";
import BookmarkletPage from "./bookmarklet/BookmarkletPage.jsx";
import ZuluPage from "./zulu/ZuluPage.jsx";
import InstallPage from "./install/InstallPage.jsx";
import { SANS } from "./theme.js";

export default function App() {
  const [view, setView] = useState("hub");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  if (view === "checklist") {
    return (
      <>
        <style>{`@media print { .hub-back-chip { display:none !important; } }`}</style>
        <ChecklistApp />
        <HubBackChip onClick={() => setView("hub")}/>
      </>
    );
  }
  if (view === "bookmarklet") return <BookmarkletPage onBack={() => setView("hub")}/>;
  if (view === "zulu")        return <ZuluPage        onBack={() => setView("hub")}/>;
  if (view === "install")     return <InstallPage     onBack={() => setView("hub")}/>;
  return <Hub onSelect={setView}/>;
}

function HubBackChip({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="hub-back-chip"
      style={{
        position:"fixed", top:12, left:12, zIndex:50,
        background:"rgba(13,16,24,.78)",
        backdropFilter:"blur(6px)",
        WebkitBackdropFilter:"blur(6px)",
        border:"1px solid rgba(255,255,255,.14)",
        color:"rgba(255,255,255,.65)",
        padding:"6px 12px",
        fontFamily:SANS,
        fontSize:11,
        fontWeight:600,
        letterSpacing:2,
        textTransform:"uppercase",
        cursor:"pointer",
        borderRadius:999,
      }}
    >
      ← Hub
    </button>
  );
}
