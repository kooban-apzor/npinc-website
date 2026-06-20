import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import {
  GetSiteSettingsResponse,
  UpdateSiteSettingsBody,
  UpdateSiteSettingsResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/site-settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteSettingsTable).limit(1);
  const settings = rows[0];
  if (!settings) {
    res.status(404).json({ error: "Site settings not found" });
    return;
  }
  res.json(settings);
});

router.put("/admin/site-settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSiteSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db.select().from(siteSettingsTable).limit(1);
  let updated;
  if (rows.length === 0) {
    [updated] = await db.insert(siteSettingsTable).values(parsed.data).returning();
  } else {
    [updated] = await db
      .update(siteSettingsTable)
      .set(parsed.data)
      .returning();
  }

  res.json(updated);
});

export default router;
