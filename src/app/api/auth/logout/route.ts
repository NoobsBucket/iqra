import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const cookieOptions = {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("iqra_session", "", cookieOptions);
  response.cookies.set("iqra-role", "", { ...cookieOptions, httpOnly: false });
  return response;
}