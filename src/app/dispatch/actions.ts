"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, ensureSchema } from "@/db";
import { deliveries, deliveryEvents } from "@/db/schema";
import { endDispatchSession, isDispatchSignedIn, startDispatchSession } from "@/lib/dispatch-auth";
import { NEXT_STATUS, STATUSES } from "@/lib/logistics";

export async function signIn(form: FormData) {
  if (!(await startDispatchSession(form.get("accessKey")))) redirect("/dispatch?notice=signin");
  redirect("/dispatch");
}

export async function signOut() {
  await endDispatchSession();
  redirect("/dispatch");
}

export async function updateStatus(form: FormData) {
  if (!(await isDispatchSignedIn())) redirect("/dispatch?notice=signin");
  const id = Number(form.get("id"));
  const candidate = form.get("status");
  const status = STATUSES.find((option) => option === candidate);
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || !status) redirect("/dispatch?notice=invalid");

  let notice: "updated" | "invalid" | "unavailable";
  try {
    await ensureSchema();
    const updated = await db.transaction(async (transaction) => {
      const [delivery] = await transaction.select({ status: deliveries.status })
        .from(deliveries).where(eq(deliveries.id, id)).limit(1);
      if (!delivery || !NEXT_STATUS[delivery.status].includes(status)) return false;
      const at = new Date();
      const [changed] = await transaction.update(deliveries).set({ status, updatedAt: at })
        .where(and(eq(deliveries.id, id), eq(deliveries.status, delivery.status))).returning({ id: deliveries.id });
      if (!changed) return false;
      await transaction.insert(deliveryEvents).values({ deliveryId: id, status, at });
      return true;
    });
    notice = updated ? "updated" : "invalid";
  } catch { notice = "unavailable"; }

  revalidatePath("/dispatch");
  redirect(`/dispatch?notice=${notice}`);
}
