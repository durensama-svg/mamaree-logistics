import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "mamaree_dispatch_session";
const DURATION = 60 * 60 * 8;

function accessKey() {
  const key = process.env.DISPATCH_ACCESS_KEY?.trim();
  return key && key.length >= 16 ? key : null;
}

export function dispatchConfigured() { return accessKey() !== null; }

function equal(left: string, right: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(left), digest(right));
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(`mamaree-dispatch:${value}`).digest("base64url");
}

export async function isDispatchSignedIn() {
  const key = accessKey();
  if (!key) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 140) return false;
  const [expires, nonce, signature, ...extra] = token.split(".");
  if (extra.length || !/^\d{10}$/.test(expires) || !nonce || !signature) return false;
  return Number(expires) > Date.now() / 1000 && equal(signature, sign(`${expires}.${nonce}`, key));
}

export async function startDispatchSession(candidate: unknown) {
  const key = accessKey();
  if (!key || typeof candidate !== "string" || candidate.length > 512 || !equal(candidate.trim(), key)) return false;
  const value = `${Math.floor(Date.now() / 1000) + DURATION}.${randomBytes(16).toString("base64url")}`;
  (await cookies()).set(COOKIE, `${value}.${sign(value, key)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/dispatch",
    maxAge: DURATION,
  });
  return true;
}

export async function endDispatchSession() {
  (await cookies()).set(COOKIE, "", { path: "/dispatch", maxAge: 0, httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
}
