import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

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

export const viewport: Viewport = { themeColor: "#0f244c" };

const themeScript = `try{var t=localStorage.getItem('mamaree-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
