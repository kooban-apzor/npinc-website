import { useState } from "react";
import { useAdminListArticles, useCreateArticle, useUpdateArticle, useDeleteArticle, getAdminListArticlesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { adminModalPanelClass } from "@/components/admin-panel-classes";
import AdminLayout from "@/components/AdminLayout";
import AdminDateField from "@/components/admin/AdminDateField";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATS = ["LegalUpdate", "FirmNews", "StaffMovement", "Notice", "Event", "Award", "Career"];
type Form = { slug: string; title: string; category: string; summary: string; content: string; author: string; publishedAt: string; isPublished: boolean };
const empty: Form = { slug: "", title: "", category: "FirmNews", summary: "", content: "", author: "", publishedAt: "", isPublished: true };

export default function AdminArticles() {
  const { data: articles, isLoading } = useAdminListArticles();
  const create = useCreateArticle();
  const update = useUpdateArticle();
  const remove = useDeleteArticle();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number; form: Form } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (a: NonNullable<typeof articles>[0]) => setModal({
    mode: "edit", id: a.id,
    form: { slug: a.slug, title: a.title, category: a.category, summary: a.summary ?? "", content: a.content ?? "", author: a.author ?? "", publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString().split("T")[0]! : "", isPublished: a.isPublished ?? false }
  });
  const handleSave = () => {
    if (!modal) return;
    const data = { ...modal.form, publishedAt: modal.form.publishedAt || undefined } as never;
    if (modal.mode === "create") {
      create.mutate({ data }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Article created" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
    } else {
      update.mutate({ id: modal.id!, data }, { onSuccess: () => { invalidate(); setModal(null); toast({ title: "Article updated" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
    }
  };
  const handleDelete = (id: number) => {
    if (!confirm("Delete this article?")) return;
    remove.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Deleted" }); }, onError: (err: unknown) => { const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed"; toast({ title: msg, variant: "destructive" }); } });
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <div><h1 className="text-3xl font-serif text-[#F7F4EE]">Insights / Articles</h1><p className="text-[#B8B8B8] mt-1">Manage legal updates, firm news and publications.</p></div>
          <button onClick={openCreate} data-testid="button-create-article" className="flex items-center gap-2 bg-[#C6A15B] text-[#0E0E0E] px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"><Plus size={16} /> Add Article</button>
        </div>
        {isLoading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#151515] border border-[#2A2A2A]" />)}</div> : (
          <div className="space-y-3">
            {(articles ?? []).map(a => (
              <div key={a.id} data-testid={`row-article-${a.id}`} className="flex items-center justify-between bg-[#151515] border border-[#2A2A2A] px-6 py-4">
                <div><h3 className="text-[#F7F4EE] font-serif">{a.title}</h3><p className="text-[#B8B8B8] text-xs mt-1">{a.category} · {a.isPublished ? <span className="text-green-400">Published</span> : <span className="text-red-400">Draft</span>}</p></div>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(a)} data-testid={`button-edit-article-${a.id}`} className="text-[#B8B8B8] hover:text-[#C6A15B] p-2"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(a.id)} data-testid={`button-delete-article-${a.id}`} className="text-[#B8B8B8] hover:text-red-400 p-2"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={adminModalPanelClass}>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-serif text-[#F7F4EE]">{modal.mode === "create" ? "Add Article" : "Edit Article"}</h2><button onClick={() => setModal(null)} className="text-[#B8B8B8] hover:text-[#F7F4EE]"><X size={20} /></button></div>
            <div className="space-y-4">
              {[{ l: "Slug", k: "slug" }, { l: "Title", k: "title" }, { l: "Summary", k: "summary", ta: true }, { l: "Content", k: "content", ta: true }, { l: "Author", k: "author" }].map(({ l, k, ta }) => (
                <div key={k}>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">{l}</label>
                  {ta ? <textarea rows={4} value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none resize-none" />
                  : <input type="text" value={(modal.form as never)[k]} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, [k]: e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none" />}
                </div>
              ))}
              <AdminDateField
                label="Published At"
                value={modal.form.publishedAt}
                onChange={v => setModal(m => m && ({ ...m, form: { ...m.form, publishedAt: v } }))}
                onClear={() => setModal(m => m && ({ ...m, form: { ...m.form, publishedAt: "" } }))}
              />
              <div>
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Category</label>
                <select value={modal.form.category} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, category: e.target.value } }))} className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none">
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3"><input type="checkbox" checked={modal.form.isPublished} onChange={e => setModal(m => m && ({ ...m, form: { ...m.form, isPublished: e.target.checked } }))} className="w-4 h-4 accent-[#C6A15B]" /><span className="text-[#B8B8B8] text-sm">Published</span></div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSave} data-testid="button-save-article" className="bg-[#C6A15B] text-[#0E0E0E] px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">Save</button>
              <button onClick={() => setModal(null)} className="border border-[#2A2A2A] text-[#B8B8B8] px-8 py-3 text-sm hover:border-[#C6A15B] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
