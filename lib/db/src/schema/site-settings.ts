import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  firmName: text("firm_name").notNull().default("Nike Pillay Inc"),
  tagline: text("tagline"),
  heroHeading: text("hero_heading"),
  heroSubheading: text("hero_subheading"),
  email: text("email").notNull().default("nike@npinc.co.za"),
  phone: text("phone").notNull().default("082 382 0843"),
  phone2: text("phone2"),
  address: text("address"),
  bbbeeLevel: text("bbbee_level"),
  linkedinUrl: text("linkedin_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
