import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, awardsTable } from "@workspace/db";
import {
  ListAwardsResponse,
  AdminListAwardsResponse,
  CreateAwardBody,
  UpdateAwardParams,
  UpdateAwardBody,
  UpdateAwardResponse,
  DeleteAwardParams,
  DeleteAwardResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/awards", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(awardsTable)
    .orderBy(asc(awardsTable.sortOrder));
  res.json(rows);
});

router.get("/admin/awards", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(awardsTable)
    .orderBy(asc(awardsTable.sortOrder));
  res.json(rows);
});

router.post("/admin/awards", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAwardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(awardsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.put("/admin/awards/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAwardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAwardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(awardsTable)
    .set(parsed.data)
    .where(eq(awardsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Award not found" });
    return;
  }
  res.json(row);
});

router.delete("/admin/awards/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAwardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(awardsTable)
    .where(eq(awardsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Award not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
