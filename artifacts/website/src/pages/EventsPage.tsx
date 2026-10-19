import { useListEvents } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function EventsPage() {
  const { data: events, isLoading } = useListEvents({});

  return (
    <PublicLayout>
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-brand text-xs uppercase tracking-[0.25em] mb-4">The Firm</p>
          <h1 className="text-5xl md:text-6xl font-serif text-paper" data-testid="text-events-title">Events</h1>
          <p className="text-fog mt-6 max-w-2xl text-lg leading-relaxed">
            Conferences, seminars, and firm events — stay connected with NP Inc.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1,2,3].map(i => <div key={i} className="border border-line p-8 animate-pulse h-32" />)}
          </div>
        ) : (events ?? []).length === 0 ? (
          <div className="text-center py-16 text-fog">No events at this time. Check back soon.</div>
        ) : (
          <div className="space-y-6">
            {(events ?? []).map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                data-testid={`card-event-${event.id}`}
                className="group flex flex-col md:flex-row gap-8 border border-line hover:border-brand/30 transition-colors p-8"
              >
                <div className="shrink-0 text-center bg-panel border border-line px-6 py-4 w-24">
                  <p className="text-brand text-2xl font-serif font-bold">{new Date(event.eventDate).getDate()}</p>
                  <p className="text-fog text-xs uppercase tracking-widest">{new Date(event.eventDate).toLocaleDateString("en-ZA", { month: "short" })}</p>
                  <p className="text-fog text-xs">{new Date(event.eventDate).getFullYear()}</p>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-serif text-paper mb-3 group-hover:text-brand transition-colors">{event.title}</h2>
                  <div className="flex flex-wrap gap-4 text-fog text-sm mb-4">
                    <span className="flex items-center gap-2"><Calendar size={13} className="text-brand" />{event.eventDate}</span>
                    {event.location && <span className="flex items-center gap-2"><MapPin size={13} className="text-brand" />{event.location}</span>}
                  </div>
                  {event.description && <p className="text-fog text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>}
                  <span className="text-brand text-xs uppercase tracking-widest inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                    View Event <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
