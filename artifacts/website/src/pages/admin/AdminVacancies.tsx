import { useState } from "react";
import { useAdminListVacancies, useCreateVacancy, useUpdateVacancy, useDeleteVacancy, getAdminListVacanciesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import AdminDateField from "@/components/admin/AdminDateField";
import { AdminPage, AdminRow, AdminGrid, AdminLoading, AdminEmpty, AdminModal, ConfirmDialog, AdminField, AdminCheck, mutationError } from "@/components/admin/ui";
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
  const [deleting, setDeleting] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListVacanciesQueryKey() });
  const saving = create.isPending || update.isPending;
  const openCreate = () => setModal({ mode: "create", form: { ...empty } });
  const openEdit = (v: NonNullable<typeof vacancies>[0]) => setModal({
    mode: "edit", id: v.id,
    form: { slug: v.slug, title: v.title, department: v.department ?? "", location: v.location ?? "", type: v.type ?? "Full-time", summary: v.summary ?? "", description: v.description ?? "", closingDate: v.closingDate ? v.closingDate.slice(0, 10) : "", isPublished: v.isPublished ?? false }
  });

  const handleSave = () => {
    if (!modal) return;
    const data = { ...modal.form, closingDate: modal.form.closingDate || undefined } as never;
    const done = (msg: string) => { invalidate(); setModal(null); toast({ title: msg }); };
    const fail = (err: unknown) => toast({ title: mutationError(err), variant: "destructive" });
    if (modal.mode === "create") {
      create.mutate({ data }, { onSuccess: () => done("Vacancy created"), onError: fail });
    } else {
      update.mutate({ id: modal.id!, data }, { onSuccess: () => done("Vacancy updated"), onError: fail });
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
      <AdminPage title="Vacancies" count={vacancies?.length} countLabel="open roles" actionLabel="Add Vacancy" onAction={openCreate} actionTestId="button-create-vacancy">
        {isLoading ? <AdminLoading /> : (vacancies ?? []).length === 0 ? <AdminEmpty message="No vacancies yet." /> : (
          <AdminGrid>
            {(vacancies ?? []).map(v => (
              <AdminRow key={v.id} testId={`row-vacancy-${v.id}`} title={v.title}
                meta={[v.department, v.location].filter(Boolean).join(" · ")} published={v.isPublished ?? undefined}
                onEdit={() => openEdit(v)} editTestId={`button-edit-vacancy-${v.id}`}
                onDelete={() => setDeleting(v.id)} deleteTestId={`button-delete-vacancy-${v.id}`} />
            ))}
          </AdminGrid>
        )}
      </AdminPage>

      {modal && (
        <AdminModal title={modal.mode === "create" ? "Add Vacancy" : "Edit Vacancy"}
          onClose={() => setModal(null)} onSave={handleSave} saving={saving} saveTestId="button-save-vacancy" wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Slug" value={modal.form.slug} onChange={v => set({ slug: v })} />
            <AdminField label="Title" value={modal.form.title} onChange={v => set({ title: v })} />
            <AdminField label="Department" value={modal.form.department} onChange={v => set({ department: v })} />
            <AdminField label="Location" value={modal.form.location} onChange={v => set({ location: v })} />
            <AdminField label="Type" value={modal.form.type} onChange={v => set({ type: v })} />
            <div className="flex items-end pb-1"><AdminCheck id="vac-pub" label="Published" checked={modal.form.isPublished} onChange={v => set({ isPublished: v })} /></div>
          </div>
          <AdminField label="Summary" value={modal.form.summary} onChange={v => set({ summary: v })} textarea rows={2} />
          <AdminField label="Description" value={modal.form.description} onChange={v => set({ description: v })} textarea rows={5} />
          <AdminDateField
            label="Closing Date"
            value={modal.form.closingDate}
            onChange={v => set({ closingDate: v })}
            onClear={() => set({ closingDate: "" })}
          />
        </AdminModal>
      )}

      {deleting != null && (
        <ConfirmDialog title="Delete this vacancy?" message="The job listing will disappear from the public careers page."
          onConfirm={confirmDelete} onCancel={() => setDeleting(null)} pending={remove.isPending} />
      )}
    </AdminLayout>
  );
}
