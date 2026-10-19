import { useState } from "react";
import { useAdminListAwards, useCreateAward, useUpdateAward, useDeleteAward, getAdminListAwardsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { AdminPage, AdminRow, AdminGrid, AdminLoading, AdminEmpty, AdminModal, ConfirmDialog, AdminField, mutationError } from "@/components/admin/ui";
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
  const [deleting, setDeleting] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListAwardsQueryKey() });
  const saving = create.isPending || update.isPending;
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (a: NonNullable<typeof awards>[0]) => setModal({
    mode: "edit", id: a.id,
    form: { title: a.title, awardingBody: a.awardingBody ?? "", year: a.year ?? "", description: a.description ?? "", sortOrder: a.sortOrder ?? 0 }
  });

  const handleSave = () => {
    if (!modal) return;
    const done = (msg: string) => { invalidate(); setModal(null); toast({ title: msg }); };
    const fail = (err: unknown) => toast({ title: mutationError(err), variant: "destructive" });
    if (modal.mode === "create") {
      create.mutate({ data: modal.form as never }, { onSuccess: () => done("Award created"), onError: fail });
    } else {
      update.mutate({ id: modal.id!, data: modal.form as never }, { onSuccess: () => done("Award updated"), onError: fail });
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
      <AdminPage title="Awards" count={awards?.length} actionLabel="Add Award" onAction={openCreate} actionTestId="button-create-award">
        {isLoading ? <AdminLoading /> : (awards ?? []).length === 0 ? <AdminEmpty message="No awards yet." /> : (
          <AdminGrid>
            {(awards ?? []).map(a => (
              <AdminRow key={a.id} testId={`row-award-${a.id}`} title={a.title}
                meta={[a.awardingBody, a.year].filter(Boolean).join(" · ")}
                onEdit={() => openEdit(a)} editTestId={`button-edit-award-${a.id}`}
                onDelete={() => setDeleting(a.id)} deleteTestId={`button-delete-award-${a.id}`} />
            ))}
          </AdminGrid>
        )}
      </AdminPage>

      {modal && (
        <AdminModal title={modal.mode === "create" ? "Add Award" : "Edit Award"}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving} saveTestId="button-save-award">
          <AdminField label="Title" value={modal.form.title} onChange={v => set({ title: v })} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><AdminField label="Awarding Body" value={modal.form.awardingBody} onChange={v => set({ awardingBody: v })} /></div>
            <AdminField label="Year" value={modal.form.year} onChange={v => set({ year: v })} />
          </div>
          <AdminField label="Description" value={modal.form.description} onChange={v => set({ description: v })} textarea />
          <AdminField label="Sort Order" type="number" value={modal.form.sortOrder} onChange={v => set({ sortOrder: Number(v) })} />
        </AdminModal>
      )}

      {deleting != null && (
        <ConfirmDialog title="Delete this award?" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} pending={remove.isPending} />
      )}
    </AdminLayout>
  );
}
