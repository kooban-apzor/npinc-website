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
        <div className="py-12 px-6 max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-line rounded w-1/4 mb-8" />
          <div className="h-16 bg-line rounded mb-8" />
          <div className="h-32 bg-line rounded" />
        </div>
      </PublicLayout>
    );
  }

  if (!service) {
    return (
      <PublicLayout>
        <div className="py-12 px-6 text-center">
          <h1 className="text-4xl font-serif text-paper mb-4">Practice Area Not Found</h1>
          <Link href="/services" className="text-brand">← Back to Practice Areas</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/services" className="inline-flex items-center gap-2 text-brand text-sm uppercase tracking-widest mb-12 hover:gap-3 transition-all" data-testid="link-back-services">
          <ArrowLeft size={14} /> Practice Areas
        </Link>

        <p className="text-brand text-xs uppercase tracking-[0.25em] mb-4">Practice Area</p>
        <h1 className="text-5xl md:text-6xl font-serif text-paper mb-8" data-testid="text-service-title">
          {service.title}
        </h1>
        <p className="text-fog text-xl leading-relaxed mb-16">{service.summary}</p>

        {service.howWeAssist && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif text-paper mb-6">How We Assist</h2>
            <p className="text-fog leading-relaxed text-lg">{service.howWeAssist}</p>
          </div>
        )}

        {service.typicalMatters && service.typicalMatters.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif text-paper mb-8">Typical Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.typicalMatters.map((matter) => (
                <div key={matter} className="flex items-center gap-4 border border-line p-4">
                  <div className="w-2 h-2 bg-brand shrink-0" />
                  <span className="text-fog">{matter}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedPeople.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif text-paper mb-8">Related Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPeople.slice(0, 3).map((person) => (
                <Link key={person.id} href={`/people/${person.slug}`} data-testid={`card-person-${person.id}`} className="group border border-line hover:border-brand/40 transition-colors p-6">
                  <div className="w-12 h-12 bg-brand/10 flex items-center justify-center mb-4 text-brand font-serif text-lg">
                    {person.firstName[0]}{person.lastName[0]}
                  </div>
                  <p className="text-brand text-xs uppercase tracking-widest mb-1">{ROLE_LABELS[normalizeRole(person.role)] ?? person.role}</p>
                  <h3 className="text-paper font-serif group-hover:text-brand transition-colors">{person.firstName} {person.lastName}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-line pt-12 flex flex-col sm:flex-row gap-4">
          <Link href="/contact" className="inline-flex items-center gap-3 bg-brand text-ink px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors" data-testid="link-contact-cta">
            Discuss Your Matter <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
