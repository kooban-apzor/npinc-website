import { useState } from "react";
import { useAdminListArticles, useCreateArticle, useUpdateArticle, useDeleteArticle, getAdminListArticlesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import AdminDateField from "@/components/admin/AdminDateField";
import { AdminPage, AdminRow, AdminGrid, AdminLoading, AdminEmpty, AdminModal, ConfirmDialog, AdminField, AdminSelect, AdminCheck, mutationError } from "@/components/admin/ui";
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
  const [deleting, setDeleting] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListArticlesQueryKey() });
  const saving = create.isPending || update.isPending;
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (a: NonNullable<typeof articles>[0]) => setModal({
    mode: "edit", id: a.id,
    form: { slug: a.slug, title: a.title, category: a.category, summary: a.summary ?? "", content: a.content ?? "", author: a.author ?? "", publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString().split("T")[0]! : "", isPublished: a.isPublished ?? false }
  });

  const handleSave = () => {
    if (!modal) return;
    const data = { ...modal.form, publishedAt: modal.form.publishedAt || undefined } as never;
    const done = (msg: string) => { invalidate(); setModal(null); toast({ title: msg }); };
    const fail = (err: unknown) => toast({ title: mutationError(err), variant: "destructive" });
    if (modal.mode === "create") {
      create.mutate({ data }, { onSuccess: () => done("Article created"), onError: fail });
    } else {
      update.mutate({ id: modal.id!, data }, { onSuccess: () => done("Article updated"), onError: fail });
    }
  };

  const confirmDelete = () => {
    if (deleting == null) return;
    remove.mutate({ id: deleting }, {
      onSuccess: () => { invalidate(); setDeleting(null); toast({ title: "Deleted" }); },
      onError: (err: unknown) => { setDeleting(null); toast({ title: mutationError(err), variant: "destructive" }); },
    });
  };

  const set = (patch: Partial<Form>) => setModal(m => m && ({ ...m, form: { ...m.form, ...patch } }));

  return (
    <AdminLayout>
      <AdminPage title="Insights / Articles" count={articles?.length} countLabel="articles" actionLabel="Add Article" onAction={openCreate} actionTestId="button-create-article">
        {isLoading ? <AdminLoading rows={4} /> : (articles ?? []).length === 0 ? <AdminEmpty message="No articles yet." /> : (
          <AdminGrid>
            {(articles ?? []).map(a => (
              <AdminRow key={a.id} testId={`row-article-${a.id}`} title={a.title}
                meta={a.category} published={a.isPublished ?? undefined}
                onEdit={() => openEdit(a)} editTestId={`button-edit-article-${a.id}`}
                onDelete={() => setDeleting(a.id)} deleteTestId={`button-delete-article-${a.id}`} />
            ))}
          </AdminGrid>
        )}
      </AdminPage>

      {modal && (
        <AdminModal title={modal.mode === "create" ? "Add Article" : "Edit Article"}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving} saveTestId="button-save-article" wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Slug" value={modal.form.slug} onChange={v => set({ slug: v })} />
            <AdminField label="Title" value={modal.form.title} onChange={v => set({ title: v })} />
          </div>
          <AdminField label="Summary" value={modal.form.summary} onChange={v => set({ summary: v })} textarea rows={2} />
          <AdminField label="Content" value={modal.form.content} onChange={v => set({ content: v })} textarea rows={6} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminField label="Author" value={modal.form.author} onChange={v => set({ author: v })} />
            <AdminSelect label="Category" value={modal.form.category} onChange={v => set({ category: v })} options={CATS.map(c => ({ value: c, label: c }))} />
            <div className="flex items-end pb-1"><AdminCheck id="art-pub" label="Published" checked={modal.form.isPublished} onChange={v => set({ isPublished: v })} /></div>
          </div>
          <AdminDateField
            label="Published At"
            value={modal.form.publishedAt}
            onChange={v => set({ publishedAt: v })}
            onClear={() => set({ publishedAt: "" })}
          />
        </AdminModal>
      )}

      {deleting != null && (
        <ConfirmDialog title="Delete this article?" message="It will be removed from the public site immediately."
          onConfirm={confirmDelete} onCancel={() => setDeleting(null)} pending={remove.isPending} />
      )}
    </AdminLayout>
  );
}
