import { useListVacancies, useSubmitCv, getListVacanciesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, MapPin, Briefcase, Clock, Upload } from "lucide-react";
import { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { useToast } from "@/hooks/use-toast";

export default function CareersPage() {
  const { data: vacancies, isLoading } = useListVacancies({ query: { queryKey: getListVacanciesQueryKey() } });
  const submitCv = useSubmitCv();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", coverLetter: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    submitCv.mutate({ data: form }, {
      onSuccess: () => {
        setSubmitted(true);
        toast({ title: "Application submitted", description: "We'll be in touch soon." });
      },
      onError: () => {
        toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
      }
    });
  };

  return (
    <PublicLayout>
      <PageSEO page="careers" />
      {/* Hero */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Opportunities</p>
          <h1 className="text-5xl md:text-6xl font-serif text-[#F7F4EE]" data-testid="text-careers-title">Build Your Career at NP Inc</h1>
          <p className="text-[#B8B8B8] mt-6 max-w-2xl text-lg leading-relaxed">
            We invest in exceptional legal talent. Join a team that sets the standard for commercial law practice in South Africa.
          </p>
        </div>

        {/* Vacancies */}
        <div className="mb-24">
          <h2 className="text-2xl font-serif text-[#F7F4EE] mb-10">Current Openings</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2].map(i => <div key={i} className="border border-[#2A2A2A] p-8 animate-pulse h-24" />)}
            </div>
          ) : (vacancies ?? []).length === 0 ? (
            <div className="border border-[#2A2A2A] p-12 text-center text-[#B8B8B8]">
              No current vacancies. Submit your CV below for future consideration.
            </div>
          ) : (
            <div className="space-y-4">
              {(vacancies ?? []).map((v) => (
                <Link
                  key={v.id}
                  href={`/careers/${v.slug}`}
                  data-testid={`card-vacancy-${v.id}`}
                  className="group flex flex-col md:flex-row md:items-center md:justify-between border border-[#2A2A2A] hover:border-[#C6A15B]/30 transition-colors p-8 gap-6"
                >
                  <div>
                    <h3 className="text-xl font-serif text-[#F7F4EE] mb-2 group-hover:text-[#C6A15B] transition-colors">{v.title}</h3>
                    <div className="flex flex-wrap gap-4 text-[#B8B8B8] text-sm">
                      {v.department && <span className="flex items-center gap-1"><Briefcase size={12} className="text-[#C6A15B]" />{v.department}</span>}
                      {v.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-[#C6A15B]" />{v.location}</span>}
                      {v.type && <span className="flex items-center gap-1"><Clock size={12} className="text-[#C6A15B]" />{v.type}</span>}
                      {v.closingDate && <span className="text-red-400 text-xs">Closing: {v.closingDate}</span>}
                    </div>
                  </div>
                  <span className="text-[#C6A15B] text-xs uppercase tracking-widest inline-flex items-center gap-2 group-hover:gap-3 transition-all shrink-0">
                    Apply <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CV submission */}
        <div className="border border-[#2A2A2A] p-10 md:p-16">
          <div className="flex items-center gap-3 mb-8">
            <Upload size={20} className="text-[#C6A15B]" />
            <h2 className="text-2xl font-serif text-[#F7F4EE]">Submit Your CV</h2>
          </div>
          <p className="text-[#B8B8B8] mb-10 leading-relaxed">
            Don't see a suitable opening? Submit your CV and we'll be in touch when a suitable opportunity arises.
          </p>

          {submitted ? (
            <div className="text-center py-10">
              <div className="text-[#C6A15B] text-4xl font-serif mb-4">Thank you</div>
              <p className="text-[#B8B8B8]">Your application has been received. We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="form-cv-submission">
              <div>
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  data-testid="input-cv-name"
                  className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  data-testid="input-cv-email"
                  className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  data-testid="input-cv-phone"
                  className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Position Applying For</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  data-testid="input-cv-position"
                  className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Cover Letter / Message</label>
                <textarea
                  value={form.coverLetter}
                  onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))}
                  rows={5}
                  data-testid="input-cv-cover-letter"
                  className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitCv.isPending}
                  data-testid="button-cv-submit"
                  className="bg-[#C6A15B] text-[#0E0E0E] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors disabled:opacity-50"
                >
                  {submitCv.isPending ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
