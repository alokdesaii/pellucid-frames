// Media Kit / Press Centre — pillar-style layout (Enerblock): default hero with
// crosshair, parallax bands, big intro statement, numbered slide-up brands,
// double image grid, enquiries + assets. Reveal + parallax + number-slide, one
// rAF each (scrollscene pattern). Static content; press email drives the CTAs.
const { useState: mkUseState, useEffect: mkUseEffect, useRef: mkUseRef } = React;

const MK_EMAIL = "media@pellucidframes.com";

const MK_BRANDS = [
  { name: "Pellucid Frames", desc: "Original productions and branded storytelling.", href: "/about.html" },
  { name: "CapitalShiftz", desc: "Finance, investing and business media.", href: "/capital-shiftz.html" },
  { name: "Bloomy Toony", desc: "Animated stories for children.", href: "/bloomy-toony.html" },
];

const MK_ASSETS = [
  "Logos", "Brand guidelines", "Executive biographies",
  "Company overview", "High-resolution images", "Press releases",
];

// scroll reveal (ready-gated so it runs after the content mounts)
function useRevealMK(ready) {
  mkUseEffect(() => {
    if (!ready) return;
    const els = Array.from(document.querySelectorAll("[data-mk-reveal]"));
    const reveal = (el) => el.classList.add("in");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      els.forEach(reveal);
      return;
    }
    const vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach((el) => { if (el.getBoundingClientRect().top < vh * 0.92) reveal(el); });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    els.forEach((el) => { if (!el.classList.contains("in")) io.observe(el); });
    const fallback = setTimeout(() => els.forEach(reveal), 2400);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, [ready]);
}

// parallax on every [data-mk-parallax] image, and slide-up on brand numbers
function useMotionMK(ready) {
  mkUseEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const imgs = Array.from(document.querySelectorAll("[data-mk-parallax]"));
    const nums = Array.from(document.querySelectorAll(".mk-brand-num span"));
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let raf;
    const tick = () => {
      const vh = window.innerHeight;
      for (const img of imgs) {
        const r = img.parentElement.getBoundingClientRect();
        const p = ((r.top + r.height / 2) - vh / 2) / vh;
        img.style.transform = `translate3d(0, ${clamp(-p * 12, -12, 12).toFixed(2)}%, 0)`;
      }
      for (const el of nums) {
        const top = el.parentElement.getBoundingClientRect().top;
        const p = clamp((vh - top) / (vh * 0.5), 0, 1);
        el.style.transform = `translateY(${(-100 * (1 - p)).toFixed(2)}%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);
}

function MediaKitBody() {
  useRevealMK(true);
  useMotionMK(true);
  const requestHref = `mailto:${MK_EMAIL}?subject=${encodeURIComponent("Brand asset request")}`;

  return (
    <main className="mk-wrap">
      {/* Hero */}
      <header className="mk-hero mk-inner">
        <div className="mk-hero-eyebrow mono">
          <span>Pellucid Frames</span>
          <span>№ 005 — Press</span>
        </div>
        <h1 className="mk-title">Media Kit /<br />Press Centre</h1>
        <div className="mk-hero-bottom">
          <div className="mk-cross" aria-hidden="true">
            <span className="mk-cross-x">X 000</span>
            <span className="mk-cross-y">Y 005</span>
          </div>
          <p className="mk-hero-desc">
            The studio, the brands and the assets — everything press needs to tell
            our story <b>accurately.</b>
          </p>
        </div>
      </header>

      {/* Parallax band */}
      <section className="mk-band">
        <img src="uploads/media-kit/mk-hero.jpg" alt="" data-mk-parallax loading="lazy" />
      </section>

      {/* About — intro statement + image */}
      <section className="mk-section mk-inner">
        <span className="mk-pretitle mk-reveal" data-mk-reveal>About</span>
        <div className="mk-intro-grid">
          <p className="mk-statement mk-reveal" data-mk-reveal>
            Pellucid Frames is a <b>Hong Kong-based creative media studio</b> — original
            films, documentaries, branded content, children's entertainment and business
            media, all made to <span className="mk-accent">inform, inspire and endure.</span>
          </p>
          <div className="mk-intro-img mk-reveal" data-mk-reveal>
            <img src="uploads/media-kit/mk-intro.jpg" alt="Pellucid Frames studio" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Brands — numbered slide-up list */}
      <section className="mk-section mk-inner">
        <div className="mk-sec-head">
          <span className="mk-pretitle mk-reveal" data-mk-reveal>Brands</span>
          <h2 className="mk-h mk-reveal" data-mk-reveal>Three brands, one studio.</h2>
        </div>
        <div className="mk-brands">
          {MK_BRANDS.map((b, i) => (
            <a className="mk-brand" href={b.href} key={b.name}>
              <span className="mk-brand-num"><span>{String(i + 1).padStart(2, "0")}</span></span>
              <span className="mk-brand-name">{b.name}</span>
              <span className="mk-brand-desc">{b.desc}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Double image */}
      <section className="mk-section mk-inner">
        <div className="mk-dbl">
          <div className="mk-dbl-img mk-reveal" data-mk-reveal>
            <img src="uploads/media-kit/mk-dbl-1.jpg" alt="" data-mk-parallax loading="lazy" />
          </div>
          <div className="mk-dbl-img mk-reveal" data-mk-reveal>
            <img src="uploads/media-kit/mk-dbl-2.jpg" alt="" data-mk-parallax loading="lazy" />
          </div>
        </div>
      </section>

      {/* Media enquiries */}
      <section className="mk-section mk-inner">
        <div className="mk-two">
          <div>
            <span className="mk-pretitle mk-reveal" data-mk-reveal>Media Enquiries</span>
            <h2 className="mk-h mk-reveal" data-mk-reveal>Talk to us.</h2>
          </div>
          <div className="mk-reveal" data-mk-reveal>
            <p className="mk-p">For interviews, collaborations and media enquiries:</p>
            <a className="mk-email" href={`mailto:${MK_EMAIL}`}>{MK_EMAIL}</a>
          </div>
        </div>
      </section>

      {/* Brand assets */}
      <section className="mk-section mk-inner">
        <div className="mk-two">
          <div>
            <span className="mk-pretitle mk-reveal" data-mk-reveal>Brand Assets</span>
            <h2 className="mk-h mk-reveal" data-mk-reveal>Available on request.</h2>
          </div>
          <div className="mk-reveal" data-mk-reveal>
            <div className="mk-assets">
              {MK_ASSETS.map((a) => <span className="mk-chip" key={a}>{a}</span>)}
            </div>
            <a className="mk-btn" href={requestHref}>
              Request brand assets <span className="mk-btn-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Closing image band */}
      <section className="mk-band">
        <img src="uploads/media-kit/mk-next.jpg" alt="" data-mk-parallax loading="lazy" />
      </section>
    </main>
  );
}

function MediaKitApp() {
  const [menuOpen, setMenuOpen] = mkUseState(false);
  const [depsLoaded, setDepsLoaded] = mkUseState(false);

  mkUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  mkUseEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  if (!depsLoaded) return null;

  const Nav = window.Nav;
  const MenuOverlay = window.MenuOverlay;
  const SiteFooter = window.SiteFooter;

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <MediaKitBody />
      <SiteFooter />
    </>
  );
}

const mkRoot = document.getElementById("mk-root");
if (mkRoot) ReactDOM.createRoot(mkRoot).render(<MediaKitApp />);
