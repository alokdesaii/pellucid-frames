// Closing call-to-action — anchors the nav's "Get in touch". Reuses the .footer styles.
// Center-aligned. A company paragraph fills word-by-word from dark gray to white as it scrolls.
const { useRef: ctaUseRef, useEffect: ctaUseEffect } = React;

const CTA_PARAGRAPH =
  "Pellucid Frames is a high-end video studio crafting premium stories from finance to fantasy, live to long-form. We direct every project end to end, holding each frame to one uncompromising standard.";

function ClosingCTA() {
  const paraRef = ctaUseRef(null);
  const wordRefs = ctaUseRef([]);
  const headRef = ctaUseRef(null);
  const mailRef = ctaUseRef(null);
  const words = CTA_PARAGRAPH.split(" ");

  ctaUseEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      wordRefs.current.forEach((el) => { if (el) el.style.color = "var(--paper)"; });
      [headRef.current, mailRef.current].forEach((el) => { if (el) { el.style.opacity = 1; el.style.transform = "none"; } });
      return;
    }
    const clampn = (v, a, b) => Math.min(b, Math.max(a, v));
    let raf;
    const tick = () => {
      const el = paraRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // reveal as the paragraph travels from 82% down to 38% up the viewport
        const start = vh * 0.82, end = vh * 0.34;
        const p = clampn((start - rect.top) / (start - end), 0, 1);
        const N = words.length;
        // words finish filling in the first 68% of the range, leaving room for the reveal
        const pw = clampn(p / 0.68, 0, 1);
        wordRefs.current.forEach((w, i) => {
          if (!w) return;
          const wStart = i / N;
          const lp = clampn((pw - wStart) * N * 1.4, 0, 1);
          // dark gray -> paper white
          const g = Math.round(74 + lp * (249 - 74));
          const gg = Math.round(74 + lp * (239 - 74));
          const gb = Math.round(74 + lp * (232 - 74));
          w.style.color = `rgb(${g},${gg},${gb})`;
        });
        // headline + email reveal only after the paragraph is fully populated (pw === 1)
        const headR = clampn((p - 0.74) / 0.12, 0, 1);
        const mailR = clampn((p - 0.88) / 0.12, 0, 1);
        if (headRef.current) {
          headRef.current.style.opacity = headR.toFixed(3);
          headRef.current.style.transform = `translateY(${((1 - headR) * 18).toFixed(1)}px)`;
        }
        if (mailRef.current) {
          mailRef.current.style.opacity = mailR.toFixed(3);
          mailRef.current.style.transform = `translateY(${((1 - mailR) * 18).toFixed(1)}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <footer className="footer" id="contact" data-screen-label="CONTACT">
      <div className="ft-cta">
        <span className="sec-kicker"><span className="volt-line" /> START A PROJECT</span>
        <p className="ft-about" ref={paraRef}>
          {words.map((w, i) => (
            <React.Fragment key={i}>
              <span className="ft-about-word" ref={(el) => (wordRefs.current[i] = el)}>{w}</span>
              {i < words.length - 1 ? " " : ""}
            </React.Fragment>
          ))}
        </p>
        <h2 ref={headRef} className="ft-reveal">Crystal Clear Stories</h2>
        <a className="ft-mail ft-reveal" ref={mailRef} href="mailto:hello@pellucidframes.com">
          hello@pellucidframes.com <Icon name="arrowUpRight" size={26} />
        </a>
      </div>
    </footer>
  );
}

Object.assign(window, { ClosingCTA });
