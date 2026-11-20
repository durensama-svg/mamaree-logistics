import { db, ensureSchema } from "@/db";
import { businessEnquiries } from "@/db/schema";
import { VOLUMES } from "@/lib/logistics";
import { badRequest, cleanPhone, cleanText, readFormJson } from "@/lib/request-data";

export async function POST(request: Request) {
  const body = await readFormJson(request);
  if (!body) return badRequest("We couldn’t read your request. Please check the form and try again.");
  const contactName = cleanText(body.contactName, 2, 80);
  const businessName = cleanText(body.businessName, 2, 100);
  const phone = cleanPhone(body.phone);
  const volume = VOLUMES.find((option) => option === body.volume);
  const message = cleanText(body.message, 8, 600);
  if (!contactName || !businessName || !phone) return badRequest("Enter your name, business name, and a valid phone number.");
  if (!volume || !message) return badRequest("Choose a delivery volume and add a few details about what you need.");

  try {
    await ensureSchema();
    await db.insert(businessEnquiries).values({ contactName, businessName, phone, volume, message });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "We couldn’t save your enquiry right now. Try again or chat with us on WhatsApp." }, { status: 503 });
  }
}
