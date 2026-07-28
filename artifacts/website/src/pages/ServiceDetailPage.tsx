import { useGetService, getGetServiceQueryKey, useListPeople } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
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

export default function ServiceDetailPage({ slug }: Props) {
  const { data: service, isLoading } = useGetService(slug, { query: { queryKey: getGetServiceQueryKey(slug) } });
  const { data: people } = useListPeople({});

  const relatedPeople = (people ?? []).filter(p =>
    service?.relatedTeamSlugs?.includes(p.slug) ||
    p.practiceAreas?.some(a => a.toLowerCase().includes(service?.title?.split(" ")[0]?.toLowerCase() ?? ""))
  );

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="py-24 px-6 max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-[#2A2A2A] rounded w-1/4 mb-8" />
          <div className="h-16 bg-[#2A2A2A] rounded mb-8" />
          <div className="h-32 bg-[#2A2A2A] rounded" />
        </div>
      </PublicLayout>
    );
  }

  if (!service) {
    return (
      <PublicLayout>
        <div className="py-24 px-6 text-center">
          <h1 className="text-4xl font-serif text-[#F7F4EE] mb-4">Practice Area Not Found</h1>
          <Link href="/services" className="text-[#C6A15B]">← Back to Practice Areas</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/services" className="inline-flex items-center gap-2 text-[#C6A15B] text-sm uppercase tracking-widest mb-12 hover:gap-3 transition-all" data-testid="link-back-services">
          <ArrowLeft size={14} /> Practice Areas
        </Link>

        <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Practice Area</p>
        <h1 className="text-5xl md:text-6xl font-serif text-[#F7F4EE] mb-8" data-testid="text-service-title">
          {service.title}
        </h1>
        <p className="text-[#B8B8B8] text-xl leading-relaxed mb-16">{service.summary}</p>

        {service.howWeAssist && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif text-[#F7F4EE] mb-6">How We Assist</h2>
            <p className="text-[#B8B8B8] leading-relaxed text-lg">{service.howWeAssist}</p>
          </div>
        )}

        {service.typicalMatters && service.typicalMatters.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif text-[#F7F4EE] mb-8">Typical Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.typicalMatters.map((matter) => (
                <div key={matter} className="flex items-center gap-4 border border-[#2A2A2A] p-4">
                  <div className="w-2 h-2 bg-[#C6A15B] shrink-0" />
                  <span className="text-[#B8B8B8]">{matter}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedPeople.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif text-[#F7F4EE] mb-8">Related Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPeople.slice(0, 3).map((person) => (
                <Link key={person.id} href={`/people/${person.slug}`} data-testid={`card-person-${person.id}`} className="group border border-[#2A2A2A] hover:border-[#C6A15B]/40 transition-colors p-6">
                  <div className="w-12 h-12 bg-[#C6A15B]/10 flex items-center justify-center mb-4 text-[#C6A15B] font-serif text-lg">
                    {person.firstName[0]}{person.lastName[0]}
                  </div>
                  <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-1">{ROLE_LABELS[normalizeRole(person.role)] ?? person.role}</p>
                  <h3 className="text-[#F7F4EE] font-serif group-hover:text-[#C6A15B] transition-colors">{person.firstName} {person.lastName}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[#2A2A2A] pt-12 flex flex-col sm:flex-row gap-4">
          <Link href="/contact" className="inline-flex items-center gap-3 bg-[#C6A15B] text-[#0E0E0E] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors" data-testid="link-contact-cta">
            Discuss Your Matter <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
