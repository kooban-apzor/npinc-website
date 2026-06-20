import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, peopleTable } from "@workspace/db";
import {
  ListPeopleQueryParams,
  GetPersonParams,
  CreatePersonBody,
  UpdatePersonParams,
  UpdatePersonBody,
  DeletePersonParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

function computeMemberStatus(row: typeof peopleTable.$inferSelect): "just_joined" | "left" | null {
  const now = Date.now();
  if (row.leftAt) {
    return (now - row.leftAt.getTime()) <= THREE_MONTHS_MS ? "left" : null;
  }
  if (row.joinedAt) {
    return (now - row.joinedAt.getTime()) <= THREE_MONTHS_MS ? "just_joined" : null;
  }
  return null;
}

function toDateOrNull(val: unknown): Date | null {
  if (!val) return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

function withStatus(row: typeof peopleTable.$inferSelect) {
  return { ...row, memberStatus: computeMemberStatus(row) };
}

router.get("/people", async (req, res): Promise<void> => {
  const queryParams = ListPeopleQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(peopleTable)
    .where(eq(peopleTable.isPublished, true))
    .orderBy(asc(peopleTable.sortOrder));

  const now = Date.now();

  // Exclude people who left more than 3 months ago
  let filtered = rows.filter(r => {
    if (r.leftAt) return (now - r.leftAt.getTime()) <= THREE_MONTHS_MS;
    return true;
  });

  if (queryParams.data.role) {
    filtered = filtered.filter(r => r.role === queryParams.data.role);
  }
  if (queryParams.data.practiceArea) {
    filtered = filtered.filter(
      r => r.practiceAreas && r.practiceAreas.includes(queryParams.data.practiceArea!),
    );
  }

  res.json(filtered.map(withStatus));
});

router.get("/people/:slug", async (req, res): Promise<void> => {
  const params = GetPersonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(peopleTable).where(eq(peopleTable.slug, params.data.slug));
  if (!row) { res.status(404).json({ error: "Person not found" }); return; }
  res.json(withStatus(row));
});

router.get("/admin/people", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(peopleTable).orderBy(asc(peopleTable.sortOrder));
  res.json(rows.map(withStatus));
});

router.post("/admin/people", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreatePersonBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = { ...parsed.data } as Record<string, unknown>;
  if (data.joinedAt) data.joinedAt = toDateOrNull(data.joinedAt);
  if (data.leftAt) data.leftAt = toDateOrNull(data.leftAt);
  const [row] = await db.insert(peopleTable).values(data as never).returning();
  res.status(201).json(withStatus(row));
});

router.put("/admin/people/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdatePersonParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdatePersonBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const data = { ...parsed.data } as Record<string, unknown>;
  // Convert ISO strings to Date objects; allow null to clear the field
  if ("joinedAt" in data) data.joinedAt = data.joinedAt ? toDateOrNull(data.joinedAt) : null;
  if ("leftAt" in data) data.leftAt = data.leftAt ? toDateOrNull(data.leftAt) : null;
  const [row] = await db.update(peopleTable).set(data as never).where(eq(peopleTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Person not found" }); return; }
  res.json(withStatus(row));
});

router.delete("/admin/people/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeletePersonParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.delete(peopleTable).where(eq(peopleTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Person not found" }); return; }
  res.json({ success: true });
});

export default router;
