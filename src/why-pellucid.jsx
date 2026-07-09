// Why Pellucid — hero with concentric rings of project thumbnails. Each ring
// rotates around the center as one rigid disc; neighbouring rings spin in
// opposite directions (cw / ccw) and outer rings fade toward the frame walls.
// Pure-CSS animation (see why-pellucid.html); this lays out ring angles + nums.
//
// Images: drop files named card-01.jpg .. card-30.jpg into uploads/why-pellucid/
// and they replace the numbered placeholders automatically.
const { useState: wpUseState, useEffect: wpUseEffect, useRef: wpUseRef } = React;

const WP_RING_DEFS = [
  { rad: 15, count: 6,  dir: "cw",  spin: 58, scale: 0.62, op: 0.90 },
  { rad: 28, count: 10, dir: "ccw", spin: 74, scale: 0.86, op: 0.72 },
  { rad: 42, count: 14, dir: "cw",  spin: 94, scale: 1.12, op: 0.50 },
];

let wpCardNum = 0;
const WP_RINGS = WP_RING_DEFS.map((r) => ({
  ...r,
  cards: Array.from({ length: r.count }, (_, i) => {
    wpCardNum += 1;
    return { th: (360 / r.count) * i, num: String(wpCardNum).padStart(2, "0") };
  }),
}));

function VortexField() {
  return (
    <div className="wp-vortex" aria-hidden="true">
      {WP_RINGS.map((ring, ri) => (
        <div key={ri} className={`wp-vortex-ring ${ring.dir}`} style={{ "--spin": `${ring.spin}s` }}>
          {ring.cards.map((c) => (
            <div key={c.num} className="wp-orb" style={{ "--th": `${c.th}deg`, "--rad": `${ring.rad}vmax` }}>
              <figure className="wp-card" style={{ "--scale": ring.scale, "--op": ring.op }}>
                <span className="wp-card-ph mono">{c.num}</span>
                <img
                  src={`uploads/why-pellucid/card-${c.num}.jpg`}
                  alt=""
                  onError={(e) => { e.currentTarget.style.opacity = 0; }}
                />
              </figure>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function WhyPellucidHero() {
  return (
    <section className="wp-hero">
      <div className="wp-hero-grid" aria-hidden="true" />
      <VortexField />
      <div className="wp-hero-inner">
        <div className="wp-eyebrow mono">
          <span>Pellucid Frames</span>
          <span>№ 001 — Ethos</span>
        </div>
        <h1 className="wp-title">
          <span className="wp-title-line">Why</span>
          <span className="wp-title-line wp-accent">Pellucid</span>
        </h1>
        <div className="wp-sub mono">Clarity as a first principle.</div>
      </div>
    </section>
  );
}

const WP_PRINCIPLES = [
  { name: "Clarity", desc: "Communicate with honesty and purpose." },
  { name: "Craft", desc: "Produce work with cinematic quality and thoughtful design." },
  { name: "Impact", desc: "Create stories that continue creating value long after they are seen." },
];

// Full-bleed image band with scroll parallax. Drop uploads/why-pellucid/parallax-NN.jpg
// to fill it. Movement is driven by one shared rAF in StorySections.
function ParallaxBand({ num, heading }) {
  return (
    <section className="wp-parallax">
      <img
        className="wp-px-img"
        src={`uploads/why-pellucid/parallax-${num}.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      <div className="wp-colgrid" aria-hidden="true" />
      {heading && <h2 className="wp-px-heading">{heading}</h2>}
    </section>
  );
}

function StorySections() {
  const rootRef = wpUseRef(null);

  wpUseEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const imgs = Array.from(root.querySelectorAll(".wp-px-img"));
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let raf;
    const tick = () => {
      const vh = window.innerHeight;
      for (const el of imgs) {
        const r = el.parentElement.getBoundingClientRect();
        // -1 (band well below) .. 1 (band well above) as it crosses the viewport
        const p = ((r.top + r.height / 2) - vh / 2) / vh;
        const shift = clamp(-p * 15, -15, 15);
        el.style.transform = `translate3d(0, ${shift.toFixed(2)}%, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={rootRef}>
      <section className="wp-section wp-statement">
        <div className="wp-colgrid" aria-hidden="true" />
        <div className="wp-section-inner">
          <span className="wp-kicker">Why Pellucid</span>
          <h2 className="wp-statement-h">Stories Shape<br />Everything.</h2>
          <p className="wp-lead">
            Stories influence how we think. How we learn. How we invest. How we build
            businesses. <b>How children imagine the world.</b>
          </p>
        </div>
      </section>

      <ParallaxBand num="01" heading="Clarity. Craft. Impact." />

      <section className="wp-section">
        <div className="wp-colgrid" aria-hidden="true" />
        <div className="wp-section-inner">
          <p className="wp-principles-intro">
            That’s why every project we undertake is guided by three principles:
          </p>
          {WP_PRINCIPLES.map((p, i) => (
            <div className="wp-principle" key={p.name}>
              <h3 className="wp-principle-name">
                <span className="wp-principle-num">0{i + 1}</span>{p.name}
              </h3>
              <p className="wp-principle-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ParallaxBand num="02" heading="Every frame earns its place." />
    </div>
  );
}

function WhyPellucidApp() {
  const [menuOpen, setMenuOpen] = wpUseState(false);
  const [depsLoaded, setDepsLoaded] = wpUseState(false);

  wpUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  wpUseEffect(() => {
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
      <WhyPellucidHero />
      <StorySections />
      <SiteFooter />
    </>
  );
}

const wpRoot = document.getElementById("wp-root");
if (wpRoot) ReactDOM.createRoot(wpRoot).render(<WhyPellucidApp />);
