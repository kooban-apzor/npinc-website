import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, vacanciesTable } from "@workspace/db";
import {
  ListVacanciesResponse,
  GetVacancyParams,
  AdminListVacanciesResponse,
  CreateVacancyBody,
  UpdateVacancyParams,
  UpdateVacancyBody,
  UpdateVacancyResponse,
  DeleteVacancyParams,
  DeleteVacancyResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/vacancies", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(vacanciesTable)
    .where(eq(vacanciesTable.isPublished, true))
    .orderBy(desc(vacanciesTable.createdAt));
  res.json(rows);
});

router.get("/vacancies/:slug", async (req, res): Promise<void> => {
  const params = GetVacancyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid parameters." });
    return;
  }
  const [row] = await db
    .select()
    .from(vacanciesTable)
    .where(eq(vacanciesTable.slug, params.data.slug));
  if (!row) {
    res.status(404).json({ error: "Vacancy not found" });
    return;
  }
  res.json(row);
});

router.get("/admin/vacancies", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(vacanciesTable)
    .orderBy(desc(vacanciesTable.createdAt));
  res.json(rows);
});

router.post("/admin/vacancies", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateVacancyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }
  try {
    const [row] = await db.insert(vacanciesTable).values(parsed.data).returning();
    res.status(201).json(row);
  } catch (err: unknown) {
    const error = err as any;
    const code = error?.code || error?.cause?.code || error?.originalError?.code;
    if (code === "23505" || error?.message?.includes("duplicate key")) {
      res.status(400).json({ error: "A vacancy with this slug already exists. Slugs must be unique." });
      return;
    }
    throw err;
  }
});

router.put("/admin/vacancies/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateVacancyParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid parameters." }); return; }
  const parsed = UpdateVacancyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body." }); return; }
  try {
    const [row] = await db.update(vacanciesTable).set(parsed.data as never).where(eq(vacanciesTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Vacancy not found" }); return; }
    res.json(row);
  } catch (err: unknown) {
    const error = err as any;
    const code = error?.code || error?.cause?.code || error?.originalError?.code;
    if (code === "23505" || error?.message?.includes("duplicate key")) {
      res.status(400).json({ error: "A vacancy with this slug already exists. Slugs must be unique." });
      return;
    }
    throw err;
  }
});

router.delete("/admin/vacancies/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteVacancyParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid parameters." }); return; }
  const [row] = await db.delete(vacanciesTable).where(eq(vacanciesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Vacancy not found" }); return; }
  res.json({ success: true });
});

export default router;
