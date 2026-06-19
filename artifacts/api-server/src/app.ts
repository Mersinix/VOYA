import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { affiliateLinksTable, campaignsTable, trackingEventsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Public affiliate redirect: /r/:code ─────────────────────────────────────
app.get("/r/:code", async (req, res): Promise<void> => {
  const code = (req.params["code"] as string)?.toUpperCase();
  if (!code) { res.status(400).send("Invalid link"); return; }

  const [link] = await db
    .select({
      id: affiliateLinksTable.id,
      status: affiliateLinksTable.status,
      productUrl: campaignsTable.productUrl,
      campaignId: campaignsTable.id,
      campaignStatus: campaignsTable.status,
    })
    .from(affiliateLinksTable)
    .innerJoin(campaignsTable, eq(affiliateLinksTable.campaignId, campaignsTable.id))
    .where(eq(affiliateLinksTable.code, code));

  if (!link || link.status !== "active" || link.campaignStatus !== "active") {
    res.status(404).send("Link not found or inactive");
    return;
  }

  // Fire-and-forget: record CLICK event
  db.insert(trackingEventsTable).values({
    linkId: link.id,
    eventType: "click",
    ipAddress: req.ip ?? null,
    userAgent: req.headers["user-agent"] ?? null,
    referrer: req.headers["referer"] ?? null,
  }).then(() => Promise.all([
    db.update(affiliateLinksTable)
      .set({ totalClicks: sql`${affiliateLinksTable.totalClicks} + 1` })
      .where(eq(affiliateLinksTable.id, link.id)),
    db.execute(sql`UPDATE campaigns SET total_clicks = total_clicks + 1 WHERE id = ${link.campaignId}`),
  ])).catch(() => {});

  res.redirect(302, link.productUrl);
});

app.use("/api", router);

export default app;
