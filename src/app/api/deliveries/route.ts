import { randomBytes } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { deliveries, deliveryEvents } from "@/db/schema";
import { isService, isZone, routeRate } from "@/lib/logistics";
import { badRequest, cleanPhone, cleanText, readFormJson } from "@/lib/request-data";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newReference() {
  const token = Array.from(randomBytes(10), (byte) => CODE_ALPHABET[byte & 31]).join("");
  return `MMR-${token.slice(0, 5)}-${token.slice(5)}`;
}

export async function POST(request: Request) {
  const body = await readFormJson(request);
  if (!body) return badRequest("We couldn’t read your request. Please check the form and try again.");

  const { service, pickupZone, dropoffZone } = body;
  const senderName = cleanText(body.senderName, 2, 80);
  const phone = cleanPhone(body.phone);
  const pickupAddress = cleanText(body.pickupAddress, 5, 180);
  const dropoffAddress = cleanText(body.dropoffAddress, 5, 180);
  const parcel = cleanText(body.parcel, 3, 240);
  if (!isService(service)) return badRequest("Choose a delivery service.");
  if (!senderName || !phone) return badRequest("Enter your name and a valid phone number.");
  if (!isZone(pickupZone) || !isZone(dropoffZone)) return badRequest("Choose Asaba or Okpanam for each area.");
  if (!pickupAddress || !dropoffAddress) return badRequest("Enter both addresses, including a street or landmark.");
  if (!parcel) return badRequest("Tell us briefly what we’ll be delivering.");

  const estimatedRate = routeRate(pickupZone, dropoffZone);
  try {
    await ensureSchema();
    const receipt = await db.transaction(async (transaction) => {
      const [delivery] = await transaction.insert(deliveries).values({
        reference: newReference(), service, senderName, phone, pickupZone, pickupAddress,
        dropoffZone, dropoffAddress, parcel, estimatedRate,
      }).returning({ id: deliveries.id, reference: deliveries.reference, at: deliveries.createdAt });
      await transaction.insert(deliveryEvents).values({ deliveryId: delivery.id, status: "requested", at: delivery.at });
      return { reference: delivery.reference, pickupZone, dropoffZone, estimatedRate };
    });
    return Response.json(receipt, { status: 201 });
  } catch {
    return Response.json({ error: "We couldn’t save your request right now. Try again or contact us on WhatsApp." }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("reference") ?? "";
  const parts = input.length <= 35 && input.toUpperCase().replace(/[\s-]+/g, "").match(/^MMR([A-HJ-NP-Z2-9]{5})([A-HJ-NP-Z2-9]{5})$/);
  if (!parts) return badRequest("Enter your full tracking code, for example MMR-7M2KD-8H4NX.");
  const reference = `MMR-${parts[1]}-${parts[2]}`;

  try {
    await ensureSchema();
    const snapshot = await db.transaction(async (transaction) => {
      const [delivery] = await transaction.select({
        id: deliveries.id,
        reference: deliveries.reference,
        pickupZone: deliveries.pickupZone,
        dropoffZone: deliveries.dropoffZone,
        status: deliveries.status,
        updatedAt: deliveries.updatedAt,
      }).from(deliveries).where(eq(deliveries.reference, reference)).limit(1);
      if (!delivery) return null;
      const events = await transaction.select({ status: deliveryEvents.status, at: deliveryEvents.at })
        .from(deliveryEvents).where(eq(deliveryEvents.deliveryId, delivery.id))
        .orderBy(asc(deliveryEvents.at), asc(deliveryEvents.id)).limit(20);
      return { reference: delivery.reference, pickupZone: delivery.pickupZone, dropoffZone: delivery.dropoffZone,
        status: delivery.status, updatedAt: delivery.updatedAt, events };
    }, { isolationLevel: "repeatable read", accessMode: "read only" });

    if (!snapshot) return Response.json({ error: "We couldn’t find that code. Check your booking confirmation and try again." }, { status: 404 });
    return Response.json(snapshot, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Tracking is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
