import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, articlesTable } from "@workspace/db";
import {
  ListArticlesQueryParams,
  ListArticlesResponse,
  GetArticleParams,
  GetArticleResponse,
  AdminListArticlesResponse,
  CreateArticleBody,
  UpdateArticleParams,
  UpdateArticleBody,
  UpdateArticleResponse,
  DeleteArticleParams,
  DeleteArticleResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/articles", async (req, res): Promise<void> => {
  const queryParams = ListArticlesQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.isPublished, true))
    .orderBy(desc(articlesTable.publishedAt));

  let filtered = rows;
  if (queryParams.data.category) {
    filtered = rows.filter((r) => r.category === queryParams.data.category);
  }

  res.json(filtered);
});

router.get("/articles/:slug", async (req, res): Promise<void> => {
  const params = GetArticleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.slug, params.data.slug));
  if (!row) {
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
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(articlesTable).values(parsed.data).returning();
  res.status(201).json(GetArticleResponse.parse(row));
});

router.put("/admin/articles/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateArticleParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateArticleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(articlesTable).set(parsed.data as never).where(eq(articlesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Article not found" }); return; }
  res.json(row);
});

router.delete("/admin/articles/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteArticleParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.delete(articlesTable).where(eq(articlesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Article not found" }); return; }
  res.json({ success: true });
});

export default router;
