import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { PERSON_ROLES } from "./people-roles";

export const personRoleEnum = PERSON_ROLES;

export const peopleTable = pgTable("people", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().$type<typeof personRoleEnum[number]>(),
  title: text("title"),
  qualifications: text("qualifications"),
  admissions: text("admissions"),
  bio: text("bio"),
  email: text("email"),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  practiceAreas: text("practice_areas").array(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  joinedAt: timestamp("joined_at", { withTimezone: true }),
  leftAt: timestamp("left_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPersonSchema = createInsertSchema(peopleTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPerson = z.infer<typeof insertPersonSchema>;
export type Person = typeof peopleTable.$inferSelect;
