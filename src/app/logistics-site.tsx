"use client";

import { useState } from "react";
import {
  ArrowUpRight, Menu, Moon, Sun, X, Zap, ShieldCheck, Sparkles, Store, ShoppingBag, Phone, MapPin, Plus, Minus,
} from "lucide-react";
import { INSTAGRAM, PHONE, PHONE_LINK, TIKTOK, naira, whatsappUrl, ZONE_NAME, ZONE_RATE } from "@/lib/logistics";
import { Brand, InstagramIcon, Logo, TikTokIcon, WhatsAppIcon } from "./brand";
import { Copilot } from "./copilot";
import { DeliveryDialog, type DeliveryDialogState } from "./delivery-dialog";

const navigation = [
  { id: "services", label: "Services" },
  { id: "how-it-works", label: "How it works" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQs" },
  { id: "share", label: "Scan & share" },
];

const questions = [
  { question: "Where do you deliver?", answer: "We handle local deliveries within Asaba and Okpanam, Delta State, including trips between the two. If you’re not sure about an address, share a nearby landmark with us on WhatsApp." },
  { question: "How much does a delivery cost?", answer: "Standard deliveries start at ₦1,500 within Asaba and ₦2,000 for trips in or to Okpanam. We’ll confirm your total before dispatch. Parcel size, distance and extra stops may affect the final rate." },
  { question: "How quickly can you pick up my parcel?", answer: "We offer same-day dispatch, subject to rider availability and when you book. If you have a deadline, mention it when you book or call us before sending your request." },
  { question: "How do I track my package?", answer: "Select ‘Track a package’ and enter the Mamaree reference from your booking confirmation. You’ll see the latest status shared by our dispatch team." },
  { question: "Can I arrange regular deliveries for my business?", answer: "Yes. Send us a business enquiry with what you deliver, how often you send orders, and where they need to go. We’ll discuss a pickup arrangement that suits your business." },
  { question: "What can I send with a rider?", answer: "We handle documents, retail orders, prepared food and other securely packed items that fit in a dispatch box. Please check with us first about bulky or fragile items. We don’t carry illegal or hazardous goods." },
];

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("mamaree-theme", next); } catch { /* storage unavailable */ }
}

function downloadQr() {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1200;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, 1200, 1200);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "mamaree-logistics-qr.png";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  };
  image.src = "/assets/qr.svg";
}

export function LogisticsSite() {
  const [flow, setFlow] = useState<DeliveryDialogState | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const copilotRequest: { text: string; nonce: number } | null = null;

  function openFlow(next: DeliveryDialogState) {
    setMenuOpen(false);
    setFlow(next);
  }

  return (
    <>
      <a className="skip" href="#main-content">Skip to content</a>
      <div className="topbar">
        <div className="wrap topbar-in">
          <span><MapPin /> Serving Asaba &amp; Okpanam, Delta State</span>
          <span className="topbar-links">
            <a href={PHONE_LINK}><Phone /> {PHONE}</a>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer"><WhatsAppIcon /> WhatsApp</a>
          </span>
        </div>
      </div>

      <header className="header">
        <div className="wrap nav">
          <Brand />
          <nav className="links" aria-label="Main navigation">
            {navigation.map(({ id, label }) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <div className="nav-right">
            <button className="icon-btn" type="button" onClick={toggleTheme} aria-label="Toggle light or dark mode" title="Toggle light / dark">
              <Moon className="i-moon" /><Sun className="i-sun" />
            </button>
            <button className="btn btn-gold nav-cta" type="button" onClick={() => openFlow({ kind: "book" })}>Book a delivery</button>
            <button className="icon-btn menu-btn" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mobile" id="mobile-menu" aria-label="Mobile navigation">
            {navigation.map(({ id, label }) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
            <button className="btn btn-outline" type="button" onClick={() => openFlow({ kind: "track" })}>Track a package</button>
            <button className="btn btn-gold" type="button" onClick={() => openFlow({ kind: "book" })}>Book a delivery</button>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section className="hero" id="home">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Delta State’s local dispatch</span>
              <h1>Fast delivery.<br /><em>Closer to home.</em></h1>
              <p className="lead">From personal parcels to daily business orders, we make deliveries simple across <strong>Asaba &amp; Okpanam.</strong></p>
              <div className="hero-actions">
                <button className="btn btn-gold" type="button" onClick={() => openFlow({ kind: "book" })}>Book a delivery <ArrowUpRight /></button>
                <button className="btn btn-outline" type="button" onClick={() => openFlow({ kind: "track" })}>Track a package</button>
              </div>
              <ul className="perks">
                <li><Zap /> Same-day dispatch</li>
                <li><ShieldCheck /> Handled with care</li>
                <li><Sparkles /> 24/7 AI Co-pilot</li>
              </ul>
            </div>
            <div className="hero-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero.jpg" alt="A Mamaree dispatch rider on a motorcycle with a delivery box" width={280} height={368} />
              <div className="hero-chip"><span className="chip-dot" /><div><small>Local coverage</small><strong>Asaba → Okpanam</strong></div></div>
            </div>
          </div>
        </section>

        <section className="rates" aria-label="Starting rates">
          <div className="wrap rates-in">
            <div><span className="eyebrow">Starting fares</span><strong className="rates-title">Local delivery rates</strong></div>
            <div className="rate"><span>Within Asaba</span><strong>{naira(ZONE_RATE.asaba)}</strong></div>
            <div className="rate"><span>Okpanam</span><strong>{naira(ZONE_RATE.okpanam)}</strong></div>
            <a className="rate-link" href="#pricing">See pricing →</a>
          </div>
        </section>

        <section className="section" id="services">
          <div className="wrap">
            <div className="head split">
              <div><span className="eyebrow">What we do</span><h2>You send it. We move it.</h2></div>
              <p>From a single parcel to orders going out every day, get a local dispatch service that fits what you’re sending.</p>
            </div>
            <div className="cards3">
              <article className="card">
                <div className="card-photo">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/images/same-day.jpg" alt="A courier handing over a parcel at a local address" width={258} height={102} /><span className="num">01</span></div>
                <div className="card-body"><span className="ico"><Zap /></span><h3>Same-day delivery</h3><p>Get documents, gifts and everyday parcels across town. We’ll pick them up and bring them straight to the door.</p>
                  <button className="link" type="button" onClick={() => openFlow({ kind: "book", service: "same-day" })}>Book same-day delivery →</button></div>
              </article>
              <article className="card">
                <div className="card-photo">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/images/business.jpg" alt="A local business owner packing customer orders for dispatch" width={258} height={102} /><span className="num">02</span></div>
                <div className="card-body"><span className="ico"><Store /></span><h3>Business dispatch</h3><p>Keep orders moving for your online shop, food business or store, whether it’s an occasional order or daily pickups.</p>
                  <button className="link" type="button" onClick={() => openFlow({ kind: "business" })}>Enquire for your business →</button></div>
              </article>
              <article className="card">
                <div className="card-photo">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/images/errands.jpg" alt="A rider collecting a paper bag for a local errand" width={258} height={102} /><span className="num">03</span></div>
                <div className="card-body"><span className="ico"><ShoppingBag /></span><h3>Pickups &amp; errands</h3><p>Need to pick something up across town? Send us the details and let a local rider make the trip for you.</p>
                  <button className="link" type="button" onClick={() => openFlow({ kind: "book", service: "errands" })}>Request a pickup →</button></div>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="on-the-road">
          <div className="wrap road">
            <div className="road-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/rider.jpg" alt="A Mamaree Logistics rider in a branded helmet on a motorbike with a branded delivery box" width={500} height={900} loading="lazy" />
            </div>
            <div className="road-copy">
              <span className="eyebrow">On the road</span>
              <h2>Real riders. <em>Real deliveries.</em></h2>
              <p className="lead">Branded riders, branded boxes and a team that knows Asaba and Okpanam. Watch us at work.</p>
              <video className="road-video" controls playsInline muted loop preload="metadata" poster="/media/poster.jpg">
                <source src="/media/mamaree-ride.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <section className="section alt" id="how-it-works">
          <div className="wrap how">
            <div>
              <span className="eyebrow">How it works</span><h2>From your door in three steps.</h2>
              <ol className="steps">
                <li><span className="step-n">1</span><div><h3>Tell us where to go</h3><p>Share your pickup and drop-off addresses and what you’re sending.</p></div></li>
                <li><span className="step-n">2</span><div><h3>We arrange a rider</h3><p>We confirm your rate and rider availability, then collect your parcel.</p></div></li>
                <li><span className="step-n">3</span><div><h3>Follow your delivery</h3><p>Use your booking reference to check when your parcel is picked up and delivered.</p></div></li>
              </ol>
              <button className="link process-link" type="button" onClick={() => openFlow({ kind: "book" })}>Start a delivery →</button>
            </div>
            <figure className="map">
              <svg viewBox="0 0 520 380" role="img" aria-label="Illustrated route between Okpanam and Asaba">
                <rect width="520" height="380" rx="22" fill="var(--panel-2)" />
                <g stroke="var(--line-2)" strokeWidth="1"><path d="M0 95h520M0 190h520M0 285h520M130 0v380M260 0v380M390 0v380" /></g>
                <path d="M40 110 C 130 60, 190 190, 270 180 S 400 270, 480 290" fill="none" stroke="var(--line-2)" strokeWidth="14" strokeLinecap="round" />
                <path d="M60 112 C 135 70, 190 188, 270 180 S 395 262, 462 280" fill="none" stroke="var(--gold)" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 10" />
                <g transform="translate(60 112)"><circle r="14" fill="var(--navy)" /><circle r="5" fill="var(--gold)" /></g>
                <g transform="translate(462 280)"><circle r="14" fill="var(--gold)" /><circle r="5" fill="var(--navy)" /></g>
                <text x="60" y="146" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="13" fontWeight="600" fill="var(--ink)">Okpanam</text>
                <text x="462" y="316" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="13" fontWeight="600" fill="var(--ink)">Asaba</text>
              </svg>
              <figcaption><strong>Asaba &amp; Okpanam</strong><small>Our local coverage in Delta State</small></figcaption>
            </figure>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="wrap">
            <div className="head center"><span className="eyebrow">Delivery pricing</span><h2>Know your fare before we go.</h2><p>Check the starting rate for your route. We confirm the final price before your rider is dispatched.</p></div>
            <div className="fares">
              {(["asaba", "okpanam"] as const).map((zone) => (
                <article className={`fare ${zone === "okpanam" ? "featured" : ""}`} key={zone}>
                  <h3>{ZONE_NAME[zone]}</h3>
                  <div className="price"><span>FROM</span><strong>{naira(ZONE_RATE[zone])}</strong></div>
                  <p>{zone === "asaba" ? "For pickups and drop-offs within Asaba." : "For local routes that include Okpanam."}</p>
                  <ul><li>Standard parcels and orders</li><li>Door-to-door pickup and drop-off</li></ul>
                  <button className={`btn ${zone === "okpanam" ? "btn-gold" : "btn-outline"}`} type="button" onClick={() => openFlow({ kind: "book", pickup: "asaba", dropoff: zone })}>Book {ZONE_NAME[zone]} delivery →</button>
                </article>
              ))}
            </div>
            <p className="foot">Sending several parcels or making extra stops? <a href={whatsappUrl("Hello Mamaree Logistics, I’d like a quote for a local delivery.")} target="_blank" rel="noreferrer">Ask us for a quote →</a></p>
          </div>
        </section>

        <section className="wrap" id="business">
          <div className="banner">
            <div>
              <span className="eyebrow gold">For local businesses</span>
              <h2>You make the sales.<br /><em>We handle the deliveries.</em></h2>
              <p>Give your customers a dependable delivery option. Let’s set up pickups that work for the way you sell.</p>
              <button className="btn btn-gold" type="button" onClick={() => openFlow({ kind: "business" })}>Talk business deliveries →</button>
            </div>
            <Logo className="mlogo--inv banner-logo" />
          </div>
        </section>

        <section className="section" id="share">
          <div className="wrap share">
            <div className="qr-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/qr.svg" alt="QR code linking to the Mamaree Logistics website" width={220} height={220} />
              <small>Scan to open the site</small>
            </div>
            <div>
              <span className="eyebrow">Scan &amp; share</span><h2>Point a camera. Book a rider.</h2>
              <p className="lead">Print this QR code on flyers, receipts, dispatch boxes or your shop window. One scan takes customers straight to this website.</p>
              <button className="btn btn-outline" type="button" onClick={downloadQr}>Download QR code</button>
            </div>
          </div>
        </section>

        <section className="section alt" id="faq">
          <div className="wrap faq">
            <div>
              <span className="eyebrow">Quick answers</span><h2>Good to know.</h2>
              <p>Can’t find what you need? Ask our Co-pilot or message us on WhatsApp.</p>
              <a className="btn btn-outline" href={whatsappUrl()} target="_blank" rel="noreferrer"><WhatsAppIcon /> Chat on WhatsApp <ArrowUpRight /></a>
            </div>
            <div className="faqs">
              {questions.map(({ question, answer }, index) => (
                <details name="delivery-faq" key={question} open={index === 0 ? true : undefined}>
                  <summary>{question}<span className="faq-toggle"><Plus className="faq-plus" /><Minus className="faq-minus" /></span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div className="wrap fgrid">
          <div><Logo className="mlogo--inv logo-foot" /><p>Your local dispatch partner in Asaba and Okpanam, Delta State, Nigeria.</p></div>
          <div><h4>Explore</h4><a href="#services">Our services</a><a href="#how-it-works">How it works</a><a href="#pricing">Delivery pricing</a><a href="#faq">FAQs</a></div>
          <div><h4>Send with us</h4>
            <button type="button" onClick={() => openFlow({ kind: "book" })}>Book a delivery</button>
            <button type="button" onClick={() => openFlow({ kind: "track" })}>Track a package</button>
            <button type="button" onClick={() => openFlow({ kind: "business" })}>Business enquiries</button>
          </div>
          <div><h4>Get in touch</h4>
            <a href={PHONE_LINK}>{PHONE}</a>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer">WhatsApp us ↗</a>
            <div className="social-links">
              <a href={INSTAGRAM} target="_blank" rel="noreferrer" aria-label="Mamaree Logistics on Instagram"><InstagramIcon /></a>
              <a href={TIKTOK} target="_blank" rel="noreferrer" aria-label="Mamaree Logistics on TikTok"><TikTokIcon /></a>
            </div>
          </div>
        </div>
        <div className="wrap fbottom">
          <small>© {new Date().getFullYear()} Mamaree Logistics.</small>
          <span><MapPin /> Asaba &amp; Okpanam, Delta State</span>
          <span className="footer-meta"><a href="/privacy">Privacy notice</a><a href="/dispatch">Dispatch desk ↗</a></span>
        </div>
      </footer>

      <Copilot
        request={copilotRequest}
        onBook={(pickup, dropoff) => openFlow({ kind: "book", pickup, dropoff })}
        onTrack={(reference) => openFlow({ kind: "track", reference })}
        onBusiness={() => openFlow({ kind: "business" })}
      />
      {flow && <DeliveryDialog state={flow} onClose={() => setFlow(null)} onChange={setFlow} />}
    </>
  );
}
