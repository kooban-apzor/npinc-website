export const PERSON_ROLES = [
  "partners",
  "directors",
  "associates",
  "candidate_attorneys",
  "consultants",
  "support",
] as const;

export type PersonRole = (typeof PERSON_ROLES)[number];

export const PERSON_ROLE_LABELS: Record<PersonRole, string> = {
  partners: "Partner",
  directors: "Director",
  associates: "Associate",
  candidate_attorneys: "Candidate Attorney",
  consultants: "Consultant",
  support: "Support",
};

const LEGACY_ROLE_MAP: Record<string, PersonRole> = {
  Partner: "partners",
  Director: "directors",
  Associate: "associates",
  CandidateAttorney: "candidate_attorneys",
  Consultant: "consultants",
  Support: "support",
  partners: "partners",
  directors: "directors",
  associates: "associates",
  candidate_attorneys: "candidate_attorneys",
  consultants: "consultants",
  support: "support",
};

export function normalizePersonRole(role: string): PersonRole | string {
  return LEGACY_ROLE_MAP[role] ?? role;
}

export function isPersonRole(role: string): role is PersonRole {
  return (PERSON_ROLES as readonly string[]).includes(role);
}
