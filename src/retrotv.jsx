// The centerpiece: interactive 3D retro TV with channels + structure mode + parallax.
const { useState, useRef, useEffect } = React;

const PF_CHANNELS = [
  {
    key: "home", tag: "CH 00 — STANDBY", feed: "feed-home",
    title: "If it isn't clear,\nit isn't Pellucid.",
    meta: "PELLUCID FRAMES",
    video: "uploads/ch_00_standby.mp4"
  },
  {
    key: "toony", tag: "CH 01 — BLOOMY TOONY", feed: "feed-toony",
    title: "Bloomy Toony", meta: "KIDS · EDUTAINMENT",
    video: "uploads/ch_01_toony.mp4"
  },
  {
    key: "capital", tag: "CH 02 — CAPITAL SHIFTZ", feed: "feed-capital",
    title: "Capital Shiftz", meta: "FINANCE · PROPERTY",
    video: "uploads/ch_02_capital.mp4"
  },
  {
    key: "live", tag: "CH 03 — STUDIO LIVE", feed: "feed-live",
    title: "Studio Live Events", meta: "KINETIC · EXPERIENTIAL",
    video: "uploads/ch_03_live.mp4"
  },
  {
    key: "ott", tag: "CH 04 — OTT ORIGINALS", feed: "feed-ott",
    title: "OTT Originals", meta: "CINEMA · SHORT FILMS",
    video: "uploads/ch_04_ott.mp4"
  }];


function Knob({ label, angle = 0, active = false, onClick, big = false }) {
  return (
    <button onClick={onClick} className="knob-wrap" aria-label={label}>
      <span className={"knob " + (big ? "knob-big " : "") + (active ? "knob-on" : "")}>
        <span className="knob-face" style={{ transform: `rotate(${angle}deg)` }}>
          <span className="knob-notch" />
        </span>
      </span>
      <span className="knob-label">{label}</span>
    </button>);

}

function ScreenContent({ ch, structure }) {
  return (
    <div className={"crt-feed " + ch.feed}>
      {ch.video && (
        <video
          src={ch.video}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1
          }}
        />
      )}

      {ch.video && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 2,
            pointerEvents: "none"
          }}
        />
      )}

      <div className="crt-noise" style={{ zIndex: 3 }} />
      <div className="crt-vignette" style={{ zIndex: 4 }} />
      <div className="crt-scan" style={{ zIndex: 5 }} />

      {/* On-screen display */}
      <div className="osd osd-tl" style={{ zIndex: 6 }}>
        <span className="rec-dot" /> REC
      </div>
      <div className="osd osd-tr" style={{ zIndex: 6 }}>{ch.tag}</div>

      <div className="crt-center" style={{ zIndex: 6 }}>
        {ch.key === "home" ?
          <h2 className="crt-tagline" style={{ letterSpacing: "0px", fontSize: "48px", color: "rgb(253, 217, 24)", fontWeight: "900" }}>
            Pellucid Frames<br />
            <span style={{ color: "var(--paper)", fontWeight: "300", textTransform: "uppercase", letterSpacing: "5px", fontSize: "20px" }}>Content.</span>{" "}
            <span style={{ color: "var(--paper)", fontWeight: "300", textTransform: "uppercase", letterSpacing: "5px", fontSize: "20px" }}>Events.</span>{" "}
            <span style={{ color: "var(--paper)", fontWeight: "300", textTransform: "uppercase", fontSize: "20px", letterSpacing: "5px" }}>Films.</span>
          </h2> :

          <div className="crt-channel">
            <div className="crt-meta">{ch.meta}</div>
            <h2 className="crt-name">{ch.title}</h2>
          </div>
        }
      </div>

      <div className="osd osd-bl" style={{ zIndex: 6 }}>{String(PF_CHANNELS.indexOf(ch)).padStart(2, "0")} / 04</div>
      <div className="osd osd-br" style={{ zIndex: 6 }}>SIGNAL ▮▮▮▯</div>

      {/* Structural display mode overlay */}
      {structure &&
        <div className="struct" style={{ zIndex: 7 }}>
          <span className="cm cm-tl" /><span className="cm cm-tr" />
          <span className="cm cm-bl" /><span className="cm cm-br" />
          <span className="struct-h" /><span className="struct-v" />
          <span className="struct-label struct-label-t">SAFE · TITLE</span>
          <span className="struct-label struct-label-b">16 : 9 · GRID ACTIVE</span>
        </div>
      }
    </div>);

}

function RetroTV() {
  const [chIdx, setChIdx] = useState(0);
  const [structure, setStructure] = useState(false);
  const stageRef = useRef(null);

  const ch = PF_CHANNELS[chIdx];
  const next = () => setChIdx((i) => (i + 1) % PF_CHANNELS.length);
  const prev = () => setChIdx((i) => (i - 1 + PF_CHANNELS.length) % PF_CHANNELS.length);

  // Parallax tilt on mouse move.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty("--ry", `${px * 10}deg`);
      stage.style.setProperty("--rx", `${-py * 8}deg`);
    };
    const reset = () => {
      stage.style.setProperty("--ry", "0deg");
      stage.style.setProperty("--rx", "0deg");
    };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", reset);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <div className="tv-stage" ref={stageRef}>
      <div className="tv-3d">
        <div className="tv-body">
          {/* Screen */}
          <div className="tv-screen-frame">
            <div className="tv-glass" />
            <div className="tv-screen">
              <ScreenContent ch={ch} structure={structure} />
            </div>
          </div>

          {/* Control deck */}
          <div className="tv-controls">
            <div className="brand-plate">
              <span className="brand-mark" />
              <span>PELLUCID&nbsp;<b>FRAMES</b></span>
            </div>

            <div className="knob-row">
              <Knob label="STRUCT" big angle={structure ? 132 : -48}
                active={structure} onClick={() => setStructure((s) => !s)} />
              <Knob label="CHANNEL" angle={chIdx * 60 - 120} onClick={next} />
            </div>

            <div className="ch-nav">
              <button className="sq-btn" onClick={prev} aria-label="Previous channel">
                <Icon name="chevronLeft" size={16} />
              </button>
              <div className="presets">
                {PF_CHANNELS.map((c, i) =>
                  <button key={c.key} onClick={() => setChIdx(i)}
                    className={"preset " + (i === chIdx ? "preset-on" : "")}
                    aria-label={"Channel " + i}>{i}</button>
                )}
              </div>
              <button className="sq-btn" onClick={next} aria-label="Next channel">
                <Icon name="chevronRight" size={16} />
              </button>
            </div>

            <div className="grille">
              {Array.from({ length: 7 }).map((_, i) => <span key={i} />)}
            </div>
          </div>
        </div>
        <div className="tv-shadow" />
      </div>

      <p className="tv-hint">
        <Icon name="radio" size={13} className="opacity-60" />
        Turn <b>STRUCT</b> · switch <b>CHANNELS</b>
      </p>
    </div>);

}

Object.assign(window, { RetroTV, PF_CHANNELS });