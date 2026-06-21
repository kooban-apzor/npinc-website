const ROLE_LABELS: Record<string, string> = {
  partners: "Partner",
  directors: "Director",
  associates: "Associate",
  candidate_attorneys: "Candidate Attorney",
  consultants: "Consultant",
  support: "Support",
};

export type StaffMovementForm = {
  firstName: string;
  lastName: string;
  role: string;
  qualifications?: string;
};

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function createStaffMovementArticlePayload(
  form: StaffMovementForm,
  type: "joined" | "departed",
  publishedAt = todayISO(),
) {
  const fullName = `${form.firstName} ${form.lastName}`.trim();
  const isJoin = type === "joined";
  const title = isJoin
    ? `NP Inc Welcomes ${fullName}`
    : `${fullName} Departs NP Inc`;
  const summary = isJoin
    ? `Nike Pillay Inc is pleased to welcome ${fullName} to the team${form.role ? ` as ${roleLabel(form.role)}` : ""}.`
    : `Nike Pillay Inc bids farewell to ${fullName}${form.role ? `, ${roleLabel(form.role)}` : ""}, and wishes them well in their future endeavours.`;
  const content = isJoin
    ? `Nike Pillay Inc is delighted to announce the appointment of ${fullName}${form.role ? ` as ${form.role}` : ""}.\n\n[Add details about their background, expertise, and what they bring to the firm.]\n\n${form.qualifications ? `Qualifications: ${form.qualifications}\n\n` : ""}We look forward to the contribution ${form.firstName} will make to our team and clients.`
    : `Nike Pillay Inc announces that ${fullName}${form.role ? `, ${form.role}` : ""}, has departed the firm.\n\n[Add a note about their time at the firm and any farewell message.]\n\nWe thank ${form.firstName} for their valued contribution and wish them every success in the future.`;

  return {
    slug: slugify(`${fullName}-${isJoin ? "joins" : "departs"}-np-inc-${publishedAt}`),
    title,
    category: "StaffMovement" as const,
    summary,
    content,
    author: "NP Inc",
    publishedAt,
    isPublished: true,
  };
}
