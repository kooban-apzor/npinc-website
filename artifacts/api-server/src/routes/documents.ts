import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import {
  ListDocumentsResponse,
  AdminListDocumentsResponse,
  CreateDocumentBody,
  UpdateDocumentParams,
  UpdateDocumentBody,
  UpdateDocumentResponse,
  DeleteDocumentParams,
  DeleteDocumentResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/documents", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.isPublic, true))
    .orderBy(asc(documentsTable.sortOrder));
  res.json(rows);
});

router.get("/admin/documents", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(documentsTable)
    .orderBy(asc(documentsTable.sortOrder));
  res.json(rows);
});

router.post("/admin/documents", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(documentsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.put("/admin/documents/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(documentsTable)
    .set(parsed.data)
    .where(eq(documentsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.json(row);
});

router.delete("/admin/documents/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(documentsTable)
    .where(eq(documentsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
