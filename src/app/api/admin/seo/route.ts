import { NextRequest, NextResponse } from "next/server";

function getUpstreamApiBaseUrl() {
  return (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.iqrainternationalislamicinstitute.com").replace(/\/+$/, "");
}

async function proxyRequest(request: NextRequest) {
  const target = new URL("/api/admin/seo", getUpstreamApiBaseUrl());
  const method = request.method;
  const body = method === "GET" || method === "DELETE" ? undefined : await request.text();

  try {
    const upstreamResponse = await fetch(target.toString(), {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
      credentials: "include",
    });

    const text = await upstreamResponse.text();
    return new NextResponse(text, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": upstreamResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("[admin-seo] upstream fetch failed:", error);
    return NextResponse.json({ error: "SEO admin API unavailable." }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}
