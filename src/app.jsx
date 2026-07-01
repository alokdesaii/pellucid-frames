// Shell: nav, ghost-text hero, footer, scroll nav. Mounts the app.
const { useState, useEffect } = React;

function Nav({ menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={"nav " + (scrolled || menuOpen ? "nav-solid" : "")}>
      <a href="/#top" className="logo" onClick={() => setMenuOpen(false)}>
        <img src="assets/logo-pellucid-white.svg" className="logo-mark" alt="Pellucid Frames" style={{ width: "auto", height: "52px" }} />
      </a>
      
      <button
        className={"nav-menu-btn " + (menuOpen ? "menu-active" : "")}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <div className="menu-burger">
          <span className="burger-line line-1" />
          <span className="burger-line line-2" />
        </div>
        <span className="menu-btn-text mono">MENU</span>
      </button>
    </header>);
}

function MenuOverlay({ isOpen, onClose }) {
  return (
    <div className={"menu-overlay " + (isOpen ? "open" : "")}>

      {/* Close button */}
      <button className="menu-close-btn" onClick={onClose} aria-label="Close menu">
        <span className="menu-close-icon"><span /><span /></span>
        <span className="mono" style={{fontSize:"11px", letterSpacing:".08em"}}>CLOSE</span>
      </button>

      <div className="menu-panels">

        {/* Left: Primary nav */}
        <div className="menu-panel menu-panel-left">
          <div>
            <div className="menu-section-label stagger-1">Navigate</div>
            <nav className="menu-primary-links">
              <a href="/#top"     className="stagger-2" onClick={onClose}>Home</a>
              <a href="/about.html"   className="stagger-3" onClick={onClose}>About Pellucid</a>
              <a href="/#passage" className="stagger-4" onClick={onClose}>Why Pellucid</a>
              <a href="/#passage" className="stagger-5" onClick={onClose}>Who We Work With</a>
              <a href="/#passage" className="stagger-6" onClick={onClose}>Our Work</a>
              <a href="/#passage" className="stagger-7" onClick={onClose}>Looking Ahead</a>
              <a href="/#contact" className="stagger-8" onClick={onClose}>Contact</a>
            </nav>
          </div>

          <div className="menu-divider" />

          <div>
            <div className="menu-section-label stagger-9">Our YouTube Channels</div>
            <div className="menu-secondary-links" style={{marginTop:"12px"}}>
              <a href="#" className="stagger-10" onClick={onClose}>CapitalShiftz</a>
              <a href="#" className="stagger-10" onClick={onClose}>Bloomy Toony</a>
            </div>
          </div>
        </div>

        {/* Center: Services + Media Kit */}
        <div className="menu-panel menu-panel-center">
          <div>
            <div className="menu-section-label stagger-1">What We Create</div>
            <div className="menu-secondary-links" style={{marginTop:"14px"}}>
              <a href="/#passage" className="stagger-2" onClick={onClose}>Original Productions</a>
              <a href="/#passage" className="stagger-3" onClick={onClose}>Brand & Commercial Content</a>
              <a href="/#passage" className="stagger-4" onClick={onClose}>Corporate Storytelling</a>
              <a href="/#passage" className="stagger-5" onClick={onClose}>Digital Media</a>
              <a href="/#passage" className="stagger-6" onClick={onClose}>Live Experiences</a>
              <a href="/#passage" className="stagger-7" onClick={onClose}>Creative Strategy</a>
            </div>
          </div>

          <div className="menu-divider" />

          <div>
            <div className="menu-section-label stagger-8">Media Kit / Press Centre</div>
            <div className="menu-secondary-links" style={{marginTop:"14px"}}>
              <a href="/#passage" className="stagger-9"  onClick={onClose}>Brands Overview</a>
              <a href="/#passage" className="sub-link stagger-10" onClick={onClose}>Pellucid Frames</a>
              <a href="#"        className="sub-link stagger-10" onClick={onClose}>CapitalShiftz</a>
              <a href="#"        className="sub-link stagger-10" onClick={onClose}>Bloomy Toony</a>
            </div>
          </div>
        </div>

        {/* Right: Volt accent panel */}
        <div className="menu-panel menu-panel-right">
          <div className="menu-right-top">
            <div className="menu-right-eyebrow">Ready to tell your story?</div>
            <a href="/#contact" className="menu-right-cta" onClick={onClose}>Get in touch →</a>
          </div>

          <div className="menu-right-bottom">
            <div className="menu-right-legal-title">Legal & Corporate Policies</div>
            <div className="menu-right-legal-links">
              <a href="#" onClick={onClose}>Privacy Policy</a>
              <a href="#" onClick={onClose}>Disclaimer</a>
              <a href="#" onClick={onClose}>Terms & Conditions</a>
              <a href="#" onClick={onClose}>Copyright Notice</a>
              <a href="#" onClick={onClose}>CSR Policy</a>
              <a href="#" onClick={onClose}>Intellectual Property</a>
              <a href="#" onClick={onClose}>Accessibility Statement</a>
              <a href="#" onClick={onClose}>Editorial Standards</a>
              <a href="#" onClick={onClose}>Cookie Policy</a>
              <a href="#" onClick={onClose}>Environmental Policy</a>
              <a href="#" onClick={onClose}>Modern Slavery</a>
              <a href="#" onClick={onClose}>Supplier Code</a>
              <a href="#" onClick={onClose}>Whistleblowing</a>
              <a href="#" onClick={onClose}>AI Usage Policy</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ScrollNav() {
  const items = [
    { id: "top", label: "HERO" },
    { id: "intro", label: "INTRO" },
    { id: "passage", label: "WORK" }
  ];

  const [active, setActive] = useState("top");
  useEffect(() => {
    const obs = items.map((it) => {
      const el = document.getElementById(it.id);
      if (!el) return null;
      const io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(it.id); },
        { rootMargin: "-45% 0px -45% 0px" }
      );
      io.observe(el);
      return io;
    });
    return () => obs.forEach((io) => io && io.disconnect());
  }, []);
  return (
    <div className="scroll-nav">
      {items.map((it) =>
        <a key={it.id} href={"#" + it.id} className={"sn-item " + (active === it.id ? "sn-on" : "")}>
          <span className="sn-dot" /><span className="sn-label">{it.label}</span>
        </a>
      )}
    </div>);
}

function App() {
  const [introDone, setIntroDone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  return (
    <>
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      <div className="grain" aria-hidden="true" />
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <ScrollScene />
        <Manifesto />
        <OrbitPassage />
        <ClosingCTA />
        <SiteFooter />
      </main>
    </>);
}

// Expose shared chrome so other pages (e.g. about.html) can reuse the nav/menu.
Object.assign(window, { Nav, MenuOverlay });

// Only mount the homepage when its root is present; other pages load this file
// solely to reuse Nav/MenuOverlay.
const rootEl = document.getElementById("root");
if (rootEl) ReactDOM.createRoot(rootEl).render(<App />);