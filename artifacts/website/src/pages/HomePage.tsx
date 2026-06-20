import { useListServices, useListPeople, useListArticles, useListAwards } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Phone, Mail, Shield } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function HomePage() {
  const { data: services } = useListServices();
  const { data: people } = useListPeople({});
  const { data: articles } = useListArticles({});
  const { data: awards } = useListAwards();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E0E] via-[#151515] to-[#0E0E0E]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C6A15B' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block border border-[#C6A15B]/30 text-[#C6A15B] text-xs tracking-[0.25em] uppercase px-6 py-2 mb-10 font-medium">
            South African Commercial Law
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#F7F4EE] leading-[1.05] mb-8 tracking-tight" data-testid="text-hero-heading">
            Trusted by<br />
            <span className="italic text-[#C6A15B]">Serious Business</span>
          </h1>
          <p className="text-lg md:text-xl text-[#B8B8B8] mb-12 max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subheading">
            Nike Pillay Inc delivers authoritative, sophisticated legal counsel to corporations, investors, and entrepreneurs across South Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              data-testid="link-hero-services"
              className="inline-flex items-center gap-3 bg-[#C6A15B] text-[#0E0E0E] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"
            >
              Our Practice Areas <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              data-testid="link-hero-contact"
              className="inline-flex items-center gap-3 border border-[#2A2A2A] text-[#F7F4EE] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:border-[#C6A15B] hover:text-[#C6A15B] transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-[#C6A15B]" />
        </div>
      </section>

      {/* B-BBEE Badge Strip */}
      <section className="bg-[#151515] border-y border-[#2A2A2A] py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-xs uppercase tracking-widest text-[#B8B8B8]">
          <div className="flex items-center gap-2 text-[#C6A15B] font-semibold">
            <Shield size={14} />
            <span>B-BBEE Level 1 Provider</span>
          </div>
          <span className="hidden md:block text-[#2A2A2A]">|</span>
          <span>Johannesburg, South Africa</span>
          <span className="hidden md:block text-[#2A2A2A]">|</span>
          <a href="tel:0823820843" className="hover:text-[#C6A15B] transition-colors flex items-center gap-2">
            <Phone size={12} /> 082 382 0843
          </a>
          <span className="hidden md:block text-[#2A2A2A]">|</span>
          <a href="mailto:nike@npinc.co.za" className="hover:text-[#C6A15B] transition-colors flex items-center gap-2">
            <Mail size={12} /> nike@npinc.co.za
          </a>
        </div>
      </section>

      {/* Practice Areas */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Expertise</p>
          <h2 className="text-4xl md:text-5xl font-serif text-[#F7F4EE]" data-testid="text-services-heading">Practice Areas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2A2A2A]">
          {(services ?? []).map((service, i) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              data-testid={`card-service-${service.id}`}
              className="group bg-[#0E0E0E] p-10 hover:bg-[#151515] transition-colors"
            >
              <div className="text-[#C6A15B] text-3xl font-serif mb-6 opacity-30">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-xl font-serif text-[#F7F4EE] mb-4 group-hover:text-[#C6A15B] transition-colors">
                {service.title}
              </h3>
              <p className="text-[#B8B8B8] text-sm leading-relaxed mb-6">{service.summary}</p>
              <span className="text-[#C6A15B] text-xs uppercase tracking-widest inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn more <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/services" className="text-[#C6A15B] text-sm uppercase tracking-widest border border-[#C6A15B]/30 px-8 py-3 hover:border-[#C6A15B] transition-colors inline-block">
            View All Practice Areas
          </Link>
        </div>
      </section>

      {/* Team Preview */}
      <section className="py-28 bg-[#151515] border-y border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">The Firm</p>
            <h2 className="text-4xl md:text-5xl font-serif text-[#F7F4EE]">Our People</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(people ?? []).slice(0, 3).map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.slug}`}
                data-testid={`card-person-${person.id}`}
                className="group"
              >
                <div className="bg-[#0E0E0E] border border-[#2A2A2A] group-hover:border-[#C6A15B]/40 transition-colors p-8">
                  <div className="w-16 h-16 bg-[#C6A15B]/10 border border-[#C6A15B]/20 flex items-center justify-center mb-6 text-[#C6A15B] font-serif text-2xl">
                    {person.firstName[0]}{person.lastName[0]}
                  </div>
                  <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-1">{person.role}</p>
                  <h3 className="text-xl font-serif text-[#F7F4EE] mb-2">
                    {person.title ? `${person.title} ` : ""}{person.firstName} {person.lastName}
                  </h3>
                  {person.qualifications && (
                    <p className="text-[#B8B8B8] text-sm mb-4">{person.qualifications}</p>
                  )}
                  <span className="text-[#C6A15B] text-xs uppercase tracking-widest inline-flex items-center gap-2">
                    View Profile <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/people" className="text-[#C6A15B] text-sm uppercase tracking-widest border border-[#C6A15B]/30 px-8 py-3 hover:border-[#C6A15B] transition-colors inline-block">
              Meet the Full Team
            </Link>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Insights</p>
          <h2 className="text-4xl md:text-5xl font-serif text-[#F7F4EE]">Latest from the Firm</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(articles ?? []).slice(0, 3).map((article) => (
            <Link
              key={article.id}
              href={`/insights/${article.slug}`}
              data-testid={`card-article-${article.id}`}
              className="group border border-[#2A2A2A] hover:border-[#C6A15B]/30 transition-colors p-8"
            >
              <span className="text-[#C6A15B] text-xs uppercase tracking-widest">{article.category}</span>
              <h3 className="text-lg font-serif text-[#F7F4EE] mt-3 mb-4 leading-snug group-hover:text-[#C6A15B] transition-colors">
                {article.title}
              </h3>
              {article.summary && (
                <p className="text-[#B8B8B8] text-sm leading-relaxed mb-6 line-clamp-3">{article.summary}</p>
              )}
              <span className="text-[#C6A15B] text-xs uppercase tracking-widest inline-flex items-center gap-2">
                Read more <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/insights" className="text-[#C6A15B] text-sm uppercase tracking-widest border border-[#C6A15B]/30 px-8 py-3 hover:border-[#C6A15B] transition-colors inline-block">
            View All Insights
          </Link>
        </div>
      </section>

      {/* Calculator CTA */}
      <section className="bg-[#C6A15B] py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-[#0E0E0E] mb-6">
            Conveyancing Calculator
          </h2>
          <p className="text-[#0E0E0E]/70 text-lg mb-10 max-w-xl mx-auto">
            Get an instant estimate of your property transfer and bond registration costs.
          </p>
          <Link
            href="/calculator"
            data-testid="link-calculator-cta"
            className="inline-flex items-center gap-3 bg-[#0E0E0E] text-[#C6A15B] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#151515] transition-colors"
          >
            Calculate Your Costs <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Awards */}
      {(awards ?? []).length > 0 && (
        <section className="py-28 px-6 max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Recognition</p>
            <h2 className="text-4xl md:text-5xl font-serif text-[#F7F4EE]">Awards & Honours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(awards ?? []).slice(0, 3).map((award) => (
              <div key={award.id} data-testid={`card-award-${award.id}`} className="border border-[#2A2A2A] p-8">
                <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-2">{award.year}</p>
                <h3 className="text-lg font-serif text-[#F7F4EE] mb-2">{award.title}</h3>
                {award.awardingBody && <p className="text-[#B8B8B8] text-sm mb-3">{award.awardingBody}</p>}
                {award.description && <p className="text-[#B8B8B8] text-sm leading-relaxed">{award.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Careers CTA */}
      <section className="bg-[#151515] border-y border-[#2A2A2A] py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Join Our Team</p>
          <h2 className="text-4xl md:text-5xl font-serif text-[#F7F4EE] mb-6">Build Your Legal Career</h2>
          <p className="text-[#B8B8B8] text-lg mb-10 max-w-xl mx-auto">
            We invest in exceptional talent. Explore our current opportunities and become part of a firm that makes a difference.
          </p>
          <Link
            href="/careers"
            data-testid="link-careers-cta"
            className="inline-flex items-center gap-3 border border-[#C6A15B] text-[#C6A15B] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#C6A15B] hover:text-[#0E0E0E] transition-colors"
          >
            View Current Openings <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Contact strip */}
      <section className="py-16 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-serif text-[#F7F4EE] mb-4">Ready to discuss your matter?</h2>
        <p className="text-[#B8B8B8] mb-8">Contact us for a confidential consultation.</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-[#B8B8B8]">
          <a href="tel:0823820843" className="flex items-center gap-2 hover:text-[#C6A15B] transition-colors">
            <Phone size={14} className="text-[#C6A15B]" /> 082 382 0843
          </a>
          <a href="tel:0871839891" className="flex items-center gap-2 hover:text-[#C6A15B] transition-colors">
            <Phone size={14} className="text-[#C6A15B]" /> 087 183 9891
          </a>
          <a href="mailto:nike@npinc.co.za" className="flex items-center gap-2 hover:text-[#C6A15B] transition-colors">
            <Mail size={14} className="text-[#C6A15B]" /> nike@npinc.co.za
          </a>
        </div>
        <Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-[#C6A15B] text-sm uppercase tracking-widest hover:underline">
          Send an Enquiry <ArrowRight size={14} />
        </Link>
      </section>
    </PublicLayout>
  );
}
