import { useState } from "react";
import { useAdminListDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument, getAdminListDocumentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { adminModalPanelClass } from "@/components/admin-panel-classes";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Form = { title: string; category: string; description: string; fileUrl: string; isPublic: boolean; sortOrder: number };
const empty: Form = { title: "", category: "", description: "", fileUrl: "", isPublic: true, sortOrder: 0 };

export default function AdminDocuments() {
  const { data: docs, isLoading } = useAdminListDocuments();
  const create = useCreateDocument();
  const update = useUpdateDocument();
  const remove = useDeleteDocument();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: Form } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListDocumentsQueryKey() });
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (d: NonNullable<typeof docs>[0]) => setModal({ mode: "edit", id: d.id, form: { title: d.title, category: d.category ?? "", description: d.description ?? "", fileUrl: d.fileUrl, isPublic: d.isPublic ?? false, sortOrder: d.sortOrder ?? 0 } });
  const handleSave = () => {
    if (!modal) return;
    if (modal.mode === "create") {
      create.mutate({ data: modal.form as never }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Document created" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
    } else {
      update.mutate({ id: modal.id!, data: modal.form as never }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Document updated" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
    }
  };
  const handleDelete = (id: number) => {
    if (!confirm("Delete this document?")) return;
    remove.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Deleted" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div><h1 className="text-3xl font-serif text-paper">Documents</h1><p className="text-fog mt-1">Manage public document downloads.</p></div>
          <button onClick={openCreate} data-testid="button-create-document" className="flex items-center gap-2 bg-brand text-ink px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors"><Plus size={16} /> Add Document</button>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-panel border border-line" />)}</div> : (
          <div className="space-y-3">
            {(docs ?? []).map(d => (
              <div key={d.id} data-testid={`row-document-${d.id}`} className="flex items-center justify-between bg-panel border border-line px-6 py-4">
                <div><h3 className="text-paper font-serif">{d.title}</h3><p className="text-fog text-xs mt-1">{d.category} · {d.isPublic ? <span className="text-green-400">Public</span> : <span className="text-red-400">Private</span>}</p></div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(d)} data-testid={`button-edit-document-${d.id}`} className="text-fog hover:text-brand p-2"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(d.id)} data-testid={`button-delete-document-${d.id}`} className="text-fog hover:text-red-400 p-2"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            {(docs ?? []).length === 0 && <div className="border border-line p-12 text-center text-fog">No documents added yet.</div>}
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={adminModalPanelClass}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-serif text-paper">{modal.mode === "create" ? "Add Document" : "Edit Document"}</h2><button onClick={() => setModal(null)}><X size={20} className="text-fog" /></button></div>
            <div className="space-y-4">
              {[{ l: "Title", k: "title" }, { l: "Category", k: "category" }, { l: "Description", k: "description" }, { l: "File URL", k: "fileUrl" }, { l: "Sort Order", k: "sortOrder", num: true }].map(({ l, k, num }) => (
                <div key={k}>
                  <label className="block text-fog text-xs uppercase tracking-widest mb-2">{l}</label>
                  <input type={num ? "number" : "text"} value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: num ? Number(e.target.value) : e.target.value } }))} className="w-full bg-ink border border-line text-paper px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                </div>
              ))}
              <div className="flex items-center gap-3"><input type="checkbox" checked={modal.form.isPublic} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, isPublic: e.target.checked } }))} className="w-4 h-4 accent-brand" /><span className="text-fog text-sm">Public (visible to all)</span></div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-document" className="bg-brand text-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors">Save</button>
              <button onClick={() => setModal(null)} className="border border-line text-fog px-8 py-3 text-sm hover:border-brand transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
