import { useState, useEffect } from "react";
import { useGetSiteSettings, useUpdateSiteSettings, getGetSiteSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";

export default function AdminSiteSettings() {
  const { data: settings } = useGetSiteSettings();
  const update = useUpdateSiteSettings();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ firmName: "", tagline: "", heroHeading: "", heroSubheading: "", email: "", phone: "", phone2: "", address: "", bbbeeLevel: "", linkedinUrl: "", facebookUrl: "", twitterUrl: "" });

  useEffect(() => {
    if (settings) setForm({ firmName: settings.firmName ?? "", tagline: settings.tagline ?? "", heroHeading: settings.heroHeading ?? "", heroSubheading: settings.heroSubheading ?? "", email: settings.email ?? "", phone: settings.phone ?? "", phone2: settings.phone2 ?? "", address: settings.address ?? "", bbbeeLevel: settings.bbbeeLevel ?? "", linkedinUrl: settings.linkedinUrl ?? "", facebookUrl: settings.facebookUrl ?? "", twitterUrl: settings.twitterUrl ?? "" });
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ data: form as never }, {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetSiteSettingsQueryKey() }); toast({ title: "Settings saved" }); },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  };

  const fields = [
    { l: "Firm Name", k: "firmName" }, { l: "Tagline", k: "tagline" }, { l: "Hero Heading", k: "heroHeading" },
    { l: "Hero Subheading", k: "heroSubheading", ta: true }, { l: "Email", k: "email" }, { l: "Phone", k: "phone" },
    { l: "Phone 2", k: "phone2" }, { l: "Address", k: "address" }, { l: "B-BBEE Level", k: "bbbeeLevel" },
    { l: "LinkedIn URL", k: "linkedinUrl" }, { l: "Facebook URL", k: "facebookUrl" }, { l: "Twitter URL", k: "twitterUrl" },
  ];

  return (
    <AdminLayout>
      <div className="p-8 md:p-12 max-w-2xl">
        <div className="mb-10"><h1 className="text-3xl font-serif text-[#F7F4EE]">Site Settings</h1><p className="text-[#B8B8B8] mt-1">Manage global site settings and contact information.</p></div>
        <form onSubmit={handleSave} className="space-y-6" data-testid="form-site-settings">
          {fields.map(({ l, k, ta }) => (
            <div key={k}>
              <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">{l}</label>
              {ta ? <textarea rows={3} value={(form as never)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none resize-none" />
              : <input type="text" value={(form as never)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none" />}
            </div>
          ))}
          <button type="submit" disabled={update.isPending} data-testid="button-save-settings" className="bg-[#C6A15B] text-[#0E0E0E] px-10 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors disabled:opacity-50">
            {update.isPending ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
