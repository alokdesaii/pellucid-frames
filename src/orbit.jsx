// OrbitImages — port of the React Bits component (Dominik Koch) to this project's
// React 18 + Babel setup, with the motion/react animation re-expressed as a pure-CSS
// offset-path orbit (no extra deps). Used as the passage between the intro and the
// next section. Frames are user-fillable <image-slot>s.
const { useMemo: obUseMemo, useRef: obUseRef, useState: obUseState, useLayoutEffect: obUseLayout, useEffect: obUseEffect } = React;

function obEllipse(cx, cy, rx, ry) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function OrbitImages({
  items = [],
  baseWidth = 1400,
  radiusX = 560,
  radiusY = 150,
  rotation = -8,
  duration = 44,
  itemW = 240,
  itemH = 150,
  direction = "normal",
  showPath = false,
  pathColor = "rgba(249,239,232,0.12)",
  pathWidth = 1.5,
  centerContent,
  className = "",
}) {
  const containerRef = obUseRef(null);
  const [scale, setScale] = obUseState(null);

  const cx = baseWidth / 2;
  const cy = baseWidth / 2;
  const path = obUseMemo(() => obEllipse(cx, cy, radiusX, radiusY), [cx, cy, radiusX, radiusY]);

  obUseLayout(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [baseWidth]);

  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const total = items.length;

  return (
    <div ref={containerRef} className={`orbit-container ${className}`} aria-hidden="true">
      <div
        className="orbit-scaling"
        style={{
          width: baseWidth, height: baseWidth,
          transform: scale !== null ? `translate(-50%, -50%) scale(${scale})` : undefined,
          visibility: scale === null ? "hidden" : undefined,
        }}
      >
        <div className="orbit-rot" style={{ transform: `rotate(${rotation}deg)` }}>
          {showPath && (
            <svg className="orbit-path-svg" width="100%" height="100%" viewBox={`0 0 ${baseWidth} ${baseWidth}`}>
              <path d={path} fill="none" stroke={pathColor} strokeWidth={pathWidth / (scale ?? 1)} />
            </svg>
          )}
          {items.map((item, i) => {
            // distribute evenly; negative delay starts each frame partway along the path
            const frac = total > 1 ? i / total : 0;
            const delay = reduce ? 0 : `${(-frac * duration).toFixed(3)}s`;
            const startDist = reduce ? `${(frac * 100).toFixed(3)}%` : undefined;
            return (
              <div
                key={i}
                className="orbit-item"
                style={{
                  width: itemW, height: itemH,
                  offsetPath: `path("${path}")`,
                  animationDuration: reduce ? undefined : `${duration}s`,
                  animationDirection: direction === "reverse" ? "reverse" : "normal",
                  animationDelay: delay,
                  offsetDistance: startDist,
                }}
              >
                <div className="orbit-item-inner" style={{ transform: `rotate(${-rotation}deg)` }}>
                  {item}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {centerContent && <div className="orbit-center">{centerContent}</div>}
    </div>
  );
}

// The passage section that hosts the orbit between the intro and the next section.
const ORBIT_FRAMES = [
  { id: "orb-frame-1", label: "MOVIES", src: "uploads/orb_movies.jpg" },
  { id: "orb-frame-2", label: "OTT", src: "uploads/orb_ott.jpg" },
  { id: "orb-frame-3", label: "EVENTS", src: "uploads/orb_events.jpg" },
  { id: "orb-frame-4", label: "FINANCE", src: "uploads/orb_finance.jpg" },
  { id: "orb-frame-5", label: "SHORT FILMS", src: "uploads/orb_short_films.jpg" },
  { id: "orb-frame-6", label: "KIDS", src: "uploads/orb_kids.jpg" },
];

function OrbitPassage() {
  return (
    <section className="passage" id="passage" data-screen-label="WORK">
      <OrbitImages
        baseWidth={1400}
        radiusX={560}
        radiusY={148}
        rotation={-8}
        duration={46}
        itemW={236}
        itemH={148}
        items={ORBIT_FRAMES.map((f) => (
          <figure className="orbit-frame" key={f.id}>
            <image-slot
              id={f.id}
              src={f.src || ""}
              style={{ width: "100%", height: "100%" }}
              shape="rounded"
              radius="10"
              placeholder={f.label}
            ></image-slot>
            <figcaption className="orbit-frame-tag mono">{f.label}</figcaption>
          </figure>
        ))}
        centerContent={
          <div className="passage-center">
            <p className="passage-line">One standard,<br />every vertical.</p>
          </div>
        }
      />
    </section>
  );
}

Object.assign(window, { OrbitImages, OrbitPassage });
