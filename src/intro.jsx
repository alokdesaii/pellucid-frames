// Cinematic intro: retro film countdown 3-2-1 → hands fly in from the sides →
// center symbol loads → zoom into the symbol's square → a TV powers on out of it → hero.
const { useState, useEffect, useRef } = React;

const PF_INTRO_SEQ = [
  ["count3",   0],
  ["count2",   850],
  ["count1",  1700],
  ["hands",   2550],
  ["symbol",  3450],
  ["assembled", 4250],
  ["zoom",    4650],
  ["poweron", 5550],
  ["fade",    6450],
  ["done",    7150],
];
const PF_ORDER = PF_INTRO_SEQ.map((s) => s[0]);
const pfIdx = (p) => PF_ORDER.indexOf(p);

function Intro({ onDone }) {
  const [phase, setPhase] = useState("count3");
  const timersRef = useRef([]);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    timersRef.current.forEach(clearTimeout);
    onDone();
  };

  const skip = () => {
    if (doneRef.current) return;
    timersRef.current.forEach(clearTimeout);
    setPhase("fade");
    timersRef.current = [setTimeout(finish, 650)];
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { finish(); return; }

    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    timersRef.current = PF_INTRO_SEQ.map(([p, t]) =>
      setTimeout(() => (p === "done" ? finish() : setPhase(p)), t)
    );

    const onKey = (e) => {
      if (["Escape", " ", "Enter"].includes(e.key)) skip();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      timersRef.current.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const i = pfIdx(phase);
  const isCount = phase.startsWith("count");
  const handsIn = i >= pfIdx("hands");
  const centerIn = i >= pfIdx("symbol");
  const zoom = i >= pfIdx("zoom");
  const power = i >= pfIdx("poweron");
  const digit = { count3: "3", count2: "2", count1: "1" }[phase];

  const sideHidden = (sign) => ({ transform: `translateX(${sign}128vw)`, opacity: 1 });
  const emblemStyle = { transform: zoom ? "scale(7.2)" : "scale(1)" };
  const leftStyle = zoom
    ? { transform: "translateX(0)", opacity: 0 }
    : handsIn ? { transform: "translateX(0)", opacity: 1 } : sideHidden("-");
  const rightStyle = zoom
    ? { transform: "translateX(0)", opacity: 0 }
    : handsIn ? { transform: "translateX(0)", opacity: 1 } : sideHidden("");
  const centerStyle = centerIn
    ? { opacity: zoom ? 1 : 1, transform: "scale(1) rotate(0deg)", filter: "blur(0px)" }
    : { opacity: 0, transform: "scale(.32) rotate(-22deg)", filter: "blur(7px)" };

  return (
    <div className="intro" data-phase={phase} role="presentation">
      <div className="intro-grain" aria-hidden="true" />

      {isCount && (
        <div className="count" aria-hidden="true">
          <div className="leader">
            <span className="lead-ring" />
            <span className="lead-cross lead-cross-h" />
            <span className="lead-cross lead-cross-v" />
            <span className="lead-sweep" />
            <span key={phase} className="count-num">{digit}</span>
          </div>
        </div>
      )}

      <div className="emblem-stage" aria-hidden="true">
        <div className="emblem" style={emblemStyle}>
          <img className="ep ep-left" src="assets/logo-part-left.svg" alt="" style={leftStyle} />
          <img className="ep ep-right" src="assets/logo-part-right.svg" alt="" style={rightStyle} />
          <img className="ep ep-center" src="assets/logo-part-center.svg" alt="" style={centerStyle} />
        </div>
      </div>

      <div className="po-wrap" data-on={power ? "true" : "false"} aria-hidden="true">
        <div className="po-body">
          <div className="po-screen"><span className="po-line" /></div>
        </div>
      </div>

      <div className="intro-flash" data-on={power ? "true" : "false"} aria-hidden="true" />

      <button className="intro-skip" onClick={skip} aria-label="Skip intro">
        SKIP <span className="intro-skip-line" />
      </button>
    </div>
  );
}

Object.assign(window, { Intro });
