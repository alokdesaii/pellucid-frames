// Homepage "Our Channels" band — two brand cards linking out to the YouTube
// channels. Copy mirrors the dedicated capital-shiftz / bloomy-toony pages.
const CHANNELS = [
  {
    key: "capital-shiftz",
    name: "Capital Shiftz",
    logo: "assets/logo-capital-shiftz.svg",
    tag: "FINANCE · MARKETS · INVESTING",
    desc: "Clear, visual explanations of what actually moved the markets — and why. No hot takes, no doom-scrolling.",
    url: "https://www.youtube.com/@CapitalShiftz",
    page: "/capital-shiftz.html",
  },
  {
    key: "bloomy-toony",
    name: "Bloomy Toony",
    logo: "assets/logo-bloomy-toony.svg",
    tag: "KIDS · ANIMATION · ORIGINAL MUSIC",
    desc: "Hand-crafted animated stories with characters kids come back to — made to be watched again and again.",
    url: "https://www.youtube.com/@BloomyToony",
    page: "/bloomy-toony.html",
  },
];

function Channels() {
  return (
    <section className="channels" id="channels" data-screen-label="CHANNELS">
      <div className="channels-inner">
        <div className="channels-head">
          <div className="channels-eyebrow mono">
            <span>Pellucid Frames</span>
            <span>Our YouTube Channels</span>
          </div>
          <h2 className="channels-title">Two channels, one standard.</h2>
        </div>

        <div className="channels-grid">
          {CHANNELS.map((c) => (
            <article className="channel-card" key={c.key}>
              {/* Logo omitted until the agency delivers proper vector marks. */}
              <div className="channel-body">
                <span className="channel-tag mono">{c.tag}</span>
                <h3 className="channel-name">{c.name}</h3>
                <p className="channel-desc">{c.desc}</p>
              </div>
              <a className="channel-btn" href={c.url} target="_blank" rel="noopener">
                <span>Watch on YouTube</span>
                <span className="channel-arrow" aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
