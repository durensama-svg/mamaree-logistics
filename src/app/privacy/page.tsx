import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Phone } from "lucide-react";
import { PHONE, PHONE_LINK, whatsappUrl } from "@/lib/logistics";
import { Brand, WhatsAppIcon } from "../brand";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How Mamaree Logistics uses your booking and enquiry details.",
};

export default function PrivacyPage() {
  return <div className="desk">
    <header className="desk-header"><div className="wrap desk-nav"><Brand href="/" /><Link className="desk-back" href="/"><ArrowLeft /> Back to website</Link></div></header>
    <main className="wrap desk-content privacy-page">
      <span className="flow-icon"><LockKeyhole /></span><h1>Privacy notice</h1><p>How Mamaree Logistics uses the details you share with us.</p>
      <div className="privacy-card">
        <section><h2>Information you provide</h2><p>When you book a delivery, we receive your name, phone number, pickup and drop-off addresses, and parcel description. When you enquire for a business, we receive your contact information and the delivery details you choose to share.</p></section>
        <section><h2>How we use it</h2><p>Our dispatch team uses these details to reply to enquiries, confirm rates and availability, coordinate pickup and drop-off with your rider, and keep a record of the delivery. We don’t collect payment card details on this site.</p></section>
        <section><h2>Tracking references</h2><p>Anyone with your tracking reference can see the service areas and delivery status, but not the names, phone numbers, or street addresses from your booking. Share your reference only with people who need it.</p></section>
        <section><h2>WhatsApp and social links</h2><p>Links to WhatsApp, Instagram, and TikTok open those services. Their own privacy terms apply when you use them. A pre-filled WhatsApp message isn’t sent until you choose to send it.</p></section>
        <section><h2>Questions about your details</h2><p>Contact Mamaree Logistics if you’d like to ask about, correct, or request deletion of your booking or enquiry information.</p><div className="privacy-links"><a className="btn btn--line" href={PHONE_LINK}><Phone /> {PHONE}</a><a className="btn btn--line" href={whatsappUrl()} target="_blank" rel="noreferrer"><WhatsAppIcon /> Message us</a></div></section>
      </div>
    </main>
  </div>;
}
