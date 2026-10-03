import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  if (request.headers.get("x-revalidate-secret") !== (process.env.REVALIDATE_SECRET || "softpage-revalidate")) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const tag = typeof body.tag === "string" ? body.tag : "";
  if (!tag.startsWith("store:")) return Response.json({ ok: false }, { status: 400 });
  revalidateTag(tag, "max");
  return Response.json({ ok: true });
}
