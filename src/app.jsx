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
        className="nav-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className="nav-menu-text">
          <span className="nav-menu-swap">
            <span className="nav-menu-sp">MENU</span>
            <span className="nav-menu-sp nav-menu-sp2" aria-hidden="true">MENU</span>
          </span>
        </span>
        <span className="nav-menu-icon" aria-hidden="true">
          <span className="nav-menu-line" />
          <span className="nav-menu-line" />
        </span>
      </button>
    </header>);
}

function MenuOverlay({ isOpen, onClose }) {
  return (
    <div className={"menu-overlay " + (isOpen ? "open" : "")}>

      {/* Close button */}
      <button className="menu-close-btn" onClick={onClose} aria-label="Close menu">
        <span className="mc-text">
          <span className="mc-swap">
            <span className="mc-sp">CLOSE</span>
            <span className="mc-sp mc-sp2" aria-hidden="true">CLOSE</span>
          </span>
        </span>
        <span className="mc-icon" aria-hidden="true"><span className="mc-x" /></span>
      </button>

      <div className="menu-panels">

        {/* Left: Primary nav */}
        <div className="menu-panel menu-panel-left">
          <div>
            <div className="menu-section-label stagger-1">Navigate</div>
            <nav className="menu-primary-links">
              <a href="/#top"     className="stagger-2" onClick={onClose}>Home</a>
              <a href="/about.html"   className="stagger-3" onClick={onClose}>About Pellucid</a>
              <a href="/why-pellucid.html" className="stagger-4" onClick={onClose}>Why Pellucid</a>
              <a href="/our-philosophy.html" className="stagger-5" onClick={onClose}>Our Philosophy</a>
              <a href="/our-work.html" className="stagger-6" onClick={onClose}>Our Work</a>
            </nav>
          </div>

          <div className="menu-divider" />

          <div>
            <div className="menu-section-label stagger-9">Our YouTube Channels</div>
            <nav className="menu-primary-links" style={{marginTop:"12px"}}>
              <a href="/capital-shiftz.html" className="stagger-10" onClick={onClose}>Capital Shiftz</a>
              <a href="/bloomy-toony.html" className="stagger-10" onClick={onClose}>Bloomy Toony</a>
            </nav>
          </div>
        </div>

        {/* Center: Services + Media Kit */}
        <div className="menu-panel menu-panel-center">
          <div>
            <a href="/what-we-create.html" className="menu-section-label menu-section-link stagger-1" onClick={onClose}>What We Create</a>
            <div className="menu-secondary-links" style={{marginTop:"14px"}}>
              <a href="/what-we-create.html#original-productions" className="stagger-2" onClick={onClose}>Original Productions</a>
              <a href="/what-we-create.html#brand-commercial" className="stagger-3" onClick={onClose}>Brand & Commercial Content</a>
              <a href="/what-we-create.html#corporate-storytelling" className="stagger-4" onClick={onClose}>Corporate Storytelling</a>
              <a href="/what-we-create.html#digital-media" className="stagger-5" onClick={onClose}>Digital Media</a>
              <a href="/what-we-create.html#live-experiences" className="stagger-6" onClick={onClose}>Live Experiences</a>
              <a href="/what-we-create.html#creative-strategy" className="stagger-7" onClick={onClose}>Creative Strategy</a>
            </div>
          </div>

          <div className="menu-divider" />

          <div>
            <a href="/media-kit.html" className="menu-section-label menu-section-link stagger-8" onClick={onClose}>Media Kit / Press Centre</a>
            <div className="menu-secondary-links" style={{marginTop:"14px"}}>
              <a href="/media-kit.html" className="stagger-9"  onClick={onClose}>Brands Overview</a>
              <a href="/#passage" className="sub-link stagger-10" onClick={onClose}>Pellucid Frames</a>
              <a href="/capital-shiftz.html" className="sub-link stagger-10" onClick={onClose}>Capital Shiftz</a>
              <a href="/bloomy-toony.html"        className="sub-link stagger-10" onClick={onClose}>Bloomy Toony</a>
            </div>
          </div>
        </div>

        {/* Right: Volt accent panel */}
        <div className="menu-panel menu-panel-right">
          <div className="menu-right-top">
            <div className="menu-right-eyebrow">Ready to tell your story?</div>
            <a href="/contact.html" className="menu-right-cta" onClick={onClose}>Get in touch →</a>
          </div>

          <div className="menu-right-bottom">
            <div className="menu-right-legal-title">Legal & Corporate Policies</div>
            <div className="menu-right-legal-links">
              <a href="/privacy-policy.html" onClick={onClose}>Privacy Policy</a>
              <a href="/disclaimer.html" onClick={onClose}>Disclaimer</a>
              <a href="/terms-conditions.html" onClick={onClose}>Terms & Conditions</a>
              <a href="/copyright-notice.html" onClick={onClose}>Copyright Notice</a>
              <a href="/csr-policy.html" onClick={onClose}>CSR Policy</a>
              <a href="/ip-policy.html" onClick={onClose}>Intellectual Property</a>
              <a href="/accessibility-statement.html" onClick={onClose}>Accessibility Statement</a>
              <a href="/editorial-standards.html" onClick={onClose}>Editorial Standards</a>
              <a href="/cookie-policy.html" onClick={onClose}>Cookie Policy</a>
              <a href="/environmental-policy.html" onClick={onClose}>Environmental Policy</a>
              <a href="/modern-slavery-statement.html" onClick={onClose}>Modern Slavery</a>
              <a href="/supplier-code.html" onClick={onClose}>Supplier Code</a>
              <a href="/whistleblowing-policy.html" onClick={onClose}>Whistleblowing</a>
              <a href="/ai-usage-policy.html" onClick={onClose}>AI Usage Policy</a>
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