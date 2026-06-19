import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const influencerLevelEnum = pgEnum("influencer_level", ["bronze", "silver", "gold", "platinum"]);

export const influencersTable = pgTable("influencers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  photoUrl: text("photo_url"),
  phone: text("phone"),
  country: text("country").notNull(),
  bio: text("bio"),
  level: influencerLevelEnum("level").notNull().default("bronze"),
  totalFollowers: integer("total_followers").notNull().default(0),
  reputationScore: text("reputation_score").notNull().default("0"),
  totalEarnings: text("total_earnings").notNull().default("0"),
  availableBalance: text("available_balance").notNull().default("0"),
  // Social networks
  tiktokUrl: text("tiktok_url"),
  tiktokFollowers: integer("tiktok_followers").notNull().default(0),
  instagramUrl: text("instagram_url"),
  instagramFollowers: integer("instagram_followers").notNull().default(0),
  facebookUrl: text("facebook_url"),
  facebookFollowers: integer("facebook_followers").notNull().default(0),
  youtubeUrl: text("youtube_url"),
  youtubeFollowers: integer("youtube_followers").notNull().default(0),
  whatsappNumber: text("whatsapp_number"),
  otherNetworks: text("other_networks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInfluencerSchema = createInsertSchema(influencersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInfluencer = z.infer<typeof insertInfluencerSchema>;
export type Influencer = typeof influencersTable.$inferSelect;
