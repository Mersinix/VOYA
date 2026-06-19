import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { influencersTable } from "./influencers";
import { campaignsTable } from "./campaigns";
import { trackingEventsTable } from "./tracking";

export const commissionStatusEnum = pgEnum("commission_status", ["pending", "validated", "paid", "rejected"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "processing", "completed", "rejected"]);

export const commissionsTable = pgTable("commissions", {
  id: serial("id").primaryKey(),
  influencerId: integer("influencer_id").notNull().references(() => influencersTable.id),
  campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id),
  trackingEventId: integer("tracking_event_id").references(() => trackingEventsTable.id),
  amount: text("amount").notNull(),
  status: commissionStatusEnum("status").notNull().default("pending"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const withdrawalsTable = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  influencerId: integer("influencer_id").notNull().references(() => influencersTable.id),
  amount: text("amount").notNull(),
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  paymentDetails: text("payment_details"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCommissionSchema = createInsertSchema(commissionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissionsTable.$inferSelect;

export const insertWithdrawalSchema = createInsertSchema(withdrawalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawalsTable.$inferSelect;
