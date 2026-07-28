import { useState } from "react";
import { useAdminListVacancies, useCreateVacancy, useUpdateVacancy, useDeleteVacancy, getAdminListVacanciesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { adminModalPanelClass } from "@/components/admin-panel-classes";
import AdminLayout from "@/components/AdminLayout";
import AdminDateField from "@/components/admin/AdminDateField";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Form = { slug: string; title: string; department: string; location: string; type: string; summary: string; description: string; closingDate: string; isPublished: boolean };
const empty: Form = { slug: "", title: "", department: "", location: "Durban, South Africa", type: "Full-time", summary: "", description: "", closingDate: "", isPublished: true };

export default function AdminVacancies() {
  const { data: vacancies, isLoading } = useAdminListVacancies();
  const create = useCreateVacancy();
  const update = useUpdateVacancy();
  const remove = useDeleteVacancy();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: Form } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListVacanciesQueryKey() });
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (v: NonNullable<typeof vacancies>[0]) => setModal({ mode: "edit", id: v.id, form: { slug: v.slug, title: v.title, department: v.department ?? "", location: v.location ?? "", type: v.type ?? "Full-time", summary: v.summary ?? "", description: v.description ?? "", closingDate: v.closingDate ? v.closingDate.slice(0, 10) : "", isPublished: v.isPublished ?? false } });
  const handleSave = () => {
    if (!modal) return;
    const data = { ...modal.form, closingDate: modal.form.closingDate || undefined } as never;
    if (modal.mode === "create") {
      create.mutate({ data }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Vacancy created" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
    } else {
      update.mutate({ id: modal.id!, data }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Vacancy updated" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
    }
  };
  const handleDelete = (id: number) => {
    if (!confirm("Delete this vacancy?")) return;
    remove.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div><h1 className="text-3xl font-serif text-[#F7F4EE]">Vacancies</h1><p className="text-[#B8B8B8] mt-1">Manage job listings.</p></div>
          <button onClick={openCreate} data-testid="button-create-vacancy" className="flex items-center gap-2 bg-[#C6A15B] text-[#0E0E0E] px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"><Plus size={16} /> Add Vacancy</button>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-[#151515] border border-[#2A2A2A]" />)}</div> : (
          <div className="space-y-3">
            {(vacancies ?? []).map(v => (
              <div key={v.id} data-testid={`row-vacancy-${v.id}`} className="flex items-center justify-between bg-[#151515] border border-[#2A2A2A] px-6 py-4">
                <div><h3 className="text-[#F7F4EE] font-serif">{v.title}</h3><p className="text-[#B8B8B8] text-xs mt-1">{v.department} · {v.location} · {v.isPublished ? <span className="text-green-400">Published</span> : <span className="text-red-400">Draft</span>}</p></div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(v)} data-testid={`button-edit-vacancy-${v.id}`} className="text-[#B8B8B8] hover:text-[#C6A15B] p-2"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(v.id)} data-testid={`button-delete-vacancy-${v.id}`} className="text-[#B8B8B8] hover:text-red-400 p-2"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={adminModalPanelClass}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-serif text-[#F7F4EE]">{modal.mode === "create" ? "Add Vacancy" : "Edit Vacancy"}</h2><button onClick={() => setModal(null)}><X size={20} className="text-[#B8B8B8]" /></button></div>
            <div className="space-y-4">
              {[{ l: "Slug", k: "slug" }, { l: "Title", k: "title" }, { l: "Department", k: "department" }, { l: "Location", k: "location" }, { l: "Type", k: "type" }, { l: "Summary", k: "summary", ta: true }, { l: "Description", k: "description", ta: true }].map(({ l, k, ta }) => (
                <div key={k}>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">{l}</label>
                  {ta ? <textarea rows={3} value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none resize-none" />
                  : <input type="text" value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />}
                </div>
              ))}
              <AdminDateField
                label="Closing Date"
                value={modal.form.closingDate}
                onChange={v => setModal(m => m && ({ ...m, form: { ...m.form, closingDate: v } }))}
                onClear={() => setModal(m => m && ({ ...m, form: { ...m.form, closingDate: "" } }))}
              />
              <div className="flex items-center gap-3"><input type="checkbox" checked={modal.form.isPublished} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, isPublished: e.target.checked } }))} className="w-4 h-4 accent-[#C6A15B]" /><span className="text-[#B8B8B8] text-sm">Published</span></div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-vacancy" className="bg-[#C6A15B] text-[#0E0E0E] px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">Save</button>
              <button onClick={() => setModal(null)} className="border border-[#2A2A2A] text-[#B8B8B8] px-8 py-3 text-sm hover:border-[#C6A15B] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
