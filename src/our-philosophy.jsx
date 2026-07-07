// Our Philosophy — a companion to Why Pellucid. Text-first statement page that
// reuses the shared `wp-` style system (see our-philosophy.html) minus the
// vortex hero, which stays unique to Why Pellucid.
const { useState: opUseState, useEffect: opUseEffect, useRef: opUseRef } = React;

// Hero: a spotlight (radial mask) wanders left↔right over a background image,
// revealing it only where it falls; the title spans the full width at the base.
function OurPhilosophyHero() {
  const heroRef = opUseRef(null);
  const textRef = opUseRef(null);
  const damageRef = opUseRef(null);

  // Old-film damage: paint procedural scratches, dust, exposure flicker, a
  // gentle vertical weave and the occasional hair/burn onto a full-size canvas
  // each frame. Screen-blended, so bright marks read over the dark hero.
  opUseEffect(() => {
    const cvs = damageRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let W, H;
    const resize = () => { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; };
    resize();

    const rnd = (a, b) => a + Math.random() * (b - a);
    // a few long-lived vertical scratches that jitter and flicker
    let scratches = [];
    const seedScratches = () => {
      scratches = Array.from({ length: 3 }, () => ({
        x: Math.random() * W, w: rnd(0.6, 2.2), a: rnd(0.1, 0.4), life: (rnd(20, 90)) | 0,
      }));
    };
    seedScratches();

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // exposure flicker — a faint full-frame lift that varies each frame
      ctx.fillStyle = `rgba(255,255,255,${rnd(0, 0.06)})`;
      ctx.fillRect(0, 0, W, H);

      // vertical weave (unstable projector gate)
      ctx.save();
      ctx.translate(0, rnd(-1.5, 1.5));

      for (const s of scratches) {
        if (s.life-- <= 0) { s.x = Math.random() * W; s.a = rnd(0.1, 0.4); s.w = rnd(0.6, 2.2); s.life = (rnd(20, 90)) | 0; }
        s.x += rnd(-0.6, 0.6);
        if (Math.random() < 0.85) { // flicker in and out
          ctx.fillStyle = `rgba(255,255,255,${s.a})`;
          ctx.fillRect(s.x, 0, s.w, H);
        }
      }

      // dust & specks — appear and vanish frame to frame
      const specks = (rnd(6, 26)) | 0;
      for (let i = 0; i < specks; i++) {
        const bright = Math.random() < 0.7;
        ctx.fillStyle = bright ? `rgba(255,255,255,${rnd(0.2, 0.6)})` : `rgba(0,0,0,${rnd(0.3, 0.7)})`;
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, rnd(0.5, 2.2), 0, 6.283);
        ctx.fill();
      }

      // occasional hair / fiber
      if (Math.random() < 0.03) {
        ctx.strokeStyle = `rgba(255,255,255,${rnd(0.15, 0.35)})`;
        ctx.lineWidth = rnd(0.6, 1.4);
        ctx.beginPath();
        let x = Math.random() * W, y = rnd(0, H * 0.4);
        ctx.moveTo(x, y);
        for (let k = 0; k < 6; k++) { x += rnd(-14, 14); y += rnd(10, 40); ctx.lineTo(x, y); }
        ctx.stroke();
      }

      // rare burn / blotch
      if (Math.random() < 0.02) {
        const x = Math.random() * W, y = Math.random() * H, r = rnd(20, 80);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,240,210,${rnd(0.1, 0.25)})`);
        g.addColorStop(1, "rgba(255,240,210,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
      }

      ctx.restore();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { draw(); return; }
    let raf, frame = 0;
    const tick = () => {
      if (frame++ % 2 === 0) draw(); // ~24-30fps, filmic cadence
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // Fit the viewBox to the glyphs' real bounds so the SVG scales uniformly to
  // full width — edge-to-edge, no distortion. Wait for the font to avoid
  // measuring a fallback face.
  opUseEffect(() => {
    const fit = () => {
      const t = textRef.current;
      if (!t) return;
      const b = t.getBBox();
      t.ownerSVGElement.setAttribute("viewBox", `${b.x} ${b.y} ${b.width} ${b.height}`);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    else fit();
  }, []);

  opUseEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--sx", "50%");
      el.style.setProperty("--sy", "42%");
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = (now - start) / 1000;
      // two incommensurate sines → a to-and-fro sweep that never quite repeats
      const x = 50 + 38 * Math.sin(t * 0.62) + 10 * Math.sin(t * 1.7 + 1.3);
      const y = 40 + 12 * Math.sin(t * 0.98 + 0.7);
      el.style.setProperty("--sx", x.toFixed(2) + "%");
      el.style.setProperty("--sy", y.toFixed(2) + "%");
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="op-hero" ref={heroRef}>
      <video
        className="op-hero-img"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260520_111942_8fc50f9e-4dfd-45c1-81bb-d93342a23d87.mp4"
        autoPlay
        muted
        loop
        playsInline
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      <div className="op-hero-light" aria-hidden="true" />
      <div className="op-hero-fade" aria-hidden="true" />
      <canvas className="op-damage" ref={damageRef} aria-hidden="true" />
      <div className="op-eyebrow mono">
        <span>Pellucid Frames</span>
        <span>№ 002 — Philosophy</span>
      </div>
      <h1 className="op-title">
        <svg viewBox="0 0 1000 150" width="100%" role="img" aria-label="Our Philosophy">
          <text ref={textRef} x="0" y="120"><tspan style={{ fill: "var(--volt)" }}>Our </tspan>Philosophy</text>
        </svg>
      </h1>
    </section>
  );
}

const OP_TENETS = [
  {
    title: "A story is never just a story.",
    body: [
      "Every piece we make moves someone, somewhere — how they see the market, how they see the world, how a child pictures kindness or curiosity for the first time. We start from that belief, and we build everything else around it.",
      "That's why we treat each project as a chance to earn trust, not just attention.",
    ],
  },
  {
    title: "We build for trust, not just reach.",
    body: [
      "A hook should promise exactly what the story delivers. A claim should stand on real expertise, especially when it touches something as consequential as someone's finances. A story should hold attention because it deserves to, not because a format is designed to trap it.",
      "These aren't rules we follow reluctantly — they're what make our work worth someone's time, and worth coming back to.",
    ],
  },
  {
    title: "We value what's essential.",
    body: [
      "Great storytelling is often found in what's left out. We look for the cut that sharpens a scene, the line that earns its place, the fact that's been checked twice. This holds true at every length and for every audience, from a ninety-second brand film to a long-form documentary to an eleven-minute story for a five-year-old.",
    ],
  },
  {
    title: "We design for a real audience.",
    body: [
      "Every brand we build speaks to someone specific. CapitalShiftz is made for people who want a genuine understanding of markets. Bloomy Toony is made for a particular stage of childhood, with all the imagination that comes with it. Knowing exactly who a story is for is what lets us make something that actually resonates.",
    ],
  },
  {
    title: "Our standard compounds over time.",
    body: [
      "We're building something that holds up well past the day it's published — a reputation people can rely on, across finance, family entertainment and brand storytelling alike. That takes patience and care, and we think it's worth it every time.",
    ],
  },
];

// Principles as full-bleed sharp panels: number | title | copy, split by solid
// dividers; each sticks and the next overlaps it on scroll (pure CSS sticky).
function PhilosophySections() {
  return (
    <section className="op-body-wrap">
      <div className="op-head">
        <div className="op-ledger-head mono">
          <span>Our Philosophy</span>
          <b>№ 002 — Ethos</b>
        </div>
      </div>
      <div className="op-stack">
        {OP_TENETS.map((t, i) => (
          <article className="op-panel" style={{ "--i": i }} key={i}>
            <div className="op-col op-col--num">
              <span className="op-num">{String(i + 1).padStart(2, "0")}<i>/</i></span>
            </div>
            <div className="op-col op-col--title">
              <h2 className="op-ptitle">{t.title}</h2>
            </div>
            <div className="op-col op-col--copy">
              <div className="op-pbody">
                {t.body.map((p, j) => <p key={j}>{p}</p>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OurPhilosophyApp() {
  const [menuOpen, setMenuOpen] = opUseState(false);
  const [depsLoaded, setDepsLoaded] = opUseState(false);

  opUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  opUseEffect(() => {
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
      <OurPhilosophyHero />
      <PhilosophySections />
      <SiteFooter />
    </>
  );
}

const opRoot = document.getElementById("op-root");
if (opRoot) ReactDOM.createRoot(opRoot).render(<OurPhilosophyApp />);
