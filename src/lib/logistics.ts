export const PHONE = "0912 525 7142";
export const PHONE_LINK = "tel:+2349125257142";
export const INSTAGRAM = "https://www.instagram.com/mamaree_logistics/";
export const TIKTOK = "https://www.tiktok.com/@mamareelogistics";

export function whatsappUrl(message?: string) {
  const base = "https://wa.me/2349125257142";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const ZONES = ["asaba", "okpanam"] as const;
export type Zone = (typeof ZONES)[number];
export const ZONE_NAME: Record<Zone, string> = { asaba: "Asaba", okpanam: "Okpanam" };
export const ZONE_RATE: Record<Zone, number> = { asaba: 1500, okpanam: 2000 };

export function isZone(value: unknown): value is Zone {
  return typeof value === "string" && ZONES.some((zone) => zone === value);
}

export function routeRate(pickup: Zone, dropoff: Zone) {
  return pickup === "okpanam" || dropoff === "okpanam" ? ZONE_RATE.okpanam : ZONE_RATE.asaba;
}

export function naira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export const SERVICES = ["same-day", "business", "errands"] as const;
export type Service = (typeof SERVICES)[number];
export const SERVICE_NAME: Record<Service, string> = {
  "same-day": "Same-day delivery",
  business: "Business dispatch",
  errands: "Pickups & errands",
};

export function isService(value: unknown): value is Service {
  return typeof value === "string" && SERVICES.some((service) => service === value);
}

export const VOLUMES = ["Occasional deliveries", "1–10 per week", "11–30 per week", "31+ per week", "Not sure yet"] as const;

export const STATUSES = ["requested", "confirmed", "picked_up", "in_transit", "delivered", "cancelled"] as const;
export type DeliveryStatus = (typeof STATUSES)[number];
export const PROGRESS = ["requested", "confirmed", "picked_up", "in_transit", "delivered"] as const;

export const STATUS_NAME: Record<DeliveryStatus, string> = {
  requested: "Request received",
  confirmed: "Booking confirmed",
  picked_up: "Picked up",
  in_transit: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_NOTE: Record<DeliveryStatus, string> = {
  requested: "We have your details. Our team will confirm the rate and rider availability with you.",
  confirmed: "The dispatch team has confirmed your booking and is arranging pickup.",
  picked_up: "Your rider has collected your parcel.",
  in_transit: "Your parcel is on its way to the drop-off address.",
  delivered: "Your parcel has reached its drop-off address.",
  cancelled: "This request was cancelled. Contact us if you need help rebooking.",
};

export const NEXT_STATUS: Record<DeliveryStatus, readonly DeliveryStatus[]> = {
  requested: ["confirmed", "cancelled"],
  confirmed: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "delivered", "cancelled"],
  in_transit: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export type BookingReceipt = {
  reference: string;
  pickupZone: Zone;
  dropoffZone: Zone;
  estimatedRate: number;
};

export type TrackingSnapshot = {
  reference: string;
  pickupZone: Zone;
  dropoffZone: Zone;
  status: DeliveryStatus;
  updatedAt: string;
  events: { status: DeliveryStatus; at: string }[];
};

export function dispatchTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}
