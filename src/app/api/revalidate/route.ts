import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET ?? "";
  const suppliedSecret = request.headers.get("x-revalidate-secret") ?? request.headers.get("revalidate-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!expectedSecret || suppliedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json().catch(() => ({}))) as { tag?: string };
    const tag = typeof payload.tag === "string" ? payload.tag.trim() : "";

    if (!tag) {
      return NextResponse.json({ error: "Tag is required." }, { status: 400 });
    }

    revalidateTag(tag, "default");
    return NextResponse.json({ ok: true, tag });
  } catch (error) {
    console.error("[revalidate] failed:", error);
    return NextResponse.json({ error: "Unable to revalidate the requested tag." }, { status: 500 });
  }
}
