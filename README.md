# Mamaree Logistics

**Fast delivery. Closer to home.**

Local deliveries in Asaba and Okpanam, Delta State, Nigeria.

Official site for Mamaree Logistics featuring:

- Modern navy + orange branding matching the official logo
- Light & Dark mode toggle
- AI Co-Pilot assistant (answers questions about rates, booking, tracking, coverage)
- Same-day delivery, business dispatch, and pickups & errands
- Booking flows, tracking by reference, business enquiry inbox
- Staff dispatch desk

## Quick Deploy to Vercel

1. Fork or import this repository into [Vercel](https://vercel.com/new)
2. Add environment variables:
   - `DATABASE_URL` — PostgreSQL connection string (Neon, Supabase, or Vercel Postgres recommended)
   - `DISPATCH_ACCESS_KEY` — strong random string (≥16 chars) for the staff desk at `/dispatch`
3. Deploy. Vercel will give you a production URL.

Without a database the marketing pages, AI Co-Pilot, theme toggle, and WhatsApp links still work perfectly. Booking/tracking APIs will return friendly errors until the DB is connected.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Brand & Theme

- Primary navy: `#0a1628`
- Accent orange: `#e67e22`
- Logo: `/public/images/logo.jpeg`
- Theme preference stored in `localStorage` under `mamaree-theme`

## AI Co-Pilot

Floating button bottom-right. Rule-based assistant with knowledge of:

- Pricing (from ₦1,500 Asaba / ₦2,000 involving Okpanam)
- How to book
- Tracking (MMR- references)
- Coverage areas
- Contact channels

## Contact

- Phone / WhatsApp: 0912 525 7142
- Instagram: [@mamaree_logistics](https://www.instagram.com/mamaree_logistics/)
- TikTok: [@mamareelogistics](https://www.tiktok.com/@mamareelogistics)

## License

Private business site. All rights reserved.
