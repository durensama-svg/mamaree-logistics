"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import {
  dispatchTime, naira, routeRate, STATUS_NAME, STATUS_NOTE, whatsappUrl, ZONE_NAME,
  type TrackingSnapshot, type Zone,
} from "@/lib/logistics";

type Message = { id: number; who: "bot" | "me"; content: ReactNode };

type CopilotProps = {
  onBook: (pickup?: Zone, dropoff?: Zone) => void;
  onTrack: (reference?: string) => void;
  onBusiness: () => void;
  /** Lets the page open the assistant with a ready-made question (e.g. "Track a package"). */
  request: { text: string; nonce: number } | null;
};

const REFERENCE = /MMR[-\s]?([A-HJ-NP-Z2-9]{5})[-\s]?([A-HJ-NP-Z2-9]{5})/i;
const START_CHIPS = ["Get a price quote", "Track my package", "Where do you deliver?", "Business deliveries"];

function zoneIn(text: string): Zone[] {
  return (text.match(/asaba|okpanam/g) ?? []) as Zone[];
}

export function Copilot({ onBook, onTrack, onBusiness, request }: CopilotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chips, setChips] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [step, setStep] = useState<null | "pickup" | "drop">(null);
  const [pickup, setPickup] = useState<Zone | null>(null);
  const idRef = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const greeted = useRef(false);
  const handled = useRef(0);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [messages]);

  function push(who: Message["who"], content: ReactNode) {
    const id = ++idRef.current;
    setMessages((list) => [...list, { id, who, content }]);
    return id;
  }
  function replace(id: number, content: ReactNode) {
    setMessages((list) => list.map((message) => (message.id === id ? { ...message, content } : message)));
  }

  function greet() {
    if (greeted.current) return;
    greeted.current = true;
    push("bot", "Hi, I’m the Mamaree Co-pilot 👋 I can quote your delivery, check a tracking reference, answer questions about areas and timing, and pass you to our dispatch team. What do you need?");
    setChips(START_CHIPS);
  }

  function openPanel() {
    setOpen(true);
    greet();
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const link = (text: string, label: string) => (
    <a href={whatsappUrl(text)} target="_blank" rel="noreferrer">{label}</a>
  );

  function quoteReply(from: Zone, to: Zone): ReactNode {
    const rate = routeRate(from, to);
    setChips(["Get a price quote", "Track my package"]);
    return (
      <>
        {ZONE_NAME[from]} → {ZONE_NAME[to]}: starts from <b>{naira(rate)}</b> for a standard parcel. Extra stops, size or distance can change the final rate; dispatch confirms before sending a rider.
        <br /><br />
        <button type="button" className="link" onClick={() => onBook(from, to)}>Book this delivery →</button>
      </>
    );
  }

  function trackReply(reference: string, id: number) {
    fetch(`/api/deliveries?reference=${encodeURIComponent(reference)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as (TrackingSnapshot & { error?: string }) | null;
        if (!response.ok || !data || data.error) throw new Error(data?.error ?? "Tracking is unavailable right now.");
        replace(id, (
          <>
            <b>{data.reference}</b>: {STATUS_NAME[data.status]}.<br />
            {STATUS_NOTE[data.status]}<br />
            <small>{ZONE_NAME[data.pickupZone]} → {ZONE_NAME[data.dropoffZone]} · updated {dispatchTime(data.updatedAt)}</small>
            <br /><br />
            <button type="button" className="link" onClick={() => onTrack(data.reference)}>See the full timeline →</button>
          </>
        ));
      })
      .catch((error: unknown) => {
        replace(id, (error instanceof Error ? error.message : "Tracking is unavailable right now.") + " You can also message dispatch on WhatsApp.");
      });
  }

  function answer(question: string): ReactNode | null {
    const text = question.toLowerCase().trim();

    if (step) {
      const zone = /okpanam/.test(text) ? "okpanam" : /asaba/.test(text) ? "asaba" : null;
      if (!zone) { setChips(["Asaba", "Okpanam"]); return "Please pick one of our areas: Asaba or Okpanam."; }
      if (step === "pickup") {
        setPickup(zone); setStep("drop"); setChips(["Asaba", "Okpanam"]);
        return <>Got it. And where is it going: <b>Asaba</b> or <b>Okpanam</b>?</>;
      }
      const from = pickup ?? "asaba";
      setStep(null); setPickup(null);
      return quoteReply(from, zone);
    }

    if (/quote|price|cost|how much|fare|rate|charge|₦|naira/.test(text)) {
      const zones = zoneIn(text);
      if (zones.length >= 2) return quoteReply(zones[0], zones[1]);
      setStep("pickup"); setChips(["Asaba", "Okpanam"]);
      return <>Sure, let’s price it. Where is the <b>pickup</b>: Asaba or Okpanam?</>;
    }

    if (/track|where is my|status|reference|parcel status/.test(text)) {
      setChips(["Get a price quote", "Where do you deliver?"]);
      return (
        <>
          Paste your tracking reference (it looks like <b>MMR-7M2KD-8H4NX</b>) and I’ll check it now. Or{" "}
          <button type="button" className="link" onClick={() => onTrack()}>open the tracking page →</button>
        </>
      );
    }
    if (/where|area|deliver to|cover|location|asaba|okpanam|town/.test(text)) {
      return <>We run local deliveries within <b>Asaba</b> and <b>Okpanam</b>, Delta State, including trips between the two. Not sure about an address? Share a nearby landmark and dispatch will confirm.</>;
    }
    if (/business|shop|vendor|store|regular|daily|bulk|contract|restaurant/.test(text)) {
      return (
        <>
          Yes, we handle regular pickups for online shops, restaurants and stores. Tell us what you send, how often, and where it goes.
          <br /><br />
          <button type="button" className="link" onClick={onBusiness}>Send a business enquiry →</button>
        </>
      );
    }
    if (/how long|fast|quick|time|same.?day|when|speed|hours|open/.test(text)) {
      return <>We offer <b>same-day dispatch</b>, subject to rider availability and when you book. If you have a deadline, mention it when you book so dispatch can plan around it.</>;
    }
    if (/send|carry|allowed|item|fragile|food|document|illegal|size|weight/.test(text)) {
      return "Riders carry documents, retail orders, prepared food and other securely packed items that fit in a dispatch box. Please check with us first about bulky or fragile items. We don’t carry illegal or hazardous goods.";
    }
    if (/pay|payment|cash|transfer|card/.test(text)) {
      return "This website only takes requests, not payments. Dispatch confirms your fare and how to pay when they confirm your booking.";
    }
    if (/contact|phone|call|whatsapp|number|instagram|tiktok|human|agent|person/.test(text)) {
      return <>Reach the team on <a href="tel:+2349125257142">0912 525 7142</a> or {link("Hello Mamaree Logistics", "WhatsApp")}. Instagram: @mamaree_logistics.</>;
    }
    if (/book|order|request|pickup|pick up|errand/.test(text)) {
      setChips(["Get a price quote"]);
      return (
        <>
          Happy to help. I can quote it first, or you can go straight to the form.
          <br /><br />
          <button type="button" className="link" onClick={() => onBook()}>Open booking form →</button>
        </>
      );
    }
    if (/hello|hi\b|hey|good (morning|afternoon|evening)/.test(text)) return "Hello! How can I help with your delivery today?";
    if (/thank/.test(text)) return "You’re welcome! Anything else I can help with?";
    return null;
  }

  function ask(question: string) {
    const text = question.trim();
    if (!text) return;
    if (!open) openPanel();
    push("me", text);
    setChips([]);
    const pending = push("bot", "…");

    const reference = REFERENCE.exec(text);
    if (reference) {
      replace(pending, "Checking that reference…");
      trackReply(`MMR-${reference[1].toUpperCase()}-${reference[2].toUpperCase()}`, pending);
      return;
    }
    setTimeout(() => {
      const reply = answer(text);
      if (reply === null) {
        setChips(["Get a price quote", "Track my package", "Where do you deliver?"]);
        replace(pending, <>I’m not sure about that one. I can help with prices, areas we cover, tracking and business deliveries, or you can {link("ask the dispatch team on WhatsApp", "ask the dispatch team on WhatsApp")}.</>);
      } else replace(pending, reply);
    }, 400);
  }

  // Open with a question when the page asks for it.
  useEffect(() => {
    if (request && request.nonce !== handled.current) {
      handled.current = request.nonce;
      setOpen(true);
      greet();
      ask(request.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = draft;
    setDraft("");
    ask(value);
  }

  return (
    <>
      <button className="copilot-fab" type="button" aria-expanded={open} aria-controls="copilot" onClick={() => (open ? setOpen(false) : openPanel())}>
        <Sparkles /> <span>AI Co-pilot</span>
      </button>
      {open && (
        <section className="copilot" id="copilot" role="dialog" aria-label="Mamaree AI Co-pilot">
          <header>
            <div className="cp-av">M</div>
            <div><strong>Mamaree Co-pilot</strong><small><span className="dot" /> Online · answers instantly</small></div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close assistant"><X /></button>
          </header>
          <div className="cp-log" ref={logRef} aria-live="polite">
            {messages.map((message) => <div key={message.id} className={`msg ${message.who}`}>{message.content}</div>)}
          </div>
          <div className="chips">{chips.map((chip) => <button key={chip} type="button" onClick={() => ask(chip)}>{chip}</button>)}</div>
          <form className="cp-form" onSubmit={submit}>
            <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} autoComplete="off" placeholder="Ask about prices, tracking, areas…" aria-label="Message" />
            <button className="btn btn-gold" type="submit">Send</button>
          </form>
          <small className="cp-note">Automated assistant. Final prices are confirmed by dispatch.</small>
        </section>
      )}
    </>
  );
}
