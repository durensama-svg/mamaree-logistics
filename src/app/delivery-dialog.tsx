"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Copy, LoaderCircle, MapPin, PackagePlus, PackageSearch, Store, X } from "lucide-react";
import {
  dispatchTime, isZone, naira, PROGRESS, routeRate, SERVICES, SERVICE_NAME, STATUS_NAME, STATUS_NOTE,
  VOLUMES, whatsappUrl, ZONES, ZONE_NAME, type BookingReceipt, type DeliveryStatus, type Service,
  type TrackingSnapshot, type Zone,
} from "@/lib/logistics";
import { WhatsAppIcon } from "./brand";

export type DeliveryDialogState =
  | { kind: "book"; pickup?: Zone; dropoff?: Zone; service?: Service }
  | { kind: "track"; reference?: string }
  | { kind: "business" };

type DialogProps = {
  state: DeliveryDialogState;
  onClose: () => void;
  onChange: (state: DeliveryDialogState) => void;
};

async function requestData<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error ?? "Something went wrong. Please try again in a moment.");
  return data as T;
}

function postData<T>(path: string, form: HTMLFormElement) {
  return requestData<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(new FormData(form))),
  });
}

function errorMessage(error: unknown) {
  if (error instanceof TypeError) return "We couldn’t connect. Check your connection and try again.";
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function SubmitButton({ busy, label, busyLabel }: { busy: boolean; label: string; busyLabel: string }) {
  return <button className="btn btn--dark flow-submit" type="submit" disabled={busy}>
    {busy ? busyLabel : label}{busy ? <LoaderCircle className="spin" /> : <ArrowRight />}
  </button>;
}

export function DeliveryDialog({ state, onClose, onChange }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement;
    dialog?.showModal();
    document.body.classList.add("dialog-open");
    return () => {
      dialog?.close();
      document.body.classList.remove("dialog-open");
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (ref.current?.open) {
      ref.current.scrollTop = 0;
      heading.current?.focus({ preventScroll: true });
    }
  }, [state.kind]);

  const { title, description, Icon } = state.kind === "book"
    ? { title: "Book a delivery", description: "Share your route and parcel details. We’ll confirm the price and availability before dispatch.", Icon: PackagePlus }
    : state.kind === "track"
    ? { title: "Track a package", description: "Use the reference from your booking confirmation to check your delivery status.", Icon: PackageSearch }
    : { title: "Business deliveries", description: "Tell us about your business and we’ll discuss how to handle your local deliveries.", Icon: Store };

  return <dialog className="flow-dialog" ref={ref} aria-labelledby="flow-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="flow-panel">
      <button type="button" className="flow-close" onClick={onClose} aria-label="Close dialog"><X /></button>
      <div className="flow-heading">
        <span className="flow-icon"><Icon /></span><h2 id="flow-title" ref={heading} tabIndex={-1}>{title}</h2><p>{description}</p>
      </div>
      {state.kind === "book" && <BookingForm pickup={state.pickup} dropoff={state.dropoff} service={state.service} onTrack={(reference) => onChange({ kind: "track", reference })} />}
      {state.kind === "track" && <TrackingForm reference={state.reference} />}
      {state.kind === "business" && <BusinessForm />}
    </div>
  </dialog>;
}

function BookingForm({ pickup = "asaba", dropoff = "asaba", service = "same-day", onTrack }: {
  pickup?: Zone; dropoff?: Zone; service?: Service; onTrack: (reference: string) => void;
}) {
  const [pickupZone, setPickupZone] = useState<Zone>(pickup);
  const [dropoffZone, setDropoffZone] = useState<Zone>(dropoff);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const [copyNotice, setCopyNotice] = useState("");
  const confirmation = useRef<HTMLDivElement>(null);

  useEffect(() => { if (receipt) confirmation.current?.focus(); }, [receipt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      setReceipt(await postData<BookingReceipt>("/api/deliveries", event.currentTarget));
    } catch (failure) {
      setError(errorMessage(failure));
    } finally { setBusy(false); }
  }

  if (receipt) return <div className="flow-success" ref={confirmation} tabIndex={-1}>
    <h3><CheckCircle2 /> Delivery request received</h3>
    <p>Save your tracking reference. Our team will use your phone number to confirm your fare and pickup.</p>
    <div className="receipt-code"><div><span>TRACKING REFERENCE</span><strong>{receipt.reference}</strong></div><button type="button" className="btn btn--line receipt-copy" onClick={async () => {
      try { await navigator.clipboard.writeText(receipt.reference); setCopyNotice("Copied!"); }
      catch { setCopyNotice("Select the code to copy it."); }
    }}><Copy /> Copy</button></div>
    {copyNotice && <p className="copy-note" role="status">{copyNotice}</p>}
    <div className="receipt-route"><span><MapPin /> {ZONE_NAME[receipt.pickupZone]} <ArrowRight /> {ZONE_NAME[receipt.dropoffZone]}</span><span>From <strong>{naira(receipt.estimatedRate)}</strong></span></div>
    <div className="flow-actions"><button type="button" className="btn btn--dark" onClick={() => onTrack(receipt.reference)}>Track this delivery <ArrowRight /></button>
      <a className="btn btn--line" href={whatsappUrl(`Hello Mamaree Logistics, I’ve booked a delivery (${receipt.reference}) from ${ZONE_NAME[receipt.pickupZone]} to ${ZONE_NAME[receipt.dropoffZone]}. Please confirm my request.`)} target="_blank" rel="noreferrer"><WhatsAppIcon /> WhatsApp us</a></div>
  </div>;

  return <form className="flow-form" onSubmit={submit}>
    <div className="form-columns">
      <label>Your name<input name="senderName" autoComplete="name" minLength={2} maxLength={80} placeholder="Full name" required /></label>
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={10} maxLength={26} placeholder="e.g. 0801 234 5678" required /></label>
    </div>
    <div className="form-route">
      <div className="form-columns form-columns--route">
        <label>Pickup area<select name="pickupZone" value={pickupZone} onChange={(event) => { const value = event.target.value; if (isZone(value)) setPickupZone(value); }}>{ZONES.map((zone) => <option key={zone} value={zone}>{ZONE_NAME[zone]}</option>)}</select></label>
        <label>Pickup address<input name="pickupAddress" minLength={5} maxLength={180} placeholder="Street and nearby landmark" required /></label>
      </div>
      <div className="form-columns form-columns--route">
        <label>Drop-off area<select name="dropoffZone" value={dropoffZone} onChange={(event) => { const value = event.target.value; if (isZone(value)) setDropoffZone(value); }}>{ZONES.map((zone) => <option key={zone} value={zone}>{ZONE_NAME[zone]}</option>)}</select></label>
        <label>Drop-off address<input name="dropoffAddress" minLength={5} maxLength={180} placeholder="Street and nearby landmark" required /></label>
      </div>
    </div>
    <div className="form-columns form-columns--parcel">
      <label>Service<select name="service" defaultValue={service}>{SERVICES.map((option) => <option key={option} value={option}>{SERVICE_NAME[option]}</option>)}</select></label>
      <label>What are you sending?<input name="parcel" minLength={3} maxLength={240} placeholder="e.g. One small box of clothing" required /></label>
    </div>
    <div className="rate-estimate" aria-live="polite"><div><strong>Estimated starting rate</strong><small>Final fare confirmed before pickup.</small></div><span>{naira(routeRate(pickupZone, dropoffZone))}</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <SubmitButton busy={busy} label="Request a rider" busyLabel="Saving your request…" />
    <p className="form-note">We use your details to arrange this delivery. No payment is taken online.</p>
  </form>;
}

function TrackingForm({ reference }: { reference?: string }) {
  const [search, setSearch] = useState(reference ?? "");
  const [snapshot, setSnapshot] = useState<TrackingSnapshot | null>(null);
  const [busy, setBusy] = useState(Boolean(reference));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) return;
    const controller = new AbortController();
    requestData<TrackingSnapshot>(`/api/deliveries?reference=${encodeURIComponent(reference)}`, { signal: controller.signal, cache: "no-store" })
      .then(setSnapshot)
      .catch((failure: unknown) => { if (!controller.signal.aborted) setError(errorMessage(failure)); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [reference]);

  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSnapshot(null);
    try {
      setSnapshot(await requestData<TrackingSnapshot>(`/api/deliveries?reference=${encodeURIComponent(search.trim())}`, { cache: "no-store" }));
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }

  return <>
    <form className="flow-form tracking-form" onSubmit={track}>
      <label>Tracking reference<input className="tracking-input" value={search} onChange={(event) => setSearch(event.target.value.toUpperCase())} name="reference" autoComplete="off" autoCapitalize="characters" spellCheck={false} minLength={13} maxLength={24} placeholder="MMR-7M2KD-8H4NX" required /></label>
      <SubmitButton busy={busy} label="Check status" busyLabel="Checking status…" />
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
    {snapshot ? <TrackingResult snapshot={snapshot} /> : <p className="tracking-help">Can’t find your reference? <a href={whatsappUrl("Hello Mamaree Logistics, can you help me find my tracking reference?")} target="_blank" rel="noreferrer">Message us <ArrowUpRight /></a></p>}
  </>;
}

function TrackingResult({ snapshot }: { snapshot: TrackingSnapshot }) {
  const started = new Map(snapshot.events.map(({ status, at }) => [status, at]));
  const steps: readonly DeliveryStatus[] = snapshot.status === "cancelled"
    ? snapshot.events.map((event) => event.status)
    : PROGRESS.filter((step) => !(snapshot.status === "delivered" && step === "in_transit" && !started.has(step)));

  return <div className="tracking-result" aria-live="polite">
    <div className="tracking-summary"><span>{snapshot.reference}</span><h3>{STATUS_NAME[snapshot.status]}</h3><p>{STATUS_NOTE[snapshot.status]}</p></div>
    <div className="receipt-route"><span><MapPin /> {ZONE_NAME[snapshot.pickupZone]} <ArrowRight /> {ZONE_NAME[snapshot.dropoffZone]}</span><span>Updated {dispatchTime(snapshot.updatedAt)}</span></div>
    <ol className="timeline">{steps.map((step) => {
      const at = started.get(step);
      return <li key={step} className={step === snapshot.status ? "timeline-current" : at ? "timeline-done" : "timeline-pending"}>
        <span className="timeline-dot">{at && step !== "cancelled" ? <Check /> : null}</span><span>{STATUS_NAME[step]}</span>{at && <time dateTime={at}>{dispatchTime(at)}</time>}
      </li>;
    })}</ol>
  </div>;
}

function BusinessForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [business, setBusiness] = useState("");
  const confirmation = useRef<HTMLDivElement>(null);
  useEffect(() => { if (business) confirmation.current?.focus(); }, [business]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const name = String(new FormData(event.currentTarget).get("businessName") ?? "").trim();
    setBusy(true);
    setError("");
    try {
      await postData<{ ok: true }>("/api/business", event.currentTarget);
      setBusiness(name);
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }

  if (business) return <div className="flow-success" ref={confirmation} tabIndex={-1}>
    <h3><CheckCircle2 /> Business enquiry received</h3>
    <p>Thanks for reaching out on behalf of <strong>{business}</strong>. Our team can follow up using the number you provided.</p>
    <a className="btn btn--dark" href={whatsappUrl(`Hello Mamaree Logistics, I’ve submitted a business delivery enquiry for ${business}. I’d like to discuss pickups and deliveries.`)} target="_blank" rel="noreferrer"><WhatsAppIcon /> Continue on WhatsApp <ArrowUpRight /></a>
  </div>;

  return <form className="flow-form" onSubmit={submit}>
    <div className="form-columns">
      <label>Contact name<input name="contactName" autoComplete="name" minLength={2} maxLength={80} placeholder="Your full name" required /></label>
      <label>Business name<input name="businessName" autoComplete="organization" minLength={2} maxLength={100} placeholder="Shop or business name" required /></label>
    </div>
    <div className="form-columns">
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" minLength={10} maxLength={26} placeholder="e.g. 0801 234 5678" required /></label>
      <label>Delivery volume<select name="volume" defaultValue="" required><option value="" disabled>Select an option</option>{VOLUMES.map((volume) => <option key={volume} value={volume}>{volume}</option>)}</select></label>
    </div>
    <label>What do you need delivered?<textarea rows={3} name="message" minLength={8} maxLength={600} placeholder="Tell us what you send, your pickup area and the delivery support you need." required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <SubmitButton busy={busy} label="Send business enquiry" busyLabel="Sending your enquiry…" />
    <p className="form-note">We use your contact details to respond to this enquiry.</p>
  </form>;
}
