import { NextRequest, NextResponse } from "next/server";
import { UPSTREAM_API_BASE_URL } from "@/lib/api";

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

function getRedirectUri(request: NextRequest) {
  const requestRedirectUri = `${request.nextUrl.origin}/api/auth/google`;
  const configuredRedirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

  if (!configuredRedirectUri) {
    console.warn(
      "[google-oauth] GOOGLE_REDIRECT_URI is not set - falling back to request.nextUrl.origin, " +
        "which can be unreliable on Cloudflare Workers. Set it explicitly to avoid redirect_uri mismatches."
    );
    return requestRedirectUri;
  }

  try {
    const configured = new URL(configuredRedirectUri);
    const normalizedConfigured = `${configured.origin}${configured.pathname.replace(/\/$/, "")}`;

    if (normalizedConfigured !== requestRedirectUri) {
      console.warn(
        "[google-oauth] GOOGLE_REDIRECT_URI does not match the current request host. " +
          `Configured: ${normalizedConfigured} | Request: ${requestRedirectUri}. Using the request host to avoid invalid_grant.`
      );
      return requestRedirectUri;
    }

    return normalizedConfigured;
  } catch {
    console.warn(
      "[google-oauth] GOOGLE_REDIRECT_URI is invalid. Falling back to the request host. " +
        `Configured value: ${configuredRedirectUri}`
    );
    return requestRedirectUri;
  }
}

function getGoogleSaveEndpoints(baseUrl: string): string[] {
  const configuredPath = process.env.GOOGLE_AUTH_API_PATH?.trim();

  const candidates = [
    configuredPath ? `${baseUrl}${configuredPath.startsWith("/") ? configuredPath : `/${configuredPath}`}` : undefined,
    `${baseUrl}/api/v1/auth/google`,
    `${baseUrl}/v1/auth/google`,
    `${baseUrl}/api/auth/google`,
    `${baseUrl}/auth/google`,
  ];

  return [...new Set(candidates.filter(Boolean) as string[])];
}

function getGoogleSaveBodies(profile: {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}) {
  const normalizedName = profile.name ?? profile.email.split("@")[0];
  const commonBody = {
    provider: "google",
    provider_id: profile.sub,
    email: profile.email,
    name: normalizedName,
    avatar_url: profile.picture,
    email_verified: profile.email_verified ?? true,
  };

  return [
    commonBody,
    {
      ...commonBody,
      providerId: profile.sub,
      google_id: profile.sub,
    },
    {
      provider: "google",
      google_id: profile.sub,
      provider_id: profile.sub,
      email: profile.email,
      full_name: normalizedName,
      avatar_url: profile.picture,
      email_verified: profile.email_verified ?? true,
    },
  ];
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
    const redirectUri = getRedirectUri(request);
    console.log("[google-oauth] authorize step using redirect_uri:", redirectUri);

    const authorizeUrl = new URL(GOOGLE_AUTHORIZE_URL);
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "openid email profile");
    authorizeUrl.searchParams.set("access_type", "offline");
    authorizeUrl.searchParams.set("prompt", "select_account");
    return NextResponse.redirect(authorizeUrl);
  }

  try {
    const redirectUri = getRedirectUri(request);
    console.log("[google-oauth] token exchange using redirect_uri:", redirectUri);

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      // This is the actual fix: log and surface Google's real error instead
      // of a generic message. Google's response body almost always names the
      // exact problem (e.g. "redirect_uri_mismatch", "invalid_grant" because
      // the code was already used or expired, "invalid_client", etc.).
      const errorBody = await tokenResponse.text();
      console.error("[google-oauth] token exchange failed:", tokenResponse.status, errorBody);
      throw new Error(`Google token exchange failed: ${errorBody}`);
    }

    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) throw new Error("Google did not return an access token");

    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    if (!profileResponse.ok) {
      const errorBody = await profileResponse.text();
      console.error("[google-oauth] profile fetch failed:", profileResponse.status, errorBody);
      throw new Error("Google profile could not be loaded");
    }

    const profile = (await profileResponse.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };
    if (!profile.sub || !profile.email) throw new Error("Google account did not provide an email");

    const normalizedProfile = {
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      email_verified: profile.email_verified,
    };

    const endpointCandidates = getGoogleSaveEndpoints(UPSTREAM_API_BASE_URL);
    const payloadCandidates = getGoogleSaveBodies(normalizedProfile);
    let lastSaveError: string | null = null;
    let saved: Record<string, unknown> | undefined;

    for (const endpoint of endpointCandidates) {
      for (const payload of payloadCandidates) {
        const persistResponse = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });

        if (persistResponse.ok) {
          saved = (await persistResponse.json()) as Record<string, unknown>;
          break;
        }

        const errorBody = await persistResponse.text();
        const trimmedError = errorBody.trim();
        const errorMessage = trimmedError || persistResponse.statusText || "unknown backend error";
        lastSaveError = `${endpoint} => ${persistResponse.status} ${errorMessage}`;
        console.error("[google-oauth] backend save failed:", endpoint, persistResponse.status, errorMessage);
      }

      if (saved) break;
    }

    if (!saved) {
      throw new Error(
        lastSaveError
          ? `The backend could not save this Google account: ${lastSaveError}`
          : "The backend could not save this Google account"
      );
    }
    const savedData = saved.data && typeof saved.data === "object" ? (saved.data as Record<string, unknown>) : undefined;
    const savedUser = (saved.user as Record<string, unknown> | undefined) ?? savedData ?? saved;
    const user = {
      id: String(savedUser.id ?? savedUser.user_id ?? `google-${profile.sub}`),
      name: String(savedUser.name ?? profile.name ?? profile.email.split("@")[0]),
      email: String(savedUser.email ?? profile.email),
      avatar: String(savedUser.avatar_url ?? profile.picture ?? ""),
    };

    const escapedUser = JSON.stringify(user).replace(/</g, "\\u003c");
    return new NextResponse(
      `<!doctype html><script>localStorage.setItem("iqra-user",${JSON.stringify(escapedUser)});window.dispatchEvent(new Event("iqra-user-changed"));window.location.replace("/");</script>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (oauthError) {
    const message = oauthError instanceof Error ? oauthError.message : "Google sign-in failed";
    return NextResponse.redirect(new URL(`/login?oauth_error=${encodeURIComponent(message)}`, request.url));
  }
}