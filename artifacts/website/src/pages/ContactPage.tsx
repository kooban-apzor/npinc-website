import { useState } from "react";
import { useSubmitContact } from "@workspace/api-client-react";
import { Phone, Mail, MapPin } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const submitContact = useSubmitContact();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    submitContact.mutate({ data: form }, {
      onSuccess: () => {
        setSubmitted(true);
        toast({ title: "Enquiry received", description: "We'll be in touch shortly." });
      },
      onError: () => {
        toast({ title: "Submission failed", description: "Please try again or email us directly.", variant: "destructive" });
      }
    });
  };

  return (
    <PublicLayout>
      <PageSEO page="contact" />
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Get in Touch</p>
          <h1 className="text-5xl md:text-6xl font-serif text-[#F7F4EE]" data-testid="text-contact-title">Contact Us</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Contact info */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-serif text-[#F7F4EE] mb-4">Nike Pillay Inc</h2>
                <p className="text-[#B8B8B8] leading-relaxed">
                  A premier South African commercial law firm committed to delivering authoritative legal counsel.
                </p>
              </div>

              <div className="space-y-5">
                <a href="tel:0823820843" className="flex items-start gap-4 group" data-testid="link-phone-1">
                  <Phone size={16} className="text-[#C6A15B] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[#B8B8B8] text-xs uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-[#F7F4EE] group-hover:text-[#C6A15B] transition-colors">082 382 0843</p>
                  </div>
                </a>
                <a href="tel:0871839891" className="flex items-start gap-4 group" data-testid="link-phone-2">
                  <Phone size={16} className="text-[#C6A15B] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[#B8B8B8] text-xs uppercase tracking-widest mb-1">Direct</p>
                    <p className="text-[#F7F4EE] group-hover:text-[#C6A15B] transition-colors">087 183 9891</p>
                  </div>
                </a>
                <a href="mailto:nike@npinc.co.za" className="flex items-start gap-4 group" data-testid="link-email">
                  <Mail size={16} className="text-[#C6A15B] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[#B8B8B8] text-xs uppercase tracking-widest mb-1">Email</p>
                    <p className="text-[#F7F4EE] group-hover:text-[#C6A15B] transition-colors">nike@npinc.co.za</p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <MapPin size={16} className="text-[#C6A15B] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[#B8B8B8] text-xs uppercase tracking-widest mb-1">Location</p>
                    <p className="text-[#F7F4EE] leading-relaxed">10 Aubrey Drive<br />Glenashley<br />Durban, 4320</p>
                  </div>
                </div>
              </div>

              <div className="border border-[#C6A15B]/30 text-[#C6A15B] text-xs tracking-widest uppercase px-4 py-3 inline-block font-medium">
                B-BBEE Level 1 Provider
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="border border-[#C6A15B]/30 p-16 text-center">
                <div className="text-[#C6A15B] text-5xl font-serif mb-6">Thank you</div>
                <p className="text-[#B8B8B8] text-lg">Your enquiry has been received. We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      data-testid="input-contact-name"
                      className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                      data-testid="input-contact-email"
                      className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      data-testid="input-contact-phone"
                      className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      data-testid="input-contact-subject"
                      className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                    rows={6}
                    data-testid="input-contact-message"
                    className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitContact.isPending}
                  data-testid="button-contact-submit"
                  className="bg-[#C6A15B] text-[#0E0E0E] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors disabled:opacity-50"
                >
                  {submitContact.isPending ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
