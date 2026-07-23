// Contact — split layout with a 3-step enquiry form (Enerblock-style, our
// palette). On submit it fetches a reCAPTCHA v3 token and POSTs the form fields
// + token as JSON to the backend API (built + hosted by IT), matching the
// house pattern used on birchford.com. Success is { isSuccess: true }.
const { useState: ctUseState, useEffect: ctUseEffect } = React;

const CT_EMAIL = "hello@pellucidframes.com";

// Flip to true once the social profiles are live to show the "Elsewhere" links.
const CT_SHOW_SOCIALS = true;

const CT_PROJECT_TYPES = [
  "Original Film", "Documentary", "Brand Campaign", "Corporate Storytelling",
  "Financial Media", "Children's Entertainment", "Digital Content",
  "Live Production", "Something else",
];
const CT_BUDGETS = ["Under $10k", "$10k – $25k", "$25k – $50k", "$50k – $100k", "$100k+", "Not sure yet"];
const CT_TIMELINES = ["As soon as possible", "1 – 3 months", "3 – 6 months", "6+ months", "Flexible / exploring"];

const CT_STEP_NAMES = ["Your details", "The project", "Your story"];

const CT_EMPTY = {
  name: "", email: "", phone: "", company: "",
  projectType: "", budget: "", timeline: "",
  message: "", referral: "",
  website: "", // honeypot — must stay empty; bots fill it
};

// ── Backend config ──────────────────────────────────────────────────────────
// ── Backend config ──────────────────────────────────────────────────────────
// Endpoints that receive the enquiry (tries Vercel /api/contact function first, then local/PHP contact.php).
const CT_ENDPOINTS = ["api/contact", "contact.php"];
// reCAPTCHA v3 site key from IT (public — the secret stays server-side). Leave
// "" to skip reCAPTCHA (e.g. local testing); the token is then sent empty.
const CT_RECAPTCHA_SITE_KEY = "";
const CT_RECAPTCHA_ACTION = "contact_form_submit";
// ─────────────────────────────────────────────────────────────────────────────

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Lazy-load Google reCAPTCHA v3 once (only if a site key is configured).
let ctRecaptchaPromise = null;
function ctLoadRecaptcha() {
  if (!CT_RECAPTCHA_SITE_KEY) return Promise.resolve(null);
  if (ctRecaptchaPromise) return ctRecaptchaPromise;
  ctRecaptchaPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${CT_RECAPTCHA_SITE_KEY}`;
    s.async = true;
    s.onload = () => resolve(window.grecaptcha || null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return ctRecaptchaPromise;
}

// Returns a fresh reCAPTCHA token, or "" if reCAPTCHA isn't configured/available.
async function ctRecaptchaToken() {
  const g = await ctLoadRecaptcha();
  if (!g) return "";
  try {
    await new Promise((r) => g.ready(r));
    return await g.execute(CT_RECAPTCHA_SITE_KEY, { action: CT_RECAPTCHA_ACTION });
  } catch {
    return "";
  }
}

function ContactForm() {
  const [step, setStep] = ctUseState(0);
  const [f, setF] = ctUseState(CT_EMPTY);
  const [errs, setErrs] = ctUseState({});
  const [done, setDone] = ctUseState(false);
  const [sending, setSending] = ctUseState(false);
  const [sendError, setSendError] = ctUseState(false);

  // Preload reCAPTCHA (no-op if no site key configured) so a token is ready fast.
  ctUseEffect(() => { ctLoadRecaptcha(); }, []);

  const set = (k) => (e) => {
    setF((prev) => ({ ...prev, [k]: e.target.value }));
    if (errs[k]) setErrs((prev) => ({ ...prev, [k]: undefined }));
  };

  // required fields per step; email also format-checked
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!f.name.trim()) e.name = "Please add your name";
      if (!f.email.trim()) e.email = "Please add your email";
      else if (!emailOk(f.email)) e.email = "That email looks off";
    } else if (step === 1) {
      if (!f.projectType) e.projectType = "Pick a project type";
    } else if (step === 2) {
      if (!f.message.trim()) e.message = "Tell us a little about it";
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, 2)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submitEnquiry = async () => {
    if (!validate() || sending) return;
    // Honeypot — a filled hidden field means a bot; pretend success, send nothing.
    if (f.website) { setDone(true); return; }
    setSending(true);
    setSendError(false);
    try {
      const recaptchaToken = await ctRecaptchaToken();
      // Send the form fields (minus the honeypot) + token, matching the API contract.
      const { website, ...fields } = f;
      const payload = JSON.stringify({ ...fields, recaptchaToken });

      let success = false;
      for (const endpoint of CT_ENDPOINTS) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
          });
          if (res.status === 404 || res.status === 405) continue;
          const data = await res.json().catch(() => ({}));
          if (res.ok && (data.isSuccess || data.ok)) {
            success = true;
            break;
          }
        } catch {
          // Continue to next endpoint if request fails
        }
      }

      if (success) {
        setDone(true);
      } else {
        throw new Error("send failed");
      }
    } catch (err) {
      // Show an inline error and let the user retry
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    // Enter advances (except inside the multiline message)
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      step < 2 ? next() : submitEnquiry();
    }
  };

  const field = (k, label, placeholder, { req, type = "text" } = {}) => (
    <label className={"ct-field" + (errs[k] ? " ct-err" : "")}>
      <span className="ct-label">{label}{req && <span className="req"> *</span>}</span>
      <input className="ct-control" type={type} value={f[k]} onChange={set(k)}
        placeholder={placeholder} autoComplete={k === "name" ? "name" : k} />
    </label>
  );

  const select = (k, label, placeholder, opts, { req } = {}) => (
    <label className={"ct-field" + (errs[k] ? " ct-err" : "")}>
      <span className="ct-label">{label}{req && <span className="req"> *</span>}</span>
      <select className="ct-control" value={f[k]} onChange={set(k)} required={req}>
        <option value="" disabled hidden>{placeholder}</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  if (done) {
    return (
      <div className="ct-done">
        <h2 className="ct-done-h">Thanks — we've <span className="ct-accent">received your message.</span></h2>
        <p>
          Our team will review your enquiry and get back to you shortly. If you'd like to
          reach us directly in the meantime, write to <a href={`mailto:${CT_EMAIL}`} style={{ color: "var(--volt)" }}>{CT_EMAIL}</a>.
        </p>
      </div>
    );
  }

  const stepErr = errs.name || errs.email || errs.projectType || errs.message;

  return (
    <div onKeyDown={onKeyDown}>
      {/* Honeypot — hidden from users; bots that fill it get silently dropped. */}
      <input type="text" name="website" tabIndex="-1" autoComplete="off"
        value={f.website} onChange={set("website")} aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }} />

      <div className="ct-stepline mono">
        <span><b>{String(step + 1).padStart(2, "0")}</b> / 03</span>
        <span className="ct-step-name">{CT_STEP_NAMES[step]}</span>
      </div>

      {step === 0 && (
        <div className="ct-fields">
          {field("name", "Full name", "Your full name", { req: true })}
          {field("email", "Email", "you@company.com", { req: true, type: "email" })}
          {field("phone", "Phone", "Optional", { type: "tel" })}
          {field("company", "Company / Organization", "Optional")}
        </div>
      )}

      {step === 1 && (
        <div className="ct-fields">
          {select("projectType", "Project type", "Select one", CT_PROJECT_TYPES, { req: true })}
          {select("budget", "Budget", "Select a range", CT_BUDGETS)}
          {select("timeline", "Timeline", "When do you need it?", CT_TIMELINES)}
        </div>
      )}

      {step === 2 && (
        <div className="ct-fields">
          <label className={"ct-field ct-field-top" + (errs.message ? " ct-err" : "")}>
            <span className="ct-label">About the project<span className="req"> *</span></span>
            <textarea className="ct-control" rows="4" value={f.message} onChange={set("message")}
              placeholder="What are you making, and what would success look like?" />
          </label>
          {field("referral", "How did you hear about us?", "Optional")}
        </div>
      )}

      {stepErr && <div className="ct-err-msg">{stepErr}</div>}
      {sendError && (
        <div className="ct-err-msg">
          Something went wrong sending your enquiry. Please try again, or email us
          directly at <span style={{ color: "var(--volt)" }}>{CT_EMAIL}</span>.
        </div>
      )}

      <div className="ct-actions">
        {step > 0 && (
          <button type="button" className="ct-btn ct-btn--ghost" onClick={back}>
            <span className="ct-arrow" aria-hidden="true">→</span>
            <span>Back</span>
          </button>
        )}
        {step < 2 ? (
          <button type="button" className="ct-btn" onClick={next}>
            <span>Next</span>
            <span className="ct-arrow" aria-hidden="true">→</span>
          </button>
        ) : (
          <button type="button" className="ct-btn ct-btn--primary" onClick={submitEnquiry} disabled={sending}>
            <span>{sending ? "Sending…" : "Send enquiry"}</span>
            <span className="ct-arrow" aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

function ContactApp() {
  const [menuOpen, setMenuOpen] = ctUseState(false);
  const [depsLoaded, setDepsLoaded] = ctUseState(false);

  ctUseEffect(() => {
    const checkDeps = () => {
      if (window.Nav && window.MenuOverlay && window.SiteFooter) setDepsLoaded(true);
      else setTimeout(checkDeps, 50);
    };
    checkDeps();
  }, []);

  ctUseEffect(() => {
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
      <main className="ct-wrap">
        <section className="ct-col ct-left">
          <h1 className="ct-title">Contact</h1>
          <p className="ct-lead">Tell us about your project and we'll guide you to the right approach.</p>
          <div className="ct-info">
            <div className="ct-info-block">
              <span className="ct-info-label">Email</span>
              <a href={`mailto:${CT_EMAIL}`}>{CT_EMAIL}</a>
            </div>
            <div className="ct-info-block">
              <span className="ct-info-label">Studio</span>
              <span>Hong Kong — Asia &amp; beyond</span>
            </div>
            {CT_SHOW_SOCIALS && (
              <div className="ct-info-block">
                <span className="ct-info-label">Elsewhere</span>
                <div className="ct-socials">
                  <a href="https://www.instagram.com/pellucid_frames/" target="_blank" rel="noopener">Instagram</a>
                  <a href="https://www.facebook.com/profile.php?id=61591650788062" target="_blank" rel="noopener">Facebook</a>
                  <a href="https://www.linkedin.com/company/pellucid-frames/" target="_blank" rel="noopener">LinkedIn</a>
                </div>
              </div>
            )}
          </div>
        </section>
        <section className="ct-col ct-right">
          <ContactForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const ctRoot = document.getElementById("ct-root");
if (ctRoot) ReactDOM.createRoot(ctRoot).render(<ContactApp />);
