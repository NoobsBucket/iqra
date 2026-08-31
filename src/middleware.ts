import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_COOKIE_NAME = "iqra_session";
const ROLE_COOKIE_NAME = "iqra-role";

const isAdmin = (role: string | undefined) => role === "admin";
const isInstructorOrAdmin = (role: string | undefined) =>
  role === "admin" || role === "instructor";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isBlogPanelRoute = pathname.startsWith("/blog-panel");

  if (!isAdminRoute && !isBlogPanelRoute) {
    return NextResponse.next();
  }

  const roleCookie = req.cookies.get(ROLE_COOKIE_NAME)?.value;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  let role: string | undefined;

  if (roleCookie) {
    role = decodeURIComponent(roleCookie).toLowerCase();
  } else if (token && JWT_SECRET) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      role = typeof payload.role === "string" ? payload.role.toLowerCase() : undefined;
    } catch {
      role = undefined;
    }
  }

  if (!role) {
    return redirectToNotFound(req);
  }

  const allowed = isAdminRoute ? isAdmin(role) : isInstructorOrAdmin(role);

  if (!allowed) {
    return redirectToNotFound(req);
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function redirectToNotFound(req: NextRequest) {
  return NextResponse.redirect(new URL("/404", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/blog-panel/:path*"],
};
