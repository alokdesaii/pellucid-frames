// BloomyToony — Pellucid Frames' children's animation YouTube channel.
// Approach-style layout (hero → intro → numbered formats → parallax → accordion
// values → CTA) in our sharp ink/paper/volt language. Copy is generated
// placeholder; swap the YouTube URL (BT_YT) and images under uploads/bloomy-toony/.
const { useState: btUseState, useEffect: btUseEffect, useRef: btUseRef } = React;

const BT_YT = "https://www.youtube.com/@BloomyToony";

const BT_FORMATS = [
  { title: "Original Cartoons", text: "Hand-crafted animated stories with characters kids come back to — built to be watched again and again, not just once." },
  { title: "Songs & Sing-alongs", text: "Original music and singable moments that teach a little something while they stick in your head all day (sorry, parents)." },
  { title: "Little Lessons", text: "Kindness, curiosity and courage, wrapped inside a story — the values that matter, never preached, always played out." },
  { title: "Read-along Tales", text: "Gentle, beautifully drawn stories for winding down — the kind of screen time that actually feels calm." },
  { title: "Behind the Scenes", text: "How the worlds get drawn and the characters come alive — a peek that turns little viewers into little makers." },
];

const BT_VALUES = [
  { title: "Safe by design", text: "Every second is made for young eyes — no dark patterns, no scary cliffhangers to trap attention, nothing you'd need to preview first." },
  { title: "Learning, hidden in play", text: "The lesson never lectures. It lives inside the story, so kids absorb it the way children learn best — by being delighted." },
  { title: "Made to be rewatched", text: "We'd rather make one episode worth watching fifty times than fifty that vanish. Comfort and repetition are features, not bugs." },
  { title: "Calm, not frantic", text: "No hyper-cut chaos engineered to over-stimulate. We pace our stories for real attention spans and gentler screen time." },
];

function useRevealCS(ready) {
  btUseEffect(() => {
    if (!ready) return;
    const els = Array.from(document.querySelectorAll("[data-bt-reveal]"));
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
  btUseEffect(() => {
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
  btUseEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const img = track.querySelector(".bt-cx-img");
    const wrap = track.querySelector(".bt-cx-imgwrap");
    const ch = track.querySelector(".bt-cx-ch");
    const read = track.querySelector(".bt-cx-ch-read");
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
  btUseEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const inners = Array.from(list.querySelectorAll(".bt-num-inner"));
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
  const [open, setOpen] = btUseState(0);
  return (
    <div className="bt-keys">
      {BT_VALUES.map((v, i) => (
        <div className={"bt-key" + (open === i ? " on" : "")} key={i}>
          <button className="bt-key-head" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <span className="bt-key-label">Rule {String(i + 1).padStart(2, "0")} — {v.title}</span>
            <span className="bt-key-plus" aria-hidden="true" />
          </button>
          <div className="bt-key-panel">
            <div className="bt-key-inner">
              <div className="bt-key-body">
                <h3 className="bt-key-title">{v.title}</h3>
                <p className="bt-key-text">{v.text}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BloomyToonyBody() {
  const parallaxRef = btUseRef(null);
  const crossRef = btUseRef(null);
  const formatsRef = btUseRef(null);
  useRevealCS(true);
  useParallaxCS(parallaxRef, true);
  useCrossReveal(crossRef);
  useNumberSlide(formatsRef);

  return (
    <main className="bt-wrap">
      {/* Hero — bg media, oversized 2-line title, volt intro box */}
      <section className="bt-hero">
        <div className="bt-hero-bg" aria-hidden="true">
          <video src="uploads/bloomy-toony/bt-hero.mp4" autoPlay muted loop playsInline preload="auto" />
        </div>
        <div className="bt-hero-content">
          <span className="bt-hero-pretitle">Pellucid Frames — YouTube</span>
          <h1 className="bt-title"><span>Bloomy</span><span className="bt-accent">Toony</span></h1>
          <div className="bt-hero-box">
            <p className="bt-hero-box-text">
              Our animation channel for kids — original cartoons, songs and gentle
              stories <b>made to be watched again and again,</b> not just once.
            </p>
            <div className="bt-hero-box-cta">
              <a className="bt-sub-btn" href={BT_YT} target="_blank" rel="noopener">
                Subscribe on YouTube <span className="bt-sub-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Intro — scroll-scrubbed image reveal + sticky text */}
      <section className="bt-crossblock">
        <div className="bt-cx-track" ref={crossRef}>
          <div className="bt-cx-sticky">
            <div className="bt-cx-cell bt-cx-media">
              <figure className="bt-cx-figure">
                <div className="bt-cx-imgwrap">
                  <img className="bt-cx-img" src="uploads/bloomy-toony/bt-intro.jpg" alt="Behind the scenes at BloomyToony" loading="lazy" />
                  <div className="bt-cx-ch" aria-hidden="true">
                    <div className="bt-cx-ch-v" /><div className="bt-cx-ch-h" /><div className="bt-cx-ch-read mono" />
                  </div>
                </div>
              </figure>
            </div>
            <div className="bt-cx-cell" aria-hidden="true" />
            <div className="bt-cx-cell bt-cx-textcell">
              <p className="bt-cx-text">
                Most kids' content is built to grab attention and never let go.
                Bloomy Toony is built to <span className="bt-accent">nourish</span> it —
                animation made with the same craft and care behind everything
                Pellucid Frames makes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formats — numbered list */}
      <section className="bt-section bt-inner">
        <div className="bt-sec-head">
          <div>
            <span className="bt-pretitle">What you'll find</span>
            <h2 className="bt-sec-title" data-bt-reveal>Five ways we make kids smile.</h2>
          </div>
          <p className="bt-sec-intro" data-bt-reveal>
            Different formats, one standard — every video is made to be safe,
            gentle and worth watching again.
          </p>
        </div>
        <div className="bt-list" ref={formatsRef}>
          {BT_FORMATS.map((f, i) => (
            <div className="bt-item" key={i}>
              <div className="bt-item-num"><span className="bt-num-inner">{String(i + 1).padStart(2, "0")}</span></div>
              <div className="bt-item-content">
                <h3 className="bt-item-title">{f.title}</h3>
                <p className="bt-item-text">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parallax band */}
      <section className="bt-parallax" ref={parallaxRef}>
        <img src="uploads/bloomy-toony/bt-parallax.jpg" alt="" />
        <h2 className="bt-parallax-h">Screen time that <span className="bt-accent">feels good.</span></h2>
      </section>

      {/* Values — sticky heading + expanding volt panels */}
      <section className="bt-section bt-inner bt-keys-sec">
        <div className="bt-keys-head">
          <span className="bt-pretitle">How we make it</span>
          <h2 className="bt-sec-title" data-bt-reveal>Four rules we don't break.</h2>
          <p className="bt-sec-intro" data-bt-reveal style={{ marginTop: "clamp(20px,3vh,32px)" }}>
            The same philosophy that shapes Pellucid Frames, applied to the
            audience that deserves the most care of all — children.
          </p>
        </div>
        <ValuePanels />
      </section>

      {/* Closing CTA */}
      <section className="bt-closing bt-inner">
        <div className="bt-closing-pre mono">New stories, every week</div>
        <h2 className="bt-closing-h" data-bt-reveal>
          Come <span className="bt-accent">grow</span> up with us.
        </h2>
        <a className="bt-cta" href={BT_YT} target="_blank" rel="noopener">
          Subscribe on YouTube <span className="bt-cta-arrow" aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
}

function BloomyToonyApp() {
  const [menuOpen, setMenuOpen] = btUseState(false);
  const [depsLoaded, setDepsLoaded] = btUseState(false);

  btUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  btUseEffect(() => {
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
      <BloomyToonyBody />
      <SiteFooter />
    </>
  );
}

const btRoot = document.getElementById("bt-root");
if (btRoot) ReactDOM.createRoot(btRoot).render(<BloomyToonyApp />);
