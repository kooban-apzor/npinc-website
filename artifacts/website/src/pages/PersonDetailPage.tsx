import { useGetPerson, getGetPersonQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

const ROLE_LABELS: Record<string, string> = {
  partners: "Partner",
  directors: "Director",
  associates: "Associate",
  candidate_attorneys: "Candidate Attorney",
  consultants: "Consultant",
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

interface Props { slug: string; }

export default function PersonDetailPage({ slug }: Props) {
  const { data: person, isLoading } = useGetPerson(slug, { query: { queryKey: getGetPersonQueryKey(slug) } });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="py-24 px-6 max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-[#2A2A2A] rounded w-1/4 mb-8" />
          <div className="h-16 bg-[#2A2A2A] rounded mb-6" />
          <div className="h-48 bg-[#2A2A2A] rounded" />
        </div>
      </PublicLayout>
    );
  }

  if (!person) {
    return (
      <PublicLayout>
        <div className="py-24 px-6 text-center">
          <h1 className="text-4xl font-serif text-[#F7F4EE] mb-4">Person Not Found</h1>
          <Link href="/people" className="text-[#C6A15B]">← Our People</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/people" className="inline-flex items-center gap-2 text-[#C6A15B] text-sm uppercase tracking-widest mb-12 hover:gap-3 transition-all" data-testid="link-back-people">
          <ArrowLeft size={14} /> Our People
        </Link>

        <div className="flex flex-col md:flex-row gap-12 mb-16">
          <div className="shrink-0">
            {person.photoUrl ? (
              <img
                src={person.photoUrl}
                alt={`${person.firstName} ${person.lastName}`}
                className="w-40 h-40 object-cover object-top grayscale"
              />
            ) : (
              <div className="w-24 h-24 bg-[#C6A15B]/10 border border-[#C6A15B]/20 flex items-center justify-center text-[#C6A15B] font-serif text-4xl">
                {person.firstName[0]}{person.lastName[0]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em]">{ROLE_LABELS[normalizeRole(person.role)] ?? person.role}</p>
              {(person as never as Record<string, unknown>).memberStatus === "just_joined" && (
                <span className="text-[0.65rem] bg-[#C6A15B]/15 text-[#C6A15B] border border-[#C6A15B]/30 px-3 py-1 uppercase tracking-widest">Just Joined</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#F7F4EE] mb-3" data-testid="text-person-name">
              {person.title ? `${person.title} ` : ""}{person.firstName} {person.lastName}
            </h1>
            {person.qualifications && (
              <p className="text-[#B8B8B8] text-lg mb-6">{person.qualifications}</p>
            )}
            <div className="flex flex-wrap gap-4">
              {person.email && (
                <a href={`mailto:${person.email}`} className="inline-flex items-center gap-2 text-[#C6A15B] text-sm hover:underline" data-testid="link-person-email">
                  <Mail size={14} /> {person.email}
                </a>
              )}
              {person.phone && (
                <a href={`tel:${person.phone}`} className="inline-flex items-center gap-2 text-[#B8B8B8] text-sm hover:text-[#C6A15B] transition-colors" data-testid="link-person-phone">
                  <Phone size={14} /> {person.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {person.admissions && (
          <div className="mb-12">
            <h2 className="text-lg font-serif text-[#F7F4EE] mb-3">Admissions</h2>
            <p className="text-[#B8B8B8]">{person.admissions}</p>
          </div>
        )}

        {person.bio && (
          <div className="mb-12">
            <h2 className="text-lg font-serif text-[#F7F4EE] mb-4">About</h2>
            <p className="text-[#B8B8B8] leading-relaxed text-lg">{person.bio}</p>
          </div>
        )}

        {person.practiceAreas && person.practiceAreas.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-serif text-[#F7F4EE] mb-4">Practice Areas</h2>
            <div className="flex flex-wrap gap-3">
              {person.practiceAreas.map(a => (
                <span key={a} className="border border-[#2A2A2A] text-[#B8B8B8] text-sm px-4 py-2">{a}</span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[#2A2A2A] pt-10">
          <Link href="/contact" className="inline-flex items-center gap-3 bg-[#C6A15B] text-[#0E0E0E] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors" data-testid="link-contact">
            Get in Touch
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
