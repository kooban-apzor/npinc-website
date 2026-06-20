import { pgTable, serial, text, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vacanciesTable = pgTable("vacancies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  department: text("department"),
  location: text("location"),
  type: text("type"),
  summary: text("summary"),
  description: text("description"),
  isPublished: boolean("is_published").notNull().default(true),
  closingDate: date("closing_date", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVacancySchema = createInsertSchema(vacanciesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVacancy = z.infer<typeof insertVacancySchema>;
export type Vacancy = typeof vacanciesTable.$inferSelect;
