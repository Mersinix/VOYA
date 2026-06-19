import { pgTable, text, serial, integer, timestamp, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { partnersTable } from "./partners";
import { categoriesTable } from "./categories";
import { subCategoriesTable } from "./categories";

export const campaignStatusEnum = pgEnum("campaign_status", ["pending", "active", "paused", "completed", "rejected"]);
export const commissionModelEnum = pgEnum("commission_model", ["cpa", "cpl"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partnersTable.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  subCategoryId: integer("sub_category_id").references(() => subCategoriesTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  productUrl: text("product_url").notNull(),
  productPrice: text("product_price"),
  stockAvailable: integer("stock_available"),
  commissionModel: commissionModelEnum("commission_model").notNull(),
  commissionAmount: text("commission_amount").notNull(), // amount per conversion in DT
  objective: text("objective"),
  minInfluencerLevel: text("min_influencer_level").notNull().default("bronze"),
  status: campaignStatusEnum("status").notNull().default("pending"),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  totalClicks: integer("total_clicks").notNull().default(0),
  totalLeads: integer("total_leads").notNull().default(0),
  totalSales: integer("total_sales").notNull().default(0),
  totalCommissions: text("total_commissions").notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const campaignApplicationsTable = pgTable("campaign_applications", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id, { onDelete: "cascade" }),
  influencerId: integer("influencer_id").notNull(),
  status: applicationStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({ id: true, createdAt: true, updatedAt: true, totalClicks: true, totalLeads: true, totalSales: true, totalCommissions: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;
