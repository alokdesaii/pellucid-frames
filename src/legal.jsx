// Reusable legal / policy page renderer. Each policy page defines a
// window.LEGAL_DOC object, then loads this file. Shape:
//   window.LEGAL_DOC = {
//     title: "Whistleblowing Policy",
//     lead: "optional intro line",
//     updated: "optional — e.g. Effective July 2026",
//     sections: [ { h: "Purpose", p: ["…"], list: ["…"], email: "x@y.com" }, … ]
//   }
const { useState: lgUseState, useEffect: lgUseEffect } = React;

function LegalApp() {
  const [menuOpen, setMenuOpen] = lgUseState(false);
  const [depsLoaded, setDepsLoaded] = lgUseState(false);

  lgUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  lgUseEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  if (!depsLoaded) return null;

  const Nav = window.Nav;
  const MenuOverlay = window.MenuOverlay;
  const SiteFooter = window.SiteFooter;
  const doc = window.LEGAL_DOC || { title: "Policy", sections: [] };

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="lg-wrap">
        <header className="lg-head lg-inner">
          <div className="lg-eyebrow mono">
            <span>Pellucid Frames — Legal</span>
            <span>{doc.updated || "Policy"}</span>
          </div>
          <h1 className="lg-title">{doc.title}</h1>
          {doc.lead && <p className="lg-lead">{doc.lead}</p>}
        </header>

        <div className="lg-body lg-inner">
          {(doc.sections || []).map((sec, i) => (
            <section className="lg-section" key={i}>
              <div><h2 className="lg-h">{sec.h}</h2></div>
              <div className="lg-content">
                {(sec.p || []).map((t, j) => <p className="lg-p" key={j}>{t}</p>)}
                {(sec.groups || []).map((g, gi) => (
                  <div className="lg-group" key={gi}>
                    {g.h && <h3 className="lg-subhead">{g.h}</h3>}
                    {(g.p || []).map((t, j) => <p className="lg-p" key={j}>{t}</p>)}
                    {g.email && <a className="lg-email" href={`mailto:${g.email}`}>{g.email}</a>}
                    {g.list && <ul className="lg-list">{g.list.map((x, k) => <li key={k}>{x}</li>)}</ul>}
                  </div>
                ))}
                {sec.list && (
                  <ul className="lg-list">
                    {sec.list.map((x, k) => <li key={k}>{x}</li>)}
                  </ul>
                )}
                {sec.email && <a className="lg-email" href={`mailto:${sec.email}`}>{sec.email}</a>}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

const lgRoot = document.getElementById("lg-root");
if (lgRoot) ReactDOM.createRoot(lgRoot).render(<LegalApp />);
