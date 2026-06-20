import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, MapPin, ExternalLink } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

interface Props { slug: string; }

export default function EventDetailPage({ slug }: Props) {
  const { data: event, isLoading } = useGetEvent(slug, { query: { queryKey: getGetEventQueryKey(slug) } });

  if (isLoading) return <PublicLayout><div className="py-24 px-6 max-w-3xl mx-auto animate-pulse"><div className="h-48 bg-[#2A2A2A] rounded" /></div></PublicLayout>;
  if (!event) return (
    <PublicLayout>
      <div className="py-24 px-6 text-center">
        <h1 className="text-4xl font-serif text-[#F7F4EE] mb-4">Event Not Found</h1>
        <Link href="/events" className="text-[#C6A15B]">← Events</Link>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/events" className="inline-flex items-center gap-2 text-[#C6A15B] text-sm uppercase tracking-widest mb-12 hover:gap-3 transition-all" data-testid="link-back-events">
          <ArrowLeft size={14} /> Events
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-[#F7F4EE] mb-8" data-testid="text-event-title">{event.title}</h1>
        <div className="flex flex-wrap gap-6 text-[#B8B8B8] text-sm mb-12 border-y border-[#2A2A2A] py-6">
          <span className="flex items-center gap-2"><Calendar size={14} className="text-[#C6A15B]" />{event.eventDate}{event.eventEndDate ? ` — ${event.eventEndDate}` : ""}</span>
          {event.location && <span className="flex items-center gap-2"><MapPin size={14} className="text-[#C6A15B]" />{event.location}</span>}
        </div>
        {event.description && (
          <div className="text-[#B8B8B8] text-lg leading-relaxed mb-12 whitespace-pre-wrap">{event.description}</div>
        )}
        {event.registrationUrl && (
          <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#C6A15B] text-[#0E0E0E] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors" data-testid="link-register">
            Register Now <ExternalLink size={14} />
          </a>
        )}
      </div>
    </PublicLayout>
  );
}
