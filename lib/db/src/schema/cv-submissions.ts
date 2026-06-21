import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cvSubmissionsTable = pgTable("cv_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  position: text("position"),
  coverLetter: text("cover_letter"),
  attachments: jsonb("attachments").$type<Array<{ filename: string; mimetype: string; data: string }>>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCvSubmissionSchema = createInsertSchema(cvSubmissionsTable).omit({ id: true, createdAt: true });
export type InsertCvSubmission = z.infer<typeof insertCvSubmissionSchema>;
export type CvSubmission = typeof cvSubmissionsTable.$inferSelect;
