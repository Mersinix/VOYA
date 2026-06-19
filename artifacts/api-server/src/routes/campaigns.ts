import { Router } from "express";
import { db } from "@workspace/db";
import { campaignsTable, categoriesTable, partnersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/requireAuth";

const router = Router();

router.get("/campaigns/public", requireAuth, requireRole("admin", "partner", "influencer"), async (req, res): Promise<void> => {
  const categoryId = req.query["categoryId"] ? parseInt(req.query["categoryId"] as string, 10) : undefined;
  const level = req.query["level"] as string | undefined;
  const page = Math.max(1, parseInt((req.query["page"] as string) || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt((req.query["limit"] as string) || "20", 10)));
  const offset = (page - 1) * limit;

  const levelOrder: Record<string, number> = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
  const userLevelNum = req.user?.role === "influencer" && level ? (levelOrder[level] ?? 1) : 1;

  const filters = [eq(campaignsTable.status, "active")];
  if (categoryId && !isNaN(categoryId)) {
    filters.push(eq(campaignsTable.categoryId, categoryId));
  }

  const rows = await db
    .select({
      id: campaignsTable.id,
      title: campaignsTable.title,
      description: campaignsTable.description,
      imageUrl: campaignsTable.imageUrl,
      commissionModel: campaignsTable.commissionModel,
      commissionAmount: campaignsTable.commissionAmount,
      minInfluencerLevel: campaignsTable.minInfluencerLevel,
      status: campaignsTable.status,
      productPrice: campaignsTable.productPrice,
      startDate: campaignsTable.startDate,
      endDate: campaignsTable.endDate,
      categoryName: categoriesTable.name,
      partnerName: partnersTable.companyName,
    })
    .from(campaignsTable)
    .leftJoin(categoriesTable, eq(campaignsTable.categoryId, categoriesTable.id))
    .leftJoin(partnersTable, eq(campaignsTable.partnerId, partnersTable.id))
    .where(and(...filters))
    .orderBy(campaignsTable.createdAt)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(campaignsTable)
    .where(and(...filters));

  res.json({
    campaigns: rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      commissionModel: r.commissionModel,
      commissionAmount: r.commissionAmount,
      minInfluencerLevel: r.minInfluencerLevel,
      status: r.status,
      productPrice: r.productPrice,
      startDate: r.startDate,
      endDate: r.endDate,
      category: r.categoryName ?? null,
      partnerName: r.partnerName ?? "Partner",
    })),
    total: count,
    page,
    limit,
  });
});

export default router;
