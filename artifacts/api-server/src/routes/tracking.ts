import { Router } from "express";
import { db } from "@workspace/db";
import {
  affiliateLinksTable, trackingEventsTable, campaignsTable,
  influencersTable, commissionsTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ─── Tracking event ingestion: POST /api/tracking/event ──────────────────────
// Partners call this from their sites to report LEAD or PURCHASE events
router.post("/event", async (req, res): Promise<void> => {
  const parsed = z.object({
    code: z.string().min(1),
    eventType: z.enum(["lead", "purchase", "view"]),
    amount: z.string().optional(),
    externalRef: z.string().optional(),
    metadata: z.string().optional(),
  }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
    return;
  }

  const { code, eventType, amount, externalRef, metadata } = parsed.data;
  const upperCode = code.toUpperCase();

  const [row] = await db
    .select({
      linkId: affiliateLinksTable.id,
      influencerId: affiliateLinksTable.influencerId,
      campaignId: campaignsTable.id,
      commissionModel: campaignsTable.commissionModel,
      commissionAmount: campaignsTable.commissionAmount,
      campaignStatus: campaignsTable.status,
    })
    .from(affiliateLinksTable)
    .innerJoin(campaignsTable, eq(affiliateLinksTable.campaignId, campaignsTable.id))
    .where(and(eq(affiliateLinksTable.code, upperCode), eq(affiliateLinksTable.status, "active")));

  if (!row) {
    res.status(404).json({ error: "Affiliate link not found or inactive" });
    return;
  }

  if (row.campaignStatus !== "active") {
    res.status(400).json({ error: "Campaign is not active" });
    return;
  }

  const [event] = await db.insert(trackingEventsTable).values({
    linkId: row.linkId,
    eventType,
    amount: amount ?? null,
    externalRef: externalRef ?? null,
    metadata: metadata ?? null,
    ipAddress: req.ip ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  }).returning();

  // Calculate commission for purchase or lead events
  if (eventType === "purchase" || eventType === "lead") {
    let commissionAmt = "0";

    if (eventType === "purchase" && row.commissionModel === "cpa") {
      commissionAmt = row.commissionAmount;
    } else if (eventType === "lead" && row.commissionModel === "cpl") {
      commissionAmt = row.commissionAmount;
    }

    const commissionNum = parseFloat(commissionAmt);
    if (commissionNum > 0) {
      await db.insert(commissionsTable).values({
        influencerId: row.influencerId,
        campaignId: row.campaignId,
        trackingEventId: event.id,
        amount: commissionAmt,
        status: "pending",
      });

      await db.execute(
        sql`UPDATE influencers SET
          available_balance = (CAST(available_balance AS numeric) + ${commissionNum})::text,
          total_earnings = (CAST(total_earnings AS numeric) + ${commissionNum})::text
          WHERE id = ${row.influencerId}`
      );

      if (eventType === "purchase") {
        await db.update(affiliateLinksTable).set({
          totalSales: sql`${affiliateLinksTable.totalSales} + 1`,
          totalEarnings: sql`(CAST(${affiliateLinksTable.totalEarnings} AS numeric) + ${commissionNum})::text`,
        }).where(eq(affiliateLinksTable.id, row.linkId));

        await db.execute(
          sql`UPDATE campaigns SET
            total_sales = total_sales + 1,
            total_commissions = (CAST(total_commissions AS numeric) + ${commissionNum})::text
            WHERE id = ${row.campaignId}`
        );
      } else {
        await db.update(affiliateLinksTable).set({
          totalLeads: sql`${affiliateLinksTable.totalLeads} + 1`,
          totalEarnings: sql`(CAST(${affiliateLinksTable.totalEarnings} AS numeric) + ${commissionNum})::text`,
        }).where(eq(affiliateLinksTable.id, row.linkId));

        await db.execute(
          sql`UPDATE campaigns SET
            total_leads = total_leads + 1,
            total_commissions = (CAST(total_commissions AS numeric) + ${commissionNum})::text
            WHERE id = ${row.campaignId}`
        );
      }
    }
  }

  res.json({ success: true, eventId: event.id });
});

export { router as trackingRouter };
export default router;
