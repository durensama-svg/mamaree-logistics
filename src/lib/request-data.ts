const MAX_FORM_BYTES = 6_000;

export async function readFormJson(request: Request): Promise<Record<string, unknown> | null> {
  const format = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (format !== "application/json" || Number(request.headers.get("content-length")) > MAX_FORM_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  try {
    const decoder = new TextDecoder();
    let text = "";
    let bytes = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_FORM_BYTES) { await reader.cancel(); return null; }
      text += decoder.decode(chunk.value, { stream: true });
    }
    const value = JSON.parse(text + decoder.decode()) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export function cleanText(value: unknown, min: number, max: number) {
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/\s+/g, " ");
  return text.length >= min && text.length <= max ? text : null;
}

export function cleanPhone(value: unknown) {
  if (typeof value !== "string" || value.length > 30 || !/^\+?[0-9 ()-]+$/.test(value.trim())) return null;
  const phone = value.trim().replace(/[ ()-]/g, "");
  return /^\+?\d{10,15}$/.test(phone) ? phone : null;
}

export function badRequest(error: string) {
  return Response.json({ error }, { status: 400 });
}
