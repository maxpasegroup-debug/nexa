import { createHmac, randomBytes, timingSafeEqual } from "crypto";

type UniverseJwtPayload = {
  userId: string;
  phone: string;
};

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function getSecret() {
  const secret = process.env.UNIVERSE_JWT_SECRET ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("UNIVERSE_JWT_SECRET is not configured");
  }

  return secret;
}

export function assertUniverseJwtSecret() {
  getSecret();
}

export function signUniverseToken(payload: UniverseJwtPayload) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    }),
  );
  const signature = base64UrlEncode(
    createHmac("sha256", getSecret()).update(`${header}.${body}`).digest(),
  );

  return `${header}.${body}.${signature}`;
}

export function verifyUniverseToken(token: string): UniverseJwtPayload {
  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) {
    throw new Error("Invalid token");
  }

  const expected = base64UrlEncode(
    createHmac("sha256", getSecret()).update(`${header}.${body}`).digest(),
  );
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature");
  }

  const parsed = JSON.parse(base64UrlDecode(body)) as UniverseJwtPayload & { exp?: number };

  if (!parsed.userId || !parsed.phone || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Expired token");
  }

  return { userId: parsed.userId, phone: parsed.phone };
}

export function getUniverseBearerToken(request: Request) {
  const auth = request.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return null;
  }

  return auth.slice("Bearer ".length).trim();
}

export function normalizeUniversePhone(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    return digits;
  }

  return `+91${digits.replace(/^91(?=\d{10}$)/, "")}`;
}

export function createReferralCode() {
  return randomBytes(6).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
}
