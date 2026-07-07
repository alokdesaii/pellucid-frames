// Our Work — push-wipe slideshow hero, scroll-fill statement, centre-scroll
// discipline list, full-screen zoom-crossfade gallery, and Looking Ahead close.
// The scrubbed sections follow the scrollscene.jsx pattern: one rAF reads a tall
// track's rect and derives progress p ∈ [0,1] that drives every transform.
const { useState: owUseState, useEffect: owUseEffect, useRef: owUseRef } = React;

// Gallery images only (no captions). Drop your own at uploads/our-work/
// gallery-0N.jpg, same names; falls back to a why-pellucid still if missing.
const OW_PROJECTS = [
  { img: "uploads/our-work/gallery-01.jpg", alt: "Original Films",           fallback: "uploads/why-pellucid/card-01.jpg" },
  { img: "uploads/our-work/gallery-02.jpg", alt: "Documentary Productions",  fallback: "uploads/why-pellucid/card-05.jpg" },
  { img: "uploads/our-work/gallery-03.jpg", alt: "Brand Campaigns",          fallback: "uploads/why-pellucid/card-09.jpg" },
  { img: "uploads/our-work/gallery-04.jpg", alt: "Corporate Storytelling",   fallback: "uploads/why-pellucid/card-13.jpg" },
  { img: "uploads/our-work/gallery-05.jpg", alt: "Financial Media",          fallback: "uploads/why-pellucid/card-17.jpg" },
  { img: "uploads/our-work/gallery-06.jpg", alt: "Children's Entertainment", fallback: "uploads/why-pellucid/card-21.jpg" },
  { img: "uploads/our-work/gallery-07.jpg", alt: "Digital Content",          fallback: "uploads/why-pellucid/card-25.jpg" },
  { img: "uploads/our-work/gallery-08.jpg", alt: "Live Productions",         fallback: "uploads/why-pellucid/card-29.jpg" },
];

// ponytail: one-liners are placeholder copy. `hero` = per-discipline hero
// slide (drop your own at uploads/our-work/hero-0N.jpg, same names); `img` =
// deck/list still. Both fall back to the other if a file is missing.
const OW_DISCIPLINES = [
  { name: "Original Films",           line: "Stories conceived, written and produced entirely in-house.",              hero: "uploads/our-work/hero-01.jpg", thumb: "uploads/our-work/discipline-01.jpg", img: "uploads/why-pellucid/card-01.jpg" },
  { name: "Documentary Productions",  line: "Real people and real stakes, told with patience and honesty.",            hero: "uploads/our-work/hero-02.jpg", thumb: "uploads/our-work/discipline-02.jpg", img: "uploads/why-pellucid/card-05.jpg" },
  { name: "Brand Campaigns",          line: "Commercial work that persuades without pretending.",                      hero: "uploads/our-work/hero-03.jpg", thumb: "uploads/our-work/discipline-03.jpg", img: "uploads/why-pellucid/card-09.jpg" },
  { name: "Corporate Storytelling",   line: "The story inside the company, told so people actually care.",             hero: "uploads/our-work/hero-04.jpg", thumb: "uploads/our-work/discipline-04.jpg", img: "uploads/why-pellucid/card-13.jpg" },
  { name: "Financial Media",          line: "Markets explained with genuine expertise, through CapitalShiftz.",        hero: "uploads/our-work/hero-05.jpg", thumb: "uploads/our-work/discipline-05.jpg", img: "uploads/why-pellucid/card-17.jpg" },
  { name: "Children's Entertainment", line: "Worlds built for young imaginations, through Bloomy Toony.",              hero: "uploads/our-work/hero-06.jpg", thumb: "uploads/our-work/discipline-06.jpg", img: "uploads/why-pellucid/card-21.jpg" },
  { name: "Digital Content",          line: "Made for the feed, held to the same standard as the screen.",             hero: "uploads/our-work/hero-07.jpg", thumb: "uploads/our-work/discipline-07.jpg", img: "uploads/why-pellucid/card-25.jpg" },
  { name: "Live Productions",         line: "Events captured as experiences, not coverage.",                           hero: "uploads/our-work/hero-08.jpg", thumb: "uploads/our-work/discipline-08.jpg", img: "uploads/why-pellucid/card-29.jpg" },
];

/* ---------- Hero: cursor trail ----------
   Measures pointer distance; every ~1/8 viewport-width of travel, spawns a
   portfolio still at the cursor. Pop in slightly rotated, drift along the
   movement direction, shrink away — Web Animations API, self-cleaning. */
function OurWorkHero() {
  const slidesRef = owUseRef(null);
  const [idx, setIdx] = owUseState(0);

  owUseEffect(() => {
    const wrap = slidesRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const slides = Array.from(wrap.querySelectorAll(".ow-slide"));
    if (slides.length < 2) return;
    const FULL  = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
    const RIGHT = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"; // collapsed at right edge
    const LEFT  = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";         // collapsed at left edge
    const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";
    const WIPE = 1500, HOLD = 1800;

    let cur = 0, timer, alive = true;
    const step = () => {
      if (!alive) return;
      const next = (cur + 1) % slides.length;
      const out = slides[cur], inc = slides[next];
      // both edges track the same eased position, so the pair tiles the screen
      // exactly — reads as the new image pushing the old one off to the left
      inc.style.display = "block";
      inc.style.zIndex = 2;
      out.style.zIndex = 1;
      inc.animate([{ clipPath: RIGHT }, { clipPath: FULL }], { duration: WIPE, easing: EASE, fill: "forwards" });
      const anim = out.animate([{ clipPath: FULL }, { clipPath: LEFT }], { duration: WIPE, easing: EASE, fill: "forwards" });
      setIdx(next);
      anim.onfinish = () => {
        out.style.display = "none";
        cur = next;
        timer = setTimeout(step, HOLD);
      };
    };
    timer = setTimeout(step, HOLD);
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  return (
    <section className="ow-hero">
      <div className="ow-slides" ref={slidesRef} aria-hidden="true">
        {OW_DISCIPLINES.map((d, i) => (
          <div key={i} className="ow-slide" style={{ display: i === 0 ? "block" : "none" }}>
            <img src={d.hero} alt="" onError={(e) => { if (e.currentTarget.src.indexOf(d.img) < 0) e.currentTarget.src = d.img; }} />
          </div>
        ))}
      </div>
      <div className="ow-hero-scrim" aria-hidden="true" />
      <div className="ow-eyebrow mono">
        <span>Pellucid Frames</span>
        <span>№ 003 — Portfolio</span>
      </div>
      <div className="ow-hero-band">
        <div className="ow-band-row mono">
          <span className="ow-tag-name"><span key={idx}>{OW_DISCIPLINES[idx].name}</span></span>
          <span className="ow-tag-count">
            <b>{String(idx + 1).padStart(2, "0")}</b> / {String(OW_DISCIPLINES.length).padStart(2, "0")}
          </span>
        </div>
        <div className="ow-band-line" aria-hidden="true" />
      </div>
      <div className="ow-hero-center">
        <h1 className="ow-title">Our <span className="ow-accent">Work</span></h1>
      </div>
    </section>
  );
}

/* ---------- Statement: scroll-fill text + parallax stills ----------
   One rAF derives section progress from its rect; each word's color alpha
   ramps ghost → full in sequence, and each still parallaxes at its own speed. */
const OW_STMT_WORDS = "Every project reflects our commitment to quality, creativity and purpose.".split(" ");
const OW_STMT_IMGS = [
  { src: "uploads/why-pellucid/card-03.jpg", cls: "ow-stmt-i1", speed: 0.10 },
  { src: "uploads/why-pellucid/card-11.jpg", cls: "ow-stmt-i2", speed: -0.07 },
  { src: "uploads/why-pellucid/card-19.jpg", cls: "ow-stmt-i3", speed: 0.16 },
  { src: "uploads/why-pellucid/card-27.jpg", cls: "ow-stmt-i4", speed: -0.12 },
];

function StatementSection() {
  const rootRef = owUseRef(null);

  owUseEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const words = Array.from(root.querySelectorAll(".ow-stmt-w"));
    const imgs = Array.from(root.querySelectorAll(".ow-stmt-img"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => { w.style.color = "var(--paper)"; });
      return;
    }

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let raf;
    const tick = () => {
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;

      // fill: 0 as the section top enters at 90% vh → 1 when its bottom
      // reaches 50% vh, scrubbing one word after another
      const p = clamp((vh * 0.9 - r.top) / (vh * 0.4 + r.height), 0, 1);
      const idx = p * words.length * 1.15; // slight overshoot so the last word completes
      words.forEach((w, i) => {
        const a = clamp(idx - i, 0, 1);
        w.style.color = `rgba(249, 239, 232, ${(0.12 + 0.88 * a).toFixed(3)})`;
      });

      // parallax: offset of section centre from viewport centre, per-image speed
      const c = (r.top + r.height / 2 - vh / 2) / vh;
      imgs.forEach((img, i) => {
        const shift = c * OW_STMT_IMGS[i].speed * vh;
        img.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="ow-statement" ref={rootRef}>
      <div className="ow-stmt-banner mono ow-reveal" data-ow-reveal>
        <span>The first thing to know about our work</span>
        <b>01</b>
      </div>
      {OW_STMT_IMGS.map((im, i) => (
        <img key={i} className={`ow-stmt-img ${im.cls}`} src={im.src} alt="" aria-hidden="true" loading="lazy" />
      ))}
      <h2 className="ow-stmt-text" aria-label={OW_STMT_WORDS.join(" ")}>
        {OW_STMT_WORDS.map((w, i) => (
          <React.Fragment key={i}>
            <span className="ow-stmt-w" aria-hidden="true">{w}</span>{" "}
          </React.Fragment>
        ))}
      </h2>
    </section>
  );
}

/* ---------- Disciplines: centre-scroll highlight list ----------
   The name nearest the viewport centre is active: it turns volt while the
   pinned still pops in (scale/rotate) and its one-liner slides in beside it.
   Scrolling back steps to the previous item, like the reference. */
function DisciplineList() {
  const rootRef = owUseRef(null);
  const listRef = owUseRef(null);
  const [active, setActive] = owUseState(-1);
  const [hover, setHover] = owUseState(-1); // hover wins over the scroll highlight

  owUseEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(0);
      return;
    }
    const names = Array.from(list.querySelectorAll(".ow-disc-name"));
    let raf;
    const tick = () => {
      const cy = window.innerHeight / 2;
      const lr = list.getBoundingClientRect();
      let next;
      if (lr.top > cy) next = -1;                 // list not reached yet — everything hidden
      else if (lr.bottom < cy) next = names.length - 1; // scrolled past — last stays
      else {
        let bestD = Infinity;
        names.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - cy);
          if (d < bestD) { bestD = d; next = i; }
        });
      }
      setActive(next); // React bails out when unchanged
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shown = hover >= 0 ? hover : active;

  return (
    <section className="ow-disc" ref={rootRef}>
      <h2 className="ow-disc-h ow-reveal" data-ow-reveal>
        From original films to live productions — <b>eight disciplines, one standard.</b>
      </h2>
      <div className="ow-disc-body">
        <div className="ow-disc-list" ref={listRef} onMouseLeave={() => setHover(-1)}>
          {OW_DISCIPLINES.map((d, i) => (
            <span
              key={i}
              className={"ow-disc-name" + (i === shown ? " on" : "")}
              onMouseEnter={() => setHover(i)}
            >{d.name}</span>
          ))}
        </div>
        <div className="ow-disc-side" aria-hidden="true">
          <div className="ow-disc-media">
            {OW_DISCIPLINES.map((d, i) => (
              <img key={i} className={i === shown ? "on" : ""} src={d.thumb} alt="" loading="lazy"
                onError={(e) => { if (e.currentTarget.src.indexOf(d.img) < 0) e.currentTarget.src = d.img; }} />
            ))}
          </div>
          <div className="ow-disc-lines">
            {OW_DISCIPLINES.map((d, i) => (
              <p key={i} className={"ow-disc-line" + (i === shown ? " on" : "")}>{d.line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Portfolio gallery: full-screen zoom sequence ----------
   Each image continuously zooms in across its scroll window and crossfades;
   the next zooms in as the current keeps zooming out and fades. One rAF derives
   progress p from the tall track, drives scale + opacity for every image. */
function GalleryDeck() {
  const trackRef = owUseRef(null);
  const viewRef = owUseRef(null);

  owUseEffect(() => {
    const track = trackRef.current;
    const view = viewRef.current;
    if (!track || !view) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      track.classList.add("ow-static");
      return;
    }

    const imgs = Array.from(view.querySelectorAll(".ow-zoom"));
    const N = imgs.length;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const ZOOM = 0.42;   // total scale growth across an image's life
    const FADE = 0.72;   // half-overlap window (in index units)
    const WINDOW = 1.0;  // scale ramps over ±1 index

    let raf;
    const tick = () => {
      const r = track.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = clamp(total > 0 ? -r.top / total : 0, 0, 1);
      const s = p * (N - 1); // focus index (float)

      imgs.forEach((el, i) => {
        const d = s - i;                        // 0 at focus, + past, − upcoming
        const opacity = clamp(1 - Math.abs(d) / FADE, 0, 1);
        // zoom grows continuously: 1.0 as it enters (d=+WINDOW) → 1+ZOOM as it leaves (d=−WINDOW)
        const scale = 1 + ZOOM * clamp((WINDOW - d) / (2 * WINDOW), 0, 1);
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `scale(${scale.toFixed(4)})`;
        el.style.visibility = opacity <= 0.01 ? "hidden" : "visible";
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="ow-deck-track" ref={trackRef} style={{ height: `${OW_PROJECTS.length * 85 + 60}svh` }}>
      <div className="ow-deck-viewport" ref={viewRef}>
        {OW_PROJECTS.map((proj, i) => (
          <div className="ow-zoom" key={i} style={{ zIndex: i, opacity: i === 0 ? 1 : 0 }}>
            <img src={proj.img} alt={proj.alt} loading="lazy"
              onError={(e) => { if (e.currentTarget.src.indexOf(proj.fallback) < 0) e.currentTarget.src = proj.fallback; }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Static sections ---------- */
function useRevealOW() {
  owUseEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-ow-reveal]"));
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
  }, []);
}

function WorkSections() {
  useRevealOW();
  return (
    <>
      <StatementSection />

      <DisciplineList />

      <GalleryDeck />

      <section className="ow-section">
        <div className="ow-section-inner">
          <span className="ow-kicker ow-reveal" data-ow-reveal>Looking Ahead</span>
          <h2 className="ow-statement-h ow-reveal" data-ow-reveal>
            The future of storytelling extends beyond individual productions.
          </h2>
          <p className="ow-body ow-reveal" data-ow-reveal>
            As Pellucid Frames grows, we will continue expanding our creative
            ecosystem through new content formats, strategic partnerships,
            educational initiatives and audience-focused media platforms.
          </p>
          <div className="ow-ambition ow-reveal" data-ow-reveal>
            <div className="ow-ambition-pre mono">Our ambition is simple</div>
            <h3 className="ow-ambition-h">
              Create stories that <span className="ow-accent">educate</span>,{" "}
              <span className="ow-accent">entertain</span> and{" "}
              <span className="ow-accent">endure</span> across generations.
            </h3>
          </div>
        </div>
      </section>
    </>
  );
}

function OurWorkApp() {
  const [menuOpen, setMenuOpen] = owUseState(false);
  const [depsLoaded, setDepsLoaded] = owUseState(false);

  owUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  owUseEffect(() => {
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
      <OurWorkHero />
      <WorkSections />
      <SiteFooter />
    </>
  );
}

const owRoot = document.getElementById("ow-root");
if (owRoot) ReactDOM.createRoot(owRoot).render(<OurWorkApp />);
