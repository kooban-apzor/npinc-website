import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, servicesTable } from "@workspace/db";
import {
  ListServicesResponse,
  GetServiceParams,
  GetServiceResponse,
  AdminListServicesResponse,
  CreateServiceBody,
  UpdateServiceParams,
  UpdateServiceBody,
  UpdateServiceResponse,
  DeleteServiceParams,
  DeleteServiceResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/services", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.isPublished, true))
    .orderBy(asc(servicesTable.sortOrder));
  res.json(rows);
});

router.get("/services/:slug", async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.slug, params.data.slug));
  if (!row) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(row);
});

router.get("/admin/services", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(servicesTable)
    .orderBy(asc(servicesTable.sortOrder));
  res.json(rows);
});

router.post("/admin/services", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(servicesTable).values(parsed.data).returning();
  res.status(201).json(GetServiceResponse.parse(row));
});

router.put("/admin/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateServiceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateServiceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(servicesTable).set(parsed.data as never).where(eq(servicesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Service not found" }); return; }
  res.json(row);
});

router.delete("/admin/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteServiceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.delete(servicesTable).where(eq(servicesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Service not found" }); return; }
  res.json({ success: true });
});

export default router;
