import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-session";

export const runtime = "nodejs";

type RuntimeEnv = Record<string, string | undefined>;
type MediaType = "image" | "video";

const allowedTypes: Record<MediaType, Set<string>> = {
  image: new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]),
  video: new Set(["video/mp4", "video/webm", "video/quicktime", "video/mpeg"]),
};

const maxSizes: Record<MediaType, number> = {
  image: 20 * 1024 * 1024,
  video: 5 * 1024 * 1024 * 1024,
};

function getRuntimeEnv(): RuntimeEnv {
  try {
    return { ...process.env, ...(getCloudflareContext().env as RuntimeEnv) };
  } catch {
    return process.env;
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const requestProtocol = forwardedProtocol ?? request.nextUrl.protocol.replace(/:$/, "");
  let originUrl: URL | undefined;
  try {
    originUrl = origin ? new URL(origin) : undefined;
  } catch {
    originUrl = undefined;
  }
  const expectedOrigin = requestHost ? `${requestProtocol}://${requestHost}` : request.nextUrl.origin;
  if (!originUrl || originUrl.origin !== new URL(expectedOrigin).origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const env = getRuntimeEnv();
  const sessionToken = request.cookies.get("iqra_session")?.value;
  if (!sessionToken || !(await verifyAdminSessionToken(sessionToken, env))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    fileName?: unknown;
    contentType?: unknown;
    size?: unknown;
    mediaType?: unknown;
  } | null;
  const mediaType = body?.mediaType;
  const contentType = body?.contentType;
  const size = body?.size;

  if (
    (mediaType !== "image" && mediaType !== "video") ||
    typeof contentType !== "string" ||
    !allowedTypes[mediaType].has(contentType) ||
    typeof size !== "number" ||
    !Number.isSafeInteger(size) ||
    size < 1 ||
    size > maxSizes[mediaType]
  ) {
    return NextResponse.json({ error: "Unsupported file type or size." }, { status: 400 });
  }

  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucketName = env.R2_BUCKET_NAME;
  const publicUrl = env.R2_PUBLIC_URL?.replace(/\/+$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return NextResponse.json({ error: "R2 is not configured. Add the required server environment variables." }, { status: 503 });
  }

  const extension = typeof body?.fileName === "string" ? body.fileName.split(".").pop()?.toLowerCase() : undefined;
  const safeExtension = extension && /^[a-z0-9]{1,8}$/.test(extension) ? extension : "bin";
  const key = `${mediaType}s/${crypto.randomUUID()}.${safeExtension}`;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );

  return NextResponse.json({ uploadUrl, publicUrl: `${publicUrl}/${key}`, key });
}