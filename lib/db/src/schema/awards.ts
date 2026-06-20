import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const awardsTable = pgTable("awards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  awardingBody: text("awarding_body"),
  year: text("year"),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAwardSchema = createInsertSchema(awardsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAward = z.infer<typeof insertAwardSchema>;
export type Award = typeof awardsTable.$inferSelect;
