import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, articlesTable } from "@workspace/db";
import {
  ListArticlesQueryParams,
  GetArticleParams,
  CreateArticleBody,
  UpdateArticleParams,
  UpdateArticleBody,
  DeleteArticleParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

const JOIN_MOVEMENT_MS = 90 * 24 * 60 * 60 * 1000;
const DEPART_MOVEMENT_MS = 30 * 24 * 60 * 60 * 1000;

function toDateOrNull(val: unknown): Date | null {
  if (!val) return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

function isStaffMovementVisible(
  row: typeof articlesTable.$inferSelect,
  now = Date.now(),
): boolean {
  if (row.category !== "StaffMovement" || !row.publishedAt) return true;
  const age = now - row.publishedAt.getTime();
  if (row.slug.includes("-departs-")) return age <= DEPART_MOVEMENT_MS;
  if (row.slug.includes("-joins-")) return age <= JOIN_MOVEMENT_MS;
  return true;
}

router.get("/articles", async (req, res): Promise<void> => {
  const queryParams = ListArticlesQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: "Invalid query parameters." });
    return;
  }

  const rows = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.isPublished, true))
    .orderBy(desc(articlesTable.publishedAt));

  let filtered = rows.filter(r => isStaffMovementVisible(r));
  if (queryParams.data.category) {
    filtered = filtered.filter((r) => r.category === queryParams.data.category);
  }

  res.json(filtered);
});

router.get("/articles/:slug", async (req, res): Promise<void> => {
  const params = GetArticleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid parameters." });
    return;
  }
  const [row] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.slug, params.data.slug));
  if (!row || !row.isPublished || !isStaffMovementVisible(row)) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(row);
});

router.get("/admin/articles", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(articlesTable)
    .orderBy(desc(articlesTable.createdAt));
  res.json(rows);
});

router.post("/admin/articles", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }
  const data = { ...parsed.data } as Record<string, unknown>;
  if (data.publishedAt) data.publishedAt = toDateOrNull(data.publishedAt);
  try {
    const [row] = await db.insert(articlesTable).values(data as never).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    const error = err as any;
    const code = error?.code || error?.cause?.code || error?.originalError?.code;
    if (code === "23505" || error?.message?.includes("duplicate key")) {
      res.status(400).json({ error: "An article with this slug already exists. Slugs must be unique." });
      return;
    }
    throw err;
  }
});

router.put("/admin/articles/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateArticleParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid parameters." }); return; }
  const parsed = UpdateArticleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body." }); return; }
  const data = { ...parsed.data } as Record<string, unknown>;
  if ("publishedAt" in data) {
    data.publishedAt = data.publishedAt ? toDateOrNull(data.publishedAt) : null;
  }
  try {
    const [row] = await db.update(articlesTable).set(data as never).where(eq(articlesTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Article not found" }); return; }
    res.json(row);
  } catch (err: unknown) {
    const error = err as any;
    const code = error?.code || error?.cause?.code || error?.originalError?.code;
    if (code === "23505" || error?.message?.includes("duplicate key")) {
      res.status(400).json({ error: "An article with this slug already exists. Slugs must be unique." });
      return;
    }
    throw err;
  }
});

router.delete("/admin/articles/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteArticleParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid parameters." }); return; }
  const [row] = await db.delete(articlesTable).where(eq(articlesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Article not found" }); return; }
  res.json({ success: true });
});

export default router;
