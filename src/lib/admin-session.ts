import { createHmac } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

export type AdminSessionEnv = {
  JWT_SECRET?: string;
  R2_SECRET_ACCESS_KEY?: string;
};

function getSigningKey(env: AdminSessionEnv) {
  const secret = env.JWT_SECRET || env.R2_SECRET_ACCESS_KEY;
  return secret ? createHmac("sha256", secret).update("iqra-admin-session-v1").digest() : undefined;
}

export async function createAdminSessionToken(userId: string, role: string, env: AdminSessionEnv) {
  const key = getSigningKey(env);
  if (!key || !userId || role.toLowerCase() !== "admin") return undefined;

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer("iqra-web")
    .setAudience("iqra-admin-upload")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAdminSessionToken(token: string, env: AdminSessionEnv) {
  const key = getSigningKey(env);
  if (!key) return false;

  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: "iqra-web",
      audience: "iqra-admin-upload",
      algorithms: ["HS256"],
    });
    return payload.role === "admin" && typeof payload.sub === "string";
  } catch {
    return false;
  }
}