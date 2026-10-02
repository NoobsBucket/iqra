import { NextRequest, NextResponse } from "next/server";

function getUpstreamApiBaseUrl() {
  return (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.iqrainternationalislamicinstitute.com").replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path query parameter." }, { status: 400 });
  }

  const target = new URL("/api/seo", getUpstreamApiBaseUrl());
  target.searchParams.set("path", path);

  try {
    const upstreamResponse = await fetch(target.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const text = await upstreamResponse.text();
    return new NextResponse(text, {
      status: upstreamResponse.status,
      headers: { "Content-Type": upstreamResponse.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    console.error("[seo] upstream fetch failed:", error);
    return NextResponse.json({ error: "SEO API unavailable." }, { status: 502 });
  }
}
