import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "./globals.css";
import "./flows.css";

export const metadata: Metadata = {
  title: {
    default: "Mamaree Logistics | Local Delivery in Asaba & Okpanam",
    template: "%s | Mamaree Logistics",
  },
  description: "Book a Mamaree Logistics rider for parcels, business orders and errands across Asaba and Okpanam, Delta State. Local deliveries from ₦1,500.",
  openGraph: {
    title: "Mamaree Logistics — Fast delivery. Closer to home.",
    description: "Your local dispatch partner in Asaba and Okpanam, Delta State, Nigeria.",
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
