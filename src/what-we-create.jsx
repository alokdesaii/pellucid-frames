// What We Create — six creative disciplines in the sharp grid/line language
// from the Contact page. Numbered rows, hairline dividers, bordered image
// frames; ids match the mega-menu items so links can deep-anchor here.
const { useState: wcUseState, useEffect: wcUseEffect } = React;

const WC_DISCIPLINES = [
  {
    id: "original-productions",
    title: "Original Productions",
    desc: "Original films, documentaries and cinematic storytelling.",
    img: "uploads/what-we-create/create-01.jpg",
  },
  {
    id: "brand-commercial",
    title: "Brand & Commercial Content",
    desc: "Brand campaigns, advertising films and visual marketing.",
    img: "uploads/what-we-create/create-02.jpg",
  },
  {
    id: "corporate-storytelling",
    title: "Corporate Storytelling",
    desc: "Executive interviews, corporate documentaries, annual reports and thought leadership.",
    img: "uploads/what-we-create/create-03.jpg",
  },
  {
    id: "digital-media",
    title: "Digital Media",
    desc: "YouTube, podcasts, social-first content and creator collaborations.",
    img: "uploads/what-we-create/create-04.jpg",
  },
  {
    id: "live-experiences",
    title: "Live Experiences",
    desc: "Event productions, creator showcases and audience experiences.",
    img: "uploads/what-we-create/create-05.jpg",
  },
  {
    id: "creative-strategy",
    title: "Creative Strategy",
    desc: "Concept development, scripting, creative direction and long-term content planning.",
    img: "uploads/what-we-create/create-06.jpg",
  },
];

function WhatWeCreateApp() {
  const [menuOpen, setMenuOpen] = wcUseState(false);
  const [depsLoaded, setDepsLoaded] = wcUseState(false);

  wcUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  wcUseEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  // Deep-anchor fix. Two cases both need a manual scroll:
  //  1. On load — the browser's jump to #section fires before React mounts the
  //     content (Babel compiles async), so it lands at the top.
  //  2. Same-page links (e.g. the footer, which lives on this page) only change
  //     the hash without reloading, and the native jump is unreliable here.
  // Handle both by scrolling on mount and on every hashchange.
  //
  // The panels are position:sticky, so offsetTop AND getBoundingClientRect both
  // report a panel's *stuck* position, which shifts with the current scroll —
  // scrolling to that from the footer landed on the wrong panel. offsetHeight is
  // immune to sticky, so we derive the panel's true resting Y from the stack's
  // document top plus the heights of the panels before it.
  wcUseEffect(() => {
    if (!depsLoaded) return;
    const naturalTop = (el) => {
      const panels = Array.from(document.querySelectorAll(".wc-panel"));
      const i = panels.indexOf(el);
      if (i < 0) return null;
      let y = 0;
      for (let n = el.offsetParent; n; n = n.offsetParent) y += n.offsetTop; // stack doc top
      for (let k = 0; k < i; k++) y += panels[k].offsetHeight;               // panels above
      return y;
    };
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        const y = el && naturalTop(el);
        if (y != null) window.scrollTo(0, y);
      });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [depsLoaded]);

  if (!depsLoaded) return null;

  const Nav = window.Nav;
  const MenuOverlay = window.MenuOverlay;
  const SiteFooter = window.SiteFooter;

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="wc-wrap">
        <header className="wc-head">
          <div className="wc-eyebrow mono">
            <span>Pellucid Frames</span>
            <span>№ 004 — Services</span>
          </div>
          <h1 className="wc-title">What We Create</h1>
          <p className="wc-lead">
            We produce content across multiple creative disciplines while maintaining
            one uncompromising standard — <b>quality.</b>
          </p>
        </header>

        <section className="wc-stack">
          {WC_DISCIPLINES.map((d, i) => (
            <article className="wc-panel" id={d.id} style={{ "--i": i }} key={d.id}>
              <div className="wc-col wc-col--num">
                <span className="wc-num">{String(i + 1).padStart(2, "0")}<i>/</i></span>
              </div>
              <div className="wc-col wc-col--img">
                <img className="wc-panel-img" src={d.img} alt={d.title} loading="lazy" />
              </div>
              <div className="wc-col wc-col--text">
                <h2 className="wc-ptitle">{d.title}</h2>
                <p className="wc-pdesc">{d.desc}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const wcRoot = document.getElementById("wc-root");
if (wcRoot) ReactDOM.createRoot(wcRoot).render(<WhatWeCreateApp />);
