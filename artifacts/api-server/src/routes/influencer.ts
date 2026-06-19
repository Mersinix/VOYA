import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, influencersTable, campaignsTable, partnersTable,
  categoriesTable, affiliateLinksTable, commissionsTable, withdrawalsTable,
} from "@workspace/db";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/requireAuth";
import { z } from "zod";
import { randomBytes } from "crypto";

const router = Router();
const influencerAuth = [requireAuth, requireRole("influencer")];

async function getInfluencerForUser(userId: number) {
  const [inf] = await db.select().from(influencersTable).where(eq(influencersTable.userId, userId));
  return inf ?? null;
}

function getLevelMinFollowers(level: string): number {
  switch (level) {
    case "silver": return 10000;
    case "gold": return 50000;
    case "platinum": return 100000;
    default: return 0;
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get("/influencer/stats", ...influencerAuth, async (req, res): Promise<void> => {
  const inf = await getInfluencerForUser(req.user!.userId);
  if (!inf) { res.status(404).json({ error: "Influencer profile not found" }); return; }

  const links = await db.select().from(affiliateLinksTable).where(eq(affiliateLinksTable.influencerId, inf.id));
  const totalClicks = links.reduce((s, l) => s + l.totalClicks, 0);
  const totalSales = links.reduce((s, l) => s + l.totalSales, 0);
  const totalEarnings = links.reduce((s, l) => s + parseFloat(l.totalEarnings), 0);
  const activeCampaigns = links.filter(l => l.status === "active").length;

  const [pendingWithdrawal] = await db
    .select({ total: sql<string>`coalesce(sum(cast(amount as numeric)), 0)::text` })
    .from(withdrawalsTable)
    .where(and(eq(withdrawalsTable.influencerId, inf.id), eq(withdrawalsTable.status, "pending")));

  res.json({
    level: inf.level,
    totalFollowers: inf.totalFollowers,
    activeCampaigns,
    totalCampaigns: links.length,
    totalClicks,
    totalSales,
    totalEarnings: totalEarnings.toFixed(2),
    availableBalance: inf.availableBalance,
    pendingWithdrawal: pendingWithdrawal?.total ?? "0",
    reputationScore: inf.reputationScore,
  });
});

// ─── Full Profile ─────────────────────────────────────────────────────────────
router.get("/influencer/profile", ...influencerAuth, async (req, res): Promise<void> => {
  const inf = await getInfluencerForUser(req.user!.userId);
  if (!inf) { res.status(404).json({ error: "Influencer profile not found" }); return; }

  res.json({
    fullName: inf.fullName,
    bio: inf.bio,
    phone: inf.phone,
    country: inf.country,
    photoUrl: inf.photoUrl,
    instagramUrl: inf.instagramUrl,
    instagramFollowers: inf.instagramFollowers,
    tiktokUrl: inf.tiktokUrl,
    tiktokFollowers: inf.tiktokFollowers,
    youtubeUrl: inf.youtubeUrl,
    youtubeFollowers: inf.youtubeFollowers,
    facebookUrl: inf.facebookUrl,
    facebookFollowers: inf.facebookFollowers,
    level: inf.level,
    totalFollowers: inf.totalFollowers,
    reputationScore: inf.reputationScore,
    availableBalance: inf.availableBalance,
    totalEarnings: inf.totalEarnings,
  });
});

// ─── Available Campaigns (marketplace) ────────────────────────────────────────
router.get("/influencer/campaigns/available", ...influencerAuth, async (req, res): Promise<void> => {
  const inf = await getInfluencerForUser(req.user!.userId);
  if (!inf) { res.status(404).json({ error: "Influencer profile not found" }); return; }

  const page = Math.max(1, parseInt((req.query["page"] as string) || "1", 10));
  const limit = Math.min(50, parseInt((req.query["limit"] as string) || "20", 10));
  const offset = (page - 1) * limit;

  const levelOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
  const influencerLevelNum = levelOrder[inf.level] ?? 1;

  // Get campaigns the influencer already joined
  const joinedLinks = await db.select({ campaignId: affiliateLinksTable.campaignId })
    .from(affiliateLinksTable).where(eq(affiliateLinksTable.influencerId, inf.id));
  const joinedIds = joinedLinks.map(l => l.campaignId);

  // Base filter: active campaigns
  const rows = await db
    .select({
      id: campaignsTable.id,
      title: campaignsTable.title,
      description: campaignsTable.description,
      imageUrl: campaignsTable.imageUrl,
      commissionModel: campaignsTable.commissionModel,
      commissionAmount: campaignsTable.commissionAmount,
      minInfluencerLevel: campaignsTable.minInfluencerLevel,
      productPrice: campaignsTable.productPrice,
      startDate: campaignsTable.startDate,
      endDate: campaignsTable.endDate,
      categoryName: categoriesTable.name,
      partnerName: partnersTable.companyName,
      partnerLogo: partnersTable.logoUrl,
    })
    .from(campaignsTable)
    .leftJoin(categoriesTable, eq(campaignsTable.categoryId, categoriesTable.id))
    .leftJoin(partnersTable, eq(campaignsTable.partnerId, partnersTable.id))
    .where(eq(campaignsTable.status, "active"))
    .orderBy(campaignsTable.createdAt)
    .limit(limit)
    .offset(offset);

  // Filter by influencer level client-side (level mapping)
  const levelNames = ["bronze", "silver", "gold", "platinum"] as const;
  const accessible = rows.filter(r => {
    const minLevel = levelOrder[r.minInfluencerLevel as keyof typeof levelOrder] ?? 1;
    return influencerLevelNum >= minLevel;
  }).map(r => ({
    ...r,
    alreadyJoined: joinedIds.includes(r.id),
  }));

  res.json({ campaigns: accessible, total: accessible.length, page, limit });
});

// ─── Join Campaign → generate affiliate link ──────────────────────────────────
router.post("/influencer/campaigns/:id/join", ...influencerAuth, async (req, res): Promise<void> => {
  const inf = await getInfluencerForUser(req.user!.userId);
  if (!inf) { res.status(404).json({ error: "Influencer profile not found" }); return; }

  const campaignId = parseInt(req.params["id"] as string, 10);
  const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, campaignId));
  if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }
  if (campaign.status !== "active") { res.status(400).json({ error: "Campaign is not active" }); return; }

  // Check level requirement
  const levelOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
  if ((levelOrder[inf.level] ?? 0) < (levelOrder[campaign.minInfluencerLevel as keyof typeof levelOrder] ?? 1)) {
    res.status(403).json({ error: "Your level is too low to join this campaign" });
    return;
  }

  // Check not already joined
  const [existing] = await db.select({ id: affiliateLinksTable.id })
    .from(affiliateLinksTable)
    .where(and(eq(affiliateLinksTable.campaignId, campaignId), eq(affiliateLinksTable.influencerId, inf.id)));
  if (existing) { res.status(409).json({ error: "Already joined this campaign" }); return; }

  // Generate unique code
  let code = randomBytes(4).toString("hex").toUpperCase();
  let collision = true;
  while (collision) {
    const [exists] = await db.select({ id: affiliateLinksTable.id }).from(affiliateLinksTable).where(eq(affiliateLinksTable.code, code));
    if (!exists) { collision = false; } else { code = randomBytes(4).toString("hex").toUpperCase(); }
  }

  const [link] = await db.insert(affiliateLinksTable).values({
    campaignId,
    influencerId: inf.id,
    code,
    status: "active",
  }).returning();

  res.status(201).json({ ...link, affiliateUrl: `https://voya.tn/ref/${code}` });
});

// ─── My Campaigns (joined) ────────────────────────────────────────────────────
router.get("/influencer/campaigns/mine", ...influencerAuth, async (req, res): Promise<void> => {
  const inf = await getInfluencerForUser(req.user!.userId);
  if (!inf) { res.status(404).json({ error: "Influencer profile not found" }); return; }

  const rows = await db
    .select({
      linkId: affiliateLinksTable.id,
      code: affiliateLinksTable.code,
      status: affiliateLinksTable.status,
      totalClicks: affiliateLinksTable.totalClicks,
      totalSales: affiliateLinksTable.totalSales,
      totalEarnings: affiliateLinksTable.totalEarnings,
      createdAt: affiliateLinksTable.createdAt,
      campaignId: campaignsTable.id,
      title: campaignsTable.title,
      commissionModel: campaignsTable.commissionModel,
      commissionAmount: campaignsTable.commissionAmount,
      campaignStatus: campaignsTable.status,
      partnerName: partnersTable.companyName,
    })
    .from(affiliateLinksTable)
    .innerJoin(campaignsTable, eq(affiliateLinksTable.campaignId, campaignsTable.id))
    .leftJoin(partnersTable, eq(campaignsTable.partnerId, partnersTable.id))
    .where(eq(affiliateLinksTable.influencerId, inf.id))
    .orderBy(desc(affiliateLinksTable.createdAt));

  res.json(rows.map(r => ({
    ...r,
    affiliateUrl: `https://voya.tn/ref/${r.code}`,
  })));
});

// ─── Leaderboard ──────────────────────────────────────────────────────────────
router.get("/influencer/leaderboard", ...influencerAuth, async (req, res): Promise<void> => {
  const period = (req.query["period"] as string) || "all";

  // For period-based leaderboard, use commissions table filtered by date
  // For "all", use total_earnings on influencer profile for performance
  if (period === "all") {
    const rows = await db
      .select({
        id: influencersTable.id,
        fullName: influencersTable.fullName,
        photoUrl: influencersTable.photoUrl,
        level: influencersTable.level,
        totalFollowers: influencersTable.totalFollowers,
        totalEarnings: influencersTable.totalEarnings,
        reputationScore: influencersTable.reputationScore,
      })
      .from(influencersTable)
      .innerJoin(usersTable, eq(influencersTable.userId, usersTable.id))
      .where(eq(usersTable.status, "active"))
      .orderBy(desc(influencersTable.totalEarnings))
      .limit(20);

    res.json(rows.map((r, i) => ({ ...r, earnings: r.totalEarnings, rank: i + 1 })));
    return;
  }

  // Period-based: query commissions
  const intervalMap: Record<string, string> = { "7d": "7 days", "30d": "30 days" };
  const interval = intervalMap[period] ?? "30 days";

  const rows = await db.execute(
    sql`SELECT
      i.id,
      i.full_name as "fullName",
      i.photo_url as "photoUrl",
      i.level,
      i.total_followers as "totalFollowers",
      i.reputation_score as "reputationScore",
      COALESCE(SUM(CAST(c.amount AS numeric)), 0)::text as earnings
    FROM influencers i
    INNER JOIN users u ON i.user_id = u.id
    LEFT JOIN commissions c ON c.influencer_id = i.id
      AND c.created_at >= NOW() - INTERVAL ${sql.raw(`'${interval}'`)}
    WHERE u.status = 'active'
    GROUP BY i.id, i.full_name, i.photo_url, i.level, i.total_followers, i.reputation_score
    ORDER BY earnings DESC
    LIMIT 20`
  );

  res.json((rows as any[]).map((r: any, i: number) => ({ ...r, rank: i + 1 })));
});

// ─── Update Profile ───────────────────────────────────────────────────────────
router.put("/influencer/profile", ...influencerAuth, async (req, res): Promise<void> => {
  const inf = await getInfluencerForUser(req.user!.userId);
  if (!inf) { res.status(404).json({ error: "Influencer profile not found" }); return; }

  const parsed = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
    bio: z.string().optional(),
    photoUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    instagramFollowers: z.number().optional(),
    tiktokUrl: z.string().optional(),
    tiktokFollowers: z.number().optional(),
    youtubeUrl: z.string().optional(),
    youtubeFollowers: z.number().optional(),
    facebookUrl: z.string().optional(),
    facebookFollowers: z.number().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  const data = parsed.data;
  // Recalculate followers and level
  const totalFollowers = (data.instagramFollowers ?? inf.instagramFollowers) +
    (data.tiktokFollowers ?? inf.tiktokFollowers) +
    (data.youtubeFollowers ?? inf.youtubeFollowers) +
    (data.facebookFollowers ?? inf.facebookFollowers);

  let level: "bronze" | "silver" | "gold" | "platinum" = "bronze";
  if (totalFollowers >= 100000) level = "platinum";
  else if (totalFollowers >= 50000) level = "gold";
  else if (totalFollowers >= 10000) level = "silver";

  await db.update(influencersTable).set({ ...data, totalFollowers, level }).where(eq(influencersTable.id, inf.id));
  res.json({ message: "Profile updated", level, totalFollowers });
});

// ─── Withdrawal Request ───────────────────────────────────────────────────────
router.post("/influencer/withdrawal", ...influencerAuth, async (req, res): Promise<void> => {
  const inf = await getInfluencerForUser(req.user!.userId);
  if (!inf) { res.status(404).json({ error: "Influencer profile not found" }); return; }

  const parsed = z.object({
    amount: z.string(),
    paymentMethod: z.string().min(1),
    paymentDetails: z.string().min(1),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  const requestedAmount = parseFloat(parsed.data.amount);
  const available = parseFloat(inf.availableBalance);
  if (requestedAmount > available) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }

  const [withdrawal] = await db.insert(withdrawalsTable).values({
    influencerId: inf.id,
    ...parsed.data,
    status: "pending",
  }).returning();
  res.status(201).json(withdrawal);
});

router.get("/influencer/withdrawals", ...influencerAuth, async (req, res): Promise<void> => {
  const inf = await getInfluencerForUser(req.user!.userId);
  if (!inf) { res.status(404).json({ error: "Influencer profile not found" }); return; }

  const withdrawals = await db.select().from(withdrawalsTable)
    .where(eq(withdrawalsTable.influencerId, inf.id))
    .orderBy(desc(withdrawalsTable.createdAt));

  res.json(withdrawals);
});

export default router;
