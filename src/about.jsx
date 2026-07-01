// About — Alternative editorial layout (Studio Herrström inspired), Pellucid Frames branding.
// Type-led, generous whitespace, two-column label/body rows, large B&W imagery.
const { useState: ahUseState, useEffect: ahUseEffect, useRef: ahUseRef } = React;

// Reveal-on-scroll using the shared [data-reveal] primitive from styles.css.
// Visibility is guaranteed: in-viewport elements reveal immediately, the rest
// via an IntersectionObserver, with a timeout fallback so nothing stays hidden.
function useRevealAH() {
  ahUseEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    const reveal = (el) => el && el.classList.add("in");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(reveal);
      return;
    }

    // Reveal anything already at/near the viewport on mount.
    const vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.92) reveal(el);
    });

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    els.forEach((el) => { if (!el.classList.contains("in")) io.observe(el); });

    // Safety net — guarantee everything becomes visible even if the observer misses.
    const fallback = setTimeout(() => els.forEach(reveal), 2200);

    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);
}

const AH_SERVICES = [
  "Original Productions",
  "Brand & Commercial Content",
  "Corporate Storytelling",
  "Digital Media",
  "Live Experiences",
  "Creative Strategy"
];

// A full-width oversized statement band.
function StatementBand({ children, index }) {
  return (
    <section className="ah-band">
      <div className="ah-section-line" data-reveal aria-hidden="true" />
      {index && <div className="ah-band-index mono" data-reveal>{index}</div>}
      <h2 className="ah-band-text" data-reveal>{children}</h2>
    </section>
  );
}

// Two-column editorial row: sticky label/index on the left, content on the right.
function EditorialRow({ index, label, children }) {
  return (
    <section className="ah-row">
      <div className="ah-section-line" data-reveal aria-hidden="true" />
      <aside className="ah-row-aside" data-reveal>
        <span className="ah-row-index mono">{index}</span>
        <span className="ah-row-label mono">{label}</span>
      </aside>
      <div className="ah-row-main">{children}</div>
    </section>
  );
}

const HONG_KONG_STARS = [
  { cx: 80, cy: 30, r: 1, delay: '0.2s' },
  { cx: 120, cy: 80, r: 1.2, delay: '0.8s' },
  { cx: 150, cy: 40, r: 1, delay: '1.5s' },
  { cx: 230, cy: 110, r: 0.8, delay: '2.3s' },
  { cx: 330, cy: 60, r: 1, delay: '0.5s' },
  { cx: 420, cy: 120, r: 0.8, delay: '1.9s' },
  { cx: 440, cy: 50, r: 1.2, delay: '3.1s' },
  { cx: 510, cy: 80, r: 0.8, delay: '2.7s' },
  { cx: 620, cy: 40, r: 1, delay: '0.1s' },
  { cx: 680, cy: 90, r: 0.8, delay: '1.4s' },
  { cx: 730, cy: 60, r: 1, delay: '2.1s' },
  { cx: 770, cy: 110, r: 0.8, delay: '0.6s' },
  { cx: 45, cy: 110, r: 1, delay: '1.1s' },
  { cx: 280, cy: 50, r: 1.2, delay: '2.5s' },
  { cx: 580, cy: 70, r: 1, delay: '0.9s' }
];

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &";

function SplitFlapText({ text }) {
  const [displayText, setDisplayText] = ahUseState(text);
  const [hasRevealed, setHasRevealed] = ahUseState(false);
  const elementRef = ahUseRef(null);
  const intervalRef = ahUseRef(null);
  const timeoutRef = ahUseRef(null);

  const startAnimation = () => {
    let tick = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      tick++;
      let resolved = true;
      const nextChars = text.split("").map((char, i) => {
        const lockTick = i * 2 + 8;
        if (tick >= lockTick) {
          return char;
        } else {
          resolved = false;
          if (char === " ") return " ";
          const randIdx = Math.floor(Math.random() * FLAP_CHARS.length);
          return FLAP_CHARS[randIdx];
        }
      });

      setDisplayText(nextChars.join(""));

      if (resolved) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          startAnimation();
        }, 5000);
      }
    }, 30);
  };

  ahUseEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  ahUseEffect(() => {
    if (hasRevealed) {
      startAnimation();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hasRevealed, text]);

  return (
    <span
      ref={elementRef}
      className="split-flap-text"
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        display: 'inline-block',
        letterSpacing: '-0.02em'
      }}
    >
      {displayText}
    </span>
  );
}

const ISO_BUILDINGS = [
  {
    id: "main-hub",
    name: "Pellucid Core Studio",
    role: "Original Productions & Entertainment",
    u: 3, v: 3, w: 2, l: 2, h: 170,
    highlight: true,
    antenna: true,
    diagnostic: [
      { label: "Category", value: "Cinema & Series" },
      { label: "Active Projects", value: "4 Feature Productions" },
      { label: "Status", value: "ONLINE" },
      { label: "Render Queue", value: "24 Frames/Sec" },
      { label: "Output Space", value: "DaVinci P3 Color" }
    ]
  },
  {
    id: "relay-east",
    name: "Digital Media Hub",
    role: "OTT & Streaming Distribution",
    u: 6, v: 1, w: 1.5, l: 1.5, h: 110,
    diagnostic: [
      { label: "Platform", value: "Pellucid Play CDN" },
      { label: "Concurrent Streams", value: "142K Active" },
      { label: "Status", value: "ACTIVE" },
      { label: "Stream Latency", value: "14 ms" },
      { label: "Avg Bandwidth", value: "8.2 Gbps" }
    ]
  },
  {
    id: "relay-west",
    name: "Live Stage Node",
    role: "Broadcast & Event Production",
    u: 1, v: 6, w: 1.5, l: 1.5, h: 100,
    diagnostic: [
      { label: "Venue", value: "HK Live Stage" },
      { label: "Camera Feed", value: "8-cam SDI Array" },
      { label: "Status", value: "ONLINE" },
      { label: "Sync Lock", value: "Genlock Audio/Video" },
      { label: "Acoustics", value: "Dolby Atmos 7.1.4" }
    ]
  },
  {
    id: "data-warehouse",
    name: "Narrative Labs",
    role: "Creative & Brand Strategy",
    u: 0, v: 2, w: 2, l: 1.5, h: 85,
    diagnostic: [
      { label: "Campaigns", value: "12 Active Accounts" },
      { label: "Script Revision", value: "Draft v4 Approved" },
      { label: "Status", value: "STABLE" },
      { label: "Market Reach", value: "Asia-Pac & EMEA" }
    ]
  },
  {
    id: "gateway-south",
    name: "Commercial Production",
    role: "Brand Ads & Social Campaign",
    u: 5, v: 5, w: 2, l: 2, h: 135,
    highlight: true,
    diagnostic: [
      { label: "Production Scale", value: "Global Campaign" },
      { label: "Source Material", value: "ProRes 4444 XQ" },
      { label: "Status", value: "ONLINE" },
      { label: "Color LUT", value: "ACES standard" }
    ]
  },
  {
    id: "aux-relay",
    name: "Narrative Short Lab",
    role: "Festival Narrative Showcase",
    u: 4, v: 0, w: 1, l: 1, h: 65,
    diagnostic: [
      { label: "Festival Cut", value: "Sundance Edit" },
      { label: "Runtime", value: "18m 42s" },
      { label: "Status", value: "POLISHING" },
      { label: "Stock Emulation", value: "Kodak 5219 film" }
    ]
  },
  {
    id: "prod-stage",
    name: "LED Volume Stage",
    role: "Virtual Production & VFX",
    u: 0, v: 5, w: 2, l: 1, h: 75,
    diagnostic: [
      { label: "Rendering", value: "Unreal Engine 5.5" },
      { label: "LED Walls", value: "Calibrated" },
      { label: "Status", value: "ONLINE" },
      { label: "Sync Rate", value: "240 Hz Lock" }
    ]
  }
];

function IsometricCity() {
  const [hoveredBuilding, setHoveredBuilding] = ahUseState(null);

  const ISO_CELLS = 8;
  const ISO_CELL_SIZE = 35;
  const ISO_ANGLE = 30 * Math.PI / 180;
  const ISO_COS = Math.cos(ISO_ANGLE);
  const ISO_SIN = Math.sin(ISO_ANGLE);

  const centerX = 380;
  const centerY = 160;

  const project = (u, v, w) => {
    const x = centerX + (u - v) * ISO_CELL_SIZE * ISO_COS;
    const y = centerY + (u + v) * ISO_CELL_SIZE * ISO_SIN - w;
    return { x, y };
  };

  const getBuildingPathData = (b) => {
    const p0 = project(b.u, b.v, 0);
    const p1 = project(b.u + b.w, b.v, 0);
    const p2 = project(b.u, b.v + b.l, 0);
    const p3 = project(b.u + b.w, b.v + b.l, 0);

    const t0 = project(b.u, b.v, b.h);
    const t1 = project(b.u + b.w, b.v, b.h);
    const t2 = project(b.u, b.v + b.l, b.h);
    const t3 = project(b.u + b.w, b.v + b.l, b.h);

    const leftFace = `${p2.x},${p2.y} ${p3.x},${p3.y} ${t3.x},${t3.y} ${t2.x},${t2.y}`;
    const rightFace = `${p1.x},${p1.y} ${p3.x},${p3.y} ${t3.x},${t3.y} ${t1.x},${t1.y}`;
    const topFace = `${t0.x},${t0.y} ${t1.x},${t1.y} ${t3.x},${t3.y} ${t2.x},${t2.y}`;

    const topCenter = project(b.u + b.w/2, b.v + b.l/2, b.h);
    const antennaTip = project(b.u + b.w/2, b.v + b.l/2, b.h + 24);

    const windows = [];
    const numFloors = Math.max(3, Math.floor(b.h / 14));
    const numColsLeft = Math.max(2, Math.floor(b.l * 2.5));
    const numColsRight = Math.max(2, Math.floor(b.w * 2.5));

    for (let f = 1; f < numFloors; f++) {
      const wHeight = (f / numFloors) * b.h * 0.95;
      for (let c = 0; c < numColsLeft; c++) {
        const uPercent = (c + 0.5) / numColsLeft;
        const uVal = b.u + uPercent * b.w;
        const vVal = b.v + b.l;
        const pt = project(uVal, vVal, wHeight);
        windows.push({
          key: `${b.id}-L-${f}-${c}`,
          x: pt.x,
          y: pt.y,
          delay: `${(f * 0.15 + c * 0.2 + Math.random() * 0.5).toFixed(2)}s`
        });
      }
    }

    for (let f = 1; f < numFloors; f++) {
      const wHeight = (f / numFloors) * b.h * 0.95;
      for (let c = 0; c < numColsRight; c++) {
        const vPercent = (c + 0.5) / numColsRight;
        const uVal = b.u + b.w;
        const vVal = b.v + vPercent * b.l;
        const pt = project(uVal, vVal, wHeight);
        windows.push({
          key: `${b.id}-R-${f}-${c}`,
          x: pt.x,
          y: pt.y,
          delay: `${(f * 0.15 + c * 0.2 + Math.random() * 0.5).toFixed(2)}s`
        });
      }
    }

    return { leftFace, rightFace, topFace, topCenter, antennaTip, windows };
  };

  const getPathData = (coords) => {
    return coords.map((c, idx) => {
      const pt = project(c[0], c[1], c[2]);
      return `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
    }).join(' ');
  };

  const sortedBuildings = [...ISO_BUILDINGS].sort((a, b) => {
    return (a.u + a.w/2 + a.v + a.l/2) - (b.u + b.w/2 + b.v + b.l/2);
  });

  const activeBuilding = hoveredBuilding || ISO_BUILDINGS[0];
  const mainHub = ISO_BUILDINGS.find((b) => b.id === "main-hub");
  const mainHubPath = getBuildingPathData(mainHub);
  const searchlightOrigin = mainHubPath.antennaTip;

  return (
    <div className="iso-city-container">
      {/* Diagnostic HUD */}
      <div className="iso-hud-box is-visible">
        <div className="hud-header">
          <span>{activeBuilding.name}</span>
          <span className="hud-value status-online">●</span>
        </div>
        <div className="hud-row">
          <span className="hud-label">Role</span>
          <span className="hud-value">{activeBuilding.role}</span>
        </div>
        {activeBuilding.diagnostic.map((item, idx) => (
          <div className="hud-row" key={idx}>
            <span className="hud-label">{item.label}</span>
            <span className={`hud-value ${item.label === 'Status' && (item.value === 'ONLINE' || item.value === 'ACTIVE') ? 'status-online' : ''}`}>{item.value}</span>
          </div>
        ))}
      </div>

      <svg className="iso-svg" viewBox="0 0 760 480">
        <defs>
          <linearGradient id="searchlight-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--volt)" stopOpacity="0.4" />
            <stop offset="30%" stopColor="var(--volt)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--volt)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Ground grid lines */}
        <g className="iso-grid">
          {Array.from({ length: ISO_CELLS + 1 }).map((_, i) => {
            const startU = project(i, 0, 0);
            const endU = project(i, ISO_CELLS, 0);
            const startV = project(0, i, 0);
            const endV = project(ISO_CELLS, i, 0);
            return (
              <React.Fragment key={i}>
                <line x1={startU.x} y1={startU.y} x2={endU.x} y2={endU.y} className="iso-grid-line" />
                <line x1={startV.x} y1={startV.y} x2={endV.x} y2={endV.y} className="iso-grid-line" />
              </React.Fragment>
            );
          })}
          
          {/* Axis borders */}
          <line
            x1={project(0, 0, 0).x} y1={project(0, 0, 0).y}
            x2={project(ISO_CELLS, 0, 0).x} y2={project(ISO_CELLS, 0, 0).y}
            className="iso-grid-axis"
          />
          <line
            x1={project(0, 0, 0).x} y1={project(0, 0, 0).y}
            x2={project(0, ISO_CELLS, 0).x} y2={project(0, ISO_CELLS, 0).y}
            className="iso-grid-axis"
          />

          {/* Grid ticks labels */}
          {Array.from({ length: ISO_CELLS }).map((_, i) => {
            const labelU = project(i + 0.5, -0.4, 0);
            const labelV = project(-0.5, i + 0.5, 0);
            const charV = String.fromCharCode(65 + i); // A, B, C...
            return (
              <React.Fragment key={i}>
                <text x={labelU.x} y={labelU.y} className="iso-grid-text" textAnchor="middle">
                  {String(i + 1).padStart(2, '0')}
                </text>
                <text x={labelV.x} y={labelV.y} className="iso-grid-text" textAnchor="middle">
                  {charV}
                </text>
              </React.Fragment>
            );
          })}
        </g>

        {/* Data Packet Trails */}
        <g className="iso-trails">
          <path d={getPathData([[1, 6, 0], [1, 3, 0], [3, 3, 0]])} className="iso-packet-line" />
          <path d={getPathData([[6, 1, 0], [3, 1, 0], [3, 3, 0]])} className="iso-packet-line" />
          <path d={getPathData([[3, 3, 0], [3, 0, 0], [4, 0, 0]])} className="iso-packet-line" />

          {/* Moving Packets */}
          <circle r="2.5" className="iso-packet">
            <animateMotion dur="4.2s" repeatCount="indefinite" path={getPathData([[1, 6, 0], [1, 3, 0], [3, 3, 0]])} />
          </circle>
          <circle r="2.5" className="iso-packet">
            <animateMotion dur="5.0s" repeatCount="indefinite" path={getPathData([[6, 1, 0], [3, 1, 0], [3, 3, 0]])} />
          </circle>
          <circle r="2.5" className="iso-packet">
            <animateMotion dur="3.5s" repeatCount="indefinite" path={getPathData([[3, 3, 0], [3, 0, 0], [4, 0, 0]])} />
          </circle>
        </g>

        {/* Buildings mesh (sorted back-to-front) */}
        <g className="iso-buildings">
          {sortedBuildings.map((b) => {
            const isHovered = hoveredBuilding && hoveredBuilding.id === b.id;
            const isHighlighted = b.highlight;
            const pathData = getBuildingPathData(b);

            return (
              <g
                key={b.id}
                className={`iso-building ${isHovered ? 'is-hovered' : ''} ${isHighlighted ? 'is-highlighted' : ''}`}
                onMouseEnter={() => setHoveredBuilding(b)}
                onMouseLeave={() => setHoveredBuilding(null)}
              >
                {/* Left Face */}
                <polygon points={pathData.leftFace} className="iso-building-face-left" />
                {/* Right Face */}
                <polygon points={pathData.rightFace} className="iso-building-face-right" />
                {/* Top Face */}
                <polygon points={pathData.topFace} className="iso-building-face-top" />

                {/* Windows */}
                {pathData.windows.map((win) => (
                  <circle
                    key={win.key}
                    cx={win.x}
                    cy={win.y}
                    r="0.8"
                    className="iso-win-dot"
                    style={{ animationDelay: win.delay }}
                  />
                ))}

                {/* Antenna and signal waves */}
                {b.antenna && (
                  <g>
                    <line
                      x1={pathData.topCenter.x}
                      y1={pathData.topCenter.y}
                      x2={pathData.antennaTip.x}
                      y2={pathData.antennaTip.y}
                      stroke="var(--volt)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={pathData.antennaTip.x}
                      cy={pathData.antennaTip.y}
                      r="1.5"
                      fill="var(--volt)"
                    />
                    <circle
                      cx={pathData.antennaTip.x}
                      cy={pathData.antennaTip.y}
                      r="40"
                      className="iso-pulse-circle"
                      style={{ animationDelay: '0s' }}
                    />
                    <circle
                      cx={pathData.antennaTip.x}
                      cy={pathData.antennaTip.y}
                      r="40"
                      className="iso-pulse-circle"
                      style={{ animationDelay: '1.2s' }}
                    />
                    <circle
                      cx={pathData.antennaTip.x}
                      cy={pathData.antennaTip.y}
                      r="40"
                      className="iso-pulse-circle"
                      style={{ animationDelay: '2.4s' }}
                    />
                  </g>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Sweeping searchlight spotlight beam representing cinema/entertainment */}
        <g style={{ transformOrigin: `${searchlightOrigin.x}px ${searchlightOrigin.y}px` }} className="searchlight-group">
          <polygon
            points={`${searchlightOrigin.x},${searchlightOrigin.y} ${searchlightOrigin.x - 140},${searchlightOrigin.y + 350} ${searchlightOrigin.x + 140},${searchlightOrigin.y + 350}`}
            fill="url(#searchlight-gradient)"
            style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}
          />
        </g>
      </svg>
    </div>
  );
}

function AboutHerrstromPage() {
  useRevealAH();
  const SiteFooter = window.SiteFooter || (() => null);

  ahUseEffect(() => {
    const video = document.querySelector('.ah-hero-video');
    if (!video) return;
    const onScroll = () => {
      video.style.transform = `translateY(${window.scrollY * 0.28}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="ah-page">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="ah-hero" data-screen-label="ABOUT HERO">
        <video
          className="ah-hero-video"
          src="uploads/about_hero_bg.mp4"
          autoPlay loop muted playsInline preload="auto" aria-hidden="true"
        />
        <div className="ah-hero-scrim" aria-hidden="true" />

        <div className="ah-hero-inner">
          <div className="ah-hero-eyebrow mono ah-hero-stagger-1" data-reveal>
            <span>(About)</span>
            <span>Pellucid Frames</span>
          </div>

          <h1 className="ah-hero-statement ah-hero-stagger-2" data-reveal>
            Where stories<br />meet <span className="ah-accent">purpose.</span>
          </h1>

          <div className="ah-hero-meta mono ah-hero-stagger-3" data-reveal>
            <span>Hong Kong — Asia &amp; beyond</span>
            <span>Video storytelling studio</span>
          </div>
        </div>
      </section>

      {/* ── Statement band 01 ──────────────────────────────── */}
      <StatementBand index="✶ Pellucid /pəˈluːsɪd/">
        Crystal clear.<br />By name, by nature.
      </StatementBand>

      {/* ── Row 01 — Meaning ───────────────────────────────── */}
      <EditorialRow index="01" label="Meaning">
        <p className="ah-lead">
          The word <span className="ah-strong">Pellucid</span> means crystal clear,
          transparent and free from distortion. It represents our belief that the most
          powerful stories are those told with honesty, precision and intention.
        </p>
        <figure className="ah-figure" data-reveal>
          <img src="uploads/about/intro_right.jpg" alt="Pellucid Frames — in the studio" />
          <figcaption className="mono">Fig.01 - The Pellucid Experience</figcaption>
        </figure>
      </EditorialRow>

      {/* ── Row 02 — What we make ──────────────────────────── */}
      <EditorialRow index="02" label="What we make">
        <p className="ah-lead">
          At Pellucid Frames, we don't simply produce videos — we create
          <span className="ah-strong"> experiences, ideas and narratives</span> that
          educate, entertain and inspire.
        </p>
        <div className="ah-services" data-reveal>
          {AH_SERVICES.map((s, i) => (
            <div key={i} className="ah-service">
              <span className="ah-service-num mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="ah-service-name">{s}</span>
              <span className="ah-service-arrow" aria-hidden="true">→</span>
            </div>
          ))}
        </div>
      </EditorialRow>

      {/* ── Row 03 — Where we work ─────────────────────────── */}
      <EditorialRow index="03" label="Where we work">
        <p className="ah-lead">
          Based in <span className="ah-strong">Hong Kong</span> and serving audiences
          across Asia and beyond, we collaborate with businesses, creators and
          organisations to develop content that creates lasting value.
        </p>
        <figure className="ah-figure" data-reveal>
          <IsometricCity />
        </figure>
      </EditorialRow>

      {/* ── Closing principle ──────────────────────────────── */}
      <section className="ah-closing">
        <div className="ah-closing-pre mono" data-reveal>Every project begins with a simple principle</div>
        <h2 className="ah-closing-big" data-reveal>
          <span className="ah-line">
            <span className="ah-word"><span className="ah-word-inner" style={{'--d':'0s'}}>Every</span></span>{' '}
            <span className="ah-word"><span className="ah-word-inner" style={{'--d':'0.08s'}}>frame</span></span>
          </span>
          <span className="ah-line">
            <span className="ah-word"><span className="ah-word-inner" style={{'--d':'0.18s'}}>earns</span></span>{' '}
            <span className="ah-word"><span className="ah-word-inner" style={{'--d':'0.26s'}}>its</span></span>{' '}
            <span className="ah-word"><span className="ah-word-inner" style={{'--d':'0.34s'}}>place.</span></span>
          </span>
        </h2>
        <a className="ah-closing-cta" href="mailto:hello@pellucidframes.com" data-reveal>
          <span>Start a project</span>
          <span className="ah-closing-cta-arrow" aria-hidden="true">→</span>
        </a>
      </section>

      <SiteFooter />
    </div>
  );
}

function AboutHerrstromApp() {
  const [depsLoaded, setDepsLoaded] = ahUseState(false);
  const [menuOpen, setMenuOpen] = ahUseState(false);

  ahUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  ahUseEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  if (!depsLoaded) return null;

  const Nav = window.Nav;
  const MenuOverlay = window.MenuOverlay;

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <AboutHerrstromPage />
    </>
  );
}

const ahRoot = document.getElementById("ah-root");
if (ahRoot) ReactDOM.createRoot(ahRoot).render(<AboutHerrstromApp />);
