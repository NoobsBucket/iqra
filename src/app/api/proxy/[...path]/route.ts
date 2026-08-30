import { NextRequest, NextResponse } from "next/server";
import { UPSTREAM_API_BASE_URL } from "@/lib/api";

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${UPSTREAM_API_BASE_URL}/${targetPath}${search}`;

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        // Later: forward the user's auth token here, server-side, once auth is added.
        // Authorization: req.headers.get("authorization") ?? "",
      },
      body,
      cache: "no-store",
    });

    const text = await upstreamRes.text();
    return new NextResponse(text, {
      status: upstreamRes.status,
      headers: { "Content-Type": upstreamRes.headers.get("content-type") ?? "application/octet-stream" },
    });
  } catch (err) {
    console.error(`[proxy] failed to reach upstream at ${targetUrl}:`, err);
    return NextResponse.json(
      { error: "Upstream service unavailable" },
      { status: 502 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE, proxy as PUT };
