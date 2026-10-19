import { useGetVacancy, getGetVacancyQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft, MapPin, Briefcase, Clock, Calendar } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

interface Props { slug: string; }

export default function VacancyDetailPage({ slug }: Props) {
  const { data: vacancy, isLoading } = useGetVacancy(slug, { query: { queryKey: getGetVacancyQueryKey(slug) } });

  if (isLoading) return <PublicLayout><div className="py-12 px-6 max-w-3xl mx-auto animate-pulse"><div className="h-64 bg-line rounded" /></div></PublicLayout>;
  if (!vacancy) return (
    <PublicLayout>
      <div className="py-12 px-6 text-center">
        <h1 className="text-4xl font-serif text-paper mb-4">Vacancy Not Found</h1>
        <Link href="/careers" className="text-brand">← Careers</Link>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/careers" className="inline-flex items-center gap-2 text-brand text-sm uppercase tracking-widest mb-12 hover:gap-3 transition-all" data-testid="link-back-careers">
          <ArrowLeft size={14} /> Careers
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-paper mb-6" data-testid="text-vacancy-title">{vacancy.title}</h1>
        <div className="flex flex-wrap gap-4 text-fog text-sm mb-12 border-y border-line py-6">
          {vacancy.department && <span className="flex items-center gap-2"><Briefcase size={14} className="text-brand" />{vacancy.department}</span>}
          {vacancy.location && <span className="flex items-center gap-2"><MapPin size={14} className="text-brand" />{vacancy.location}</span>}
          {vacancy.type && <span className="flex items-center gap-2"><Clock size={14} className="text-brand" />{vacancy.type}</span>}
          {vacancy.closingDate && <span className="flex items-center gap-2 text-red-400"><Calendar size={14} />Closing: {vacancy.closingDate}</span>}
        </div>
        {vacancy.summary && <p className="text-fog text-xl leading-relaxed mb-10 italic border-l-2 border-brand pl-6">{vacancy.summary}</p>}
        {vacancy.description && (
          <div className="text-fog leading-relaxed whitespace-pre-wrap text-base mb-12">{vacancy.description}</div>
        )}
        <Link href="/careers#submit-application" className="inline-flex items-center gap-3 bg-brand text-ink px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors" data-testid="link-apply">
          Apply Now via CV Form
        </Link>
      </div>
    </PublicLayout>
  );
}
