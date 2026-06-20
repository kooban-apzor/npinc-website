import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, peopleTable } from "@workspace/db";
import {
  ListPeopleQueryParams,
  ListPeopleResponse,
  GetPersonParams,
  GetPersonResponse,
  AdminListPeopleResponse,
  CreatePersonBody,
  UpdatePersonParams,
  UpdatePersonBody,
  UpdatePersonResponse,
  DeletePersonParams,
  DeletePersonResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/people", async (req, res): Promise<void> => {
  const queryParams = ListPeopleQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  let query = db
    .select()
    .from(peopleTable)
    .where(eq(peopleTable.isPublished, true))
    .$dynamic();

  const rows = await query.orderBy(asc(peopleTable.sortOrder));

  let filtered = rows;
  if (queryParams.data.role) {
    filtered = rows.filter((r) => r.role === queryParams.data.role);
  }
  if (queryParams.data.practiceArea) {
    filtered = filtered.filter(
      (r) =>
        r.practiceAreas &&
        r.practiceAreas.includes(queryParams.data.practiceArea!),
    );
  }

  res.json(filtered);
});

router.get("/people/:slug", async (req, res): Promise<void> => {
  const params = GetPersonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(peopleTable)
    .where(eq(peopleTable.slug, params.data.slug));
  if (!row) {
    res.status(404).json({ error: "Person not found" });
    return;
  }
  res.json(row);
});

router.get("/admin/people", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(peopleTable)
    .orderBy(asc(peopleTable.sortOrder));
  res.json(rows);
});

router.post("/admin/people", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreatePersonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(peopleTable).values(parsed.data).returning();
  res.status(201).json(GetPersonResponse.parse(row));
});

router.put("/admin/people/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdatePersonParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdatePersonBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(peopleTable).set(parsed.data as never).where(eq(peopleTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Person not found" }); return; }
  res.json(row);
});

router.delete("/admin/people/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeletePersonParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.delete(peopleTable).where(eq(peopleTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Person not found" }); return; }
  res.json({ success: true });
});

export default router;
