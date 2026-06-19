import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subCategoriesTable = pgTable("sub_categories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

export const insertSubCategorySchema = createInsertSchema(subCategoriesTable).omit({ id: true, createdAt: true });
export type InsertSubCategory = z.infer<typeof insertSubCategorySchema>;
export type SubCategory = typeof subCategoriesTable.$inferSelect;
