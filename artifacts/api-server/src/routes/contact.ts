import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { eq, desc } from "drizzle-orm";
import { db, contactEnquiriesTable } from "@workspace/db";
import {
  SubmitContactBody,
  ListContactEnquiriesResponse,
  DeleteContactEnquiryParams,
  DeleteContactEnquiryResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many contact submissions. Please try again in 15 minutes." },
});

router.post("/contact", contactRateLimit, async (req, res): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }
  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim();
  const message = parsed.data.message.trim();
  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, email, and message are required and cannot be blank." });
    return;
  }
  const [row] = await db.insert(contactEnquiriesTable).values({
    ...parsed.data,
    name,
    email,
    message,
    phone: parsed.data.phone?.trim() || null,
    subject: parsed.data.subject?.trim() || null,
  }).returning();
  res.status(201).json(row);
});

router.get("/admin/contact-enquiries", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(contactEnquiriesTable)
    .orderBy(desc(contactEnquiriesTable.createdAt));
  res.json(rows);
});

router.delete("/admin/contact-enquiries/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteContactEnquiryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid parameters." });
    return;
  }
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw ?? "", 10);
  const [row] = await db
    .delete(contactEnquiriesTable)
    .where(eq(contactEnquiriesTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Enquiry not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
