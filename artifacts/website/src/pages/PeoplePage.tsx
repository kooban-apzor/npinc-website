import { useState } from "react";
import { useListPeople, getListPeopleQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import PageSEO from "@/components/PageSEO";

const ROLES = ["All", "partners", "directors", "associates", "candidate_attorneys", "consultants", "support"] as const;
const ROLE_LABELS: Record<string, string> = {
  All: "All",
  partners: "Partners",
  directors: "Directors",
  associates: "Associates",
  candidate_attorneys: "Candidate Attorneys",
  consultants: "Consultants",
  support: "Support",
};
const LEGACY_ROLE_MAP: Record<string, string> = {
  Partner: "partners",
  Director: "directors",
  Associate: "associates",
  CandidateAttorney: "candidate_attorneys",
  Candidate_Attorneys: "candidate_attorneys",
  Consultant: "consultants",
  Support: "support",
};
function normalizeRole(role: string): string {
  return LEGACY_ROLE_MAP[role] ?? role;
}

export default function PeoplePage() {
  const [activeRole, setActiveRole] = useState<string>("All");
  const { data: people, isLoading } = useListPeople(
    activeRole === "All" ? {} : { role: activeRole as never },
    { query: { queryKey: getListPeopleQueryKey(activeRole === "All" ? {} : { role: activeRole as never }) } }
  );

  return (
    <PublicLayout>
      <PageSEO page="people" />
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-brand text-xs uppercase tracking-[0.25em] mb-4">The Firm</p>
          <h1 className="text-5xl md:text-6xl font-serif text-paper" data-testid="text-people-title">Our People</h1>
          <p className="text-fog mt-6 max-w-2xl text-lg leading-relaxed">
            Meet the legal professionals who drive results for our clients — a team united by expertise, integrity, and a commitment to excellence.
          </p>
        </div>

        {/* Role filter */}
        <div className="flex flex-wrap gap-3 mb-16" data-testid="filter-roles">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              data-testid={`button-role-${role.toLowerCase()}`}
              className={`px-5 py-2 text-xs uppercase tracking-widest border transition-colors ${
                activeRole === role
                  ? "bg-brand text-ink border-brand"
                  : "border-line text-fog hover:border-brand hover:text-brand"
              }`}
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="border border-line p-8 animate-pulse">
                <div className="w-16 h-16 bg-line rounded mb-6" />
                <div className="h-4 bg-line rounded mb-3 w-1/3" />
                <div className="h-6 bg-line rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(people ?? []).map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.slug}`}
                data-testid={`card-person-${person.id}`}
                className="group border border-line hover:border-brand/40 transition-colors p-8"
              >
                {person.photoUrl ? (
                  <img
                    src={person.photoUrl}
                    alt={`${person.firstName} ${person.lastName}`}
                    className="w-20 h-20 object-cover object-top mb-6 grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="w-16 h-16 bg-brand/10 border border-brand/20 flex items-center justify-center mb-6 text-brand font-serif text-2xl">
                    {person.firstName[0]}{person.lastName[0]}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-brand text-xs uppercase tracking-widest">{ROLE_LABELS[normalizeRole(person.role)] ?? person.role}</p>
                  {(person as never as Record<string, unknown>).memberStatus === "just_joined" && (
                    <span className="text-[0.6rem] bg-brand/15 text-brand border border-brand/30 px-2 py-0.5 uppercase tracking-widest">Just Joined</span>
                  )}
                </div>
                <h2 className="text-xl font-serif text-paper mb-2 group-hover:text-brand transition-colors">
                  {person.title ? `${person.title} ` : ""}{person.firstName} {person.lastName}
                </h2>
                {person.qualifications && <p className="text-fog text-sm mb-4">{person.qualifications}</p>}
                {person.practiceAreas && person.practiceAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {person.practiceAreas.slice(0, 2).map(a => (
                      <span key={a} className="text-[0.65rem] border border-line text-fog px-2 py-1">{a}</span>
                    ))}
                  </div>
                )}
                <span className="text-brand text-xs uppercase tracking-widest inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  View Profile <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (people ?? []).length === 0 && (
          <div className="text-center py-16 text-fog">
            No team members found in this category.
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
