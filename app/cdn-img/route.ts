import { NextRequest } from "next/server";
import { isAllowedGcsUrl } from "@/lib/cdn/imageUrl";

export const dynamic = "force-dynamic";

async function proxyGcs(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("u") || "";
  if (!isAllowedGcsUrl(target)) {
    return new Response("Forbidden", { status: 403 });
  }

  const upstream = await fetch(target, {
    method: request.method,
    redirect: "error",
  });

  const headers = new Headers(upstream.headers);
  headers.delete("set-cookie");
  headers.set("Cache-Control", "public, max-age=86400, s-maxage=31536000");
  return new Response(upstream.body, { status: upstream.status, headers });
}

export async function GET(request: NextRequest) {
  return proxyGcs(request);
}

export async function HEAD(request: NextRequest) {
  return proxyGcs(request);
}
