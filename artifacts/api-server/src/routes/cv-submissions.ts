import { Router, type IRouter } from "express";
import multer from "multer";
import { eq, desc } from "drizzle-orm";
import { db, cvSubmissionsTable } from "@workspace/db";
import {
  ListCvSubmissionsResponse,
  DeleteCvSubmissionParams,
  DeleteCvSubmissionResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 5 } });

router.post("/careers/submit", upload.array("files", 5), async (req, res): Promise<void> => {
  const { name, email, phone, position, coverLetter } = req.body as Record<string, string>;
  if (!name || !email) {
    res.status(422).json({ error: "name and email are required" });
    return;
  }

  const files = req.files as Express.Multer.File[] | undefined;
  const attachments = (files ?? []).map((f) => ({
    filename: f.originalname,
    mimetype: f.mimetype,
    data: f.buffer.toString("base64"),
  }));

  const [row] = await db.insert(cvSubmissionsTable).values({
    name,
    email,
    phone: phone || undefined,
    position: position || undefined,
    coverLetter: coverLetter || undefined,
    attachments,
  }).returning();

  res.status(201).json({ success: true });
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
