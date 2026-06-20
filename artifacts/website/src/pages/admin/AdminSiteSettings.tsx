import { useState, useEffect } from "react";
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Globe, Building2, Search } from "lucide-react";

type Tab = "homepage" | "contact" | "seo";

type FormState = {
  firmName: string;
  tagline: string;
  heroBadgeText: string;
  heroHeading: string;
  heroSubheading: string;
  heroImageUrl: string;
  heroCtaPrimaryText: string;
  heroCtaPrimaryLink: string;
  heroCtaSecondaryText: string;
  heroCtaSecondaryLink: string;
  email: string;
  phone: string;
  phone2: string;
  address: string;
  bbbeeLevel: string;
  linkedinUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  seoHomeTitle: string;
  seoHomeDescription: string;
  seoPeopleTitle: string;
  seoPeopleDescription: string;
  seoServicesTitle: string;
  seoServicesDescription: string;
  seoInsightsTitle: string;
  seoInsightsDescription: string;
  seoCalculatorTitle: string;
  seoCalculatorDescription: string;
  seoCareersTitle: string;
  seoCareersDescription: string;
  seoContactTitle: string;
  seoContactDescription: string;
};

const EMPTY: FormState = {
  firmName: "", tagline: "",
  heroBadgeText: "", heroHeading: "", heroSubheading: "", heroImageUrl: "",
  heroCtaPrimaryText: "", heroCtaPrimaryLink: "",
  heroCtaSecondaryText: "", heroCtaSecondaryLink: "",
  email: "", phone: "", phone2: "", address: "", bbbeeLevel: "",
  linkedinUrl: "", facebookUrl: "", twitterUrl: "",
  seoHomeTitle: "", seoHomeDescription: "",
  seoPeopleTitle: "", seoPeopleDescription: "",
  seoServicesTitle: "", seoServicesDescription: "",
  seoInsightsTitle: "", seoInsightsDescription: "",
  seoCalculatorTitle: "", seoCalculatorDescription: "",
  seoCareersTitle: "", seoCareersDescription: "",
  seoContactTitle: "", seoContactDescription: "",
};

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  maxHint?: number;
}

function Field({ label, hint, value, onChange, multiline, rows = 3, placeholder, maxHint }: FieldProps) {
  return (
    <div>
      <label className="block text-[#F7F4EE] text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-[#B8B8B8] text-xs mb-2">{hint}</p>}
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] placeholder-[#555] px-4 py-3 focus:border-[#C6A15B] focus:outline-none resize-none text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] placeholder-[#555] px-4 py-3 focus:border-[#C6A15B] focus:outline-none text-sm"
        />
      )}
      {maxHint != null && (
        <p className={`text-xs mt-1 text-right ${value.length > maxHint ? "text-red-400" : "text-[#555]"}`}>
          {value.length} / {maxHint} chars {value.length > maxHint ? "(too long for Google)" : "(recommended max)"}
        </p>
      )}
    </div>
  );
}

function SeoPageSection({ label, titleKey, descKey, form, setForm }: {
  label: string;
  titleKey: keyof FormState;
  descKey: keyof FormState;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  const title = form[titleKey];
  const desc = form[descKey];
  return (
    <div className="border border-[#2A2A2A] p-6 space-y-4">
      <h3 className="text-[#C6A15B] text-xs uppercase tracking-widest font-medium">{label}</h3>
      <Field
        label="Page Title"
        hint="Shown in the browser tab and Google results. Keep under 60 characters."
        value={title}
        onChange={v => setForm(f => ({ ...f, [titleKey]: v }))}
        placeholder={`e.g. ${label} — Nike Pillay Inc`}
        maxHint={60}
      />
      <Field
        label="Meta Description"
        hint="The short summary shown under the page title in Google. Aim for 120–155 characters."
        value={desc}
        onChange={v => setForm(f => ({ ...f, [descKey]: v }))}
        multiline
        rows={3}
        placeholder="A short, compelling summary of this page..."
        maxHint={155}
      />
      {title && (
        <div className="bg-[#0E0E0E] border border-[#2A2A2A] p-4 rounded">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-2">Google Preview</p>
          <p className="text-[#8AB4F8] text-sm font-medium truncate">{title}</p>
          {desc && <p className="text-[#B8B8B8] text-xs mt-1 leading-relaxed line-clamp-2">{desc}</p>}
        </div>
      )}
    </div>
  );
}

export default function AdminSiteSettings() {
  const { data: settings } = useGetSiteSettings();
  const update = useUpdateSiteSettings();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("homepage");
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (!settings) return;
    setForm({
      firmName: settings.firmName ?? "",
      tagline: settings.tagline ?? "",
      heroBadgeText: settings.heroBadgeText ?? "",
      heroHeading: settings.heroHeading ?? "",
      heroSubheading: settings.heroSubheading ?? "",
      heroImageUrl: settings.heroImageUrl ?? "",
      heroCtaPrimaryText: settings.heroCtaPrimaryText ?? "",
      heroCtaPrimaryLink: settings.heroCtaPrimaryLink ?? "",
      heroCtaSecondaryText: settings.heroCtaSecondaryText ?? "",
      heroCtaSecondaryLink: settings.heroCtaSecondaryLink ?? "",
      email: settings.email ?? "",
      phone: settings.phone ?? "",
      phone2: settings.phone2 ?? "",
      address: settings.address ?? "",
      bbbeeLevel: settings.bbbeeLevel ?? "",
      linkedinUrl: settings.linkedinUrl ?? "",
      facebookUrl: settings.facebookUrl ?? "",
      twitterUrl: settings.twitterUrl ?? "",
      seoHomeTitle: settings.seoHomeTitle ?? "",
      seoHomeDescription: settings.seoHomeDescription ?? "",
      seoPeopleTitle: settings.seoPeopleTitle ?? "",
      seoPeopleDescription: settings.seoPeopleDescription ?? "",
      seoServicesTitle: settings.seoServicesTitle ?? "",
      seoServicesDescription: settings.seoServicesDescription ?? "",
      seoInsightsTitle: settings.seoInsightsTitle ?? "",
      seoInsightsDescription: settings.seoInsightsDescription ?? "",
      seoCalculatorTitle: settings.seoCalculatorTitle ?? "",
      seoCalculatorDescription: settings.seoCalculatorDescription ?? "",
      seoCareersTitle: settings.seoCareersTitle ?? "",
      seoCareersDescription: settings.seoCareersDescription ?? "",
      seoContactTitle: settings.seoContactTitle ?? "",
      seoContactDescription: settings.seoContactDescription ?? "",
    });
  }, [settings]);

  const f = (k: keyof FormState) => ({
    value: form[k],
    onChange: (v: string) => setForm(prev => ({ ...prev, [k]: v })),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ data: form as never }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() });
        toast({ title: "Settings saved" });
      },
      onError: () => toast({ title: "Error saving settings", variant: "destructive" }),
    });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "homepage", label: "Homepage", icon: <Globe size={15} /> },
    { id: "contact", label: "Contact & Firm", icon: <Building2 size={15} /> },
    { id: "seo", label: "SEO", icon: <Search size={15} /> },
  ];

  return (
    <AdminLayout>
      <div className="p-8 md:p-12 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-[#F7F4EE]">Site Settings</h1>
          <p className="text-[#B8B8B8] mt-1">Manage your homepage hero, contact details, and search engine metadata — no technical knowledge needed.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2A2A2A] mb-10">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? "border-[#C6A15B] text-[#C6A15B]"
                  : "border-transparent text-[#B8B8B8] hover:text-[#F7F4EE]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} data-testid="form-site-settings">

          {/* ── HOMEPAGE TAB ── */}
          {activeTab === "homepage" && (
            <div className="space-y-8">
              <div>
                <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-6">Hero Section</p>
                <div className="space-y-5">
                  <Field
                    label="Badge Text"
                    hint="The small gold label shown above the main heading in the hero."
                    placeholder="e.g. South African Commercial Law"
                    {...f("heroBadgeText")}
                  />
                  <Field
                    label="Main Heading"
                    hint="The large headline visitors see first. Keep it short and punchy."
                    placeholder="e.g. Trusted by Serious Business"
                    {...f("heroHeading")}
                  />
                  <Field
                    label="Subheading"
                    hint="A sentence or two that expands on the headline."
                    placeholder="e.g. Nike Pillay Inc delivers authoritative legal counsel..."
                    multiline
                    rows={3}
                    {...f("heroSubheading")}
                  />
                  <Field
                    label="Background Image URL"
                    hint="Path to the hero photo (e.g. /npinc/hero-property.jpg). Images are stored in the website's public/npinc/ folder."
                    placeholder="/npinc/hero-property.jpg"
                    {...f("heroImageUrl")}
                  />
                  {form.heroImageUrl && (
                    <div className="border border-[#2A2A2A] overflow-hidden h-32">
                      <img
                        src={form.heroImageUrl}
                        alt="Hero preview"
                        className="w-full h-full object-cover opacity-60"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-6">Call-to-Action Buttons</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    label="Primary Button Text"
                    hint="The gold button on the left."
                    placeholder="Our Practice Areas"
                    {...f("heroCtaPrimaryText")}
                  />
                  <Field
                    label="Primary Button Link"
                    hint="Where it goes. Use /services, /contact, etc."
                    placeholder="/services"
                    {...f("heroCtaPrimaryLink")}
                  />
                  <Field
                    label="Secondary Button Text"
                    hint="The outline button on the right."
                    placeholder="Get in Touch"
                    {...f("heroCtaSecondaryText")}
                  />
                  <Field
                    label="Secondary Button Link"
                    placeholder="/contact"
                    {...f("heroCtaSecondaryLink")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── CONTACT & FIRM TAB ── */}
          {activeTab === "contact" && (
            <div className="space-y-8">
              <div>
                <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-6">Firm Identity</p>
                <div className="space-y-5">
                  <Field label="Firm Name" placeholder="Nike Pillay Inc" {...f("firmName")} />
                  <Field label="Tagline" hint="Shown in the footer and some headers." placeholder="Attorneys, Notaries & Conveyancers" {...f("tagline")} />
                  <Field label="B-BBEE Level" placeholder="e.g. Level 1" {...f("bbbeeLevel")} />
                </div>
              </div>
              <div>
                <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-6">Contact Details</p>
                <div className="space-y-5">
                  <Field label="Email Address" placeholder="nike@npinc.co.za" {...f("email")} />
                  <Field label="Phone Number" placeholder="+27 31 000 0000" {...f("phone")} />
                  <Field label="Second Phone (optional)" placeholder="+27 82 000 0000" {...f("phone2")} />
                  <Field label="Office Address" hint="Shown in the footer and contact page." placeholder="Suite X, Building Name, Durban, South Africa" {...f("address")} />
                </div>
              </div>
              <div>
                <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-6">Social Media Links</p>
                <div className="space-y-5">
                  <Field label="LinkedIn URL" placeholder="https://linkedin.com/company/..." {...f("linkedinUrl")} />
                  <Field label="Facebook URL" placeholder="https://facebook.com/..." {...f("facebookUrl")} />
                  <Field label="Twitter / X URL" placeholder="https://twitter.com/..." {...f("twitterUrl")} />
                </div>
              </div>
            </div>
          )}

          {/* ── SEO TAB ── */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <p className="text-[#B8B8B8] text-sm leading-relaxed">
                These titles and descriptions control what Google shows when someone searches for your firm. They do <strong className="text-[#F7F4EE]">not</strong> appear on the page itself — they are only visible to search engines and in the browser tab.
              </p>
              <SeoPageSection label="Home Page" titleKey="seoHomeTitle" descKey="seoHomeDescription" form={form} setForm={setForm} />
              <SeoPageSection label="Our People" titleKey="seoPeopleTitle" descKey="seoPeopleDescription" form={form} setForm={setForm} />
              <SeoPageSection label="Services / Practice Areas" titleKey="seoServicesTitle" descKey="seoServicesDescription" form={form} setForm={setForm} />
              <SeoPageSection label="Insights & News" titleKey="seoInsightsTitle" descKey="seoInsightsDescription" form={form} setForm={setForm} />
              <SeoPageSection label="Conveyancing Calculator" titleKey="seoCalculatorTitle" descKey="seoCalculatorDescription" form={form} setForm={setForm} />
              <SeoPageSection label="Careers" titleKey="seoCareersTitle" descKey="seoCareersDescription" form={form} setForm={setForm} />
              <SeoPageSection label="Contact Us" titleKey="seoContactTitle" descKey="seoContactDescription" form={form} setForm={setForm} />
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-[#2A2A2A]">
            <button
              type="submit"
              disabled={update.isPending}
              data-testid="button-save-settings"
              className="bg-[#C6A15B] text-[#0E0E0E] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors disabled:opacity-50"
            >
              {update.isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
