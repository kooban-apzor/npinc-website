import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  ListEventsResponse,
  GetEventParams,
  AdminListEventsResponse,
  CreateEventBody,
  UpdateEventParams,
  UpdateEventBody,
  UpdateEventResponse,
  DeleteEventParams,
  DeleteEventResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/events", async (req, res): Promise<void> => {
  const queryParams = ListEventsQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.isPublished, true))
    .orderBy(asc(eventsTable.eventDate));

  let filtered = rows;
  if (queryParams.data.upcoming === "true") {
    const today = new Date().toISOString().split("T")[0];
    filtered = rows.filter((r) => r.eventDate >= today!);
  }

  res.json(filtered);
});

router.get("/events/:slug", async (req, res): Promise<void> => {
  const params = GetEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.slug, params.data.slug));
  if (!row) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(row);
});

router.get("/admin/events", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(eventsTable)
    .orderBy(asc(eventsTable.eventDate));
  res.json(rows);
});

router.post("/admin/events", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(eventsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.put("/admin/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(eventsTable).set(parsed.data as never).where(eq(eventsTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Event not found" }); return; }
  res.json(row);
});

router.delete("/admin/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.delete(eventsTable).where(eq(eventsTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Event not found" }); return; }
  res.json({ success: true });
});

export default router;
