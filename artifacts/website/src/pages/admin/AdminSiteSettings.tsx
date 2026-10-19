import { useState, useEffect } from "react";
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Globe, Building2, Search, Palette } from "lucide-react";
import { DEFAULT_THEME, THEME_PRESETS, THEME_FIELDS, applyTheme, isValidHex, shiftLightness, type ThemeColors } from "@/lib/theme";

type Tab = "homepage" | "contact" | "seo" | "colours";

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
  themePrimary: string;
  themePrimaryDark: string;
  themeBackground: string;
  themeSurface: string;
  themeText: string;
  themeMuted: string;
  themeBorder: string;
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
  ...DEFAULT_THEME,
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
      <label className="block text-paper text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-fog text-xs mb-2">{hint}</p>}
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-panel border border-line text-paper placeholder-fog/60 px-4 py-3 focus:border-brand focus:outline-none resize-none text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-panel border border-line text-paper placeholder-fog/60 px-4 py-3 focus:border-brand focus:outline-none text-sm"
        />
      )}
      {maxHint != null && (
        <p className={`text-xs mt-1 text-right ${value.length > maxHint ? "text-red-400" : "text-fog/60"}`}>
          {value.length} / {maxHint} chars {value.length > maxHint ? "(too long for Google)" : "(recommended max)"}
        </p>
      )}
    </div>
  );
}

interface ColourRowProps {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}

function ColourRow({ label, hint, value, onChange }: ColourRowProps) {
  const safe = isValidHex(value) ? value : "#000000";
  return (
    <div className="flex items-center gap-4">
      <label
        className="w-11 h-11 shrink-0 border border-line cursor-pointer overflow-hidden"
        title="Click to pick a colour"
      >
        <input
          type="color"
          value={safe}
          onChange={e => onChange(e.target.value)}
          className="w-full h-full cursor-pointer border-0 p-0 bg-transparent"
        />
      </label>
      <div className="flex-1 min-w-0">
        <p className="text-paper text-sm font-medium">{label}</p>
        <p className="text-fog text-xs">{hint}</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        maxLength={7}
        aria-label={`${label} hex code`}
        className={`w-24 shrink-0 bg-panel border text-paper px-3 py-2 text-sm font-mono uppercase focus:outline-none ${
          isValidHex(value) ? "border-line focus:border-brand" : "border-red-500"
        }`}
      />
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
    <div className="border border-line p-6 space-y-4">
      <h3 className="text-brand text-xs uppercase tracking-widest font-medium">{label}</h3>
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
        <div className="bg-ink border border-line p-4 rounded">
          <p className="text-xs text-fog/60 uppercase tracking-widest mb-2">Google Preview</p>
          <p className="text-fog text-sm font-medium truncate">{title}</p>
          {desc && <p className="text-fog text-xs mt-1 leading-relaxed line-clamp-2">{desc}</p>}
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
      themePrimary: settings.themePrimary ?? DEFAULT_THEME.themePrimary,
      themePrimaryDark: settings.themePrimaryDark ?? DEFAULT_THEME.themePrimaryDark,
      themeBackground: settings.themeBackground ?? DEFAULT_THEME.themeBackground,
      themeSurface: settings.themeSurface ?? DEFAULT_THEME.themeSurface,
      themeText: settings.themeText ?? DEFAULT_THEME.themeText,
      themeMuted: settings.themeMuted ?? DEFAULT_THEME.themeMuted,
      themeBorder: settings.themeBorder ?? DEFAULT_THEME.themeBorder,
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
    { id: "colours", label: "Colours", icon: <Palette size={15} /> },
    { id: "seo", label: "SEO", icon: <Search size={15} /> },
  ];

  const themeForm = (k: keyof ThemeColors) => ({
    value: form[k],
    onChange: (v: string) => setColour(k, v),
  });

  const setColour = (key: keyof ThemeColors, value: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: value.toUpperCase() };
      // Keep the hover shade in step when the accent changes
      if (key === "themePrimary" && isValidHex(value)) {
        next.themePrimaryDark = shiftLightness(value, -10);
      }
      return next;
    });
  };

  const applyPreset = (colors: ThemeColors) => setForm(prev => ({ ...prev, ...colors }));

  const resetTheme = () => setForm(prev => ({ ...prev, ...DEFAULT_THEME }));

  return (
    <AdminLayout>
      <div className="p-8 md:p-12 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl font-serif text-paper">Site Settings</h1>
          <p className="text-fog mt-1">Manage your homepage hero, contact details, and search engine metadata — no technical knowledge needed.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line mb-10">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? "border-brand text-brand"
                  : "border-transparent text-fog hover:text-paper"
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
                <p className="text-brand text-xs uppercase tracking-widest mb-6">Hero Section</p>
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
                    <div className="border border-line overflow-hidden h-32">
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
                <p className="text-brand text-xs uppercase tracking-widest mb-6">Call-to-Action Buttons</p>
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
                <p className="text-brand text-xs uppercase tracking-widest mb-6">Firm Identity</p>
                <div className="space-y-5">
                  <Field label="Firm Name" placeholder="Nike Pillay Inc" {...f("firmName")} />
                  <Field label="Tagline" hint="Shown in the footer and some headers." placeholder="Attorneys, Notaries & Conveyancers" {...f("tagline")} />
                  <Field label="B-BBEE Level" placeholder="e.g. Level 1" {...f("bbbeeLevel")} />
                </div>
              </div>
              <div>
                <p className="text-brand text-xs uppercase tracking-widest mb-6">Contact Details</p>
                <div className="space-y-5">
                  <Field label="Email Address" placeholder="nike@npinc.co.za" {...f("email")} />
                  <Field label="Phone Number" placeholder="+27 31 000 0000" {...f("phone")} />
                  <Field label="Second Phone (optional)" placeholder="+27 82 000 0000" {...f("phone2")} />
                  <Field label="Office Address" hint="Shown in the footer and contact page." placeholder="Suite X, Building Name, Durban, South Africa" {...f("address")} />
                </div>
              </div>
              <div>
                <p className="text-brand text-xs uppercase tracking-widest mb-6">Social Media Links</p>
                <div className="space-y-5">
                  <Field label="LinkedIn URL" placeholder="https://linkedin.com/company/..." {...f("linkedinUrl")} />
                  <Field label="Facebook URL" placeholder="https://facebook.com/..." {...f("facebookUrl")} />
                  <Field label="Twitter / X URL" placeholder="https://twitter.com/..." {...f("twitterUrl")} />
                </div>
              </div>
            </div>
          )}

          {/* ── COLOURS TAB ── */}
          {activeTab === "colours" && (
            <div className="space-y-8">
              <p className="text-fog text-sm leading-relaxed">
                Change the look of your whole website here. Pick a ready-made style, or fine-tune each colour yourself.
                Press <strong className="text-paper">Save Settings</strong> below and the new colours go live everywhere instantly.
              </p>

              {/* Presets */}
              <div>
                <p className="text-brand text-xs uppercase tracking-widest mb-4">One-click styles</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {THEME_PRESETS.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset({ ...p.colors })}
                      className="text-left border border-line hover:border-brand transition-colors p-4 bg-panel"
                      data-testid={`button-preset-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-center gap-1.5 mb-3">
                        {(Object.keys(p.colors) as (keyof ThemeColors)[]).map(k => (
                          <span key={k} className="w-6 h-6 border border-black/30" style={{ backgroundColor: p.colors[k] }} />
                        ))}
                      </div>
                      <p className="text-paper text-sm font-medium">{p.name}</p>
                      <p className="text-fog text-xs mt-0.5">{p.blurb}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual colours */}
              <div>
                <p className="text-brand text-xs uppercase tracking-widest mb-4">Fine-tune colours</p>
                <div className="space-y-5">
                  {THEME_FIELDS.map(meta => (
                    <ColourRow
                      key={meta.key}
                      label={meta.label}
                      hint={meta.hint}
                      {...themeForm(meta.key)}
                    />
                  ))}
                </div>
              </div>

              {/* Live preview */}
              <div>
                <p className="text-brand text-xs uppercase tracking-widest mb-4">Preview</p>
                <div
                  className="border p-6 space-y-4"
                  style={{ backgroundColor: form.themeBackground, borderColor: form.themeBorder }}
                >
                  <p className="font-serif text-2xl" style={{ color: form.themeText }}>Trusted by Serious Business</p>
                  <p className="text-sm" style={{ color: form.themeMuted }}>This is how secondary text will look across the site.</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-6 py-3 text-sm font-semibold uppercase tracking-widest" style={{ backgroundColor: form.themePrimary, color: form.themeBackground }}>Gold button</span>
                    <span className="px-6 py-3 text-sm font-semibold uppercase tracking-widest" style={{ backgroundColor: form.themePrimaryDark, color: form.themeBackground }}>Hover shade</span>
                  </div>
                  <div className="p-4" style={{ backgroundColor: form.themeSurface, border: `1px solid ${form.themeBorder}` }}>
                    <p className="text-sm" style={{ color: form.themePrimary }}>Accent link and highlights →</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={resetTheme}
                className="text-fog text-xs uppercase tracking-widest underline underline-offset-4 hover:text-paper transition-colors"
              >
                Reset to Classic Gold
              </button>
            </div>
          )}

          {/* ── SEO TAB ── */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <p className="text-fog text-sm leading-relaxed">
                These titles and descriptions control what Google shows when someone searches for your firm. They do <strong className="text-paper">not</strong> appear on the page itself — they are only visible to search engines and in the browser tab.
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

          <div className="mt-10 pt-6 border-t border-line">
            <button
              type="submit"
              disabled={update.isPending}
              data-testid="button-save-settings"
              className="bg-brand text-ink px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors disabled:opacity-50"
            >
              {update.isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
