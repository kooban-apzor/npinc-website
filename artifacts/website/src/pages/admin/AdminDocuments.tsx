import { useState } from "react";
import { useAdminListDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument, getAdminListDocumentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { AdminPage, AdminRow, AdminGrid, AdminLoading, AdminEmpty, AdminModal, ConfirmDialog, AdminField, AdminCheck, mutationError } from "@/components/admin/ui";
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
  const [deleting, setDeleting] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListDocumentsQueryKey() });
  const saving = create.isPending || update.isPending;
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (d: NonNullable<typeof docs>[0]) => setModal({
    mode: "edit", id: d.id,
    form: { title: d.title, category: d.category ?? "", description: d.description ?? "", fileUrl: d.fileUrl, isPublic: d.isPublic ?? false, sortOrder: d.sortOrder ?? 0 }
  });

  const handleSave = () => {
    if (!modal) return;
    const done = (msg: string) => { invalidate(); setModal(null); toast({ title: msg }); };
    const fail = (err: unknown) => toast({ title: mutationError(err), variant: "destructive" });
    if (modal.mode === "create") {
      create.mutate({ data: modal.form as never }, { onSuccess: () => done("Document created"), onError: fail });
    } else {
      update.mutate({ id: modal.id!, data: modal.form as never }, { onSuccess: () => done("Document updated"), onError: fail });
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
      <AdminPage title="Documents" count={docs?.length} actionLabel="Add Document" onAction={openCreate} actionTestId="button-create-document">
        {isLoading ? <AdminLoading /> : (docs ?? []).length === 0 ? <AdminEmpty message="No documents yet." /> : (
          <AdminGrid>
            {(docs ?? []).map(d => (
              <AdminRow key={d.id} testId={`row-document-${d.id}`} title={d.title}
                meta={d.category || undefined} published={d.isPublic ?? undefined}
                onEdit={() => openEdit(d)} editTestId={`button-edit-document-${d.id}`}
                onDelete={() => setDeleting(d.id)} deleteTestId={`button-delete-document-${d.id}`} />
            ))}
          </AdminGrid>
        )}
      </AdminPage>

      {modal && (
        <AdminModal title={modal.mode === "create" ? "Add Document" : "Edit Document"}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving} saveTestId="button-save-document">
          <AdminField label="Title" value={modal.form.title} onChange={v => set({ title: v })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Category" value={modal.form.category} onChange={v => set({ category: v })} />
            <AdminField label="Sort Order" type="number" value={modal.form.sortOrder} onChange={v => set({ sortOrder: Number(v) })} />
          </div>
          <AdminField label="Description" value={modal.form.description} onChange={v => set({ description: v })} textarea rows={2} />
          <AdminField label="File URL" value={modal.form.fileUrl} onChange={v => set({ fileUrl: v })} placeholder="https://…" />
          <AdminCheck id="doc-pub" label="Public (visible to all)" checked={modal.form.isPublic} onChange={v => set({ isPublic: v })} />
        </AdminModal>
      )}

      {deleting != null && (
        <ConfirmDialog title="Delete this document?" message="The download link will stop working immediately."
          onConfirm={confirmDelete} onCancel={() => setDeleting(null)} pending={remove.isPending} />
      )}
    </AdminLayout>
  );
}
