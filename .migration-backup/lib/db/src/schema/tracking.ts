import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { campaignsTable } from "./campaigns";
import { influencersTable } from "./influencers";

export const eventTypeEnum = pgEnum("event_type", ["click", "view", "lead", "purchase"]);
export const linkStatusEnum = pgEnum("link_status", ["active", "paused", "expired"]);

export const affiliateLinksTable = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id, { onDelete: "cascade" }),
  influencerId: integer("influencer_id").notNull().references(() => influencersTable.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(), // e.g. ABCD123
  status: linkStatusEnum("status").notNull().default("active"),
  totalClicks: integer("total_clicks").notNull().default(0),
  totalLeads: integer("total_leads").notNull().default(0),
  totalSales: integer("total_sales").notNull().default(0),
  totalEarnings: text("total_earnings").notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const trackingEventsTable = pgTable("tracking_events", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").notNull().references(() => affiliateLinksTable.id, { onDelete: "cascade" }),
  eventType: eventTypeEnum("event_type").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  amount: text("amount"), // for purchase events
  externalRef: text("external_ref"), // order ID from partner
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinksTable).omit({ id: true, createdAt: true, totalClicks: true, totalLeads: true, totalSales: true, totalEarnings: true });
export type InsertAffiliateLink = z.infer<typeof insertAffiliateLinkSchema>;
export type AffiliateLink = typeof affiliateLinksTable.$inferSelect;
