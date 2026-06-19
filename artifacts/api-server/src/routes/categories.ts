import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, subCategoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  const subs = await db.select().from(subCategoriesTable);

  const result = categories.map((cat) => ({
    ...cat,
    subCategories: subs.filter((s) => s.categoryId === cat.id),
  }));

  res.json(result);
});

export default router;
