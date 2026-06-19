import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  usersTable,
  partnersTable,
  influencersTable,
  refreshTokensTable,
} from "@workspace/db";
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshExpiresAt,
} from "../lib/auth";
import { requireAuth } from "../middlewares/requireAuth";
import { z } from "zod";
import crypto from "crypto";

const router = Router();

const registerPartnerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(1),
  managerName: z.string().min(1),
  phone: z.string().min(1),
  country: z.string().min(1),
  address: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

const registerInfluencerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  country: z.string().min(1),
  bio: z.string().optional(),
  tiktokUrl: z.string().optional(),
  tiktokFollowers: z.number().int().min(0).optional(),
  instagramUrl: z.string().optional(),
  instagramFollowers: z.number().int().min(0).optional(),
  facebookUrl: z.string().optional(),
  facebookFollowers: z.number().int().min(0).optional(),
  youtubeUrl: z.string().optional(),
  youtubeFollowers: z.number().int().min(0).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function computeLevel(followers: number): "bronze" | "silver" | "gold" | "platinum" {
  if (followers >= 100000) return "platinum";
  if (followers >= 50000) return "gold";
  if (followers >= 10000) return "silver";
  return "bronze";
}

async function buildProfileResponse(userId: number, role: string) {
  if (role === "partner") {
    const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.userId, userId));
    return partner ?? null;
  }
  if (role === "influencer") {
    const [influencer] = await db.select().from(influencersTable).where(eq(influencersTable.userId, userId));
    return influencer ?? null;
  }
  return null;
}

router.post("/register-partner", async (req, res): Promise<void> => {
  const parsed = registerPartnerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, data.email));
  if (existing) {
    res.status(409).json({ error: "Cette adresse email est déjà utilisée" });
    return;
  }

  const passwordHash = await hashPassword(data.password);
  const [user] = await db.insert(usersTable).values({
    email: data.email,
    passwordHash,
    role: "partner",
    status: "pending",
  }).returning();

  const apiKey = crypto.randomBytes(32).toString("hex");
  const [partner] = await db.insert(partnersTable).values({
    userId: user.id,
    companyName: data.companyName,
    managerName: data.managerName,
    phone: data.phone,
    country: data.country,
    address: data.address,
    website: data.website,
    description: data.description,
    apiKey,
  }).returning();

  const payload = { userId: user.id, role: user.role, status: user.status };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await db.insert(refreshTokensTable).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: getRefreshExpiresAt(),
  });

  res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, status: user.status, profile: partner },
  });
});

router.post("/register-influencer", async (req, res): Promise<void> => {
  const parsed = registerInfluencerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, data.email));
  if (existing) {
    res.status(409).json({ error: "Cette adresse email est déjà utilisée" });
    return;
  }

  const passwordHash = await hashPassword(data.password);
  const [user] = await db.insert(usersTable).values({
    email: data.email,
    passwordHash,
    role: "influencer",
    status: "pending",
  }).returning();

  const totalFollowers = (data.tiktokFollowers ?? 0) + (data.instagramFollowers ?? 0) +
    (data.facebookFollowers ?? 0) + (data.youtubeFollowers ?? 0);
  const level = computeLevel(totalFollowers);

  const [influencer] = await db.insert(influencersTable).values({
    userId: user.id,
    fullName: data.fullName,
    phone: data.phone,
    country: data.country,
    bio: data.bio,
    level,
    totalFollowers,
    tiktokUrl: data.tiktokUrl,
    tiktokFollowers: data.tiktokFollowers ?? 0,
    instagramUrl: data.instagramUrl,
    instagramFollowers: data.instagramFollowers ?? 0,
    facebookUrl: data.facebookUrl,
    facebookFollowers: data.facebookFollowers ?? 0,
    youtubeUrl: data.youtubeUrl,
    youtubeFollowers: data.youtubeFollowers ?? 0,
  }).returning();

  const payload = { userId: user.id, role: user.role, status: user.status };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await db.insert(refreshTokensTable).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: getRefreshExpiresAt(),
  });

  res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, status: user.status, profile: influencer },
  });
});

router.post("/login", async (req, res): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email));
  if (!user) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  const valid = await comparePassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  const profile = await buildProfileResponse(user.id, user.role);
  const payload = { userId: user.id, role: user.role, status: user.status };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await db.insert(refreshTokensTable).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: getRefreshExpiresAt(),
  });

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, status: user.status, profile },
  });
});

router.post("/refresh", async (req, res): Promise<void> => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let payload: ReturnType<typeof verifyRefreshToken>;
  try {
    payload = verifyRefreshToken(parsed.data.refreshToken);
  } catch {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return;
  }

  const [stored] = await db.select().from(refreshTokensTable)
    .where(eq(refreshTokensTable.token, parsed.data.refreshToken));

  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
  if (!user) {
    res.status(401).json({ error: "Utilisateur introuvable" });
    return;
  }

  const newPayload = { userId: user.id, role: user.role, status: user.status };
  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  await db.delete(refreshTokensTable).where(eq(refreshTokensTable.token, parsed.data.refreshToken));
  await db.insert(refreshTokensTable).values({
    userId: user.id,
    token: newRefreshToken,
    expiresAt: getRefreshExpiresAt(),
  });

  const profile = await buildProfileResponse(user.id, user.role);

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: { id: user.id, email: user.email, role: user.role, status: user.status, profile },
  });
});

router.post("/logout", async (req, res): Promise<void> => {
  const parsed = refreshSchema.safeParse(req.body);
  if (parsed.success) {
    await db.delete(refreshTokensTable).where(eq(refreshTokensTable.token, parsed.data.refreshToken));
  }
  res.json({ message: "Déconnecté avec succès" });
});

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.userId));
  if (!dbUser) {
    res.status(404).json({ error: "Utilisateur introuvable" });
    return;
  }
  const profile = await buildProfileResponse(dbUser.id, dbUser.role);
  res.json({ id: dbUser.id, email: dbUser.email, role: dbUser.role, status: dbUser.status, profile });
});

export default router;
