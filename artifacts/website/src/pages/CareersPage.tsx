import { useListVacancies, getListVacanciesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, MapPin, Briefcase, Clock, Paperclip, X, Upload } from "lucide-react";
import { useState, useRef } from "react";
import PublicLayout from "@/components/PublicLayout";
import PageSEO from "@/components/PageSEO";
import { useToast } from "@/hooks/use-toast";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ".pdf,.doc,.docx,.txt,.rtf";

export default function CareersPage() {
  const { data: vacancies, isLoading } = useListVacancies({ query: { queryKey: getListVacanciesQueryKey() } });
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", coverLetter: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const toAdd = Array.from(incoming).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast({ title: `${f.name} is too large`, description: "Maximum file size is 10 MB.", variant: "destructive" });
        return false;
      }
      return true;
    });
    setFiles((prev) => {
      const combined = [...prev, ...toAdd];
      if (combined.length > MAX_FILES) {
        toast({ title: "Too many files", description: `Maximum ${MAX_FILES} files per submission.`, variant: "destructive" });
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const coverLetter = form.coverLetter.trim();
    if (!name || !email) {
      toast({ title: "Name and email are required.", variant: "destructive" });
      return;
    }
    if (form.coverLetter && !coverLetter) {
      toast({ title: "Message cannot be blank.", variant: "destructive" });
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      if (form.phone.trim()) fd.append("phone", form.phone.trim());
      if (form.position.trim()) fd.append("position", form.position.trim());
      if (coverLetter) fd.append("coverLetter", coverLetter);
      files.forEach((f) => fd.append("files", f));

      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/careers/submit`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Server error");
      setForm({ name: "", email: "", phone: "", position: "", coverLetter: "" });
      setFiles([]);
      setSubmitted(true);
      toast({ title: "Application submitted", description: "We'll be in touch soon." });
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setPending(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", position: "", coverLetter: "" });
    setFiles([]);
    setSubmitted(false);
  };

  return (
    <PublicLayout>
      <PageSEO page="careers" />
      {/* Hero */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
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
              No current vacancies. Submit your application below for future consideration.
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

        {/* Application form */}
        <div id="submit-application" className="border border-[#2A2A2A] p-10 md:p-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-3">
            <Upload size={20} className="text-[#C6A15B]" />
            <h2 className="text-2xl font-serif text-[#F7F4EE]">Submit an Application</h2>
          </div>
          <p className="text-[#B8B8B8] mb-10 leading-relaxed">
            Don't see a suitable opening? Submit your details and supporting documents — we'll be in touch when the right opportunity arises. You may attach your CV, academic transcripts, a covering letter, or any other relevant documents (up to {MAX_FILES} files, 10 MB each).
          </p>

          {submitted ? (
            <div className="text-center py-10">
              <div className="text-[#C6A15B] text-4xl font-serif mb-4">Thank you</div>
              <p className="text-[#B8B8B8] mb-8">Your application has been received. We'll be in touch soon.</p>
              <button onClick={resetForm} data-testid="button-cv-submit-another"
                className="bg-[#C6A15B] text-[#0E0E0E] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">
                Submit Another Application
              </button>
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
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Message</label>
                <textarea
                  value={form.coverLetter}
                  onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))}
                  rows={5}
                  data-testid="input-cv-cover-letter"
                  className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* File attachments */}
              <div className="md:col-span-2">
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">
                  Supporting Documents <span className="normal-case text-[#B8B8B8]/60">(CV, transcripts, cover letter — up to {MAX_FILES} files)</span>
                </label>
                <div
                  className="border border-dashed border-[#2A2A2A] hover:border-[#C6A15B]/50 transition-colors p-6 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip size={20} className="text-[#C6A15B] mx-auto mb-2" />
                  <p className="text-[#B8B8B8] text-sm">Click to attach documents</p>
                  <p className="text-[#B8B8B8]/50 text-xs mt-1">PDF, Word, or plain text · 10 MB per file</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={e => addFiles(e.target.files)}
                  data-testid="input-cv-files"
                />
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between bg-[#151515] border border-[#2A2A2A] px-4 py-3 text-sm">
                        <span className="flex items-center gap-2 text-[#F7F4EE] truncate">
                          <Paperclip size={13} className="text-[#C6A15B] shrink-0" />
                          {f.name}
                          <span className="text-[#B8B8B8]/60 text-xs shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
                        </span>
                        <button type="button" onClick={() => removeFile(i)} className="text-[#B8B8B8] hover:text-red-400 transition-colors ml-4 shrink-0">
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={pending}
                  data-testid="button-cv-submit"
                  className="bg-[#C6A15B] text-[#0E0E0E] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors disabled:opacity-50"
                >
                  {pending ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
