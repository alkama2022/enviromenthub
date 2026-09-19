export async function authenticateCronRequest(request: Request): Promise<Response | null> {
  const current = process.env["CRON_SECRET"];
  const previous = process.env["CRON_SECRET_PREVIOUS"];

  if (!current) {
    return new Response("Server configuration error", { status: 500 });
  }

  const match = /^Bearer ([^\s,]+)$/.exec(request.headers.get("authorization") ?? "");
  const token = match?.[1];
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { createHash, timingSafeEqual } = await import("node:crypto");
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  const providedDigest = digest(token);
  const currentMatches = timingSafeEqual(providedDigest, digest(current));
  const previousMatches = timingSafeEqual(providedDigest, digest(previous ?? current));

  if (!currentMatches && !previousMatches) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null;
}
