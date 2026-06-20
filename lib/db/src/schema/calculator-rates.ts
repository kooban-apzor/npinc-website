import { pgTable, serial, text, numeric, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const calculatorRatesTable = pgTable("calculator_rates", {
  id: serial("id").primaryKey(),
  rateType: text("rate_type").notNull(),
  label: text("label").notNull(),
  value: numeric("value", { precision: 20, scale: 6 }).notNull(),
  effectiveFrom: date("effective_from", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCalculatorRateSchema = createInsertSchema(calculatorRatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCalculatorRate = z.infer<typeof insertCalculatorRateSchema>;
export type CalculatorRate = typeof calculatorRatesTable.$inferSelect;
