import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { UPSTREAM_API_BASE_URL } from "@/lib/api";
import { createAdminSessionToken, type AdminSessionEnv } from "@/lib/admin-session";

function getRuntimeEnv(): AdminSessionEnv {
  try {
    return { ...process.env, ...(getCloudflareContext().env as AdminSessionEnv) };
  } catch {
    return process.env as AdminSessionEnv;
  }
}

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${UPSTREAM_API_BASE_URL}/${targetPath}${search}`;

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;
  const cookieHeader = req.headers.get("cookie") ?? undefined;
  const authHeader = req.headers.get("authorization") ?? undefined;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
      cache: "no-store",
      credentials: "include",
    });

    const text = await upstreamRes.text();
    const response = new NextResponse(text, {
      status: upstreamRes.status,
      headers: { "Content-Type": upstreamRes.headers.get("content-type") ?? "application/octet-stream" },
    });

    for (const cookie of upstreamRes.headers.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }

    if (req.method === "POST" && targetPath === "v1/auth/login" && upstreamRes.ok) {
      response.cookies.set("iqra_session", "", {
        httpOnly: true,
        secure: req.nextUrl.protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      try {
        const payload = JSON.parse(text) as Record<string, unknown>;
        const user = (payload.user ?? payload.data ?? payload) as Record<string, unknown>;
        const role = String(user.role ?? user.user_role ?? user.role_name ?? "user").toLowerCase();
        const userId = String(user.id ?? user.uuid ?? user.user_id ?? payload.user_id ?? "");
        const token = await createAdminSessionToken(userId, role, getRuntimeEnv());

        if (token) {
          response.cookies.set("iqra_session", token, {
            httpOnly: true,
            secure: req.nextUrl.protocol === "https:",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          });
        }
      } catch {
        // The upstream response remains usable if it does not contain a JSON user record.
      }
    }

    return response;
  } catch (err) {
    console.error(`[proxy] failed to reach upstream at ${targetUrl}:`, err);
    return NextResponse.json(
      { error: "Upstream service unavailable" },
      { status: 502 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE, proxy as PUT };
