import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { rateLimit } from "express-rate-limit";
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

const cvRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many CV submissions. Please try again in 15 minutes." },
});

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
    }
  },
});

router.post("/careers/submit", cvRateLimit, upload.array("files", 3), async (req, res): Promise<void> => {
  const parsed = SubmitCvBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim();
  if (!name) {
    res.status(400).json({ error: "Name is required and cannot be blank." });
    return;
  }
  if (!email) {
    res.status(400).json({ error: "Email is required and cannot be blank." });
    return;
  }
  const coverLetter = parsed.data.coverLetter?.trim();
  if (parsed.data.coverLetter && !coverLetter) {
    res.status(400).json({ error: "Message cannot be blank." });
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
    phone: parsed.data.phone?.trim() || null,
    position: parsed.data.position?.trim() || null,
    coverLetter: coverLetter || null,
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
    res.status(400).json({ error: "Invalid parameters." });
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

router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File too large. Maximum size is 5MB." });
      return;
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({ error: "Too many files. Maximum is 3." });
      return;
    }
    res.status(400).json({ error: "File upload error." });
    return;
  }
  if (err.message === "Only PDF, DOC, and DOCX files are allowed.") {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Internal server error." });
});

export default router;
