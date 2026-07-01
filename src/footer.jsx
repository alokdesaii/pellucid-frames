// Site footer — scenic-image footer with link columns and a giant gradient wordmark.
function FootCol({ title, children }) {
  return (
    <div className="sf-col">
      <h4 className="sf-col-title">{title}</h4>
      <div className="sf-col-links">{children}</div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer" data-screen-label="FOOTER">
      <video
        className="sf-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4"
      ></video>
      <div className="sf-scrim" aria-hidden="true" />

      <div className="sf-inner">
        <div className="sf-top">
          <a href="/#top" className="sf-logo" aria-label="Pellucid Frames">
            <img src="assets/logo-symbol-white.svg" alt="Pellucid Frames" />
          </a>
          <span className="sf-tagline mono">CRAFT SLOW. SHIP SHARP.</span>
        </div>

        <div className="sf-cols">
          <FootCol title="NAVIGATE">
            <a href="/#top">Home</a>
            <a href="/about.html">About Pellucid Frames</a>
            <a href="/#passage">Why Pellucid</a>
            <a href="/#passage">Who We Work With</a>
            <a href="/#passage">Our Work</a>
            <a href="/#passage">Looking Ahead</a>
            <a href="/#contact">Contact</a>
          </FootCol>

          <FootCol title="WHAT WE CREATE">
            <a href="/#passage">Original Productions</a>
            <a href="/#passage">Brand & Commercial Content</a>
            <a href="/#passage">Corporate Storytelling</a>
            <a href="/#passage">Digital Media</a>
            <a href="/#passage">Live Experiences</a>
            <a href="/#passage">Creative Strategy</a>
          </FootCol>

          <FootCol title="MEDIA KIT / PRESS CENTRE">
            <a href="/#passage">Brands Overview</a>
            <a href="/#passage" className="sf-sublink">Pellucid Frames</a>
            <a href="#"        className="sf-sublink">CapitalShiftz</a>
            <a href="#"        className="sf-sublink">Bloomy Toony</a>
          </FootCol>

          <FootCol title="OUR YOUTUBE CHANNELS">
            <a href="#">CapitalShiftz</a>
            <a href="#">Bloomy Toony</a>
            <div className="flex gap-3 mt-4 border-t border-white/5 pt-4">
              <a href="#" target="_blank" rel="noopener" aria-label="Instagram" className="text-xs opacity-60 hover:opacity-100 transition-opacity">Instagram</a>
              <a href="#" target="_blank" rel="noopener" aria-label="LinkedIn" className="text-xs opacity-60 hover:opacity-100 transition-opacity">LinkedIn</a>
            </div>
          </FootCol>
        </div>

        <div className="sf-policies-container">
          <div className="sf-policies-title">Legal & Corporate Policies</div>
          <div className="sf-policies-grid">
            <a href="#">Privacy Policy</a>
            <a href="#">Disclaimer</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Copyright Notice</a>
            <a href="#">Corporate Social Responsibility (CSR) Policy</a>
            <a href="#">Copyright & Intellectual Property Policy</a>
            <a href="#">Accessibility Statement</a>
            <a href="#">Editorial Standards & Code of Ethics</a>
            <a href="#">Cookie Policy</a>
            <a href="#">Environmental Sustainability Policy</a>
            <a href="#">Modern Slavery & Human Rights Statement</a>
            <a href="#">Supplier Code of Conduct</a>
            <a href="#">Whistleblowing Policy</a>
            <a href="#">AI Usage & Responsible Innovation Policy</a>
          </div>
        </div>
      </div>

      <div className="sf-legal">
        <span>© {new Date().getFullYear()} PELLUCID FRAMES</span>
        <span>ALL RIGHTS RESERVED</span>
      </div>
    </footer>
  );
}

Object.assign(window, { SiteFooter });
