import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, calculatorRatesTable } from "@workspace/db";
import {
  ListCalculatorRatesResponse,
  AdminListCalculatorRatesResponse,
  CreateCalculatorRateBody,
  UpdateCalculatorRateParams,
  UpdateCalculatorRateBody,
  UpdateCalculatorRateResponse,
  DeleteCalculatorRateParams,
  DeleteCalculatorRateResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/calculator-rates", async (_req, res): Promise<void> => {
  const rows = await db.select().from(calculatorRatesTable);
  res.json(rows);
});

router.get("/admin/calculator-rates", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(calculatorRatesTable);
  res.json(rows);
});

router.post("/admin/calculator-rates", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCalculatorRateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(calculatorRatesTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.put("/admin/calculator-rates/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCalculatorRateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCalculatorRateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(calculatorRatesTable)
    .set(parsed.data)
    .where(eq(calculatorRatesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Rate not found" });
    return;
  }
  res.json(row);
});

router.delete("/admin/calculator-rates/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCalculatorRateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(calculatorRatesTable)
    .where(eq(calculatorRatesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Rate not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
