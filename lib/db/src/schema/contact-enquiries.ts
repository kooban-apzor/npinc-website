import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactEnquiriesTable = pgTable("contact_enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContactEnquirySchema = createInsertSchema(contactEnquiriesTable).omit({ id: true, createdAt: true });
export type InsertContactEnquiry = z.infer<typeof insertContactEnquirySchema>;
export type ContactEnquiry = typeof contactEnquiriesTable.$inferSelect;
