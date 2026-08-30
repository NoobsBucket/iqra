import { NextRequest, NextResponse } from "next/server";
import { UPSTREAM_API_BASE_URL } from "@/lib/api";

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

function getRedirectUri(request: NextRequest) {
  return process.env.GOOGLE_REDIRECT_URI ?? `${request.nextUrl.origin}/api/auth/google`;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (error) return NextResponse.redirect(new URL(`/login?oauth_error=${encodeURIComponent(error)}`, request.url));

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?oauth_error=Google+OAuth+is+not+configured", request.url));
  }

  if (!code) {
    const authorizeUrl = new URL(GOOGLE_AUTHORIZE_URL);
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", getRedirectUri(request));
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "openid email profile");
    authorizeUrl.searchParams.set("access_type", "offline");
    authorizeUrl.searchParams.set("prompt", "select_account");
    return NextResponse.redirect(authorizeUrl);
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(request),
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) throw new Error("Google authorization code could not be exchanged");
    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) throw new Error("Google did not return an access token");

    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    if (!profileResponse.ok) throw new Error("Google profile could not be loaded");

    const profile = (await profileResponse.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };
    if (!profile.sub || !profile.email) throw new Error("Google account did not provide an email");

    const persistResponse = await fetch(`${UPSTREAM_API_BASE_URL}${process.env.GOOGLE_AUTH_API_PATH ?? "/v1/auth/google"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "google",
        provider_id: profile.sub,
        email: profile.email,
        name: profile.name ?? profile.email.split("@")[0],
        avatar_url: profile.picture,
        email_verified: profile.email_verified ?? true,
      }),
      cache: "no-store",
    });

    if (!persistResponse.ok) throw new Error("The backend could not save this Google account");
    const saved = (await persistResponse.json()) as Record<string, unknown>;
    const savedData = saved.data && typeof saved.data === "object" ? saved.data as Record<string, unknown> : undefined;
    const savedUser = (saved.user as Record<string, unknown> | undefined) ?? savedData ?? saved;
    const user = {
      id: String(savedUser.id ?? savedUser.user_id ?? `google-${profile.sub}`),
      name: String(savedUser.name ?? profile.name ?? profile.email.split("@")[0]),
      email: String(savedUser.email ?? profile.email),
      avatar: String(savedUser.avatar_url ?? profile.picture ?? ""),
    };

    const escapedUser = JSON.stringify(user).replace(/</g, "\\u003c");
    return new NextResponse(`<!doctype html><script>localStorage.setItem("iqra-user",${JSON.stringify(escapedUser)});window.dispatchEvent(new Event("iqra-user-changed"));window.location.replace("/");</script>`, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (oauthError) {
    const message = oauthError instanceof Error ? oauthError.message : "Google sign-in failed";
    return NextResponse.redirect(new URL(`/login?oauth_error=${encodeURIComponent(message)}`, request.url));
  }
}