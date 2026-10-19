import { useState, useEffect, useRef } from "react";
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Globe, Building2, Search, Palette, Upload } from "lucide-react";
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

function formFromSettings(s: {
  firmName?: string | null;
  tagline?: string | null;
  heroBadgeText?: string | null;
  heroHeading?: string | null;
  heroSubheading?: string | null;
  heroImageUrl?: string | null;
  heroCtaPrimaryText?: string | null;
  heroCtaPrimaryLink?: string | null;
  heroCtaSecondaryText?: string | null;
  heroCtaSecondaryLink?: string | null;
  email?: string | null;
  phone?: string | null;
  phone2?: string | null;
  address?: string | null;
  bbbeeLevel?: string | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  seoHomeTitle?: string | null;
  seoHomeDescription?: string | null;
  seoPeopleTitle?: string | null;
  seoPeopleDescription?: string | null;
  seoServicesTitle?: string | null;
  seoServicesDescription?: string | null;
  seoInsightsTitle?: string | null;
  seoInsightsDescription?: string | null;
  seoCalculatorTitle?: string | null;
  seoCalculatorDescription?: string | null;
  seoCareersTitle?: string | null;
  seoCareersDescription?: string | null;
  seoContactTitle?: string | null;
  seoContactDescription?: string | null;
  themePrimary?: string | null;
  themePrimaryDark?: string | null;
  themeBackground?: string | null;
  themeSurface?: string | null;
  themeText?: string | null;
  themeMuted?: string | null;
  themeBorder?: string | null;
}): FormState {
  return {
    firmName: s.firmName ?? "",
    tagline: s.tagline ?? "",
    heroBadgeText: s.heroBadgeText ?? "",
    heroHeading: s.heroHeading ?? "",
    heroSubheading: s.heroSubheading ?? "",
    heroImageUrl: s.heroImageUrl ?? "",
    heroCtaPrimaryText: s.heroCtaPrimaryText ?? "",
    heroCtaPrimaryLink: s.heroCtaPrimaryLink ?? "",
    heroCtaSecondaryText: s.heroCtaSecondaryText ?? "",
    heroCtaSecondaryLink: s.heroCtaSecondaryLink ?? "",
    email: s.email ?? "",
    phone: s.phone ?? "",
    phone2: s.phone2 ?? "",
    address: s.address ?? "",
    bbbeeLevel: s.bbbeeLevel ?? "",
    linkedinUrl: s.linkedinUrl ?? "",
    facebookUrl: s.facebookUrl ?? "",
    twitterUrl: s.twitterUrl ?? "",
    seoHomeTitle: s.seoHomeTitle ?? "",
    seoHomeDescription: s.seoHomeDescription ?? "",
    seoPeopleTitle: s.seoPeopleTitle ?? "",
    seoPeopleDescription: s.seoPeopleDescription ?? "",
    seoServicesTitle: s.seoServicesTitle ?? "",
    seoServicesDescription: s.seoServicesDescription ?? "",
    seoInsightsTitle: s.seoInsightsTitle ?? "",
    seoInsightsDescription: s.seoInsightsDescription ?? "",
    seoCalculatorTitle: s.seoCalculatorTitle ?? "",
    seoCalculatorDescription: s.seoCalculatorDescription ?? "",
    seoCareersTitle: s.seoCareersTitle ?? "",
    seoCareersDescription: s.seoCareersDescription ?? "",
    seoContactTitle: s.seoContactTitle ?? "",
    seoContactDescription: s.seoContactDescription ?? "",
    themePrimary: s.themePrimary ?? DEFAULT_THEME.themePrimary,
    themePrimaryDark: s.themePrimaryDark ?? DEFAULT_THEME.themePrimaryDark,
    themeBackground: s.themeBackground ?? DEFAULT_THEME.themeBackground,
    themeSurface: s.themeSurface ?? DEFAULT_THEME.themeSurface,
    themeText: s.themeText ?? DEFAULT_THEME.themeText,
    themeMuted: s.themeMuted ?? DEFAULT_THEME.themeMuted,
    themeBorder: s.themeBorder ?? DEFAULT_THEME.themeBorder,
  };
}

// Neat card wrapper for settings sections
function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-panel border border-line p-5 md:p-6 ${className ?? ""}`}>
      <h2 className="text-brand text-xs uppercase tracking-widest mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

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
      <label className="block text-paper text-sm mb-1">{label}</label>
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
        <p className="text-paper text-sm">{label}</p>
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
      <h3 className="text-brand text-xs uppercase tracking-widest">{label}</h3>
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
          <p className="text-fog text-sm truncate">{title}</p>
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
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const handleHeroFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (heroFileRef.current) heroFileRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please choose an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large. Maximum size is 5MB.", variant: "destructive" });
      return;
    }
    setUploadingHero(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      setForm(prev => ({ ...prev, heroImageUrl: dataUrl }));
      toast({ title: "Image loaded — press Save Settings to go live." });
    } catch {
      toast({ title: "Could not read image. Please try another file.", variant: "destructive" });
    } finally {
      setUploadingHero(false);
    }
  };

  useEffect(() => {
    if (!settings) return;
    setForm(formFromSettings(settings));
  }, [settings]);

  const f = (k: keyof FormState) => ({
    value: form[k],
    onChange: (v: string) => setForm(prev => ({ ...prev, [k]: v })),
  });

  // Serialize the whole form for dirty-checking (cheap: ~50 short strings)
  const serializeForm = (s: FormState) => JSON.stringify(s);

  const savedSnapshot = settings ? serializeForm(formFromSettings(settings)) : null;
  const formDirty = savedSnapshot != null && serializeForm(form) !== savedSnapshot;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const doSave = () => {
    setConfirmOpen(false);
    update.mutate({ data: form as never }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() });
        toast({ title: "Settings saved — your site is updated." });
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

  const revertUnsavedColours = () => {
    if (!settings) return;
    setForm(prev => ({
      ...prev,
      themePrimary: settings.themePrimary ?? DEFAULT_THEME.themePrimary,
      themePrimaryDark: settings.themePrimaryDark ?? DEFAULT_THEME.themePrimaryDark,
      themeBackground: settings.themeBackground ?? DEFAULT_THEME.themeBackground,
      themeSurface: settings.themeSurface ?? DEFAULT_THEME.themeSurface,
      themeText: settings.themeText ?? DEFAULT_THEME.themeText,
      themeMuted: settings.themeMuted ?? DEFAULT_THEME.themeMuted,
      themeBorder: settings.themeBorder ?? DEFAULT_THEME.themeBorder,
    }));
  };

  const coloursDirty = (Object.keys(DEFAULT_THEME) as (keyof ThemeColors)[]).some(
    k => (form[k] ?? "").toUpperCase() !== ((settings?.[k] ?? DEFAULT_THEME[k]) ?? "").toUpperCase(),
  );

  // Live site-wide preview: while on the Colours tab, apply the unsaved form
  // colours to the whole page so the user sees the real site change before saving.
  // Restores the saved theme when leaving the tab or unmounting.
  const formTheme = {
    themePrimary: form.themePrimary,
    themePrimaryDark: form.themePrimaryDark,
    themeBackground: form.themeBackground,
    themeSurface: form.themeSurface,
    themeText: form.themeText,
    themeMuted: form.themeMuted,
    themeBorder: form.themeBorder,
  };
  useEffect(() => {
    if (activeTab !== "colours") return;
    applyTheme(formTheme);
    return () => {
      if (!settings) return;
      applyTheme({
        themePrimary: settings.themePrimary ?? undefined,
        themePrimaryDark: settings.themePrimaryDark ?? undefined,
        themeBackground: settings.themeBackground ?? undefined,
        themeSurface: settings.themeSurface ?? undefined,
        themeText: settings.themeText ?? undefined,
        themeMuted: settings.themeMuted ?? undefined,
        themeBorder: settings.themeBorder ?? undefined,
      });
    };
  });

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        {/* Header with Save top-right */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-paper">Site Settings</h1>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={update.isPending || !formDirty}
              data-testid="button-save-settings"
              className="bg-brand text-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors disabled:opacity-40"
            >
              {update.isPending ? "Saving..." : "Save Changes"}
            </button>
            <span className={`text-xs ${formDirty ? "text-brand" : "text-fog/60"}`}>
              {formDirty ? "● Unsaved changes" : "All changes saved"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-line mb-8">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                activeTab === t.id
                  ? "border-brand text-brand"
                  : "border-transparent text-fog hover:text-paper"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div>
        <form onSubmit={e => { e.preventDefault(); if (formDirty) setConfirmOpen(true); }} data-testid="form-site-settings">

          {/* ── HOMEPAGE TAB ── */}
          {activeTab === "homepage" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Hero Text" className="lg:col-span-2">
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
              </Card>

              <Card title="Background Image">
                <Field
                  label="Image"
                  hint="The photo behind the hero, blended dark like a watermark. Click Browse to upload, or type a path like /npinc/hero-property.jpg."
                  placeholder="/npinc/hero-property.jpg"
                  {...f("heroImageUrl")}
                />
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 border border-line text-fog px-5 py-2.5 text-xs uppercase tracking-widest cursor-pointer hover:border-brand hover:text-brand transition-colors">
                    <Upload size={13} /> {uploadingHero ? "Uploading…" : "Browse / Upload"}
                    <input
                      ref={heroFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleHeroFile}
                    />
                  </label>
                  {form.heroImageUrl && (
                    <span className="text-fog/60 text-xs truncate">{form.heroImageUrl}</span>
                  )}
                </div>
                {form.heroImageUrl && (
                  <div className="border border-line overflow-hidden">
                    <img
                      src={form.heroImageUrl}
                      alt="Hero preview — darkened as it will appear on the site"
                      className="w-full h-48 object-cover brightness-[0.35]"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <p className="text-fog/60 text-xs px-3 py-2">Preview with the site's dark watermark blend applied.</p>
                  </div>
                )}
              </Card>

              <Card title="Call-to-Action Buttons">
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
              </Card>
            </div>
          )}

          {/* ── CONTACT & FIRM TAB ── */}
          {activeTab === "contact" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Firm Identity">
                <Field label="Firm Name" placeholder="Nike Pillay Inc" {...f("firmName")} />
                <Field label="Tagline" hint="Shown in the footer and some headers." placeholder="Attorneys, Notaries & Conveyancers" {...f("tagline")} />
                <Field label="B-BBEE Level" placeholder="e.g. Level 1" {...f("bbbeeLevel")} />
              </Card>
              <Card title="Contact Details">
                <Field label="Email Address" placeholder="nike@npinc.co.za" {...f("email")} />
                <Field label="Phone Number" placeholder="+27 31 000 0000" {...f("phone")} />
                <Field label="Second Phone (optional)" placeholder="+27 82 000 0000" {...f("phone2")} />
                <Field label="Office Address" hint="Shown in the footer and contact page." placeholder="Suite X, Building Name, Durban, South Africa" {...f("address")} />
              </Card>
              <Card title="Social Media Links" className="lg:col-span-2">
                <Field label="LinkedIn URL" placeholder="https://linkedin.com/company/..." {...f("linkedinUrl")} />
                <Field label="Facebook URL" placeholder="https://facebook.com/..." {...f("facebookUrl")} />
                <Field label="Twitter / X URL" placeholder="https://twitter.com/..." {...f("twitterUrl")} />
              </Card>
            </div>
          )}

          {/* ── COLOURS TAB ── */}
          {activeTab === "colours" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <p className="text-fog text-sm leading-relaxed lg:col-span-2">
                Pick a ready-made style, or fine-tune each colour — everything previews live.
                Press <strong className="text-paper">Save Changes</strong> top-right and confirm to go live.
              </p>

              <Card title="One-click styles">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {THEME_PRESETS.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset({ ...p.colors })}
                      className="text-left border border-line hover:border-brand transition-colors p-4 bg-ink"
                      data-testid={`button-preset-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-center gap-1.5 mb-3">
                        {(Object.keys(p.colors) as (keyof ThemeColors)[]).map(k => (
                          <span key={k} className="w-6 h-6 border border-black/30" style={{ backgroundColor: p.colors[k] }} />
                        ))}
                      </div>
                      <p className="text-paper text-sm">{p.name}</p>
                      <p className="text-fog text-xs mt-0.5">{p.blurb}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="Fine-tune colours">
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
              </Card>

              <Card title="Preview" className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-fog text-xs">
                    {coloursDirty
                      ? "You are previewing unsaved colours across this whole page — Save Changes to keep them, Discard preview to go back."
                      : "Pick a style or tweak a colour above to preview it live across this page."}
                  </p>
                  {coloursDirty && (
                    <button
                      type="button"
                      onClick={revertUnsavedColours}
                      className="text-fog text-xs uppercase tracking-widest underline underline-offset-4 hover:text-paper transition-colors shrink-0 ml-4"
                    >
                      Discard
                    </button>
                  )}
                </div>
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
                <button
                  type="button"
                  onClick={resetTheme}
                  className="text-fog text-xs uppercase tracking-widest underline underline-offset-4 hover:text-paper transition-colors mt-4"
                >
                  Reset to Classic Gold
                </button>
              </Card>
            </div>
          )}

          {/* ── SEO TAB ── */}
          {activeTab === "seo" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <p className="text-fog text-sm leading-relaxed lg:col-span-2">
                What Google shows for each page (not visible on the page itself).
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

          <div className="hidden" aria-hidden="true">
            <button type="submit" disabled tabIndex={-1}>Save Settings</button>
          </div>
        </form>
        </div>

        {/* ── Confirm-save dialog ── */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setConfirmOpen(false)}>
            <div className="bg-panel border border-line p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-serif text-paper mb-3">Publish these changes?</h2>
              <p className="text-fog text-sm leading-relaxed mb-6">
                {activeTab === "colours"
                  ? "Your new colours will go live across the whole website immediately."
                  : "Your changes will go live on the website immediately."}
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={doSave}
                  disabled={update.isPending}
                  data-testid="button-confirm-save"
                  className="bg-brand text-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors disabled:opacity-50"
                >
                  {update.isPending ? "Publishing..." : "Yes, publish"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="border border-line text-fog px-8 py-3 text-sm hover:border-brand transition-colors"
                >
                  Keep editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
