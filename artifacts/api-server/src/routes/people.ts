import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, peopleTable, normalizePersonRole } from "@workspace/db";
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

function isStillOnStaff(leftAt: Date | null, now = new Date()): boolean {
  if (!leftAt) return true;
  const today = now.toISOString().slice(0, 10);
  const lastDay = leftAt.toISOString().slice(0, 10);
  return today <= lastDay;
}

function computeMemberStatus(row: typeof peopleTable.$inferSelect): "just_joined" | null {
  const now = Date.now();
  if (row.leftAt) return null;
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
    res.status(400).json({ error: "Invalid query parameters." });
    return;
  }

  const rows = await db
    .select()
    .from(peopleTable)
    .where(eq(peopleTable.isPublished, true))
    .orderBy(asc(peopleTable.sortOrder));

  let filtered = rows.filter(r => isStillOnStaff(r.leftAt));

  if (queryParams.data.role) {
    const role = normalizePersonRole(queryParams.data.role);
    filtered = filtered.filter(r => normalizePersonRole(r.role) === role);
  }

  res.json(filtered.map(withStatus));
});

router.get("/people/:slug", async (req, res): Promise<void> => {
  const params = GetPersonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid parameters." });
    return;
  }
  const [row] = await db.select().from(peopleTable).where(eq(peopleTable.slug, params.data.slug));
  if (!row) { res.status(404).json({ error: "Person not found" }); return; }
  if (!isStillOnStaff(row.leftAt)) {
    res.status(404).json({ error: "Person not found" });
    return;
  }
  res.json(withStatus(row));
});

router.get("/admin/people", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(peopleTable).orderBy(asc(peopleTable.sortOrder));
  res.json(rows.map(withStatus));
});

router.post("/admin/people", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreatePersonBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body." }); return; }
  if (!parsed.data.firstName?.trim() || !parsed.data.lastName?.trim()) {
    res.status(400).json({ error: "First name and last name are required." });
    return;
  }
  const data = { ...parsed.data } as Record<string, unknown>;
  if (typeof data.role === "string") data.role = normalizePersonRole(data.role);
  if (data.joinedAt) data.joinedAt = toDateOrNull(data.joinedAt);
  if (data.leftAt) data.leftAt = toDateOrNull(data.leftAt);
  try {
    const [row] = await db.insert(peopleTable).values(data as never).returning();
    res.status(201).json(withStatus(row));
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "23505") {
      res.status(400).json({ error: "A person with this slug already exists. Slugs must be unique." });
      return;
    }
    throw err;
  }
});

router.put("/admin/people/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdatePersonParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid parameters." }); return; }
  const parsed = UpdatePersonBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body." }); return; }
  if (parsed.data.firstName !== undefined && !parsed.data.firstName.trim()) {
    res.status(400).json({ error: "First name cannot be empty." });
    return;
  }
  if (parsed.data.lastName !== undefined && !parsed.data.lastName.trim()) {
    res.status(400).json({ error: "Last name cannot be empty." });
    return;
  }
  const data = { ...parsed.data } as Record<string, unknown>;
  if (typeof data.role === "string") data.role = normalizePersonRole(data.role);
  if ("joinedAt" in data) data.joinedAt = data.joinedAt ? toDateOrNull(data.joinedAt) : null;
  if ("leftAt" in data) data.leftAt = data.leftAt ? toDateOrNull(data.leftAt) : null;
  try {
    const [row] = await db.update(peopleTable).set(data as never).where(eq(peopleTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Person not found" }); return; }
    res.json(withStatus(row));
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "23505") {
      res.status(400).json({ error: "A person with this slug already exists. Slugs must be unique." });
      return;
    }
    throw err;
  }
});

router.delete("/admin/people/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeletePersonParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid parameters." }); return; }
  const [row] = await db.delete(peopleTable).where(eq(peopleTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Person not found" }); return; }
  res.json({ success: true });
});

export default router;
