// Pinned scroll cinematic: TV stays fixed, zooms in, and a field of volumetric light rays
// glows behind it. Reuses the interactive <RetroTV/>.
const { useRef, useEffect } = React;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function ScrollScene() {
  const trackRef = useRef(null);
  const pinContentRef = useRef(null);
  const tvZoomRef = useRef(null);
  const chromeRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      if (trackRef.current) trackRef.current.style.height = "100svh";
      return;
    }

    let raf;
    const tick = () => {
      const track = trackRef.current;
      if (track) {
        const rect = track.getBoundingClientRect();
        const total = track.offsetHeight - window.innerHeight;
        const p = clamp(-rect.top / Math.max(total, 1), 0, 1);

        // TV zoom-in (ease-in)
        if (tvZoomRef.current) {
          const tz = p * p;
          tvZoomRef.current.style.transform = `scale(${(1 + tz * 6.5).toFixed(3)})`;
        }
        // Energy glow swells then fades
        if (glowRef.current) {
          const g = Math.sin(clamp(p, 0, 1) * Math.PI); // 0→1→0
          glowRef.current.style.opacity = (g * 0.9).toFixed(3);
          glowRef.current.style.transform = `scale(${(0.6 + p * 1.8).toFixed(3)})`;
        }
        // Hero chrome fades out almost immediately
        if (chromeRef.current) {
          const o = clamp(1 - p / 0.12, 0, 1);
          chromeRef.current.style.opacity = o.toFixed(3);
        }
        // Whole scene fades at the very end → clean handoff to content
        if (pinContentRef.current) {
          pinContentRef.current.style.opacity = (1 - clamp((p - 0.80) / 0.20, 0, 1)).toFixed(3);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="scroll-track" id="top" ref={trackRef} data-screen-label="HERO">
      <div className="scroll-pin">
        <div className="pin-content" ref={pinContentRef}>
          <div className="blast-glow" ref={glowRef} />

          {/* LightRays — volumetric light rays radiating behind the TV */}
          <div className="rays-full" aria-hidden="true">
            <LightRays
              raysOrigin="top-center"
              raysColor="#ffffff"
              raysSpeed={0.8}
              lightSpread={0.6}
              rayLength={2.2}
              fadeDistance={1.2}
              saturation={1.0}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0.06}
              distortion={0.04}
              opacity={0.7}
            />
          </div>

          {/* Ghost wordmark behind everything — bleeds past the TV, shows through the glass */}
          <div className="ghost" aria-hidden="true">
            <span>PELLUCID</span>
            <span>FRAMES</span>
          </div>

          {/* 3D scene container */}
          <div className="scene-3d">
            {/* The pinned, zooming TV */}
            <div className="tv-zoom" ref={tvZoomRef}>
              <RetroTV />
            </div>
          </div>

          {/* Hero chrome (fades on scroll) */}
          <div className="hero-chrome" ref={chromeRef}>
            <div className="hero-top-meta">
              <span>HIGH-END VIDEO STORYTELLING</span>
              <span>EST. 2026</span>
            </div>
            <div className="hero-foot">
              <div className="hf-left">
                <span className="hf-eyebrow">PELLUCID FRAMES — MEDIA HOUSE</span>
                <p>Finance to fantasy, live to long-form. Premium frames, end to end.</p>
              </div>
              <div className="hf-scroll">
                <span>SCROLL</span><Icon name="arrowDown" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ScrollScene });
