import { useState } from "react";
import { useAdminListAwards, useCreateAward, useUpdateAward, useDeleteAward, getAdminListAwardsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { adminModalPanelClass } from "@/components/admin-panel-classes";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Form = { title: string; awardingBody: string; year: string; description: string; sortOrder: number };
const empty: Form = { title: "", awardingBody: "", year: new Date().getFullYear().toString(), description: "", sortOrder: 0 };

export default function AdminAwards() {
  const { data: awards, isLoading } = useAdminListAwards();
  const create = useCreateAward();
  const update = useUpdateAward();
  const remove = useDeleteAward();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: Form } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListAwardsQueryKey() });
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (a: NonNullable<typeof awards>[0]) => setModal({ mode: "edit", id: a.id, form: { title: a.title, awardingBody: a.awardingBody ?? "", year: a.year ?? "", description: a.description ?? "", sortOrder: a.sortOrder } });
  const handleSave = () => {
    if (!modal) return;
    if (modal.mode === "create") {
      create.mutate({ data: modal.form as never }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Award created" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
    } else {
      update.mutate({ id: modal.id!, data: modal.form as never }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Award updated" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
    }
  };
  const handleDelete = (id: number) => {
    if (!confirm("Delete this award?")) return;
    remove.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div><h1 className="text-3xl font-serif text-[#F7F4EE]">Awards</h1><p className="text-[#B8B8B8] mt-1">Manage awards and recognition.</p></div>
          <button onClick={openCreate} data-testid="button-create-award" className="flex items-center gap-2 bg-[#C6A15B] text-[#0E0E0E] px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"><Plus size={16} /> Add Award</button>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#151515] border border-[#2A2A2A]" />)}</div> : (
          <div className="space-y-3">
            {(awards ?? []).map(a => (
              <div key={a.id} data-testid={`row-award-${a.id}`} className="flex items-center justify-between bg-[#151515] border border-[#2A2A2A] px-6 py-4">
                <div><h3 className="text-[#F7F4EE] font-serif">{a.title}</h3><p className="text-[#B8B8B8] text-xs mt-1">{a.awardingBody} · {a.year}</p></div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(a)} data-testid={`button-edit-award-${a.id}`} className="text-[#B8B8B8] hover:text-[#C6A15B] p-2"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(a.id)} data-testid={`button-delete-award-${a.id}`} className="text-[#B8B8B8] hover:text-red-400 p-2"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={adminModalPanelClass}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-serif text-[#F7F4EE]">{modal.mode === "create" ? "Add Award" : "Edit Award"}</h2><button onClick={() => setModal(null)}><X size={20} className="text-[#B8B8B8]" /></button></div>
            <div className="space-y-4">
              {[{ l: "Title", k: "title" }, { l: "Awarding Body", k: "awardingBody" }, { l: "Year", k: "year" }, { l: "Description", k: "description", ta: true }, { l: "Sort Order", k: "sortOrder", num: true }].map(({ l, k, ta, num }) => (
                <div key={k}>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">{l}</label>
                  {ta ? <textarea rows={3} value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none resize-none" />
                  : <input type={num ? "number" : "text"} value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: num ? Number(e.target.value) : e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-award" className="bg-[#C6A15B] text-[#0E0E0E] px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">Save</button>
              <button onClick={() => setModal(null)} className="border border-[#2A2A2A] text-[#B8B8B8] px-8 py-3 text-sm hover:border-[#C6A15B] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
