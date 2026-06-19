import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, partnersTable, influencersTable, categoriesTable,
  subCategoriesTable, campaignsTable, subscriptionPlansTable,
  partnerSubscriptionsTable, commissionsTable, affiliateLinksTable,
} from "@workspace/db";
import { eq, sql, and, ne } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/requireAuth";
import { z } from "zod";

const router = Router();
const adminAuth = [requireAuth, requireRole("admin")];

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get("/admin/stats", ...adminAuth, async (_req, res): Promise<void> => {
  const [[users], [partners], [influencers], [campaigns], [commissions]] = await Promise.all([
    db.select({ count: sql<number>`cast(count(*) as integer)` }).from(usersTable),
    db.select({ count: sql<number>`cast(count(*) as integer)` }).from(partnersTable),
    db.select({ count: sql<number>`cast(count(*) as integer)` }).from(influencersTable),
    db.select({ count: sql<number>`cast(count(*) as integer)` }).from(campaignsTable),
    db.select({ total: sql<string>`coalesce(sum(cast(amount as numeric)), 0)::text` }).from(commissionsTable),
  ]);
  const [activePartners] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(usersTable).where(and(eq(usersTable.role, "partner"), eq(usersTable.status, "active")));
  const [activeInfluencers] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(usersTable).where(and(eq(usersTable.role, "influencer"), eq(usersTable.status, "active")));
  const [activeCampaigns] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(campaignsTable).where(eq(campaignsTable.status, "active"));
  const [pendingPartners] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(usersTable).where(and(eq(usersTable.role, "partner"), eq(usersTable.status, "pending")));
  const [pendingInfluencers] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(usersTable).where(and(eq(usersTable.role, "influencer"), eq(usersTable.status, "pending")));

  res.json({
    totalUsers: users.count,
    totalPartners: partners.count,
    totalInfluencers: influencers.count,
    totalCampaigns: campaigns.count,
    activePartners: activePartners.count,
    activeInfluencers: activeInfluencers.count,
    activeCampaigns: activeCampaigns.count,
    pendingPartners: pendingPartners.count,
    pendingInfluencers: pendingInfluencers.count,
    totalCommissions: commissions.total,
  });
});

// ─── Partners ─────────────────────────────────────────────────────────────────
router.get("/admin/partners", ...adminAuth, async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt((req.query["page"] as string) || "1", 10));
  const limit = Math.min(50, parseInt((req.query["limit"] as string) || "20", 10));
  const offset = (page - 1) * limit;
  const status = req.query["status"] as string | undefined;

  const filters = status ? [eq(usersTable.status, status as "active" | "pending" | "suspended")] : [];

  const rows = await db
    .select({
      id: partnersTable.id,
      userId: partnersTable.userId,
      companyName: partnersTable.companyName,
      managerName: partnersTable.managerName,
      email: usersTable.email,
      phone: partnersTable.phone,
      country: partnersTable.country,
      website: partnersTable.website,
      logoUrl: partnersTable.logoUrl,
      status: usersTable.status,
      createdAt: partnersTable.createdAt,
    })
    .from(partnersTable)
    .innerJoin(usersTable, eq(partnersTable.userId, usersTable.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(partnersTable.createdAt)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(partnersTable)
    .innerJoin(usersTable, eq(partnersTable.userId, usersTable.id))
    .where(filters.length ? and(...filters) : undefined);

  res.json({ partners: rows, total: count, page, limit });
});

router.put("/admin/partners/:id/status", ...adminAuth, async (req, res): Promise<void> => {
  const partnerId = parseInt(req.params["id"] as string, 10);
  const parsed = z.object({ status: z.enum(["active", "pending", "suspended"]) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid status" }); return; }

  const [partner] = await db.select({ userId: partnersTable.userId }).from(partnersTable).where(eq(partnersTable.id, partnerId));
  if (!partner) { res.status(404).json({ error: "Partner not found" }); return; }

  await db.update(usersTable).set({ status: parsed.data.status }).where(eq(usersTable.id, partner.userId));
  res.json({ message: "Status updated" });
});

// ─── Influencers ──────────────────────────────────────────────────────────────
router.get("/admin/influencers", ...adminAuth, async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt((req.query["page"] as string) || "1", 10));
  const limit = Math.min(50, parseInt((req.query["limit"] as string) || "20", 10));
  const offset = (page - 1) * limit;
  const status = req.query["status"] as string | undefined;

  const filters = status ? [eq(usersTable.status, status as "active" | "pending" | "suspended")] : [];

  const rows = await db
    .select({
      id: influencersTable.id,
      userId: influencersTable.userId,
      fullName: influencersTable.fullName,
      email: usersTable.email,
      phone: influencersTable.phone,
      country: influencersTable.country,
      level: influencersTable.level,
      totalFollowers: influencersTable.totalFollowers,
      totalEarnings: influencersTable.totalEarnings,
      photoUrl: influencersTable.photoUrl,
      status: usersTable.status,
      createdAt: influencersTable.createdAt,
    })
    .from(influencersTable)
    .innerJoin(usersTable, eq(influencersTable.userId, usersTable.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(influencersTable.createdAt)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(influencersTable)
    .innerJoin(usersTable, eq(influencersTable.userId, usersTable.id))
    .where(filters.length ? and(...filters) : undefined);

  res.json({ influencers: rows, total: count, page, limit });
});

router.put("/admin/influencers/:id/status", ...adminAuth, async (req, res): Promise<void> => {
  const influencerId = parseInt(req.params["id"] as string, 10);
  const parsed = z.object({ status: z.enum(["active", "pending", "suspended"]) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid status" }); return; }

  const [inf] = await db.select({ userId: influencersTable.userId }).from(influencersTable).where(eq(influencersTable.id, influencerId));
  if (!inf) { res.status(404).json({ error: "Influencer not found" }); return; }

  await db.update(usersTable).set({ status: parsed.data.status }).where(eq(usersTable.id, inf.userId));
  res.json({ message: "Status updated" });
});

// ─── Campaigns ────────────────────────────────────────────────────────────────
router.get("/admin/campaigns", ...adminAuth, async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt((req.query["page"] as string) || "1", 10));
  const limit = Math.min(50, parseInt((req.query["limit"] as string) || "20", 10));
  const offset = (page - 1) * limit;
  const status = req.query["status"] as string | undefined;

  const filters = status ? [eq(campaignsTable.status, status as "pending" | "active" | "paused" | "completed" | "rejected")] : [];

  const rows = await db
    .select({
      id: campaignsTable.id,
      title: campaignsTable.title,
      commissionModel: campaignsTable.commissionModel,
      commissionAmount: campaignsTable.commissionAmount,
      status: campaignsTable.status,
      minInfluencerLevel: campaignsTable.minInfluencerLevel,
      totalClicks: campaignsTable.totalClicks,
      totalSales: campaignsTable.totalSales,
      totalCommissions: campaignsTable.totalCommissions,
      startDate: campaignsTable.startDate,
      endDate: campaignsTable.endDate,
      createdAt: campaignsTable.createdAt,
      partnerName: partnersTable.companyName,
      categoryName: categoriesTable.name,
    })
    .from(campaignsTable)
    .leftJoin(partnersTable, eq(campaignsTable.partnerId, partnersTable.id))
    .leftJoin(categoriesTable, eq(campaignsTable.categoryId, categoriesTable.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(campaignsTable.createdAt)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(campaignsTable)
    .where(filters.length ? and(...filters) : undefined);

  res.json({ campaigns: rows, total: count, page, limit });
});

router.put("/admin/campaigns/:id/status", ...adminAuth, async (req, res): Promise<void> => {
  const campaignId = parseInt(req.params["id"] as string, 10);
  const parsed = z.object({ status: z.enum(["pending", "active", "paused", "completed", "rejected"]) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid status" }); return; }

  const [campaign] = await db.select({ id: campaignsTable.id }).from(campaignsTable).where(eq(campaignsTable.id, campaignId));
  if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }

  await db.update(campaignsTable).set({ status: parsed.data.status }).where(eq(campaignsTable.id, campaignId));
  res.json({ message: "Campaign status updated" });
});

// ─── Categories ───────────────────────────────────────────────────────────────
router.post("/admin/categories", ...adminAuth, async (req, res): Promise<void> => {
  const parsed = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    icon: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json(cat);
});

router.put("/admin/categories/:id", ...adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  const parsed = z.object({ name: z.string().min(1).optional(), icon: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  await db.update(categoriesTable).set(parsed.data).where(eq(categoriesTable.id, id));
  res.json({ message: "Category updated" });
});

router.delete("/admin/categories/:id", ...adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ message: "Category deleted" });
});

router.post("/admin/categories/:id/subcategories", ...adminAuth, async (req, res): Promise<void> => {
  const categoryId = parseInt(req.params["id"] as string, 10);
  const parsed = z.object({ name: z.string().min(1), slug: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  const [sub] = await db.insert(subCategoriesTable).values({ ...parsed.data, categoryId }).returning();
  res.status(201).json(sub);
});

// ─── Subscription Plans ────────────────────────────────────────────────────────
router.get("/admin/plans", ...adminAuth, async (_req, res): Promise<void> => {
  const plans = await db.select().from(subscriptionPlansTable).orderBy(subscriptionPlansTable.id);
  res.json(plans);
});

router.post("/admin/plans", ...adminAuth, async (req, res): Promise<void> => {
  const parsed = z.object({
    name: z.string().min(1),
    tier: z.enum(["starter", "business", "premium"]),
    priceMonthly: z.string(),
    maxCampaigns: z.number().nullable().optional(),
    maxInfluencers: z.number().nullable().optional(),
    allowedLevels: z.string(),
    features: z.string(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  const [plan] = await db.insert(subscriptionPlansTable).values(parsed.data).returning();
  res.status(201).json(plan);
});

router.put("/admin/plans/:id", ...adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  const parsed = z.object({
    name: z.string().min(1).optional(),
    priceMonthly: z.string().optional(),
    maxCampaigns: z.number().nullable().optional(),
    isActive: z.boolean().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  await db.update(subscriptionPlansTable).set(parsed.data).where(eq(subscriptionPlansTable.id, id));
  res.json({ message: "Plan updated" });
});

export default router;
