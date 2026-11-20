export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`mlogo ${className}`.trim()} role="img" aria-label="Mamaree Logistics">
      <i />
      <b />
    </span>
  );
}

export function Brand({ href = "#home" }: { href?: string }) {
  return (
    <a className="brand" href={href} aria-label="Mamaree Logistics home">
      <Logo />
    </a>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.2-4.3a8.5 8.5 0 1 1 15.8-4.4Z" />
      <path d="M9.1 8.1c-.5-.4-1-.1-1.2.4-.5 1.2.4 3.1 1.9 4.6 1.6 1.6 3.6 2.5 4.7 2 .5-.2.8-.8.5-1.2l-1.8-1c-.3-.2-.6-.1-.8.2l-.4.6c-1.2-.5-2.1-1.4-2.7-2.6l.6-.6c.2-.2.3-.5.1-.8Z" strokeWidth="1.45" />
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.6 6.5h.01" strokeWidth="2.6" />
    </svg>
  );
}

export function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h3a4.5 4.5 0 0 0 4 4v3a7.7 7.7 0 0 1-4-1.4v5.9a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2V4Z" />
    </svg>
  );
}
