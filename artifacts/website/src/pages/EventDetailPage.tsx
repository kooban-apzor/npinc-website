import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, MapPin, ExternalLink } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

interface Props { slug: string; }

export default function EventDetailPage({ slug }: Props) {
  const { data: event, isLoading } = useGetEvent(slug, { query: { queryKey: getGetEventQueryKey(slug) } });

  if (isLoading) return <PublicLayout><div className="py-12 px-6 max-w-3xl mx-auto animate-pulse"><div className="h-48 bg-line rounded" /></div></PublicLayout>;
  if (!event) return (
    <PublicLayout>
      <div className="py-12 px-6 text-center">
        <h1 className="text-4xl font-serif text-paper mb-4">Event Not Found</h1>
        <Link href="/events" className="text-brand">← Events</Link>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/events" className="inline-flex items-center gap-2 text-brand text-sm uppercase tracking-widest mb-12 hover:gap-3 transition-all" data-testid="link-back-events">
          <ArrowLeft size={14} /> Events
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-paper mb-8" data-testid="text-event-title">{event.title}</h1>
        <div className="flex flex-wrap gap-6 text-fog text-sm mb-12 border-y border-line py-6">
          <span className="flex items-center gap-2"><Calendar size={14} className="text-brand" />{event.eventDate}{event.eventEndDate ? ` — ${event.eventEndDate}` : ""}</span>
          {event.location && <span className="flex items-center gap-2"><MapPin size={14} className="text-brand" />{event.location}</span>}
        </div>
        {event.description && (
          <div className="text-fog text-lg leading-relaxed mb-12 whitespace-pre-wrap">{event.description}</div>
        )}
        {event.registrationUrl && (
          <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-brand text-ink px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors" data-testid="link-register">
            Register Now <ExternalLink size={14} />
          </a>
        )}
      </div>
    </PublicLayout>
  );
}
