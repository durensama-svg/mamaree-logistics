import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown, LockKeyhole, MapPin, PackageSearch, Phone, Store } from "lucide-react";
import { desc } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { businessEnquiries, deliveries } from "@/db/schema";
import { dispatchConfigured, isDispatchSignedIn } from "@/lib/dispatch-auth";
import { dispatchTime, naira, NEXT_STATUS, SERVICE_NAME, STATUS_NAME, ZONE_NAME } from "@/lib/logistics";
import { Brand } from "../brand";
import { signIn, signOut, updateStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dispatch Desk", robots: { index: false, follow: false } };

type PageProps = { searchParams: Promise<{ view?: string; notice?: string }> };

export default async function DispatchPage({ searchParams }: PageProps) {
  const { view, notice } = await searchParams;
  const configured = dispatchConfigured();
  const signedIn = await isDispatchSignedIn();
  let records: (typeof deliveries.$inferSelect)[] = [];
  let enquiries: (typeof businessEnquiries.$inferSelect)[] = [];
  let dataError = false;
  if (signedIn) {
    try {
      await ensureSchema();
      [records, enquiries] = await Promise.all([
        db.select().from(deliveries).orderBy(desc(deliveries.createdAt)).limit(100),
        db.select().from(businessEnquiries).orderBy(desc(businessEnquiries.createdAt)).limit(100),
      ]);
    } catch { dataError = true; }
  }

  return <div className="desk">
    <header className="desk-header"><div className="wrap desk-nav"><Brand href="/" />
      {signedIn ? <form action={signOut}><button className="btn btn--line" type="submit">Sign out</button></form> : <Link className="desk-back" href="/"><ArrowLeft /> Back to website</Link>}
    </div></header>
    {!signedIn ? <main className="desk-login">
      <span className="flow-icon"><LockKeyhole /></span><h1>Dispatch desk</h1><p>Staff access for Mamaree Logistics.</p>
      {configured ? <form action={signIn} className="flow-form">
        <label>Dispatch access key<input name="accessKey" type="password" autoComplete="current-password" maxLength={512} required /></label>
        {notice === "signin" && <p className="form-error" role="alert">The access key didn’t match, or your session expired.</p>}
        <button className="btn btn--dark flow-submit" type="submit">Sign in <ArrowRight /></button>
      </form> : <p className="desk-alert">Staff access is not configured. The site owner can set a <code>DISPATCH_ACCESS_KEY</code> of at least 16 characters in the server environment to enable the dispatch desk.</p>}
    </main> : <main className="wrap desk-content">
      <span className="eyebrow">OPERATIONS</span><h1>Dispatch desk</h1><p>Review recent deliveries and enquiries for Asaba and Okpanam.</p>
      {dataError && <p className="form-error" role="alert">The dispatch desk couldn’t load your records. Please refresh in a moment.</p>}
      {notice === "updated" && <p className="desk-alert desk-alert--success" role="status">Delivery updated. The customer’s tracking page now shows the new status.</p>}
      {(notice === "invalid" || notice === "unavailable") && <p className="form-error" role="alert">This status could not be updated. Refresh and check the current status before you try again.</p>}
      <div className="desk-stats">
        <div><span>Recent bookings</span><strong>{records.length}</strong></div><div><span>Awaiting confirmation</span><strong>{records.filter((record) => record.status === "requested").length}</strong></div><div><span>Business enquiries</span><strong>{enquiries.length}</strong></div>
      </div>
      <nav className="desk-tabs" aria-label="Dispatch views">
        <Link href="/dispatch" aria-current={view !== "business" ? "page" : undefined}><PackageSearch /> Deliveries</Link>
        <Link href="/dispatch?view=business" aria-current={view === "business" ? "page" : undefined}><Store /> Business enquiries</Link>
      </nav>
      {view === "business" ? <section className="desk-records" aria-label="Business enquiries">
        {!enquiries.length && <div className="desk-empty"><Store /><h2>No business enquiries yet</h2><p>New business requests from the website will appear here.</p></div>}
        {enquiries.map((entry) => <article className="desk-lead" key={entry.id}>
          <div className="desk-lead-heading"><div><h2>{entry.businessName}</h2><p>{entry.contactName} · {entry.volume}</p></div><time dateTime={entry.createdAt.toISOString()}>{dispatchTime(entry.createdAt)}</time></div>
          <p>{entry.message}</p><a href={`tel:${entry.phone}`}><Phone /> {entry.phone}</a>
        </article>)}
      </section> : <section className="desk-records" aria-label="Delivery records">
        {!records.length && <div className="desk-empty"><PackageSearch /><h2>No deliveries yet</h2><p>New delivery requests from the website will appear here.</p></div>}
        {records.map((record) => <details className="desk-record" key={record.id}>
          <summary><span className="desk-summary-main"><strong>{record.reference}</strong><small>{ZONE_NAME[record.pickupZone]} <ArrowRight /> {ZONE_NAME[record.dropoffZone]}</small></span><span className={`desk-status desk-status--${record.status}`}>{STATUS_NAME[record.status]}</span><ChevronDown className="desk-chevron" /></summary>
          <div className="desk-record-body">
            <div className="desk-addresses"><div><small><MapPin /> PICKUP</small><p>{record.pickupAddress}, {ZONE_NAME[record.pickupZone]}</p></div><div><small><MapPin /> DROP-OFF</small><p>{record.dropoffAddress}, {ZONE_NAME[record.dropoffZone]}</p></div></div>
            <div className="desk-order"><div><small>SENDER</small><p>{record.senderName} <a href={`tel:${record.phone}`}><Phone /> {record.phone}</a></p></div><div><small>PARCEL · {SERVICE_NAME[record.service].toUpperCase()}</small><p>{record.parcel}</p></div><div><small>STARTING FARE</small><p>{naira(record.estimatedRate)}</p></div></div>
            <div className="desk-record-update"><span>Requested {dispatchTime(record.createdAt)}</span>
              {NEXT_STATUS[record.status].length > 0 && <form action={updateStatus}>
                <input name="id" type="hidden" value={record.id} /><select name="status" aria-label={`New status for ${record.reference}`} defaultValue="" required><option value="" disabled>Choose a status</option>{NEXT_STATUS[record.status].map((status) => <option key={status} value={status}>{STATUS_NAME[status]}</option>)}</select><button type="submit" className="btn btn--dark">Update status</button>
              </form>}
            </div>
          </div>
        </details>)}
      </section>}
    </main>}
  </div>;
}
