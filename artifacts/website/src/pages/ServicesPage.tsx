import { useListServices } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function ServicesPage() {
  const { data: services, isLoading } = useListServices();

  return (
    <PublicLayout>
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">What We Do</p>
          <h1 className="text-5xl md:text-6xl font-serif text-[#F7F4EE]" data-testid="text-services-title">Practice Areas</h1>
          <p className="text-[#B8B8B8] mt-6 max-w-2xl text-lg leading-relaxed">
            We offer deep expertise across key areas of commercial law, providing integrated, strategic advice that serves your business goals.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#2A2A2A]">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-[#0E0E0E] p-10 animate-pulse">
                <div className="h-4 bg-[#2A2A2A] rounded mb-4 w-1/3" />
                <div className="h-6 bg-[#2A2A2A] rounded mb-4 w-2/3" />
                <div className="h-20 bg-[#2A2A2A] rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#2A2A2A]">
            {(services ?? []).map((service, i) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                data-testid={`card-service-${service.id}`}
                className="group bg-[#0E0E0E] hover:bg-[#151515] transition-colors overflow-hidden"
              >
                {service.heroImageUrl && (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={service.heroImageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/30 to-transparent" />
                  </div>
                )}
                <div className="p-10">
                <div className="text-[#C6A15B] text-3xl font-serif mb-6 opacity-30">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h2 className="text-2xl font-serif text-[#F7F4EE] mb-4 group-hover:text-[#C6A15B] transition-colors">
                  {service.title}
                </h2>
                <p className="text-[#B8B8B8] text-sm leading-relaxed mb-8">{service.summary}</p>
                {service.typicalMatters && service.typicalMatters.length > 0 && (
                  <ul className="mb-8 space-y-2">
                    {service.typicalMatters.map((matter) => (
                      <li key={matter} className="text-[#B8B8B8] text-sm flex items-center gap-2">
                        <span className="w-1 h-1 bg-[#C6A15B] rounded-full shrink-0" />
                        {matter}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="text-[#C6A15B] text-xs uppercase tracking-widest inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  View Practice Area <ArrowRight size={12} />
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
