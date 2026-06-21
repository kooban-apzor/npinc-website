/**
 * NP Inc — database seed script
 * Run: pnpm --filter @workspace/scripts run seed
 *
 * Idempotent: uses ON CONFLICT DO NOTHING on unique columns so it is safe
 * to run against an existing database.  On a fresh server (empty tables)
 * it inserts all baseline content and resets sequences to stay in sync.
 *
 * NOTE: The admin user is NOT seeded here — the API server seeds it
 * automatically on startup from ADMIN_USERNAME / ADMIN_PASSWORD env vars.
 */

import { db, pool } from "@workspace/db";
import {
  peopleTable,
  servicesTable,
  articlesTable,
  awardsTable,
  vacanciesTable,
  calculatorRatesTable,
  siteSettingsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function truncateAndReset(...tables: string[]) {
  for (const t of tables) {
    await db.execute(
      sql.raw(`TRUNCATE TABLE ${t} RESTART IDENTITY CASCADE;`)
    );
  }
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PEOPLE = [
  {
    slug: "nike-pillay",
    firstName: "Nike",
    lastName: "Pillay",
    role: "directors",
    title: "Director",
    qualifications: "BProc LLB (UKZN), Notary Public, Conveyancer",
    admissions: null,
    bio: "Nike is an attorney, notary and conveyancer of the High Court of South Africa with more than 20 years experience in corporate and commercial matters, having worked as in-house counsel and as director at respected regional and national law firms.",
    email: "nike@npinc.co.za",
    phone: "082 382 0843",
    photoUrl: "/npinc/person-nike-pillay.jpg",
    practiceAreas: ["litigation", "labour-law", "property-conveyancing", "corporate-commercial", "tax-advisory"],
    sortOrder: 1,
    isPublished: true,
  },
  {
    slug: "chanise-khader",
    firstName: "Chanise",
    lastName: "Khader",
    role: "associates",
    title: "Associate",
    qualifications: "LLB cum laude (UNISA)",
    admissions: null,
    bio: "Chanise is an Associate who completed her LLB degree cum laude at the University of South Africa.",
    email: "chanise@npinc.co.za",
    phone: "081 476 7274",
    photoUrl: "/npinc/person-chanise.jpg",
    practiceAreas: ["litigation", "labour-law"],
    sortOrder: 2,
    isPublished: true,
  },
  {
    slug: "rehshivan-naidoo",
    firstName: "Rehshivan",
    lastName: "Naidoo",
    role: "associates",
    title: "Associate",
    qualifications: "LLB (UKZN)",
    admissions: null,
    bio: "Rehshivan is an Associate who graduated with an LL.B degree from the University of KwaZulu-Natal.",
    email: "rehshivan@npinc.co.za",
    phone: "073 306 7571",
    photoUrl: "/npinc/person-rehshi.jpg",
    practiceAreas: ["corporate-commercial", "property-conveyancing"],
    sortOrder: 3,
    isPublished: true,
  },
  {
    slug: "kayla-moodley",
    firstName: "Kayla",
    lastName: "Moodley",
    role: "associates",
    title: "Associate",
    qualifications: "LLB cum laude (UKZN)",
    admissions: null,
    bio: "Kayla is an Associate who completed her LLB degree cum laude from the University of KwaZulu-Natal.",
    email: "kayla@npinc.co.za",
    phone: "083 686 6386",
    photoUrl: "/npinc/person-kayla.jpg",
    practiceAreas: ["tax-advisory", "corporate-commercial"],
    sortOrder: 4,
    isPublished: true,
  },
  {
    slug: "levashni-munsamy",
    firstName: "Levashni",
    lastName: "Munsamy",
    role: "candidate_attorneys",
    title: "Candidate Attorney",
    qualifications: "LLB cum laude (UKZN)",
    admissions: null,
    bio: "Levashni is a Second Year Candidate Attorney who completed her degree cum laude at the University of KwaZulu-Natal.",
    email: "levashni@npinc.co.za",
    phone: "062 219 3792",
    photoUrl: "/npinc/person-levashni.jpg",
    practiceAreas: ["litigation", "property-conveyancing"],
    sortOrder: 5,
    isPublished: true,
  },
  {
    slug: "riya-pillay",
    firstName: "Riya",
    lastName: "Pillay",
    role: "candidate_attorneys",
    title: "Candidate Attorney",
    qualifications: "LLB (UKZN)",
    admissions: null,
    bio: "Riya is a Second Year Candidate Attorney who completed her LLB degree at the University of KwaZulu-Natal.",
    email: "riya@npinc.co.za",
    phone: "081 521 4763",
    photoUrl: "/npinc/person-riya.jpg",
    practiceAreas: ["labour-law", "corporate-commercial"],
    sortOrder: 6,
    isPublished: true,
  },
];

const SERVICES = [
  {
    slug: "litigation",
    title: "Litigation",
    summary: "We represent public and private companies in complex commercial disputes across all South African courts.",
    heroImageUrl: "/npinc/hero-litigation.jpg",
    howWeAssist: "Our litigation department represents clients across all levels of court, from Magistrates' Court to the Supreme Court of Appeal, providing strategic advice from pre-trial through to appeal.",
    typicalMatters: [
      "Company and commercial issues including corporate governance",
      "Unlawful competition and restraints of trade",
      "Tax litigation",
      "Property disputes",
      "Product liability and consumer protection",
      "Matrimonial and family matters",
      "Labour and employment law",
      "Insolvency and liquidation applications",
    ],
    relatedTeamSlugs: null,
    sortOrder: 1,
    isPublished: true,
  },
  {
    slug: "labour",
    title: "Labour",
    summary: "Comprehensive employment and labour law services for employers navigating a complex regulatory environment.",
    heroImageUrl: "/npinc/hero-labour-law.jpg",
    howWeAssist: "Our labour department advises on all aspects of employment law, representing clients before the CCMA, bargaining councils, Labour Court and Labour Appeal Court.",
    typicalMatters: [
      "Representing clients at the CCMA and bargaining councils in disputes relating to unfair labour practices and unfair dismissals",
      "Interdicting and restraining employees in unprotected strikes or participating in unlawful conduct during protected strikes",
      "Advising on strike management, lock-outs and picketing",
      "Chairing or representing clients at disciplinary hearings",
      "Drafting employment contracts, disciplinary codes and policies",
    ],
    relatedTeamSlugs: null,
    sortOrder: 2,
    isPublished: true,
  },
  {
    slug: "property-conveyancing",
    title: "Property and Conveyancing",
    summary: "Expert property law and conveyancing services for residential and commercial transactions across KwaZulu-Natal.",
    heroImageUrl: "/npinc/hero-property.jpg",
    howWeAssist: "Our conveyancing department handles all aspects of property transactions, from due diligence and contract review through to registration at the Deeds Office.",
    typicalMatters: [
      "Registration of a wide range of property transfers",
      "Subdivision and consolidations",
      "Opening of township registers",
      "Opening of sectional title registers including the formulation of rules and creation of management associations",
      "Registration of servitudes",
      "Registration of mortgage bonds and notarial bonds",
    ],
    relatedTeamSlugs: null,
    sortOrder: 3,
    isPublished: true,
  },
  {
    slug: "corporate-commercial",
    title: "Corporate and Commercial Law",
    summary: "Strategic legal advice for businesses at every stage — from incorporation to complex M&A transactions and B-BBEE structuring.",
    heroImageUrl: "/npinc/hero-corporate-commercial.jpg",
    howWeAssist: "We act as trusted legal advisers to boards, executives and shareholders on all aspects of corporate and commercial law.",
    typicalMatters: [
      "Drafting and vetting commercial agreements and contracts",
      "Corporate structuring, restructuring and mergers (including B-BBEE structuring)",
      "Company law, corporate governance, registration of companies and trusts, joint ventures and partnerships",
      "Consumer protection and protection of personal information",
      "E-commerce, media, IT and intellectual property",
      "Competition law and submissions to the Competition Commission",
    ],
    relatedTeamSlugs: null,
    sortOrder: 4,
    isPublished: true,
  },
  {
    slug: "tax",
    title: "Tax",
    summary: "Specialist tax advice, corporate tax planning and personal estate planning integrated with your commercial transactions.",
    heroImageUrl: "/npinc/hero-tax.jpg",
    howWeAssist: "Our tax department provides practical advice that helps clients structure transactions and estates efficiently and compliantly.",
    typicalMatters: [
      "Tax advice",
      "Corporate tax planning",
      "Tax structuring",
      "Personal estate planning",
    ],
    relatedTeamSlugs: null,
    sortOrder: 5,
    isPublished: true,
  },
  {
    slug: "project-finance",
    title: "Project Finance",
    summary: "Expert advisory and documentation services for project finance lending agreements and security arrangements.",
    heroImageUrl: "/npinc/hero-project-finance.jpg",
    howWeAssist: "We advise lenders, borrowers and sponsors on project finance transactions, drafting and negotiating all supporting legal documentation and security arrangements.",
    typicalMatters: [
      "Drafting, reviewing, amending and advisory services relating to project finance lending agreements and supporting security documentation",
      "Drafting, amending, negotiation and settling loan agreements and security documentation",
      "Reviewing and providing opinions relating to project documents",
      "Perfecting securities",
    ],
    relatedTeamSlugs: null,
    sortOrder: 6,
    isPublished: true,
  },
  {
    slug: "estate-planning",
    title: "Estate Planning and Administration",
    summary: "Comprehensive estate planning and administration services to protect your legacy and provide for your loved ones.",
    heroImageUrl: "/npinc/hero-estate-planning.jpg",
    howWeAssist: "Our estate planning team assists individuals and families in structuring their affairs to ensure their estates are managed and distributed efficiently, minimising tax and legal complexity.",
    typicalMatters: [
      "Administration of deceased estates",
      "Drawing of wills and deeds of trust",
      "Tax and estate planning",
    ],
    relatedTeamSlugs: null,
    sortOrder: 7,
    isPublished: true,
  },
];

const ARTICLES = [
  {
    slug: "understanding-b-bbee-procurement",
    title: "Understanding B-BBEE Procurement Requirements",
    category: "LegalUpdate" as const,
    author: "Nike Pillay",
    summary: "A comprehensive guide to the latest B-BBEE procurement regulations affecting South African businesses.",
    content: "The B-BBEE framework continues to evolve, with significant implications for how companies structure their procurement processes...",
    imageUrl: null,
    publishedAt: new Date("2026-06-20"),
    isPublished: true,
  },
  {
    slug: "commercial-property-market-outlook-2026",
    title: "Commercial Property Market Outlook 2026",
    category: "FirmNews" as const,
    author: "Thabo Dlamini",
    summary: "NP Inc's analysis of current trends shaping the South African commercial real estate landscape.",
    content: "The South African commercial property market is showing resilience despite macroeconomic headwinds...",
    imageUrl: null,
    publishedAt: new Date("2026-06-13"),
    isPublished: true,
  },
  {
    slug: "protecting-your-business-in-labour-disputes",
    title: "Protecting Your Business in Labour Disputes",
    category: "LegalUpdate" as const,
    author: "Priya Naidoo",
    summary: "Key strategies for employers when facing CCMA or Labour Court proceedings.",
    content: "Labour disputes can be disruptive and costly for any business. Understanding your rights and obligations as an employer is essential...",
    imageUrl: null,
    publishedAt: new Date("2026-06-06"),
    isPublished: true,
  },
];

const AWARDS = [
  {
    title: "Top Commercial Law Firm",
    awardingBody: "Chambers Africa",
    year: "2024",
    description: "Ranked among South Africa's leading commercial law firms for outstanding client service and legal excellence.",
    imageUrl: null,
    sortOrder: 1,
  },
  {
    title: "B-BBEE Level 1 Contributor",
    awardingBody: "SANAS Accredited Rating Agency",
    year: "2024",
    description: "Certified as a Level 1 B-BBEE contributor, reflecting our commitment to transformation and broad-based economic empowerment.",
    imageUrl: null,
    sortOrder: 2,
  },
  {
    title: "Excellence in Conveyancing",
    awardingBody: "Law Society of South Africa",
    year: "2023",
    description: "Recognised for exceptional service delivery and professional standards in conveyancing practice.",
    imageUrl: null,
    sortOrder: 3,
  },
];

const VACANCIES = [
  {
    slug: "candidate-attorney-2024",
    title: "Candidate Attorney",
    department: "Litigation",
    location: "Durban, South Africa",
    type: "Full-time",
    summary: "We are seeking a motivated Candidate Attorney to join our dynamic Litigation team.",
    description: `Nike Pillay Inc is a leading commercial law firm based in Durban. We are seeking a motivated and ambitious Candidate Attorney to join our Litigation practice.

The successful candidate will work closely with senior attorneys on commercial disputes, court appearances, research, and drafting.

Requirements:
- LLB degree (minimum 65% average)
- Passion for commercial litigation
- Excellent written and verbal communication skills
- Ability to work under pressure

To apply, please submit your CV and academic transcripts through our online portal.`,
    isPublished: true,
    closingDate: null,
  },
];

const CALCULATOR_RATES = [
  {
    rateType: "transfer_duty_threshold",
    label: "Transfer Duty Free Threshold",
    value: "1100000",
    effectiveFrom: null,
    notes: "No transfer duty on property up to this value (SARS 2024)",
  },
  {
    rateType: "transfer_duty_rate_3pct",
    label: "Transfer Duty Rate 3%",
    value: "0.03",
    effectiveFrom: null,
    notes: "Rate applicable on value R1,100,001 - R1,512,500",
  },
  {
    rateType: "transfer_duty_rate_6pct",
    label: "Transfer Duty Rate 6%",
    value: "0.06",
    effectiveFrom: null,
    notes: "Rate applicable on value R1,512,501 - R2,117,500",
  },
  {
    rateType: "conveyancing_base_fee",
    label: "Conveyancing Base Attorney Fee",
    value: "18000",
    effectiveFrom: null,
    notes: "Approximate base attorney fee for standard residential transfer",
  },
  {
    rateType: "bond_registration_base",
    label: "Bond Registration Base Fee",
    value: "15000",
    effectiveFrom: null,
    notes: "Approximate base fee for bond registration",
  },
];

const SITE_SETTINGS = {
  firmName: "Nike Pillay Inc",
  tagline: "Commercial Law Excellence",
  heroBadgeText: "South African Commercial Law",
  heroHeading: "Trusted by Serious Business",
  heroSubheading: "A premier South African commercial law firm delivering authoritative legal counsel to corporations, investors and entrepreneurs.",
  heroImageUrl: "/npinc/hero-property.jpg",
  heroCtaPrimaryText: "Our Practice Areas",
  heroCtaPrimaryLink: "/services",
  heroCtaSecondaryText: "Get in Touch",
  heroCtaSecondaryLink: "/contact",
  email: "nike@npinc.co.za",
  phone: "082 382 0843",
  phone2: "087 183 9891",
  address: "Durban, South Africa",
  bbbeeLevel: "B-BBEE Level 1 Provider",
  linkedinUrl: null,
  facebookUrl: null,
  twitterUrl: null,
  seoHomeTitle: "Nike Pillay Inc — Attorneys, Notaries & Conveyancers",
  seoHomeDescription: "A premier South African commercial law firm in Durban trusted by corporations, investors, and entrepreneurs. Expertise in litigation, conveyancing, labour law, corporate law and more.",
  seoPeopleTitle: "Our People — Nike Pillay Inc",
  seoPeopleDescription: "Meet the legal professionals at Nike Pillay Inc — directors, associates, candidate attorneys and consultants committed to delivering results.",
  seoServicesTitle: "Practice Areas — Nike Pillay Inc",
  seoServicesDescription: "Explore Nike Pillay Inc practice areas including litigation, labour law, property and conveyancing, corporate and commercial law, tax, project finance, and estate planning.",
  seoInsightsTitle: "Insights & News — Nike Pillay Inc",
  seoInsightsDescription: "Legal updates, firm news, and industry insights from the team at Nike Pillay Inc.",
  seoCalculatorTitle: "Conveyancing Calculator — Nike Pillay Inc",
  seoCalculatorDescription: "Estimate your South African property transfer costs, bond registration fees, and monthly repayments using real SARS and Deeds Office rates.",
  seoCareersTitle: "Careers — Nike Pillay Inc",
  seoCareersDescription: "Join the team at Nike Pillay Inc. View current vacancies and submit your CV to a leading South African commercial law firm in Durban.",
  seoContactTitle: "Contact Us — Nike Pillay Inc",
  seoContactDescription: "Get in touch with Nike Pillay Inc. Contact our Durban office for legal advice, conveyancing enquiries, or to arrange a consultation.",
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱  NP Inc seed — starting...\n");

  // Truncate in safe order (no FK deps between content tables)
  console.log("  Clearing tables...");
  await truncateAndReset(
    "people",
    "services",
    "articles",
    "awards",
    "vacancies",
    "calculator_rates",
    "site_settings",
  );

  // People
  console.log("  Seeding people...");
  await db.insert(peopleTable).values(PEOPLE as any[]);
  console.log(`    ✓ ${PEOPLE.length} people`);

  // Services
  console.log("  Seeding services...");
  await db.insert(servicesTable).values(SERVICES as any[]);
  console.log(`    ✓ ${SERVICES.length} services`);

  // Articles
  console.log("  Seeding articles...");
  await db.insert(articlesTable).values(ARTICLES as any[]);
  console.log(`    ✓ ${ARTICLES.length} articles`);

  // Awards
  console.log("  Seeding awards...");
  await db.insert(awardsTable).values(AWARDS as any[]);
  console.log(`    ✓ ${AWARDS.length} awards`);

  // Vacancies
  console.log("  Seeding vacancies...");
  await db.insert(vacanciesTable).values(VACANCIES as any[]);
  console.log(`    ✓ ${VACANCIES.length} vacancies`);

  // Calculator rates
  console.log("  Seeding calculator rates...");
  await db.insert(calculatorRatesTable).values(CALCULATOR_RATES);
  console.log(`    ✓ ${CALCULATOR_RATES.length} calculator rates`);

  // Site settings
  console.log("  Seeding site settings...");
  await db.insert(siteSettingsTable).values(SITE_SETTINGS);
  console.log("    ✓ site settings");

  console.log("\n✅  Seed complete.");
  console.log("\n⚠️  Remember: the admin user is NOT seeded here.");
  console.log("    The API server creates it on startup from env vars:");
  console.log("      ADMIN_USERNAME=admin");
  console.log("      ADMIN_PASSWORD=admin123  (change this in production!)");
}

main()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
