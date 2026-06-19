import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

function requireSecret(key: string, devDefault: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env["NODE_ENV"] === "production") {
      throw new Error(`[VOYA] Missing required environment variable: ${key}. Set it before deploying.`);
    }
    // Dev-only fallback — never reaches production due to guard above
    return devDefault;
  }
  return value;
}

const ACCESS_SECRET = requireSecret("JWT_ACCESS_SECRET", "voya-access-secret-dev-only-not-for-production");
const REFRESH_SECRET = requireSecret("JWT_REFRESH_SECRET", "voya-refresh-secret-dev-only-not-for-production");
const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES_DAYS = 7;

export interface JwtPayload {
  userId: number;
  role: string;
  status: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: `${REFRESH_EXPIRES_DAYS}d` });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function getRefreshExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_EXPIRES_DAYS);
  return d;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
