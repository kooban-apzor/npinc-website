import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, cvSubmissionsTable } from "@workspace/db";
import {
  SubmitCvBody,
  ListCvSubmissionsResponse,
  DeleteCvSubmissionParams,
  DeleteCvSubmissionResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.post("/cv-submissions", async (req, res): Promise<void> => {
  const parsed = SubmitCvBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(cvSubmissionsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.get("/admin/cv-submissions", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(cvSubmissionsTable)
    .orderBy(desc(cvSubmissionsTable.createdAt));
  res.json(rows);
});

router.delete("/admin/cv-submissions/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCvSubmissionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw ?? "", 10);
  const [row] = await db
    .delete(cvSubmissionsTable)
    .where(eq(cvSubmissionsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "CV submission not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
