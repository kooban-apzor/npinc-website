import { useState } from "react";
import { useAdminListServices, useCreateService, useUpdateService, useDeleteService, getAdminListServicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { adminModalPanelClass } from "@/components/admin-panel-classes";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ServiceForm = { slug: string; title: string; summary: string; howWeAssist: string; typicalMatters: string; sortOrder: number; isPublished: boolean };
const empty: ServiceForm = { slug: "", title: "", summary: "", howWeAssist: "", typicalMatters: "", sortOrder: 0, isPublished: true };

export default function AdminServices() {
  const { data: services, isLoading } = useAdminListServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: ServiceForm } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListServicesQueryKey() });

  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (s: NonNullable<typeof services>[0]) => setModal({
    mode: "edit", id: s.id,
    form: { slug: s.slug, title: s.title, summary: s.summary ?? "", howWeAssist: s.howWeAssist ?? "", typicalMatters: (s.typicalMatters ?? []).join("\n"), sortOrder: s.sortOrder ?? 0, isPublished: s.isPublished ?? false }
  });

  const handleSave = () => {
    if (!modal) return;
    const matters = modal.form.typicalMatters.split("\n").map(s => s.trim()).filter(Boolean);
    const data = { ...modal.form, typicalMatters: matters };
    if (modal.mode === "create") {
      createService.mutate({ data }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Service created" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
    } else {
      updateService.mutate({ id: modal.id!, data }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Service updated" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this service?")) return;
    deleteService.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Service deleted" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-serif text-paper" data-testid="text-admin-services-title">Practice Areas</h1>
            <p className="text-fog mt-1">Manage the firm's practice areas and service descriptions.</p>
          </div>
          <button onClick={openCreate} data-testid="button-create-service" className="flex items-center gap-2 bg-brand text-ink px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors">
            <Plus size={16} /> Add Service
          </button>
        </div>

        {isLoading ? <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-panel border border-line" />)}</div> : (
          <div className="space-y-3">
            {(services ?? []).map(s => (
              <div key={s.id} data-testid={`row-service-${s.id}`} className="flex items-center justify-between bg-panel border border-line px-6 py-4">
                <div>
                  <h3 className="text-paper font-serif">{s.title}</h3>
                  <p className="text-fog text-xs mt-1">{s.slug} · Sort: {s.sortOrder} · {s.isPublished ? <span className="text-green-400">Published</span> : <span className="text-red-400">Draft</span>}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(s)} data-testid={`button-edit-service-${s.id}`} className="text-fog hover:text-brand transition-colors p-2"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(s.id)} data-testid={`button-delete-service-${s.id}`} className="text-fog hover:text-red-400 transition-colors p-2"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={adminModalPanelClass}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-paper">{modal.mode === "create" ? "Add Service" : "Edit Service"}</h2>
              <button onClick={() => setModal(null)} className="text-fog hover:text-paper"><X size={20} /></button>
            </div>
            <div className="space-y-5">
              {[
                { label: "Slug", key: "slug", type: "text" },
                { label: "Title", key: "title", type: "text" },
                { label: "Summary", key: "summary", type: "textarea" },
                { label: "How We Assist", key: "howWeAssist", type: "textarea" },
                { label: "Typical Matters (one per line)", key: "typicalMatters", type: "textarea" },
                { label: "Sort Order", key: "sortOrder", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-fog text-xs uppercase tracking-widest mb-2">{label}</label>
                  {type === "textarea" ? (
                    <textarea rows={3} value={(modal.form as never)[key]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [key]: e.target.value } }))}
                      className="w-full bg-ink border border-line text-paper px-3 py-2 text-sm focus:border-brand focus:outline-none resize-none" />
                  ) : (
                    <input type={type} value={(modal.form as never)[key]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [key]: type === "number" ? Number(e.target.value) : e.target.value } }))}
                      className="w-full bg-ink border border-line text-paper px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                  )}
                </div>
              ))}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is-published" checked={modal.form.isPublished} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, isPublished: e.target.checked } }))} className="w-4 h-4 accent-brand" />
                <label htmlFor="is-published" className="text-fog text-sm">Published</label>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-service" className="bg-brand text-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors">Save</button>
              <button onClick={() => setModal(null)} className="border border-line text-fog px-8 py-3 text-sm hover:border-brand transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
