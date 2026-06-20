import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),

  // Firm identity
  firmName: text("firm_name").notNull().default("Nike Pillay Inc"),
  tagline: text("tagline"),

  // Hero section
  heroBadgeText: text("hero_badge_text"),
  heroHeading: text("hero_heading"),
  heroSubheading: text("hero_subheading"),
  heroImageUrl: text("hero_image_url"),
  heroCtaPrimaryText: text("hero_cta_primary_text"),
  heroCtaPrimaryLink: text("hero_cta_primary_link"),
  heroCtaSecondaryText: text("hero_cta_secondary_text"),
  heroCtaSecondaryLink: text("hero_cta_secondary_link"),

  // Contact details
  email: text("email").notNull().default("nike@npinc.co.za"),
  phone: text("phone").notNull().default("082 382 0843"),
  phone2: text("phone2"),
  address: text("address"),
  bbbeeLevel: text("bbbee_level"),

  // Social links
  linkedinUrl: text("linkedin_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),

  // SEO — per page meta title & description
  seoHomeTitle: text("seo_home_title"),
  seoHomeDescription: text("seo_home_description"),
  seoPeopleTitle: text("seo_people_title"),
  seoPeopleDescription: text("seo_people_description"),
  seoServicesTitle: text("seo_services_title"),
  seoServicesDescription: text("seo_services_description"),
  seoInsightsTitle: text("seo_insights_title"),
  seoInsightsDescription: text("seo_insights_description"),
  seoCalculatorTitle: text("seo_calculator_title"),
  seoCalculatorDescription: text("seo_calculator_description"),
  seoCareersTitle: text("seo_careers_title"),
  seoCareersDescription: text("seo_careers_description"),
  seoContactTitle: text("seo_contact_title"),
  seoContactDescription: text("seo_contact_description"),

  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
