// CapitalShiftz — Pellucid Frames' finance YouTube channel. Approach-style
// layout (hero → intro → numbered formats → parallax → accordion values → CTA)
// in our sharp ink/paper/volt language. Copy is generated placeholder; swap the
// YouTube URL (CS_YT) and images under uploads/capital-shiftz/ when ready.
const { useState: csUseState, useEffect: csUseEffect, useRef: csUseRef } = React;

const CS_YT = "https://www.youtube.com/@CapitalShiftz";

const CS_FORMATS = [
  { title: "Market Breakdowns", text: "Clear, visual explanations of what actually moved the markets this week — and why. No hot takes, no doom-scrolling." },
  { title: "Explainers", text: "The concepts behind the headlines — interest rates, IPOs, bonds, valuations — built to finally make sense and stay with you." },
  { title: "Interviews & Conversations", text: "Founders, investors and operators, long-form, on how capital really moves when the cameras usually aren't rolling." },
  { title: "Weekly Recaps", text: "The week in markets distilled to what mattered and what was just noise — in the time it takes to drink a coffee." },
  { title: "Deep Dives", text: "Long-form investigations into the companies, sectors and money stories worth understanding properly." },
];

const CS_VALUES = [
  { title: "Clarity over noise", text: "We explain, we don't hype. If a story needs manufactured drama to hold attention, we'd rather leave it out. The goal is understanding, not adrenaline." },
  { title: "Evidence, not opinion", text: "Every claim is sourced and every number is shown. We walk through the data and the reasoning so you can check our work — and disagree with it." },
  { title: "No tips, no promises", text: "We will never tell you what to buy. We help you understand markets well enough to make your own decisions with your eyes open." },
  { title: "Built to last", text: "We cover the ideas that stay true after the news cycle moves on — the kind of literacy that compounds instead of expiring by Friday." },
];

function useRevealCS(ready) {
  csUseEffect(() => {
    if (!ready) return;
    const els = Array.from(document.querySelectorAll("[data-cs-reveal]"));
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

// scroll parallax for the full-bleed band (one rAF, scrollscene pattern)
function useParallaxCS(ref, ready) {
  csUseEffect(() => {
    if (!ready) return;
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const img = el.querySelector("img");
    if (!img) return;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let raf;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = ((r.top + r.height / 2) - vh / 2) / vh; // -1..1 across viewport
      img.style.transform = `translate3d(0, ${clamp(-p * 14, -14, 14).toFixed(2)}%, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);
}

// intro image: scroll-scrubbed reveal. A tall track pins the grid; progress p
// opens the clip-path from the top-left corner to bottom-right, and a crosshair
// tracks the reveal corner with a live readout. Text stays pinned meanwhile.
function useCrossReveal(trackRef) {
  csUseEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const img = track.querySelector(".cs-cx-img");
    const wrap = track.querySelector(".cs-cx-imgwrap");
    const ch = track.querySelector(".cs-cx-ch");
    const read = track.querySelector(".cs-cx-ch-read");
    // scroll-linked reveal runs regardless of reduced-motion (it's driven by
    // the user's own scroll, not autonomous motion); only mobile falls back.
    const mq = window.matchMedia("(max-width: 860px)");
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let raf;
    const tick = () => {
      if (mq.matches) {
        if (img) img.style.clipPath = "none";
      } else {
        const r = track.getBoundingClientRect();
        const vh = window.innerHeight;
        // reveal starts the moment the section enters the viewport and
        // completes ~80% of the way through the pinned stretch, so it holds
        // fully open for a beat before the next section arrives
        const travelled = vh - r.top;            // 0 when the top touches the viewport bottom
        const journey = (vh + Math.max(r.height - vh, 0)) * 0.8;
        const p = clamp(journey > 0 ? travelled / journey : 1, 0, 1);
        const inset = ((1 - p) * 100).toFixed(2);
        if (img) img.style.clipPath = `inset(0 ${inset}% ${inset}% 0)`;
        if (wrap && ch) {
          const wr = wrap.getBoundingClientRect();
          const rx = p * wr.width, ry = p * wr.height;
          ch.style.setProperty("--rx", rx.toFixed(1) + "px");
          ch.style.setProperty("--ry", ry.toFixed(1) + "px");
          ch.style.opacity = p > 0.005 && p < 0.995 ? "1" : "0"; // only mid-reveal
          if (read) read.textContent = `X ${Math.round(rx)}  Y ${Math.round(ry)}`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}

// numbers slide up into place, scrubbed by scroll (mirrors the reference's
// animated-number: yPercent -100 → 0, from "top bottom" to "top center")
function useNumberSlide(listRef) {
  csUseEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const inners = Array.from(list.querySelectorAll(".cs-num-inner"));
    if (!inners.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      inners.forEach((el) => { el.style.transform = "none"; });
      return;
    }
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let raf;
    const tick = () => {
      const vh = window.innerHeight;
      inners.forEach((el) => {
        const top = el.parentElement.getBoundingClientRect().top;
        // 0 when the number's top is at viewport bottom, 1 when it reaches centre
        const p = clamp((vh - top) / (vh * 0.5), 0, 1);
        el.style.transform = `translateY(${(-100 * (1 - p)).toFixed(2)}%)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}

function ValuePanels() {
  const [open, setOpen] = csUseState(0);
  return (
    <div className="cs-keys">
      {CS_VALUES.map((v, i) => (
        <div className={"cs-key" + (open === i ? " on" : "")} key={i}>
          <button className="cs-key-head" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <span className="cs-key-label">Rule {String(i + 1).padStart(2, "0")} — {v.title}</span>
            <span className="cs-key-plus" aria-hidden="true" />
          </button>
          <div className="cs-key-panel">
            <div className="cs-key-inner">
              <div className="cs-key-body">
                <h3 className="cs-key-title">{v.title}</h3>
                <p className="cs-key-text">{v.text}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CapitalShiftzBody() {
  const parallaxRef = csUseRef(null);
  const crossRef = csUseRef(null);
  const formatsRef = csUseRef(null);
  useRevealCS(true);
  useParallaxCS(parallaxRef, true);
  useCrossReveal(crossRef);
  useNumberSlide(formatsRef);

  return (
    <main className="cs-wrap">
      {/* Hero — bg media, oversized 2-line title, volt intro box */}
      <section className="cs-hero">
        <div className="cs-hero-bg" aria-hidden="true">
          <video src="uploads/capital-shiftz/cs-hero.mp4" autoPlay muted loop playsInline preload="auto" />
        </div>
        <div className="cs-hero-content">
          <span className="cs-hero-pretitle">Pellucid Frames — YouTube</span>
          <h1 className="cs-title"><span>Capital</span><span className="cs-accent">Shiftz</span></h1>
          <div className="cs-hero-box">
            <p className="cs-hero-box-text">
              Our finance channel — market breakdowns, explainers and honest
              conversations that help you <b>genuinely understand money,</b> not chase it.
            </p>
            <div className="cs-hero-box-cta">
              <a className="cs-sub-btn" href={CS_YT} target="_blank" rel="noopener">
                Subscribe on YouTube <span className="cs-sub-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Intro — scroll-scrubbed image reveal + sticky text */}
      <section className="cs-crossblock">
        <div className="cs-cx-track" ref={crossRef}>
          <div className="cs-cx-sticky">
            <div className="cs-cx-cell cs-cx-media">
              <figure className="cs-cx-figure">
                <div className="cs-cx-imgwrap">
                  <img className="cs-cx-img" src="uploads/capital-shiftz/cs-intro.jpg" alt="Behind the scenes at CapitalShiftz" loading="lazy" />
                  <div className="cs-cx-ch" aria-hidden="true">
                    <div className="cs-cx-ch-v" /><div className="cs-cx-ch-h" /><div className="cs-cx-ch-read mono" />
                  </div>
                </div>
              </figure>
            </div>
            <div className="cs-cx-cell" aria-hidden="true" />
            <div className="cs-cx-cell cs-cx-textcell">
              <p className="cs-cx-text">
                Most finance media is built to keep you anxious and refreshing.
                CapitalShiftz is built to make you <span className="cs-accent">literate</span> —
                the markets explained with the same craft and honesty behind everything
                Pellucid Frames makes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formats — numbered list */}
      <section className="cs-section cs-inner">
        <div className="cs-sec-head">
          <div>
            <span className="cs-pretitle">What you'll find</span>
            <h2 className="cs-sec-title" data-cs-reveal>Five ways we cover the markets.</h2>
          </div>
          <p className="cs-sec-intro" data-cs-reveal>
            Different formats, one standard — every video earns your time and
            respects your intelligence.
          </p>
        </div>
        <div className="cs-list" ref={formatsRef}>
          {CS_FORMATS.map((f, i) => (
            <div className="cs-item" key={i}>
              <div className="cs-item-num"><span className="cs-num-inner">{String(i + 1).padStart(2, "0")}</span></div>
              <div className="cs-item-content">
                <h3 className="cs-item-title">{f.title}</h3>
                <p className="cs-item-text">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parallax band */}
      <section className="cs-parallax" ref={parallaxRef}>
        <img src="uploads/capital-shiftz/cs-parallax.jpg" alt="" loading="lazy" decoding="async" />
        <h2 className="cs-parallax-h">Understand the money. <span className="cs-accent">Skip the noise.</span></h2>
      </section>

      {/* Values — sticky heading + expanding volt panels */}
      <section className="cs-section cs-inner cs-keys-sec">
        <div className="cs-keys-head">
          <span className="cs-pretitle">How we cover finance</span>
          <h2 className="cs-sec-title" data-cs-reveal>Four rules we don't break.</h2>
          <p className="cs-sec-intro" data-cs-reveal style={{ marginTop: "clamp(20px,3vh,32px)" }}>
            The same philosophy that shapes Pellucid Frames, applied to the one
            subject where getting it wrong actually costs people money.
          </p>
        </div>
        <ValuePanels />
      </section>

      {/* Closing CTA */}
      <section className="cs-closing cs-inner">
        <img className="cs-closing-logo" src="assets/capital-shiftz-logo.png" alt="Capital Shiftz" loading="lazy" />
        <div className="cs-closing-pre mono">New videos, every week</div>
        <h2 className="cs-closing-h" data-cs-reveal>
          Come <span className="cs-accent">understand</span> the markets with us.
        </h2>
        <a className="cs-cta" href={CS_YT} target="_blank" rel="noopener">
          Subscribe on YouTube <span className="cs-cta-arrow" aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
}

function CapitalShiftzApp() {
  const [menuOpen, setMenuOpen] = csUseState(false);
  const [depsLoaded, setDepsLoaded] = csUseState(false);

  csUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  csUseEffect(() => {
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
      <CapitalShiftzBody />
      <SiteFooter />
    </>
  );
}

const csRoot = document.getElementById("cs-root");
if (csRoot) ReactDOM.createRoot(csRoot).render(<CapitalShiftzApp />);
