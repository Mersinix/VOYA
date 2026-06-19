import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, partnersTable, influencersTable, categoriesTable,
  campaignsTable, subscriptionPlansTable, partnerSubscriptionsTable,
  affiliateLinksTable,
} from "@workspace/db";
import { eq, sql, and, ilike, gte, inArray } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/requireAuth";
import { z } from "zod";

const router = Router();
const partnerAuth = [requireAuth, requireRole("partner")];

async function getPartnerIdForUser(userId: number): Promise<number | null> {
  const [partner] = await db.select({ id: partnersTable.id }).from(partnersTable).where(eq(partnersTable.userId, userId));
  return partner?.id ?? null;
}

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get("/partner/stats", ...partnerAuth, async (req, res): Promise<void> => {
  const partnerId = await getPartnerIdForUser(req.user!.userId);
  if (!partnerId) { res.status(404).json({ error: "Partner profile not found" }); return; }

  const campaigns = await db.select().from(campaignsTable).where(eq(campaignsTable.partnerId, partnerId));
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalClicks = campaigns.reduce((s, c) => s + c.totalClicks, 0);
  const totalSales = campaigns.reduce((s, c) => s + c.totalSales, 0);
  const totalCommissions = campaigns.reduce((s, c) => s + parseFloat(c.totalCommissions), 0);

  // Count unique influencers across partner campaigns
  const campaignIds = campaigns.map(c => c.id);
  let totalInfluencers = 0;
  if (campaignIds.length > 0) {
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(distinct influencer_id) as integer)` })
      .from(affiliateLinksTable)
      .where(inArray(affiliateLinksTable.campaignId, campaignIds));
    totalInfluencers = count;
  }

  const sub = await db
    .select({ plan: subscriptionPlansTable, sub: partnerSubscriptionsTable })
    .from(partnerSubscriptionsTable)
    .innerJoin(subscriptionPlansTable, eq(partnerSubscriptionsTable.planId, subscriptionPlansTable.id))
    .where(and(eq(partnerSubscriptionsTable.partnerId, partnerId), eq(partnerSubscriptionsTable.status, "active")))
    .limit(1);

  res.json({
    activeCampaigns,
    totalCampaigns: campaigns.length,
    totalInfluencers,
    totalClicks,
    totalSales,
    totalCommissions: totalCommissions.toFixed(2),
    subscription: sub[0] ? { plan: sub[0].plan, status: sub[0].sub.status, endDate: sub[0].sub.endDate } : null,
  });
});

// ─── Partner Campaigns CRUD ────────────────────────────────────────────────────
router.get("/partner/campaigns", ...partnerAuth, async (req, res): Promise<void> => {
  const partnerId = await getPartnerIdForUser(req.user!.userId);
  if (!partnerId) { res.status(404).json({ error: "Partner profile not found" }); return; }

  const page = Math.max(1, parseInt((req.query["page"] as string) || "1", 10));
  const limit = Math.min(50, parseInt((req.query["limit"] as string) || "20", 10));
  const offset = (page - 1) * limit;

  const campaigns = await db
    .select({
      id: campaignsTable.id,
      title: campaignsTable.title,
      description: campaignsTable.description,
      imageUrl: campaignsTable.imageUrl,
      commissionModel: campaignsTable.commissionModel,
      commissionAmount: campaignsTable.commissionAmount,
      minInfluencerLevel: campaignsTable.minInfluencerLevel,
      status: campaignsTable.status,
      totalClicks: campaignsTable.totalClicks,
      totalLeads: campaignsTable.totalLeads,
      totalSales: campaignsTable.totalSales,
      totalCommissions: campaignsTable.totalCommissions,
      startDate: campaignsTable.startDate,
      endDate: campaignsTable.endDate,
      createdAt: campaignsTable.createdAt,
      categoryName: categoriesTable.name,
    })
    .from(campaignsTable)
    .leftJoin(categoriesTable, eq(campaignsTable.categoryId, categoriesTable.id))
    .where(eq(campaignsTable.partnerId, partnerId))
    .orderBy(campaignsTable.createdAt)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(campaignsTable)
    .where(eq(campaignsTable.partnerId, partnerId));

  res.json({ campaigns, total: count, page, limit });
});

router.post("/partner/campaigns", ...partnerAuth, async (req, res): Promise<void> => {
  const partnerId = await getPartnerIdForUser(req.user!.userId);
  if (!partnerId) { res.status(404).json({ error: "Partner profile not found" }); return; }

  const parsed = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    imageUrl: z.string().url().optional().or(z.literal("")),
    productUrl: z.string().url(),
    productPrice: z.string().optional(),
    commissionModel: z.enum(["cpa", "cpl"]),
    commissionAmount: z.string(),
    minInfluencerLevel: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
    categoryId: z.number().int().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data", details: parsed.error.issues }); return; }

  const [campaign] = await db.insert(campaignsTable).values({
    partnerId,
    ...parsed.data,
    minInfluencerLevel: parsed.data.minInfluencerLevel ?? "bronze",
    status: "pending",
  }).returning();
  res.status(201).json(campaign);
});

router.put("/partner/campaigns/:id", ...partnerAuth, async (req, res): Promise<void> => {
  const partnerId = await getPartnerIdForUser(req.user!.userId);
  if (!partnerId) { res.status(404).json({ error: "Partner profile not found" }); return; }

  const campaignId = parseInt(req.params["id"] as string, 10);
  const [campaign] = await db.select({ id: campaignsTable.id }).from(campaignsTable)
    .where(and(eq(campaignsTable.id, campaignId), eq(campaignsTable.partnerId, partnerId)));
  if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }

  const parsed = z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    imageUrl: z.string().optional(),
    productUrl: z.string().url().optional(),
    productPrice: z.string().optional(),
    commissionAmount: z.string().optional(),
    minInfluencerLevel: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  await db.update(campaignsTable).set(parsed.data).where(eq(campaignsTable.id, campaignId));
  res.json({ message: "Campaign updated" });
});

router.delete("/partner/campaigns/:id", ...partnerAuth, async (req, res): Promise<void> => {
  const partnerId = await getPartnerIdForUser(req.user!.userId);
  if (!partnerId) { res.status(404).json({ error: "Partner profile not found" }); return; }

  const campaignId = parseInt(req.params["id"] as string, 10);
  const [campaign] = await db.select({ id: campaignsTable.id }).from(campaignsTable)
    .where(and(eq(campaignsTable.id, campaignId), eq(campaignsTable.partnerId, partnerId)));
  if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }

  await db.delete(campaignsTable).where(eq(campaignsTable.id, campaignId));
  res.json({ message: "Campaign deleted" });
});

// ─── Influencer Directory ─────────────────────────────────────────────────────
router.get("/partner/influencers", ...partnerAuth, async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt((req.query["page"] as string) || "1", 10));
  const limit = Math.min(50, parseInt((req.query["limit"] as string) || "20", 10));
  const offset = (page - 1) * limit;

  const filters: ReturnType<typeof eq>[] = [eq(usersTable.status, "active")];
  if (req.query["country"]) filters.push(ilike(influencersTable.country, `%${req.query["country"]}%`) as any);
  if (req.query["level"]) filters.push(eq(influencersTable.level, req.query["level"] as "bronze" | "silver" | "gold" | "platinum"));
  if (req.query["minFollowers"]) filters.push(gte(influencersTable.totalFollowers, parseInt(req.query["minFollowers"] as string, 10)));

  const rows = await db
    .select({
      id: influencersTable.id,
      fullName: influencersTable.fullName,
      photoUrl: influencersTable.photoUrl,
      country: influencersTable.country,
      level: influencersTable.level,
      totalFollowers: influencersTable.totalFollowers,
      bio: influencersTable.bio,
      instagramUrl: influencersTable.instagramUrl,
      tiktokUrl: influencersTable.tiktokUrl,
      youtubeUrl: influencersTable.youtubeUrl,
    })
    .from(influencersTable)
    .innerJoin(usersTable, eq(influencersTable.userId, usersTable.id))
    .where(and(...filters))
    .orderBy(influencersTable.totalFollowers)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(influencersTable)
    .innerJoin(usersTable, eq(influencersTable.userId, usersTable.id))
    .where(and(...filters));

  res.json({ influencers: rows, total: count, page, limit });
});

// ─── Subscription ─────────────────────────────────────────────────────────────
router.get("/partner/subscription", ...partnerAuth, async (req, res): Promise<void> => {
  const partnerId = await getPartnerIdForUser(req.user!.userId);
  if (!partnerId) { res.status(404).json({ error: "Partner profile not found" }); return; }

  const sub = await db
    .select({ plan: subscriptionPlansTable, sub: partnerSubscriptionsTable })
    .from(partnerSubscriptionsTable)
    .innerJoin(subscriptionPlansTable, eq(partnerSubscriptionsTable.planId, subscriptionPlansTable.id))
    .where(eq(partnerSubscriptionsTable.partnerId, partnerId))
    .orderBy(partnerSubscriptionsTable.createdAt)
    .limit(1);

  res.json(sub[0] ? { plan: sub[0].plan, status: sub[0].sub.status, startDate: sub[0].sub.startDate, endDate: sub[0].sub.endDate } : null);
});

export default router;
