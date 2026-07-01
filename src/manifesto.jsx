// Manifesto — the bubble zooms into existence from a dot as the hero fades out,
// then the headline assembles with a per-character kinetic reveal. Scroll-tied.
const { useRef: mfUseRef, useEffect: mfUseEffect } = React;

const MF_LINES = [
  { text: "Every Frame", accent: false },
  { text: "Earns Its Place", accent: true }, // accent appends the single volt period
];

// flatten into characters, preserving line membership + global reveal order
const MF_CHARS = (() => {
  const lines = [];
  let order = 0;
  MF_LINES.forEach((l) => {
    const chars = l.text.split("").map((ch) => ({ ch, accent: false, order: order++ }));
    if (l.accent) chars.push({ ch: ".", accent: true, order: order++ });
    lines.push(chars);
  });
  return { lines, total: order };
})();

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

function Manifesto() {
  const trackRef = mfUseRef(null);
  const eyebrowRef = mfUseRef(null);
  const charRefs = mfUseRef([]);
  const subRef = mfUseRef(null);
  const orbRef = mfUseRef(null);

  mfUseEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const settle = () => {
      if (eyebrowRef.current) { eyebrowRef.current.style.opacity = 1; eyebrowRef.current.style.transform = "none"; }
      charRefs.current.forEach((el) => { if (el) { el.style.opacity = 1; el.style.transform = "none"; el.style.filter = "none"; } });
      if (subRef.current) { subRef.current.style.opacity = 1; subRef.current.style.transform = "none"; }
      if (orbRef.current) { orbRef.current.style.opacity = 0.45; orbRef.current.style.transform = "translate(-50%,-50%) scale(1)"; }
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { track.style.height = "100svh"; settle(); return; }

    const clampn = (v, a, b) => Math.min(b, Math.max(a, v));
    let raf;
    const tick = () => {
      const rect = track.getBoundingClientRect();
      const total = track.offsetHeight - window.innerHeight;
      const p = clampn(-rect.top / Math.max(total, 1), 0, 1);

      // --- orb: zoom in from a dot, delayed so it forms well after the hero clears ---
      if (orbRef.current) {
        const op = clampn((p - 0.22) / 0.40, 0, 1);
        const s = 0.12 + op * 0.88;
        orbRef.current.style.opacity = (clampn((p - 0.22) / 0.20, 0, 1) * 0.45).toFixed(3);
        orbRef.current.style.transform = `translate(-50%, -50%) scale(${s.toFixed(3)})`;
      }

      // --- eyebrow ---
      if (eyebrowRef.current) {
        const lp = clampn((p - 0.32) / 0.10, 0, 1);
        eyebrowRef.current.style.opacity = lp.toFixed(3);
        eyebrowRef.current.style.transform = `translateY(${((1 - lp) * 16).toFixed(1)}px)`;
      }

      // --- per-character kinetic reveal (right after the orb forms) ---
      const N = MF_CHARS.total;
      const charBegin = 0.48;
      const charWindow = 0.40;        // total scroll span the whole word-set uses
      const charSpan = 0.18;          // each char's own fade duration
      charRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = charBegin + (i / Math.max(N - 1, 1)) * (charWindow - charSpan);
        const lp = clampn((p - start) / charSpan, 0, 1);
        const e = easeOutCubic(lp);
        el.style.opacity = e.toFixed(3);
        const ty = (1 - e) * 40;
        const sc = 0.80 + e * 0.20;
        el.style.transform = `translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(3)})`;
        el.style.filter = `blur(${((1 - e) * 13).toFixed(1)}px)`;
      });

      // --- subtext ---
      if (subRef.current) {
        const lp = clampn((p - 0.68) / 0.14, 0, 1);
        subRef.current.style.opacity = lp.toFixed(3);
        subRef.current.style.transform = `translateY(${((1 - lp) * 22).toFixed(1)}px)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="mf-track" id="intro" ref={trackRef} data-screen-label="INTRO">
      <div className="mf-pin">
        <div className="mf-orb" ref={orbRef} aria-hidden="true">
          <Bubble />
        </div>
        <div className="mf-inner">
          <span className="mf-eyebrow" ref={eyebrowRef}>
            <span className="volt-line" /> PELLUCID FRAMES
          </span>
          <h2 className="mf-display" aria-label="Every Frame Earns Its Place.">
            {MF_CHARS.lines.map((chars, li) => (
              <span className="mf-line" key={li}>
                {chars.map((c) => (
                  <span
                    key={c.order}
                    className={"mf-char" + (c.accent ? " volt-text" : "")}
                    ref={(el) => (charRefs.current[c.order] = el)}
                  >
                    {c.ch === " " ? "\u00A0" : c.ch}
                  </span>
                ))}
              </span>
            ))}
          </h2>
          <p className="mf-sub" ref={subRef}>
            Finance to fantasy, live to long-form. We build premium video stories end
            to end — directed with one uncompromising standard.
          </p>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Manifesto });
